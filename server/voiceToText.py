from openai import OpenAI
client = OpenAI()

audio_file= open("./test.mp4", "rb")
transcript = client.audio.transcriptions.create(
  model="whisper-1",
  file=audio_file,
  language="zh",
  response_format="json",
)

print(transcript)