import { useState, useEffect, useRef } from 'react';
import { Chart } from 'primereact/chart';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { GET_AUTOCOMPLETE } from '../queries/journals.js';
import {
  GET_MOOD_SCORE_LINE_CHART,
  GET_FEELING_PIE_CHART,
  GET_FACTOR_SCATTER_CHART,
} from '../queries/chart.js';
import { useLazyQuery } from '@apollo/client';
import { AutoComplete } from 'primereact/autocomplete';
import { Scatter } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import 'chart.js/auto';

const FeelingColorMapping = {
  愉快: '--yellow-100',
  樂觀: '--yellow-200',
  有趣: '--yellow-300',
  興奮: '--yellow-400',
  刺激: '--yellow-500',
  放鬆: '--teal-100',
  感恩: '--teal-200',
  安全: '--teal-300',
  親密: '--teal-400',
  深思: '--teal-500',
  覺察: '--orange-100',
  被尊重: '--orange-200',
  自豪: '--orange-300',
  有價值: '--orange-400',
  充滿信心: '--orange-500',
  迷惑: '--purple-100',
  尷尬: '--purple-200',
  氣餒: '--purple-300',
  無助: '--purple-400',
  信心不足: '--purple-500',
  焦慮: '--purple-600',
  懷疑: '--pink-100',
  受挫: '--pink-200',
  受傷: '--pink-300',
  憤怒: '--pink-400',
  嫉妒: '--pink-500',
  敵意: '--pink-600',
  疲倦: '--indigo-100',
  無聊: '--indigo-200',
  孤獨: '--indigo-300',
  憂鬱: '--indigo-400',
  慚愧: '--indigo-500',
  後悔: '--indigo-600',
};

function Dashboard() {
  const [date, setDate] = useState(null);
  const [selectedView, setSelectedView] = useState(null);
  const [lineChartData, setLineChartData] = useState({});
  const [linechartOptions, setLineChartOptions] = useState({});
  const [pieChartData, setPieChartData] = useState({});
  const [pieChartOptions, setPieChartOptions] = useState({});
  const [scatterChartData, setScatterChartData] = useState({ datasets: [] });
  const [scatterChartOptions, setScatterChartOptions] = useState({});
  const [autocompleteValue, setAutocompleteValue] = useState('');
  const [autocompleteItems, setAutocompleteItems] = useState([]);
  const fetchPolicy = 'network-only';
  const [getMoodScoreLineChart] = useLazyQuery(GET_MOOD_SCORE_LINE_CHART, { fetchPolicy });
  const [getFeelingPieChart] = useLazyQuery(GET_FEELING_PIE_CHART, { fetchPolicy });
  const [getFactorScatterChart] = useLazyQuery(GET_FACTOR_SCATTER_CHART, { fetchPolicy });
  const [getAutocomplete] = useLazyQuery(GET_AUTOCOMPLETE, { fetchPolicy });

  const documentStyle = getComputedStyle(document.documentElement);
  const textColor = documentStyle.getPropertyValue('--text-color');
  const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
  const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

  const views = [
    { name: 'Month', axisScale: 'day' },
    { name: 'Year', axisScale: 'month' },
  ];

  const refreshMoodScoreLineChart = async (view, selectedDate) => {
    const period = view.name;
    const res = await getMoodScoreLineChart({ variables: { period, selectedDate } });
    const data = {
      labels: res.data?.getMoodScoreLineChart?.labels || [],
      datasets: [
        {
          label: 'Mood Score',
          data: res.data?.getMoodScoreLineChart?.data || [],
          fill: false,
          borderColor: documentStyle.getPropertyValue('--blue-300'),
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
  const refreshFeelingPieChart = async (view, selectedDate) => {
    const period = view.name;
    const res = await getFeelingPieChart({ variables: { period, selectedDate } });
    const labels = res.data?.getFeelingPieChart?.labels || [];
    const chartDate = res.data?.getFeelingPieChart?.data || [];
    const backgroundColor = labels.map((label) =>
      documentStyle.getPropertyValue(FeelingColorMapping[label]),
    );
    const data = {
      labels,
      datasets: [
        {
          data: chartDate,
          backgroundColor,
        },
      ],
    };
    const options = {
      plugins: { legend: { labels: { usePointStyle: true } } },
    };
    setPieChartData(data);
    setPieChartOptions(options);
  };

  const refreshFactorScatterChart = async (view, selectedDate) => {
    const period = view.name;
    const res = await getFactorScatterChart({ variables: { period, selectedDate } });
    const factorArray = res.data.getFactorScatterChart;
    const datasets = factorArray.map((factor) => {
      return {
        label: factor.label,
        data: factor.data,
      };
    });
    const data = { datasets };
    const options = {
      scales: {
        x: {
          type: 'linear',
          title: { display: true, text: '平均分數' },
        },
        y: {
          type: 'linear',
          title: { display: true, text: '提及次數' },
        },
      },
    };
    setScatterChartData(data);
    setScatterChartOptions(options);
  };

  const applyChange = () => {
    if (selectedView && date) {
      refreshMoodScoreLineChart(selectedView, date);
      refreshFeelingPieChart(selectedView, date);
      refreshFactorScatterChart(selectedView, date);
    }
  };

  useEffect(() => {
    const initSelectedView = views[0];
    // TODO: 開發完後改回來
    // const initDate = new Date();
    const initDate = new Date('2023-11-01');
    setSelectedView(initSelectedView);
    setDate(initDate);
    refreshMoodScoreLineChart(initSelectedView, initDate);
    refreshFeelingPieChart(initSelectedView, initDate);
    refreshFactorScatterChart(initSelectedView, initDate);
  }, []);

  // TODO: 按 shift 會跳錯誤
  const autocomplete = async (event) => {
    const { data } = await getAutocomplete({ variables: { keyword: event.query.trim() } });
    const suggestions = data.autoCompleteJournals.map((journal) => journal.title);
    if (suggestions) return setAutocompleteItems(suggestions);
    else return [];
  };

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
          <div className="card flex justify-content-center">
            <Chart
              type="pie"
              data={pieChartData}
              options={pieChartOptions}
              className="w-full md:w-30rem"
            />
          </div>
          <h3>影響因素</h3>
          <div className="card flex justify-content-center">
            <Scatter data={scatterChartData} options={scatterChartOptions} />
          </div>
          <h3>關鍵字</h3>
          <AutoComplete
            className="p-inputtext-sm"
            placeholder="筆記標題"
            value={autocompleteValue}
            suggestions={autocompleteItems}
            completeMethod={autocomplete}
            // onSelect={select}
            onChange={(e) => setAutocompleteValue(e.value)}
            loadingIcon="pi pi-spin pi-spinner"
          />
        </div>
      ) : null}
    </>
  );
}

export default Dashboard;
