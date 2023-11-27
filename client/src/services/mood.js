import { useLazyQuery } from '@apollo/client';
import { GET_FEELINGS, GET_FACTORS } from '../queries/emotion';

const fetchFeelingNodes = async () => {
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
  // console.log(feelings)
  // console.log(nodes)
  // setFeelingNodes(nodes);
  return (nodes)
}