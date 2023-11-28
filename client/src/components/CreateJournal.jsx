import { useState } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { SelectButton } from 'primereact/selectbutton';
import { Calendar } from 'primereact/calendar';
import MarkdownEditor from './MarkdownEditor';
import AudioRecording from './AudioRecording';
import Emotion from './Emotion';
import { CREATE_JOURNAL } from '../mutations/journals';
import { useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';

function CreateJournal() {
  const [audioNameS3, setAudioNameS3] = useState('');
  const journalTypeOption = ['diary', 'note'];
  const [type, setType] = useState(journalTypeOption[0]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [moodScore, setMoodScore] = useState(1);
  const [moodFeelings, setMoodFeelings] = useState([]);
  const [moodFactors, setMoodFactors] = useState([]);
  const [date, setDate] = useState(new Date());
  const [createJournal] = useMutation(CREATE_JOURNAL);
  const navigate = useNavigate();

  const dateParser = (yourDate) => {
    const offset = yourDate.getTimezoneOffset()
    yourDate = new Date(yourDate.getTime() - (offset*60*1000))
    return yourDate.toISOString().split('T')[0];
  }

  const submit = () => {
    const createNewJournal = async () => {
      let journalInput;
      if (type === 'note') {
        if (!title || !content) return alert('筆記名稱及內容不能為空白');
        journalInput = {
          type,
          title,
          content,
        };
      } else {
        if (!content) return alert('筆記內容不能為空白');
        journalInput= {
          type,
          title: dateParser(date),
          diaryDate: dateParser(date),
          content,
          moodScore,
          moodFeelings,
          moodFactors,
        };
      }
      try {
        const { data } = await createJournal({ variables: { journalInput } });
        const { title } = data.createJournal;
        const journalId = data.createJournal._id;
        console.log(journalId);
        navigate(`/journal/${journalId}`);
        alert(`筆記新增成功：${title}`);
      } catch (error) {
        if (error.message.includes('DUPLICATE_KEY')) return alert('筆記名稱重複');
        console.error(error);
      }
    };
    createNewJournal();
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
        {type === 'note' ? (
          <span className="p-float-label">
            <InputText id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <label htmlFor="title">Title</label>
          </span>
        ) : (
          <div className="card flex justify-content-center">
            <Calendar
              value={date}
              onChange={(e) => setDate(e.value)}
              dateFormat="yy-mm-dd"
              showIcon
            />
          </div>
        )}
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
          moodScore={moodScore}
          setMoodScore={setMoodScore}
          moodFeelings={moodFeelings}
          setMoodFeelings={setMoodFeelings}
          moodFactors={moodFactors}
          setMoodFactors={setMoodFactors}
          content={content}
        />
      ) : null}
      <div className="card flex justify-content-center">
        <Button label="Create" onClick={submit} />
      </div>
    </>
  );
}

export default CreateJournal;
