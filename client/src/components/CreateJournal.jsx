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
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Tooltip } from 'primereact/tooltip';

function CreateJournal() {
  const { newJournalDate } = useParams();
  const [audioNameS3, setAudioNameS3] = useState('');
  const journalTypeOption = ['diary', 'note'];
  const [type, setType] = useState(journalTypeOption[0]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [moodScore, setMoodScore] = useState(1);
  const [moodFeelings, setMoodFeelings] = useState([]);
  const [moodFactors, setMoodFactors] = useState([]);
  const [date, setDate] = useState(new Date(newJournalDate));
  const [createJournal] = useMutation(CREATE_JOURNAL);
  const navigate = useNavigate();

  const dateParser = (yourDate) => {
    const offset = yourDate.getTimezoneOffset();
    yourDate = new Date(yourDate.getTime() - offset * 60 * 1000);
    return yourDate.toISOString().split('T')[0];
  };

  const submit = () => {
    const createNewJournal = async () => {
      let journalInput;
      const journalTitle = type === 'diary' ? dateParser(date) : title;
      if (!journalTitle) return toast.warn('筆記名稱不能為空白');
      if (!content) return toast.warn('筆記內容不能為空白');
      if (type === 'note') {
        journalInput = {
          type,
          title: journalTitle,
          content,
        };
      } else {
        journalInput = {
          type,
          title: journalTitle,
          diaryDate: journalTitle,
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
        navigate('/journalList');
        toast.success(`筆記新增成功：${title}`);
      } catch (error) {
        if (error.message.includes('Keyword not exist:')) {
          const link = error.message.split(':')[1];
          return toast.error(`連結筆記不存在： ${link}`);
        }
        if (error.message.includes('DUPLICATE_KEY')) {
          return toast.error(`筆記名稱重複： ${journalTitle}`);
        }
        console.error(error);
      }
    };
    createNewJournal();
  };

  return (
    <>
      <div className="card flex justify-content-center">
        <Tooltip target=".custom-target-icon" />
        <i
          className="custom-target-icon pi pi-info-circle p-text-secondary p-3"
          data-pr-tooltip="點擊以切換不同筆記種類"
          data-pr-position="left"
          data-pr-at="left+5 top"
          data-pr-my="right center-2"
          style={{ fontSize: '1rem', cursor: 'pointer' }}
        ></i>
        <div className="mr-5">
          <SelectButton
            value={type}
            allowEmpty={false}
            onChange={(e) => setType(e.value)}
            options={journalTypeOption}
          />
        </div>
        {type === 'note' ? (
          <span className="p-float-label">
            <InputText id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <label htmlFor="title">Title</label>
          </span>
        ) : (
          <Calendar
            value={date}
            onChange={(e) => setDate(e.value)}
            dateFormat="yy-mm-dd"
            showIcon
          />
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
        <Button label="建立筆記" onClick={submit} />
      </div>
    </>
  );
}

export default CreateJournal;
