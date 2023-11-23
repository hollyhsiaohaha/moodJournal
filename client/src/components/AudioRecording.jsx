import { useState, useEffect, useRef } from 'react';

const AudioRecorder = () => {
    const [stateIndex, setStateIndex] = useState(0);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const audioChunksRef = useRef([]);
    const [audioURL, setAudioURL] = useState('');

    useEffect(() => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          console.log('mediaDevices supported..');
          navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
              const recorder = new MediaRecorder(stream);
  
              recorder.ondataavailable = e => {
                  audioChunksRef.current.push(e.data);
              };
  
              recorder.onstop = () => {
                  const blob = new Blob(audioChunksRef.current, { 'type': 'audio/ogg; codecs=opus' });
                  setAudioURL(window.URL.createObjectURL(blob));
                  audioChunksRef.current = [];
              };
  
              setMediaRecorder(recorder);
          }).catch(error => {
              console.log('Following error has occurred: ', error);
              setStateIndex('');
          });
      } else {
          console.log('Your browser does not support mediaDevices');
          setStateIndex('');
      }
  }, []);

    const record = () => {
        audioChunksRef.current = [];
        setStateIndex(1);
        mediaRecorder.start();
    };

    const stopRecording = () => {
        setStateIndex(2);
        mediaRecorder.stop();
    };

    // const downloadAudio = () => {
    //     const downloadLink = document.createElement('a');
    //     downloadLink.href = audioURL;
    //     downloadLink.setAttribute('download', 'audio');
    //     downloadLink.click();
    // };

    const uploadAudio = () => {
        const downloadLink = document.createElement('a');
        downloadLink.href = audioURL;
        downloadLink.setAttribute('download', 'audio');
        downloadLink.click();
    };

    return (
        <div>
            <div className="display">
                {stateIndex === 1 && <p>Recording...</p>}
                {stateIndex === 2 && <audio controls src={audioURL} preload='auto'></audio>}
            </div>
            <div className="controllers">
                {stateIndex === 0 && <button onClick={record}>Start Recording</button>}
                {stateIndex === 1 && <button onClick={stopRecording}>Stop Recording</button>}
                {stateIndex === 2 && <button onClick={record}>Record Again</button>}
                {/* {stateIndex === 2 && <button onClick={downloadAudio}>Download</button>} */}
                {stateIndex === 2 && <button onClick={uploadAudio}>Upload</button>}
            </div>
        </div>
    );
};

export default AudioRecorder;
