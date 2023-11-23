import { useState } from 'react';
import MarkdownEditor from './MarkdownEditor'
import AudioRecording from './AudioRecording';

// 應該在這層的 hook 
// audio file name
// voice to text result

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