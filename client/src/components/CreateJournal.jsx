import { useState } from 'react';
import MarkdownEditor from './MarkdownEditor'
import AudioRecording from './AudioRecording';

function CreateJournal() {
  const [audioNameS3, setAudioNameS3] = useState('');
  return (
    <>
      <AudioRecording audioNameS3={audioNameS3} setAudioNameS3={setAudioNameS3}/>
      <MarkdownEditor audioNameS3={audioNameS3} setAudioNameS3={setAudioNameS3}/>
    </>
  )
}

export default CreateJournal;