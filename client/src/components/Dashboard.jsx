import { useState, useEffect } from 'react';
import { Chart } from 'primereact/chart';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { GET_MOOD_SCORE_LINE_CHART } from '../queries/chart.js';
import { useLazyQuery } from '@apollo/client';
import 'chartjs-adapter-date-fns';

function Dashboard() {
  const [date, setDate] = useState(null);
  const [selectedView, setSelectedView] = useState(null);
  const [lineChartData, setLineChartData] = useState({});
  const [linechartOptions, setLineChartOptions] = useState({});
  const [getMoodScoreLineChart] = useLazyQuery(GET_MOOD_SCORE_LINE_CHART, {
    fetchPolicy: 'network-only',
  });

  const documentStyle = getComputedStyle(document.documentElement);
  const textColor = documentStyle.getPropertyValue('--text-color');
  const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
  const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

  const views = [
    { name: 'Month', axisScale: 'day' },
    { name: 'Year', axisScale: 'month' },
  ];

  const refreshMoodScoreLineChart = async (view, selectedDate) => {
    console.log(view);
    console.log(selectedDate);
    const period = view.name;
    const res = await getMoodScoreLineChart({ variables: { period, selectedDate } });
    const data = {
      labels: res.data?.getMoodScoreLineChart?.labels || [],
      datasets: [
        {
          label: 'Mood Score',
          data: res.data?.getMoodScoreLineChart?.data || [],
          fill: false,
          borderColor: documentStyle.getPropertyValue('--blue-500'),
          tension: 0.1,
        },
      ],
    };
    const options = {
      maintainAspectRatio: false,
      aspectRatio: 1,
      plugins: { legend: { labels: { color: textColor } } },
      scales: {
        x: {
          ticks: { color: textColorSecondary },
          grid: { color: surfaceBorder },
          type: 'time',
          time: { unit: selectedView?.axisScale },
        },
        y: {
          ticks: { color: textColorSecondary },
          grid: { color: surfaceBorder },
          max: 10,
          min: 1,
        },
      },
    };
    setLineChartData(data);
    setLineChartOptions(options);
  };

  const applyChange = () => {
    if (selectedView && date) {
      refreshMoodScoreLineChart(selectedView, date);
    }
  };

  useEffect(() => {
    const initSelectedView = views[0];
    const initDate = new Date();
    setSelectedView(initSelectedView);
    setDate(initDate);
    refreshMoodScoreLineChart(initSelectedView, initDate);
  }, []);

  return (
    <>
      <div className="card flex justify-content-center">
        <Calendar
          value={date}
          onChange={(e) => {
            setDate(e.value);
          }}
          view={selectedView?.name === 'Year' ? 'year' : 'month'}
          dateFormat={selectedView?.name === 'Year' ? 'yy' : 'yy-mm'}
        />
        <Dropdown
          value={selectedView}
          onChange={(e) => {
            setSelectedView(e.value);
          }}
          options={views}
          optionLabel="name"
          className="w-full md:w-14rem"
        />
        <Button label="Apply" onClick={applyChange} />
      </div>
      {selectedView && date ? (
        <div>
          <h3>情緒分數</h3>
          <div className="card">
            <Chart type="line" data={lineChartData} options={linechartOptions} />
          </div>
          <h3>情緒分佈</h3>
          <h3>影響因素</h3>
          <h3>關鍵字</h3>
        </div>
      ) : null}
    </>
  );
}

export default Dashboard;
