export const Feelings = [
  {
    name: '平靜',
    values: ['放鬆', '感恩', '安全', '親密', '深思'],
  },
  {
    name: '喜悅',
    values: ['愉快', '樂觀', '有趣', '興奮', '刺激'],
  },
  {
    name: '力量',
    values: ['覺察', '被尊重', '自豪', '有價值', '充滿信心'],
  },
  {
    name: '生氣',
    values: ['懷疑', '受挫', '受傷', '憤怒', '嫉妒', '敵意'],
  },
  {
    name: '恐懼',
    values: ['迷惑', '尷尬', '氣餒', '無助', '信心不足', '焦慮'],
  },
  {
    name: '悲傷',
    values: ['疲倦', '無聊', '孤獨', '憂鬱', '慚愧', '後悔'],
  },
];

export const Factors = [
  {
    name: '自我照顧',
    values: ['健康', '心靈', '嗜好'],
  },
  {
    name: '關係',
    values: ['同儕', '家人', '朋友', '伴侶'],
  },
  {
    name: '日常',
    values: ['家務', '工作', '教育', '天氣', '時事', '金錢'],
  },
];

export const feelingOptions = [];
Feelings.forEach((feelingCategory) => {
  feelingOptions.push(...feelingCategory.values);
});
export const factorOptions = [];
Factors.forEach((factorCategory) => {
  factorOptions.push(...factorCategory.values);
});

export const prompt = `接下來我會給你一則文章，請以 json 的格式回傳給我答覆。
                       資料型態如下：{score: interger, feeling: array, factor: array}
                       以下是各個項目的解說：
                       score 為本篇文章的情緒分數，10 為最高分，1為最低分。
                       feeling 為從以下情緒項目選出最相似的，並輸出成 array，十分確定才可加入情緒項目。
                       情緒項目：${feelingOptions.join(',')}。
                       factor 為從以下要素項目選出最相似的，並輸出成 array，十分確定才可加入要素項目。
                       要素項目：${factorOptions.join(',')}。
                      `;
