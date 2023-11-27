import { useEffect, useRef, useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import EasyMDE from 'easymde';
import 'easymde/dist/easymde.min.css';
import PropTypes from 'prop-types';
import { GET_AUTOCOMPLETE, GET_JOURNAL_ID_BY_TITLE, GET_VOICE_TO_TEXT } from '../queries/journals';

// helper functions
function CustomizedMarkdownEditor({ audioNameS3, setAudioNameS3, setContent, content }) {
  const editorRef = useRef(null);
  const easyMDEInstance = useRef(null);

  const valueUpdate = (instance) => {
    setContent(easyMDEInstance.current.value());
  }

  useEffect(() => {
    easyMDEInstance.current = new EasyMDE({
      element: editorRef.current,
    });

    easyMDEInstance.current.codemirror.on('change', valueUpdate);
    return () => {
      console.log('============', easyMDEInstance.current);
      if (easyMDEInstance.current) {
        console.log('a')
        // easyMDEInstance.current.toTextArea();
        easyMDEInstance.current = null;
        const ele = document.querySelector('.EasyMDEContainer');
        ele?.remove();
        // editorRef.current = null;
      }
    }
  }, []);


  return (
    <>
      <h3>筆記內容</h3>
      <textarea ref={editorRef} />
    </>
  );
}

CustomizedMarkdownEditor.propTypes = {
  audioNameS3: PropTypes.string,
  setAudioNameS3: PropTypes.func.isRequired,
  setContent: PropTypes.func.isRequired,
  content: PropTypes.string,
};

export default CustomizedMarkdownEditor;
