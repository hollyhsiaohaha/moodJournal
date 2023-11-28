import { useState, useEffect } from 'react';
import { Calendar } from 'primereact/calendar';
import { DataView } from 'primereact/dataview';
import { Rating } from 'primereact/rating';
import { GET_DIARIES_BY_MONTH, GET_LATEST_JOURNALS } from '../queries/journals';
import { useLazyQuery } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './Home.css';

const dateParser = (yourDate) => {
  const offset = yourDate.getTimezoneOffset();
  yourDate = new Date(yourDate.getTime() - offset * 60 * 1000);
  return yourDate.toISOString().split('T')[0];
};

function Home() {
  const [date, setDate] = useState(new Date());
  const [calendarRefreshFlag, setcalendarRefreshFlag] = useState(0);
  const [calendarRefreshDone, setcalendarRefreshDone] = useState(false);
  const [monthJournals, setMonthJournals] = useState(0);
  const [latestDiaries, setLatestDiaries] = useState([]);
  const [latestNotes, setLatestNotes] = useState([]);
  const [getMonthDiaries] = useLazyQuery(GET_DIARIES_BY_MONTH);
  const [getLatesJournals] = useLazyQuery(GET_LATEST_JOURNALS);
  const navigate = useNavigate();

  // === calendar ===
  useEffect(() => {
    const refreshCalendar = async () => {
      const { data } = await getMonthDiaries({ variables: { month: date } });
      const journals = data.getDiariesbyMonth;
      setMonthJournals(journals);
      setcalendarRefreshDone(true);
    };
    refreshCalendar();
  }, [calendarRefreshFlag]);

  const pickeDate = (e) => {
    const dateString = dateParser(e.value);
    for (const journal of monthJournals) {
      if (journal.title === dateString) return navigate(`/journal/${journal._id}`);
    }
    alert('日記不存在');
  };

  const dateStyleTemplate = (dateMeta) => {
    const m = dateMeta.month + 1;
    const d = dateMeta.day;
    const dateString = `${dateMeta.year}-${m < 10 ? '0' + m : m}-${d < 10 ? '0' + d : d}`;
    let moodColorClass = 'mood-circle';
    if (monthJournals) {
      for (const journal of monthJournals || []) {
        if (journal.title === dateString) {
          moodColorClass += ` mood-${journal.moodScore}`;
        }
      }
    }
    return <span className={moodColorClass}>{dateMeta.day}</span>;
  };

  // ============
  useEffect(() => {
    const getNotes = async () => {
      const { data } = await getLatesJournals({
        variables: {
          amount: 5,
          type: 'note',
        },
      });
      if (data) setLatestNotes(data.getUserLatestJournals);
    };
    const getDiaries = async () => {
      const { data } = await getLatesJournals({
        variables: {
          amount: 5,
          type: 'diary',
        },
      });
      console.log(data);
      if (data) setLatestDiaries(data.getUserLatestJournals);
    };
    getNotes();
    getDiaries();
  }, []);

  const noteItemTemplate = (journal) => {
    return (
      <div className="col-12">
        <div className="flex flex-column p-2 gap-2">
          <div className="flex flex-column sm:flex-row justify-content-between align-items-center xl:align-items-start flex-1 gap-4">
            <div className="flex flex-column align-items-center sm:align-items-start gap-3">
              <Link to={`/journal/${journal._id}`}>{journal.title}</Link>
            </div>
            <span className="text-xs">{`${journal.content.slice(0, 50)}${
              journal.content.length > 50 ? '...' : ''
            }`}</span>
            <span className="text-xs">{dateParser(new Date(Number(journal.updatedAt)))}</span>
          </div>
        </div>
      </div>
    );
  };

  const diaryItemTemplate = (journal) => {
    return (
      <div className="col-12">
        <div className="flex flex-column p-2 gap-2">
          <div className="flex flex-column sm:flex-row justify-content-between align-items-center xl:align-items-start flex-1 gap-4">
            <div className="flex flex-column align-items-center sm:align-items-start gap-3">
              <Link to={`/journal/${journal._id}`}>{journal.title}</Link>
              <span className="text-xs">{`❤️ ${journal.moodScore}`}</span>
            </div>
            <span className="text-xs">{`${journal.content.slice(0, 50)}${
              journal.content.length > 50 ? '...' : ''
            }`}</span>
            <span className="text-xs">{dateParser(new Date(Number(journal.updatedAt)))}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <h3>情緒月曆</h3>
      <div className="card flex justify-content-center">
        {calendarRefreshDone ? (
          <Calendar
            value={date}
            onViewDateChange={(e) => {
              setcalendarRefreshDone(false);
              setDate(e.value);
              setcalendarRefreshFlag(calendarRefreshFlag + 1);
            }}
            onMonthChange={(e) => {
              setcalendarRefreshDone(false);
              const firstDate = new Date(`${e.year}-${e.month}-01`);
              setDate(firstDate);
              setcalendarRefreshFlag(calendarRefreshFlag + 1);
            }}
            onChange={pickeDate}
            inline
            showOtherMonths={false}
            dateTemplate={dateStyleTemplate}
          />
        ) : null}
      </div>
      <h3>最新日記</h3>
      <div className="card">
        <DataView value={latestDiaries} itemTemplate={diaryItemTemplate} emptyMessage="尚無筆記" />
      </div>
      <h3>最新筆記</h3>
      <div className="card">
        <DataView value={latestNotes} itemTemplate={noteItemTemplate} emptyMessage="尚無筆記" />
      </div>
    </>
  );
}

export default Home;
