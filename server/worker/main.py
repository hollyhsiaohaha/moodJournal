from flask import Flask, request, jsonify
from transformers import  BertTokenizerFast, BertModel
from sklearn.metrics.pairwise import cosine_similarity

feelings = [
  '興奮',     '刺激',   '愉快',
  '有趣',     '樂觀',   '放鬆',
  '感恩',     '安全',   '親密',
  '深思',     '覺察',   '自豪',
  '被尊重',   '有價值', '充滿信心',
  '迷惑',     '氣餒',   '無助',
  '信心不足', '尷尬',   '焦慮',
  '懷疑',     '憤怒',   '嫉妒',
  '受挫',     '敵意',   '受傷',
  '疲倦',     '無聊',   '孤獨',
  '憂鬱',     '慚愧',   '後悔'
]

factors = [
  '健康', '心靈', '嗜好',
  '同儕', '家人', '朋友',
  '伴侶', '家務', '工作',
  '教育', '天氣', '時事',
  '金錢'
]

def get_vector(word, model, tokenizer):
    inputs = tokenizer(word, return_tensors="pt")
    outputs = model(**inputs)
    return outputs.last_hidden_state[:, 0, :].detach().numpy()

def find_most_similar(word_vectors, text_vector):
    similarities = {word: cosine_similarity(word_vector, text_vector) for word, word_vector in word_vectors.items()}
    return max(similarities, key=similarities.get)

tokenizer = BertTokenizerFast.from_pretrained('bert-base-chinese')
model = BertModel.from_pretrained('bert-base-chinese')

feeling_vectors = {word: get_vector(word, model, tokenizer) for word in feelings}
factor_vectors = {word: get_vector(word, model, tokenizer) for word in factors}

app = Flask(__name__)

@app.route('/get_feelings_and_factors', methods=['POST'])
def get_feelings_and_factors():
    data = request.json
    text = data.get('text')
    if not text:
        return jsonify({"error": "No text provided"}), 400
    text_vector = get_vector(text, model, tokenizer)
    most_similar_feeling = find_most_similar(feeling_vectors, text_vector)
    most_similar_factor = find_most_similar(factor_vectors, text_vector)
    result = {
        "feeling": [most_similar_feeling],
        "factor": [most_similar_factor],
    }
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=5000)
