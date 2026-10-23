import React, { useState, useEffect, useRef } from 'react';
import { whisperEngine } from './whisper/engine';
import { AudioRecorder } from './audio/recorder';

interface TranslationPair {
  id: string;
  translation: string;
  time: string;
}

export default function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [entries, setEntries] = useState<TranslationPair[]>([]);
  const [statusText, setStatusText] = useState('Ready for Conversation');

  const recorderRef = useRef<AudioRecorder | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries, isTranslating]);

  const handleAudioFinished = async (audioBlob: Blob) => {
    if (audioBlob.size < 1000) {
      setStatusText('Recording too short. Try again.');
      setIsTranslating(false);
      return;
    }

    try {
      setStatusText('Translating to English...');
      const translatedText = await whisperEngine.translateAudio(audioBlob);

      if (translatedText && translatedText.length > 1) {
        setEntries((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            translation: translatedText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
      setStatusText('Ready for Conversation');
    } catch (err: any) {
      console.error('Translation error:', err);
      setStatusText('Translation failed. Try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  const startRecording = async () => {
    try {
      setStatusText('Listening... Speak Tagalog now');
      const recorder = new AudioRecorder(handleAudioFinished);
      await recorder.start();
      recorderRef.current = recorder;
      setIsRecording(true);
    } catch (err: any) {
      alert(`Microphone error: ${err.message || err}`);
      setStatusText('Microphone Access Denied');
    }
  };

  const stopRecording = () => {
    if (recorderRef.current) {
      setIsRecording(false);
      setIsTranslating(true);
      setStatusText('Processing audio...');
      recorderRef.current.stop();
      recorderRef.current = null;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#090d16', color: '#f8fafc', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <header style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f172a', borderBottom: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: isRecording ? '#ef4444' : isTranslating ? '#eab308' : '#22c55e', boxShadow: '0 0 10px currentColor' }} />
          <h1 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Language Helper</h1>
        </div>
        <span style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', borderRadius: '9999px', backgroundColor: '#1e293b', color: '#38bdf8', fontWeight: 500 }}>{statusText}</span>
      </header>

      <main style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {entries.length === 0 ? (
          <div style={{ backgroundColor: '#1e293b', padding: '2.5rem 1.5rem', borderRadius: '1rem', border: '1px solid #334155', textAlign: 'center', marginTop: '4rem' }}>
            <h2 style={{ fontSize: '1.35rem', marginBottom: '0.75rem', color: '#f8fafc' }}>Tagalog-English Voice Mode</h2>
            <p style={{ color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>Tap the blue button, speak in Tagalog, and tap stop to see the English translation appear instantly.</p>
          </div>
        ) : (
          entries.map((item) => (
            <div key={item.id} style={{ backgroundColor: '#1e293b', padding: '1.25rem', borderRadius: '0.85rem', borderLeft: '4px solid #38bdf8', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.05em', color: '#38bdf8' }}>ENGLISH TRANSLATION</span>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{item.time}</span>
              </div>
              <p style={{ fontSize: '1.35rem', fontWeight: 500, margin: 0, lineHeight: 1.5, color: '#f1f5f9' }}>{item.translation}</p>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </main>

      <footer style={{ padding: '1.5rem', backgroundColor: '#0f172a', borderTop: '1px solid #1e293b', display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isTranslating}
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: '1.15rem',
            borderRadius: '9999px',
            border: 'none',
            backgroundColor: isRecording ? '#ef4444' : isTranslating ? '#64748b' : '#2563eb',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            cursor: isTranslating ? 'not-allowed' : 'pointer',
            boxShadow: isRecording ? '0 0 20px rgba(239, 68, 68, 0.5)' : '0 4px 16px rgba(37, 99, 235, 0.4)',
          }}
        >
          {isTranslating ? 'Translating Speech...' : isRecording ? '🛑 Stop & Translate' : '🎙️ Tap to Speak (Tagalog)'}
        </button>
      </footer>
    </div>
  );
}
