import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { SelectButton } from 'primereact/selectbutton';
import { Calendar } from 'primereact/calendar';
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup';
import MarkdownEditor from './MarkdownEditor';
import AudioRecording from './AudioRecording';
import Emotion from './Emotion';
import Backlink from './Backlink';
import { GET_JOURNAL_BY_ID } from '../queries/journals';
import { UPDATE_JOURNAL, DELETE_JOURNAL } from '../mutations/journals';
import { useMutation, useLazyQuery } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

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
    if (!data) {
      navigate('/journalList');
      return toast.error('筆記不存在');
    }
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
        if (!title || !content) return toast.error('筆記名稱及內容不能為空白');
        journalInput = {
          title,
          content,
        };
      } else {
        if (!content) return toast.error('筆記內容不能為空白');
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
        toast.success(`筆記修改成功：${title}`);
      } catch (error) {
        if (error.message.includes('DUPLICATE_TITLE'))
          return toast.error(`修改失敗，筆記名稱重複: ${title}`);
        if (error.message.includes('Keyword not exist:')) return toast.error('連結筆記不存在');
        console.error(error);
      }
    };
    updateExistingJournal();
  };

  const deleteThisJournal = async () => {
    const { data } = await deleteJournal({ variables: { id: journalId } });
    const deleteRes = data.deleteJournal;
    if (deleteRes) toast.success('刪除成功');
    else toast.error('刪除失敗');
    navigate('/journalList');
  };

  const confirm = (event) => {
    confirmPopup({
      target: event.currentTarget,
      message: '確定要刪除此則筆記？',
      icon: 'pi pi-info-circle',
      acceptClassName: 'p-button-danger',
      accept: deleteThisJournal,
      reject: () => toast.warn('取消'),
    });
  };

  return (
    <>
      <ConfirmPopup />
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
          <Button label="儲存" icon="pi pi-check" onClick={update} key={journalId} />
          <Button label="刪除" severity="danger" icon="pi pi-times" onClick={confirm} />
        </span>
      </div>
    </>
  );
}

export default Journal;
