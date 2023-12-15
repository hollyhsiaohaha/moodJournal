import { useState, useEffect } from 'react';
import { TreeSelect } from 'primereact/treeselect';
import { Knob } from 'primereact/knob';
import PropTypes from 'prop-types';
import { useLazyQuery } from '@apollo/client';
import { GET_FEELINGS, GET_FACTORS, SENTIMENT_ANALYSIS } from '../queries/emotion';
import { Button } from 'primereact/button';
import { toast } from 'react-toastify';

function Emotion({
  moodScore,
  setMoodScore,
  moodFeelings,
  setMoodFeelings,
  moodFactors,
  setMoodFactors,
  content,
  journalId,
}) {
  const [feelingNodes, setFeelingNodes] = useState(null);
  const [selectedFeelingNodes, setSelectedFeelingNodes] = useState(null);
  const [factorNodes, setFactorNodes] = useState(null);
  const [selectedFactorNodes, setSelectedFactorNodes] = useState(null);
  const fetchPolicy = 'network-only';
  const [getFeelings] = useLazyQuery(GET_FEELINGS, { fetchPolicy });
  const [getFactors] = useLazyQuery(GET_FACTORS, { fetchPolicy });
  const [getSentimentAnalysis] = useLazyQuery(SENTIMENT_ANALYSIS, { fetchPolicy });
  const [loading, setLoading] = useState(false);

  const nodesToArray = (nodes, nodeList) => {
    const resArray = [];
    if (!nodes) return resArray;
    for (const [key, value] of Object.entries(nodes)) {
      if (key.includes('-') && value.checked) {
        const categoryIdx = key.split('-')[0];
        const nodeIdx = key.split('-')[1];
        const node = nodeList[categoryIdx].children[nodeIdx];
        resArray.push(node.data);
      }
    }
    return resArray;
  };

  const ArrayToNodes = (array, nodeList) => {
    const nodesMapping = {};
    const nodes = {};
    if (!array) return null;
    for (const category of nodeList) {
      for (const node of category.children) {
        nodesMapping[node.data] = node.key;
      }
    }
    for (const item of array) {
      const key = nodesMapping[item];
      if (key) {
        nodes[key] = { checked: true, partialChecked: false };
        nodes[key.split('-')[0]] = { checked: false, partialChecked: true };
      }
    }
    return nodes;
  };

  useEffect(() => {
    const initFeelingNodes = async () => {
      const { data } = await getFeelings();
      const feelings = data.getFeelings;
      const nodes = [];
      for (let i = 0; i < feelings.length; i++) {
        const category = feelings[i];
        const children = category.values.map((value, idx) => {
          return { key: `${i}-${idx}`, label: value, data: value };
        });
        const categoryObj = {
          key: i,
          label: category.name,
          data: category.name,
          children,
        };
        nodes.push(categoryObj);
      }
      setFeelingNodes(nodes);
      const initMoodFeelings = moodFeelings;
      if (initMoodFeelings) setSelectedFeelingNodes(ArrayToNodes(initMoodFeelings, nodes));
    };
    const initFactorNodes = async () => {
      const { data } = await getFactors();
      const factors = data.getFactors;
      const nodes = [];
      for (let i = 0; i < factors.length; i++) {
        const category = factors[i];
        const children = category.values.map((value, idx) => {
          return { key: `${i}-${idx}`, label: value, data: value };
        });
        const categoryObj = {
          key: i,
          label: category.name,
          data: category.name,
          children,
        };
        nodes.push(categoryObj);
      }
      setFactorNodes(nodes);
      const initMoodFactors = moodFactors;
      if (initMoodFactors) setSelectedFactorNodes(ArrayToNodes(initMoodFactors, nodes));
    };
    initFeelingNodes();
    initFactorNodes();
  }, [journalId]);

  useEffect(() => {
    setMoodFeelings(nodesToArray(selectedFeelingNodes, feelingNodes));
  }, [selectedFeelingNodes]);

  useEffect(() => {
    setMoodFactors(nodesToArray(selectedFactorNodes, factorNodes));
  }, [selectedFactorNodes]);

  const emotionAnalysis = async () => {
    setLoading(true);
    if (!content.trim()) {
      setLoading(false);
      return toast.warn('請先輸入內容');
    }
    const regexBrackets = /\[\[(.*?)\]\]/g;
    const regexAudioTag = /\<audio.*?\<\/audio\>/gs;
    const contentRemoveBrackets = content.replace(regexBrackets, '$1');
    const journalContent = contentRemoveBrackets.replace(regexAudioTag, '');
    const { data } = await getSentimentAnalysis({
      variables: {
        journalContent,
      },
    });
    const res = data.sentimentAnalysisOpenAi;
    if (res) {
      const { score, factor, feeling } = res;
      if (!score || !factor || !feeling) {
        setLoading(false);
        return toast.warn('未偵測出任何情緒 請手動輸入');
      }
      const feelingNodeAnalysis = ArrayToNodes(feeling, feelingNodes);
      const factorNodeAnalysis = ArrayToNodes(factor, factorNodes);
      setMoodScore(score);
      setSelectedFeelingNodes(feelingNodeAnalysis);
      setSelectedFactorNodes(factorNodeAnalysis);
    } else toast.error('目前無法使用情緒偵測');
    setLoading(false);
  };
  return (
    <>
      <h3>情緒紀錄</h3>
      <Button label="情緒偵測" severity="secondary" loading={loading} onClick={emotionAnalysis} />
      <div className="card flex justify-content-center">
        <div className="mr-8">
          <h4>分數</h4>
          <Knob value={moodScore} onChange={(e) => setMoodScore(e.value)} min={1} max={10} />
        </div>
        <div className="mr-5">
          <h4>感受</h4>
          <TreeSelect
            value={selectedFeelingNodes}
            onChange={(e) => setSelectedFeelingNodes(e.value)}
            options={feelingNodes}
            metaKeySelection={false}
            className="md:w-20rem w-full"
            selectionMode="checkbox"
            display="chip"
            placeholder="Select Items"
          ></TreeSelect>
        </div>
        <div className="mr-5">
          <h4>影響因素</h4>
          <TreeSelect
            value={selectedFactorNodes}
            onChange={(e) => setSelectedFactorNodes(e.value)}
            options={factorNodes}
            metaKeySelection={false}
            className="md:w-20rem w-full"
            selectionMode="checkbox"
            display="chip"
            placeholder="Select Items"
          ></TreeSelect>
        </div>
      </div>
    </>
  );
}

Emotion.propTypes = {
  audioNameS3: PropTypes.string,
  setAudioNameS3: PropTypes.func,
  setContent: PropTypes.func,
  moodScore: PropTypes.number,
  setMoodScore: PropTypes.func,
  moodFeelings: PropTypes.array,
  setMoodFeelings: PropTypes.func,
  moodFactors: PropTypes.array,
  setMoodFactors: PropTypes.func,
  content: PropTypes.string,
  journalId: PropTypes.string,
};

export default Emotion;
