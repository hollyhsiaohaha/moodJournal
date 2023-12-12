import { useParams } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { SelectButton } from 'primereact/selectbutton';
import { Calendar } from 'primereact/calendar';
import MarkdownEditor from './MarkdownEditor';
import AudioRecording from './AudioRecording';
import Emotion from './Emotion';
import Backlink from './Backlink';
import { GET_JOURNAL_BY_ID } from '../queries/journals';
import { UPDATE_JOURNAL, DELETE_JOURNAL } from '../mutations/journals';
import { useMutation, useLazyQuery } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { Toast } from 'primereact/toast';

function Journal() {
  const { journalId } = useParams();
  const [audioNameS3, setAudioNameS3] = useState('');
  const journalTypeOption = ['diary', 'note'];
  const [type, setType] = useState(journalTypeOption[0]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState(' ');
  const [moodScore, setMoodScore] = useState(1);
  const [moodFeelings, setMoodFeelings] = useState([]);
  const [moodFactors, setMoodFactors] = useState([]);
  const [toastVisible, setToastVisible] = useState(false);
  const toastBC = useRef(null);
  const [date, setDate] = useState(new Date());
  const fetchPolicy = 'network-only';
  const [getJournalById] = useLazyQuery(GET_JOURNAL_BY_ID, { fetchPolicy });
  const [updateJournal] = useMutation(UPDATE_JOURNAL, { fetchPolicy });
  const [deleteJournal] = useMutation(DELETE_JOURNAL, { fetchPolicy });
  const navigate = useNavigate();

  const dateParser = (yourDate) => {
    const offset = yourDate.getTimezoneOffset();
    yourDate = new Date(yourDate.getTime() - offset * 60 * 1000);
    return yourDate.toISOString().split('T')[0];
  };

  const getJournalInfo = async (id) => {
    const { data } = await getJournalById({ variables: { id } });
    if (!data) return alert('筆記不存在');
    setType(data.getJournalbyId.type);
    setContent(data.getJournalbyId.content);
    setMoodScore(data.getJournalbyId.moodScore);
    setMoodFeelings(data.getJournalbyId.moodFeelings);
    setMoodFactors(data.getJournalbyId.moodFactors);
    setTitle(data.getJournalbyId.title);
    setDate(new Date(data.getJournalbyId.title));
  };

  useEffect(() => {
    getJournalInfo(journalId);
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
        journalInput = {
          title: dateParser(date),
          diaryDate: dateParser(date),
          content,
          moodScore,
          moodFeelings,
          moodFactors,
        };
      }
      try {
        const res = await updateJournal({ variables: { id: journalId, journalInput } });
        console.log(res);
        const { data } = await updateJournal({ variables: { id: journalId, journalInput } });
        const { title } = data.updateJournal;
        navigate('/journalList');
        alert(`筆記修改成功：${title}`);
      } catch (error) {
        if (error.message.includes('DUPLICATE_TITLE'))
          return alert(`修改失敗，筆記名稱重複: ${title}`);
        if (error.message.includes('Keyword not exist:')) return alert('連結筆記不存在');
        console.error(error);
      }
    };
    updateExistingJournal();
  };

  const deleteThisJournal = async () => {
    const { data } = await deleteJournal({ variables: { id: journalId } });
    const deleteRes = data.deleteJournal;
    if (deleteRes) {
      alert('刪除成功');
    } else {
      alert('刪除失敗');
    }
    navigate('/journalList');
  }


  const clearToast = () => {
    toastBC.current.clear();
    setToastVisible(false);
  };

  const confirm = () => {
    if (!toastVisible) {
      setToastVisible(true);
        toastBC.current.clear();
        toastBC.current.show({
            severity: 'warn',
            sticky: true,
            content: () => (
                <div className="flex flex-column align-items-left" style={{ flex: '1' }}>
                    <div className="font-medium text-lg my-3 text-900">{`確定要刪除筆記嗎: ${title}`}</div>
                    <Button className="p-button-sm flex" label="確認" severity="error" onClick={deleteThisJournal}></Button>
                </div>
            )
        });
    }
  };

  return (
    <>
      <Toast ref={toastBC} position="bottom-center" onRemove={clearToast} />
      <div className="card flex justify-content-center">
        <div className="mr-5">
          <SelectButton
            disabled={true}
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
        journalId={journalId}
      />
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
      <Backlink journalId={journalId} />
      <div className="card flex justify-content-center">
        <span className="p-buttonset">
          <Button label="Save" icon="pi pi-check" onClick={update} key={journalId} />
          <Button
            label="Delete"
            severity="danger"
            icon="pi pi-times"
            onClick={confirm}
          />
        </span>
      </div>
    </>
  );
}

export default Journal;
