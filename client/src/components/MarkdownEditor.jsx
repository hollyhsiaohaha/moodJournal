import { useEffect, useRef, useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import EasyMDE from 'easymde';
import 'easymde/dist/easymde.min.css';
import PropTypes from 'prop-types';
import { CDN_PATH } from '../utils/conf';
import {
  GET_AUTOCOMPLETE,
  GET_JOURNAL_ID_BY_TITLE,
  GET_VOICE_TO_TEXT,
  GET_JOURNAL_BY_ID,
} from '../queries/journals';

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
    //  update content to parent compon
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
            // TODO: 看要不要放在一個 state 中，印出給 user 一個違規清單 ???
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
      if (error) return setVoiceToTextResults('錯誤：目前無法進行 voice to text');
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
    const voiceToText = voiceToTextResults;
    const currentContent = easyMDEInstance.current.value();
    easyMDEInstance.current.value(`${currentContent}\n${voiceToText}`);
    setVoiceToTextResults('');
  }, [voiceToTextResults]);

  //  === Autocomplete List ===
  const renderAutocompleteList = () => {
    const cursorCoords = getCursorCoords();
    const listStyle = {
      position: 'absolute',
      top: `${cursorCoords.top}px`,
      left: `${cursorCoords.left}px`,
      zIndex: 1000,
      borderStyle: autoCompleteResults.length ? 'solid' : 'none',
      listStyleType: 'none',
    };
    return (
      <ul className="autocomplete-list" style={listStyle}>
        {autoCompleteResults.map((item, index) => (
          <li key={index} onClick={() => handleAutocompleteSelect(item)}>
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
      <h3>筆記內容</h3>
      <p>使用 [[標題]] 來連結不同筆記 </p>
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
