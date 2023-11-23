import { useState, useEffect, useRef } from 'react';

const AudioRecorder = ({ audioNameS3, setAudioNameS3 }) => {
  const [stateIndex, setStateIndex] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const audioChunksRef = useRef([]);
  const [audioURL, setAudioURL] = useState('');

  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      console.log('mediaDevices supported..');
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          const recorder = new MediaRecorder(stream);

          recorder.ondataavailable = (e) => {
            audioChunksRef.current.push(e.data);
          };

          recorder.onstop = () => {
            const blob = new Blob(audioChunksRef.current, { type: 'audio/ogg; codecs=opus' });
            setAudioURL(window.URL.createObjectURL(blob));
            audioChunksRef.current = [];
          };

          setMediaRecorder(recorder);
        })
        .catch((error) => {
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

	const uploadAudio = async () => {
    try {
      const response = await fetch(audioURL);
      const blob = await response.blob();
  
      const formData = new FormData();
      formData.append('audio', blob, 'audio.ogg');
  
      const headers = formData.getHeaders ? formData.getHeaders() : {};
      headers['Authorization'] = localStorage.getItem('JWT_TOKEN');
      const res = await fetch('http://localhost:3000/api/audio', {
          method: 'POST',
          body: formData,
          headers,
      })
      const data = await res.json();
      if (data.fileName) {
        setStateIndex(0);
        return setAudioNameS3(data.fileName);
      }
      throw new Error(data.error);
    } catch (error) {
      alert('無法上傳音檔');
      console.error(error)
    }

};

  return (
    <div>
      <div className="display">
        {stateIndex === 1 && <p>Recording...</p>}
        {stateIndex === 2 && <audio controls src={audioURL} preload="auto"></audio>}
      </div>
      <div className="controllers">
        {stateIndex === 0 && <button onClick={record}>開始錄音</button>}
        {stateIndex === 1 && <button onClick={stopRecording}>停止錄音</button>}
        {stateIndex === 2 && <button onClick={record}>重新錄音</button>}
        {stateIndex === 2 && <button onClick={uploadAudio}>上傳</button>}
      </div>
    </div>
  );
};

export default AudioRecorder;
