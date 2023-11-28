import { useState, useEffect } from 'react';
import { Calendar } from 'primereact/calendar';
import { GET_DIARIES_BY_MONTH } from '../queries/journals';
import { useLazyQuery } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import './Home.css'

const dateParser = (yourDate) => {
  const offset = yourDate.getTimezoneOffset()
  yourDate = new Date(yourDate.getTime() - (offset*60*1000))
  return yourDate.toISOString().split('T')[0];
}

function Home() {
  const [date, setDate] = useState(new Date());
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [refreshDone, setRefreshDone] = useState(false);
  const [monthJournals, setMonthJournals] = useState(0);
  const [getMonthDiaries] = useLazyQuery(GET_DIARIES_BY_MONTH);
  const navigate = useNavigate();

  useEffect(() => {
    const refreshCalendar = async () => {
      const { data } = await getMonthDiaries({ variables: { month: date } });
      const journals = data.getDiariesbyMonth;
      setMonthJournals(journals);
      setRefreshDone(true);
    };
    refreshCalendar();
  }, [refreshFlag]);

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
          moodColorClass += ` mood-${journal.moodScore}`
        } 
      }
    }
    return (
      <span className={moodColorClass}>
        {dateMeta.day}
      </span>
    );
  }

  return (
    <div className="card flex justify-content-center">
      
      {refreshDone ? (
        <Calendar
        value={date}
        onViewDateChange={(e) => {
          setRefreshDone(false);
          setDate(e.value);
          setRefreshFlag(refreshFlag + 1);
        }}
        onMonthChange={(e) => {
          setRefreshDone(false);
          const firstDate = new Date(`${e.year}-${e.month}-01`);
          setDate(firstDate);
          setRefreshFlag(refreshFlag + 1);
        }}
        onChange={pickeDate}
        inline
        showOtherMonths={false}
        dateTemplate={dateStyleTemplate}
      /> ) : null }
    </div>
  );
}

export default Home;
