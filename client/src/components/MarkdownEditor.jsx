import { useEffect, useRef, useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import EasyMDE from 'easymde';
import 'easymde/dist/easymde.min.css';
import { GET_AUTOCOMPLETE } from '../queries/journals';

function CustomizedMarkdownEditor() {
  const editorRef = useRef(null);
  const easyMDEInstance = useRef(null);
  const [autoCompleteResults, setAutoCompleteResults] = useState([]);

  const [getAutocomplete, { data, loading, error }] = useLazyQuery(GET_AUTOCOMPLETE, { errorPolicy: "all" });
  useEffect(() => {
    easyMDEInstance.current = new EasyMDE({
      element: editorRef.current,
      previewRender: (plainText) => {
        const customRenderedText = plainText.replace(/\[\[(.*?)\]\]/g, (match, keyword) => {
          // TODO: url 改真正的 journal 連結 , 打 getJournalByTitle
          const url = `http://`; // e.g. http://localhost:3000/journal/journalId
          return `[${keyword}](${url})`;
        });
        return easyMDEInstance.current.markdown(customRenderedText);
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
