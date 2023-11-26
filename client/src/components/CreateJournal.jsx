import { useState } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { SelectButton } from 'primereact/selectbutton';
import MarkdownEditor from './MarkdownEditor';
import AudioRecording from './AudioRecording';
import Emotion from './Emotion';

function CreateJournal() {
  const [audioNameS3, setAudioNameS3] = useState('');
  const journalTypeOption = ['diary', 'note'];
  const [type, setType] = useState(journalTypeOption[0]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState(1);
  const [moodFeelings, setMoodFeelings] = useState([]);
  const [moodFactors, setMoodFactors] = useState([]);
  const submit = () => {
    const journal = {
      type,
      title,
      content,
      mood,
      moodFeelings,
      moodFactors,
    };
    console.log(journal);
  };
  return (
    <>
      <div className="card flex justify-content-center">
        <SelectButton
          value={type}
          allowEmpty={false}
          onChange={(e) => setType(e.value)}
          options={journalTypeOption}
        />
      </div>
      <div className="card flex justify-content-center">
        <span className="p-float-label">
          <InputText id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <label htmlFor="title">Title</label>
        </span>
      </div>
      <AudioRecording audioNameS3={audioNameS3} setAudioNameS3={setAudioNameS3} />

      <MarkdownEditor
        audioNameS3={audioNameS3}
        setAudioNameS3={setAudioNameS3}
        setContent={setContent}
        content={content}
      />
      {type === 'diary' ? (
        <Emotion
          mood={mood}
          setMood={setMood}
          moodFeelings={moodFeelings}
          setMoodFeelings={setMoodFeelings}
          moodFactors={moodFactors}
          setMoodFactors={setMoodFactors}
          content={content}
        />
      ) : null}
      <div className="card flex justify-content-center">
        <Button label="Create Journal" onClick={submit} />
      </div>
    </>
  );
}

export default CreateJournal;
