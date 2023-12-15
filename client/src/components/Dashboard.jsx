import { useState, useEffect } from 'react';
import { Chart } from 'primereact/chart';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Tooltip } from 'primereact/tooltip';
import { GET_AUTOCOMPLETE } from '../queries/journals.js';
import {
  GET_MOOD_SCORE_LINE_CHART,
  GET_FEELING_PIE_CHART,
  GET_FACTOR_SCATTER_CHART,
  GET_KEYWORD_BAR_CHART,
} from '../queries/chart.js';
import { useLazyQuery } from '@apollo/client';
import { AutoComplete } from 'primereact/autocomplete';
import { Scatter } from 'react-chartjs-2';
import { FeelingColorMapping, FactorColorMapping } from '../utils/colorMapping.js';
import 'chartjs-adapter-date-fns';
import 'chart.js/auto';
import { io } from 'socket.io-client';

function Dashboard() {
  const views = [
    { name: 'Month', axisScale: 'day' },
    { name: 'Year', axisScale: 'month' },
  ];
  const [date, setDate] = useState(new Date());
  const [selectedView, setSelectedView] = useState(views[0]);
  const [lineChartData, setLineChartData] = useState({});
  const [linechartOptions, setLineChartOptions] = useState({});
  const [pieChartData, setPieChartData] = useState({});
  const [pieChartOptions, setPieChartOptions] = useState({});
  const [scatterChartData, setScatterChartData] = useState({ datasets: [] });
  const [scatterChartOptions, setScatterChartOptions] = useState({});
  const [barChartData, setBarChartData] = useState({});
  const [barChartOptions, setBarChartOptions] = useState({});
  const [autocompleteValue, setAutocompleteValue] = useState('');
  const [selectedAutocompleteValue, setSelectedAutocompleteValue] = useState('');
  const [autocompleteItems, setAutocompleteItems] = useState([]);
  const fetchPolicy = 'network-only';
  const [getMoodScoreLineChart] = useLazyQuery(GET_MOOD_SCORE_LINE_CHART, { fetchPolicy });
  const [getFeelingPieChart] = useLazyQuery(GET_FEELING_PIE_CHART, { fetchPolicy });
  const [getFactorScatterChart] = useLazyQuery(GET_FACTOR_SCATTER_CHART, { fetchPolicy });
  const [getKeywordBarChart] = useLazyQuery(GET_KEYWORD_BAR_CHART, { fetchPolicy });
  const [getAutocomplete] = useLazyQuery(GET_AUTOCOMPLETE, { fetchPolicy });

  const documentStyle = getComputedStyle(document.documentElement);
  const textColor = documentStyle.getPropertyValue('--text-color');
  const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
  const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

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
        backgroundColor: documentStyle.getPropertyValue(FactorColorMapping[factor.label]),
      };
    });
    let maxY = 1;
    datasets.forEach((item) => {
      item.data[0]?.y > maxY ? (maxY = item.data[0]?.y) : null;
    });
    const data = { datasets };
    const options = {
      scales: {
        x: { title: { display: true, text: '平均分數' }, min: 0, max: 10 },
        y: {
          title: { display: true, text: '提及次數' },
          ticks: { stepSize: 1 },
          min: 0,
          max: Math.ceil(maxY * 1.2),
        },
      },
      elements: { point: { radius: 8 } },
    };
    setScatterChartData(data);
    setScatterChartOptions(options);
  };

  const refreshKeywordBarChart = async (view, selectedDate, keyword) => {
    const options = {
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        tooltips: { mode: 'index', intersect: false },
        legend: { labels: { color: textColor } },
      },
      scales: {
        x: {
          stacked: true,
          ticks: { color: textColorSecondary },
          grid: { color: surfaceBorder },
        },
        y: {
          stacked: true,
          ticks: { color: textColorSecondary, stepSize: 1 },
          grid: { color: surfaceBorder },
          title: { display: true, text: '提及次數' },
        },
      },
    };

    if (!keyword) return setBarChartOptions(options);
    const period = view.name;
    const res = await getKeywordBarChart({ variables: { period, selectedDate, keyword } });
    const keywordFeeling = res?.data?.getKeywordBarChart;
    if (!keywordFeeling) return setBarChartOptions(options);
    const data = {
      labels: keywordFeeling.labels,
      datasets: keywordFeeling.datasets.map((dataset) => {
        return {
          label: dataset.label,
          data: dataset.data,
          backgroundColor: documentStyle.getPropertyValue(FeelingColorMapping[dataset.label]),
        };
      }),
    };
    setBarChartData(data);
    setBarChartOptions(options);
  };

  const applyChange = () => {
    if (selectedView && date) {
      refreshMoodScoreLineChart(selectedView, date);
      refreshFeelingPieChart(selectedView, date);
      refreshFactorScatterChart(selectedView, date);
      refreshKeywordBarChart(selectedView, date, selectedAutocompleteValue);
    }
  };

  useEffect(() => applyChange(), []);

  useEffect(() => {
    const { protocol, hostname } = window.location;
    const port = hostname === 'localhost' ? ':3000' : '';
    const uri = `${protocol}//${hostname}${port}`;
    const socket = io(uri);
    socket.on('connection', () => {
      console.log('[Client] connected to server');
    });
    socket.on('message', (msg) => {
      if (msg === 'journal update') {
        console.log('refresh due to journal update');
        applyChange();
      }
    });
    socket.on('disconnect', () => {
      console.log('[Client] disconnected');
    });
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    refreshKeywordBarChart(selectedView, date, selectedAutocompleteValue);
  }, [selectedAutocompleteValue]);

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
        <Button label="更新圖表" onClick={applyChange} />
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
            placeholder="輸入筆記標題"
            value={autocompleteValue}
            suggestions={autocompleteItems}
            completeMethod={autocomplete}
            onSelect={(e) => setSelectedAutocompleteValue(e.value)}
            onChange={(e) => setAutocompleteValue(e.value)}
            loadingIcon="pi pi-spin pi-spinner"
          />
          <Tooltip target=".custom-target-icon" />
          <i
            className="custom-target-icon pi pi-info-circle p-text-secondary p-1"
            data-pr-tooltip="輸入筆記標題進行搜尋"
            data-pr-position="right"
            data-pr-at="right+5 top"
            data-pr-my="left center-2"
            style={{ fontSize: '1rem', cursor: 'pointer' }}
          ></i>
          <div className="card">
            <Chart type="bar" data={barChartData} options={barChartOptions} />
          </div>
        </div>
      ) : null}
    </>
  );
}

export default Dashboard;
