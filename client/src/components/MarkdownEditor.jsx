import { useEffect, useRef, useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import EasyMDE from 'easymde';
import 'easymde/dist/easymde.min.css';
import PropTypes from 'prop-types';
import { Tooltip } from 'primereact/tooltip';
import { CDN_PATH } from '../utils/conf';
import './MarkdownEditor.css';
import {
  GET_AUTOCOMPLETE,
  GET_JOURNAL_ID_BY_TITLE,
  GET_VOICE_TO_TEXT,
  GET_JOURNAL_BY_ID,
} from '../queries/journals';
import { toast } from 'react-toastify';

// helper functions
function CustomizedMarkdownEditor({ audioNameS3, setAudioNameS3, setContent, content, journalId }) {
  const editorRef = useRef(null);
  const easyMDEInstance = useRef(null);
  const [autoCompleteResults, setAutoCompleteResults] = useState([]);
  const [voiceToTextResults, setVoiceToTextResults] = useState('');
  const fetchPolicy = 'network-only';
  const [getAutocomplete] = useLazyQuery(GET_AUTOCOMPLETE, { fetchPolicy });
  const [getJournalIdByTitle] = useLazyQuery(GET_JOURNAL_ID_BY_TITLE, { fetchPolicy });
  const [getVoiceToText] = useLazyQuery(GET_VOICE_TO_TEXT, { fetchPolicy });
  const [getJournalById] = useLazyQuery(GET_JOURNAL_BY_ID, { fetchPolicy });

  // === helper functions ===
  const triggerAutocomplete = async (keyword) => {
    try {
      const { data } = await getAutocomplete({
        variables: { keyword },
      });
      if (data) {
        const autocompletList = data.autoCompleteJournals.map((journal) => journal.title);
        setAutoCompleteResults(autocompletList);
      }
    } catch (error) {
      console.error('Autocomplete API fail', error);
    }
  };

  const valueUpdate = (instance) => {
    //  update content to parent component
    setContent(easyMDEInstance.current.value());
    // autocomplete trigger conditions
    const cursor = instance.getCursor();
    const textBeforeCursor = instance.getRange({ line: cursor.line, ch: 0 }, cursor);
    const lastOpeningBracket = textBeforeCursor.lastIndexOf('[[');
    const lastClosingBracket = textBeforeCursor.lastIndexOf(']]');
    if (lastOpeningBracket > lastClosingBracket) {
      const keyword = textBeforeCursor.slice(lastOpeningBracket + 2, cursor.ch);
      keyword ? triggerAutocomplete(keyword) : null;
    } else setAutoCompleteResults([]);
  };

  const customRender = async (plainText) => {
    const matches = [...plainText.matchAll(/\[\[(.*?)\]\]/g)];
    const replacements = await Promise.all(
      matches.map(async (match) => {
        const keyword = match[1];
        try {
          const { data } = await getJournalIdByTitle({ variables: { title: keyword } });
          const journalId = data?.getJournalbyTitle?._id;
          if (!journalId) {
            const message = `連結筆記不存在： ${keyword}`;
            throw new Error(message);
          }
          const domain = window.location.origin;
          return {
            match,
            replacement: `[${keyword}](${domain}/journal/${journalId})`,
          };
        } catch (error) {
          console.error(error);
          return { match, replacement: keyword };
        }
      }),
    );

    let customRenderedText = plainText;
    replacements.forEach(({ match, replacement }) => {
      customRenderedText = customRenderedText.replace(match[0], replacement);
    });
    return easyMDEInstance.current ? easyMDEInstance.current.markdown(customRenderedText) : null;
  };

  // useEffect for easyMDE
  useEffect(() => {
    easyMDEInstance.current = new EasyMDE({
      element: editorRef.current,
      initialValue: content,
      spellChecker: false,
      previewRender: (plainText, preview) => {
        setTimeout(async () => {
          preview.innerHTML = await customRender(plainText);
        }, 100);
        return 'Loading...';
      },
    });

    easyMDEInstance.current.codemirror.on('change', valueUpdate);
    return () => {
      const ele = document.querySelector('.EasyMDEContainer');
      ele?.remove();
    };
  }, []);

  useEffect(() => {
    const getJournalInfo = async () => {
      const { data } = await getJournalById({ variables: { id: journalId } });
      easyMDEInstance.current.value(data.getJournalbyId.content);
    };
    if (journalId) getJournalInfo();
  }, [journalId]);

  // === useEffect for audio filename update ===
  useEffect(() => {
    const voiceToText = async (fileName) => {
      const { data, error } = await getVoiceToText({ variables: { fileName } });
      if (error) {
        toast.error('錯誤：目前無法進行 voice to text')
        return setVoiceToTextResults('');
      }
      if (data.voiceToText) return setVoiceToTextResults(data.voiceToText);
    };
    if (audioNameS3) {
      const fileName = audioNameS3;
      const currentContent = easyMDEInstance.current.value();
      const audioTag = `\n<audio id=" ${fileName}" controls="" preload="auto">
          <source id="${fileName}-src" src="${CDN_PATH}/${fileName}">
        </audio>
      `;
      easyMDEInstance.current.value(currentContent + audioTag);
      setAudioNameS3('');
      voiceToText(fileName);
    }
  }, [audioNameS3, setAudioNameS3, getVoiceToText]);

  useEffect(() => {
    if (voiceToTextResults) {
      const voiceToText = voiceToTextResults;
      const currentContent = easyMDEInstance.current.value();
      easyMDEInstance.current.value(`${currentContent}\n${voiceToText}`);
      setVoiceToTextResults('');
      toast.success('語音轉譯完成，已加入筆記')
    }
  }, [voiceToTextResults]);

  //  === Autocomplete List ===
  const renderAutocompleteList = () => {
    const cursorCoords = getCursorCoords();
    const listStyle = {
      position: 'absolute',
      top: `${cursorCoords.top}px`,
      left: `${cursorCoords.left}px`,
      borderStyle: autoCompleteResults.length ? 'solid' : 'none',
    };
    return (
      <ul className="autocomplete-list" style={listStyle}>
        {autoCompleteResults.map((item, index) => (
          <li
            key={index}
            className="autocomplete-item"
            onClick={() => handleAutocompleteSelect(item)}
          >
            {item}
          </li>
        ))}
      </ul>
    );
  };

  const handleAutocompleteSelect = (selectedTitle) => {
    if (easyMDEInstance.current) {
      const cm = easyMDEInstance.current.codemirror;
      const cursor = cm.getCursor();
      const textBeforeCursor = cm.getRange({ line: cursor.line, ch: 0 }, cursor);
      const lastOpeningBracket = textBeforeCursor.lastIndexOf('[[');
      cm.replaceRange(
        `${selectedTitle}]]`,
        { line: cursor.line, ch: lastOpeningBracket + 2 },
        cursor,
      );
      setAutoCompleteResults([]);
    }
  };

  const getCursorCoords = () => {
    if (easyMDEInstance.current) {
      const editor = easyMDEInstance.current.codemirror;
      const cursor = editor.getCursor();
      return editor.cursorCoords(cursor);
    }
    return { top: 0, left: 0 };
  };
  //  ===========================

  return (
    <>
      <div className='m-3'>
        <h3 className="m-2" style={{ display: 'inline' }}>
          筆記內容
        </h3>
        <Tooltip target=".custom-target-icon" />
        <i
          className="custom-target-icon pi pi-info-circle p-text-secondary"
          data-pr-tooltip="使用 [[筆記標題]] 來連結不同筆記"
          data-pr-position="right"
          data-pr-at="right+5 top"
          data-pr-my="left center-2"
          style={{ fontSize: '1rem', cursor: 'pointer' }}
        ></i>
      </div>
      <textarea ref={editorRef} />
      {renderAutocompleteList()}
    </>
  );
}

CustomizedMarkdownEditor.propTypes = {
  audioNameS3: PropTypes.string,
  setAudioNameS3: PropTypes.func.isRequired,
  setContent: PropTypes.func.isRequired,
  content: PropTypes.string,
  journalId: PropTypes.string,
};

export default CustomizedMarkdownEditor;
