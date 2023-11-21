import { useEffect, useRef } from 'react';
import EasyMDE from 'easymde';
import { useLazyQuery, gql, useMutation } from '@apollo/client';
import 'easymde/dist/easymde.min.css';

function CustomizedMarkdownEditor() {
  const editorRef = useRef(null);
  const easyMDEInstance = useRef(null);
  const GET_AUTOCOMPLETE = gql`
    mutation SignIn {
      signIn(signInInput: { email: "test@test.com", password: "test" }) {
        _id
        name
        email
        jwtToken
      }
    }
  `;
  const [getAutocomplete, { data, loading, error }] = useMutation(GET_AUTOCOMPLETE);
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
    easyMDEInstance.current.codemirror.on('change', (instance) => {
      const cursor = instance.getCursor();
      const textBeforeCursor = instance.getRange({ line: cursor.line, ch: 0 }, cursor);
      if (textBeforeCursor.endsWith('[[')) {
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
    console.log('got cha');
    try {
      const a = await getAutocomplete()
      console.log(a);
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
