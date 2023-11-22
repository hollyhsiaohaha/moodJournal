import { useEffect, useRef, useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import EasyMDE from 'easymde';
import 'easymde/dist/easymde.min.css';
import { GET_AUTOCOMPLETE, GET_JOURNAL_ID_BY_TITLE } from '../queries/journals';

function CustomizedMarkdownEditor() {
  const editorRef = useRef(null);
  const easyMDEInstance = useRef(null);
  const [autoCompleteResults, setAutoCompleteResults] = useState([]);

  const [getAutocomplete] = useLazyQuery(GET_AUTOCOMPLETE);
  const [getJournalIdByTitle] = useLazyQuery(GET_JOURNAL_ID_BY_TITLE);

  useEffect(() => {
    const customRender = async (plainText) => {
      const matches = [...plainText.matchAll(/\[\[(.*?)\]\]/g)];
      const replacements = await Promise.all(matches.map(async (match) => {
        const keyword = match[1];
        try {
          const { data, error } = await getJournalIdByTitle({ variables: { title: keyword } });
          const journalId = data?.getJournalbyTitle?._id;
          if (!journalId) {
            // TODO: 看要不要放在一個 state 中，印出給 user 一個違規清單
            const message = `連結筆記不存在： ${keyword}`;
            throw new Error(message);
          }
          const domain = window.location.host;
          return {
            match,
            replacement: `[${keyword}](${domain}/journal/${journalId})`
          };
        } catch (error) {
          console.error(error);
          return { match, replacement: keyword };
        }
      }));

      let customRenderedText = plainText;
      replacements.forEach(({ match, replacement }) => {
        customRenderedText = customRenderedText.replace(match[0], replacement);
      });
      return easyMDEInstance.current.markdown(customRenderedText);
    };

    easyMDEInstance.current = new EasyMDE({
      element: editorRef.current,
      previewRender: (plainText, preview) => {
        setTimeout( async () => {
          preview.innerHTML = await customRender(plainText);
      }, 100);
        return "Loading...";
      },
    });

    easyMDEInstance.current.codemirror.on('change', (instance) => {
      const cursor = instance.getCursor();
      const textBeforeCursor = instance.getRange({ line: cursor.line, ch: 0 }, cursor);
      const lastOpeningBracket = textBeforeCursor.lastIndexOf('[[');
      const lastClosingBracket = textBeforeCursor.lastIndexOf(']]');
      if (lastOpeningBracket > lastClosingBracket) {
        const keyword = textBeforeCursor.slice(lastOpeningBracket + 2, cursor.ch);
        keyword ? triggerAutocomplete(keyword) : null;
      }
    });
    return () => easyMDEInstance.current.toTextArea();
  }, []);

  const getEditorValue = () => {
    if (easyMDEInstance.current) {
      alert(easyMDEInstance.current.value());
    }
  };

  const triggerAutocomplete = async (keyword) => {
    try {
      const { data, error } = await getAutocomplete({ 
        variables: { keyword },
      })
      if (error) {
        // TODO: 403 需要在這邊判斷ㄇ 
        const status = error.networkError?.result?.errors[0].extensions?.http?.status;
        if (status === 403) {
          return alert('請先登入');
        }
        throw new Error(error)
      }
      if (data) {
        console.log(data.autoCompleteJournals);
      }
    } catch (error) {
      console.error('Autocomplete API fail', error);
    }
  };

  return (
    <>
      <textarea ref={editorRef} />
      <button onClick={getEditorValue}>Get Editor Content</button>
    </>
  );
}

export default CustomizedMarkdownEditor;
