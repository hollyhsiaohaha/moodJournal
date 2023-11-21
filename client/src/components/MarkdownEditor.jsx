import { useEffect, useRef } from 'react';
import EasyMDE from 'easymde';
import 'easymde/dist/easymde.min.css';

function CustomizedMarkdownEditor() {
  const editorRef = useRef(null);
  const easyMDEInstance = useRef(null);

  useEffect(() => {
    easyMDEInstance.current = new EasyMDE({
      element: editorRef.current,
      previewRender: (plainText) => {
        const customRenderedText = plainText.replace(/\[\[(.*?)\]\]/g, (match, keyword) => {
          // TODO: url 改真正的 journal 連結
          const url = `http://${keyword}`;
          return `[${keyword}](${url})`;
        });
        return easyMDEInstance.current.markdown(customRenderedText);
      },
    });
    easyMDEInstance.current.codemirror.on("change", (instance) => {
      const cursor = instance.getCursor();
      const textBeforeCursor = instance.getRange({ line: cursor.line, ch: 0 }, cursor);
      if (textBeforeCursor.endsWith("[[")) {
        triggerAutocomplete();
      }
    });
    return () => easyMDEInstance.current.toTextArea();
  }, []);

  const getEditorValue = () => {
    if (easyMDEInstance.current) {
      alert(easyMDEInstance.current.value());
    }
  };

  const triggerAutocomplete = async () => {
    console.log('got cha')
    // try {
    //   const response = await fetch('您的API地址');
    //   const suggestions = await response.json();
    //   console.log(suggestions)
    // } catch (error) {
    //   console.error('Autocomplete API fail', error);
    // }
  }

  return (
    <>
      <textarea ref={editorRef} />
      <button onClick={getEditorValue}>Get Editor Content</button>
    </>
  )
}

export default CustomizedMarkdownEditor;
