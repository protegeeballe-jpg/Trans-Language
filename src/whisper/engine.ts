export const whisperEngine = {
  async translateAudio(audioBlob: Blob): Promise<string> {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;

    if (!apiKey) {
      throw new Error('Groq API Key (VITE_GROQ_API_KEY) is missing in environment variables.');
    }

    // Step 1: Transcribe Tagalog audio accurately using Whisper
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-large-v3');
    formData.append('language', 'tl');

    const transcriptionResponse = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: formData,
    });

    if (!transcriptionResponse.ok) {
      throw new Error('Audio transcription failed.');
    }

    const transcriptionData = await transcriptionResponse.json();
    const tagalogText = (transcriptionData.text || '').trim();

    if (!tagalogText) return '';

    // Step 2: Translate Tagalog text into natural English using Llama 3.1
    const chatResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'You are an expert Tagalog-to-English translator. Translate the provided Tagalog text into natural, accurate English. Output ONLY the English translation without quotes or extra commentary.'
          },
          { role: 'user', content: tagalogText }
        ],
        temperature: 0.1,
      }),
    });

    if (!chatResponse.ok) {
      return tagalogText; // Fallback
    }

    const chatData = await chatResponse.json();
    return chatData.choices?.[0]?.message?.content?.trim() || tagalogText;
  },
};
