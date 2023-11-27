import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { SelectButton } from 'primereact/selectbutton';
import { Calendar } from 'primereact/calendar';
import MarkdownEditor from './MarkdownEditor';
import AudioRecording from './AudioRecording';
import Emotion from './Emotion';
import Backlink from './Backlink';
import { GET_JOURNAL_BY_ID } from '../queries/journals';
import { UPDATE_JOURNAL } from '../mutations/journals';
import { useMutation, useLazyQuery } from '@apollo/client';

function Journal() {
  const { journalId } = useParams();
  const [audioNameS3, setAudioNameS3] = useState('');
  const journalTypeOption = ['diary', 'note'];
  const [type, setType] = useState(journalTypeOption[0]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [moodScore, setMoodScore] = useState(1);
  const [moodFeelings, setMoodFeelings] = useState([]);
  const [moodFactors, setMoodFactors] = useState([]);
  const [date, setDate] = useState(new Date());
  const [getJournalById] = useLazyQuery(GET_JOURNAL_BY_ID);
  const [updateJournal] = useMutation(UPDATE_JOURNAL);

  const dateParser = (yourDate) => {
    const offset = yourDate.getTimezoneOffset()
    yourDate = new Date(yourDate.getTime() - (offset*60*1000))
    return yourDate.toISOString().split('T')[0];
  }
  useEffect(() => {
    const getJournalInfo = async () => {
      const {data} = await getJournalById({variables: {id: journalId}});
      if (!data) return alert('筆記不存在');
      setType(data.getJournalbyId.type);
      setContent(data.getJournalbyId.content);
      setMoodScore(data.getJournalbyId.moodScore);
      setMoodFeelings(data.getJournalbyId.moodFeelings);
      setMoodFactors(data.getJournalbyId.moodFactors);
      setTitle(data.getJournalbyId.title);
      setDate(new Date(data.getJournalbyId.title));
    }
    getJournalInfo();
  }, [journalId]);

  const update = () => {
    const updateExistingJournal = async () => {
      let journalInput;
      if (type === 'note') {
        if (!title || !content) return alert('筆記名稱及內容不能為空白');
        journalInput = {
          title,
          content,
        };
      } else {
        if (!content) return alert('筆記內容不能為空白');
        journalInput= {
          title: dateParser(date),
          diaryDate: dateParser(date),
          content,
          moodScore,
          moodFeelings,
          moodFactors,
        };
      }
      // console.log(journalInput)
      try {
        const res = await updateJournal({ variables: { id: journalId, journalInput } });
        console.log(res)
        const { data } = await updateJournal({ variables: { id: journalId, journalInput } });
        const { title } = data.updateJournal;
        alert(`筆記修改成功：${title}`);
      } catch (error) {
        if (error.message.includes('DUPLICATE_TITLE')) return alert(`修改失敗，筆記名稱重複: ${title}`);
        console.error(error);
      }
    };
    updateExistingJournal();
  };

  // TODO: 判斷有變動才顯示 save + 按鈕
  return (
    <>
      <div className="card flex justify-content-center">
        <SelectButton
          disabled={true}
          value={type}
          allowEmpty={false}
          onChange={(e) => setType(e.value)}
          options={journalTypeOption}
        />
      </div>
      <div className="card flex justify-content-center">
        {type === 'note'? (
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
      { content ? (
        <MarkdownEditor
        audioNameS3={audioNameS3}
        setAudioNameS3={setAudioNameS3}
        setContent={setContent}
        content={content}
        journalId={journalId}
        />
      ) : null
      }
      {type === 'diary' && title ? (
        <Emotion
          moodScore={moodScore}
          setMoodScore={setMoodScore}
          moodFeelings={moodFeelings}
          setMoodFeelings={setMoodFeelings}
          moodFactors={moodFactors}
          setMoodFactors={setMoodFactors}
          content={content}
          journalId={journalId}
        />
      ) : null}
      <Backlink journalId={journalId}/>
      <div className="card flex justify-content-center">
        <span className="p-buttonset" >
            <Button label="Save" icon="pi pi-check" onClick={update} key={journalId}/>
        </span>
      </div>
    </>
  );
}

export default Journal;
