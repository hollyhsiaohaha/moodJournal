import { useState, useRef, useEffect } from 'react';
import { Button } from 'primereact/button';
import PropTypes from 'prop-types';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { MAX_AUDIO_LENGTH } from '../utils/conf';

function AudioRecorder({ setAudioNameS3 }) {
  const [stateIndex, setStateIndex] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const audioChunksRef = useRef([]);
  const [audioURL, setAudioURL] = useState('');

  const record = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      console.log('mediaDevices supported..');
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          const recorder = new MediaRecorder(stream);
          audioChunksRef.current = [];
          recorder.ondataavailable = (e) => {
            audioChunksRef.current.push(e.data);
          };
          recorder.onstop = () => {
            const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            setAudioURL(window.URL.createObjectURL(blob));
            audioChunksRef.current = [];
            stream.getTracks().forEach((track) => track.stop());
          };
          setMediaRecorder(recorder);
          setStateIndex(1);
          recorder.start();
          setTimeout(() => {
            if (recorder.state === 'recording') {
              recorder.stop();
              setStateIndex(2);
            }
          }, MAX_AUDIO_LENGTH);
        })
        .catch((error) => {
          console.error(error);
          setStateIndex('');
        });
    } else {
      toast.error('瀏覽器不支援錄音功能');
      setStateIndex('');
    }
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
      formData.append('audio', blob, 'audio.webm');
      const headers = formData.getHeaders ? formData.getHeaders() : {};
      const token = Cookies.get('JWT_TOKEN');
      headers['Authorization'] = token;
      const { protocol, hostname } = window.location;
      const port = hostname === 'localhost' ? ':3000' : '';
      const apiUri = `${protocol}//${hostname}${port}/api/audio`;
      const res = await fetch(apiUri, {
        method: 'POST',
        body: formData,
        headers,
      });
      const data = await res.json();
      if (data.fileName) {
        setStateIndex(0);
        toast.success('音檔上傳成功');
        return setAudioNameS3(data.fileName);
      }
      throw new Error(data.error);
    } catch (error) {
      toast.error('無法上傳音檔');
      console.error(error);
    }
  };

  return (
    <div>
      <h3 className='mb-0'>錄音</h3>
      <div className="display m-2">
        {stateIndex === 1 && <p> 錄音中...</p>}
        {stateIndex === 2 && <audio controls src={audioURL} preload="auto"></audio>}
      </div>
      <div className="controllers">
        {stateIndex === 0 && <Button onClick={record} className='mr-1' severity="secondary" icon="pi pi-circle-fill" aria-label="開始錄音" />}
        {stateIndex === 1 && <Button onClick={stopRecording} className='mr-1' severity="secondary" icon="pi pi-stop" aria-label="停止錄音" />}
        {stateIndex === 2 && <Button onClick={record} className='mr-1' severity="secondary" icon="pi pi-refresh" aria-label="重新錄音" />}
        {stateIndex === 2 && <Button onClick={uploadAudio} className='mr-1' severity="secondary" icon="pi pi-upload" aria-label="上傳" />}
      </div>
    </div>
  );
}

AudioRecorder.propTypes = {
  audioNameS3: PropTypes.string,
  setAudioNameS3: PropTypes.func.isRequired,
};

export default AudioRecorder;
