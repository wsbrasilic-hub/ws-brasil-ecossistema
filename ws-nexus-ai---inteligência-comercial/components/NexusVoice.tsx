
import React, { useState, useRef } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage, Blob } from '@google/genai';

const NexusVoice: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Hooks diretos garantem que o React não perca a referência no dispatcher
  const audioContextIn = useRef<AudioContext | null>(null);
  const audioContextOut = useRef<AudioContext | null>(null);
  const nextStartTime = useRef(0);
  const sources = useRef(new Set<AudioBufferSourceNode>());
  const streamRef = useRef<MediaStream | null>(null);

  function encode(bytes: Uint8Array) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) { binary += String.fromCharCode(bytes[i]); }
    return btoa(binary);
  }

  function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) { bytes[i] = binaryString.charCodeAt(i); }
    return bytes;
  }

  async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) { channelData[i] = dataInt16[i * numChannels + channel] / 32768.0; }
    }
    return buffer;
  }

  function createBlob(data: Float32Array): Blob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) { int16[i] = data[i] * 32768; }
    return { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
  }

  const stopAllAudio = () => {
    for (const source of sources.current.values()) {
      try { source.stop(); } catch(e) {}
      sources.current.delete(source);
    }
    nextStartTime.current = 0;
  };

  const toggleConnection = async () => {
    if (isActive) {
      if (streamRef.current) { streamRef.current.getTracks().forEach(track => track.stop()); }
      stopAllAudio();
      setIsActive(false);
      return;
    }

    setIsConnecting(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      if (!audioContextIn.current) audioContextIn.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      if (!audioContextOut.current) audioContextOut.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: 'Você é o Nexus, inteligência comercial da WS Brasil. Responda de forma curta e executiva.',
        },
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsActive(true);
            const source = audioContextIn.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextIn.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextIn.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && audioContextOut.current) {
              nextStartTime.current = Math.max(nextStartTime.current, audioContextOut.current.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), audioContextOut.current, 24000, 1);
              const source = audioContextOut.current.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(audioContextOut.current.destination);
              source.addEventListener('ended', () => sources.current.delete(source));
              source.start(nextStartTime.current);
              nextStartTime.current += audioBuffer.duration;
              sources.current.add(source);
            }
            if (message.serverContent?.interrupted) { stopAllAudio(); }
          },
          onerror: () => setIsActive(false),
          onclose: () => setIsActive(false)
        }
      });
    } catch (err) {
      console.error(err);
      setIsConnecting(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[1000] flex flex-col items-end gap-4">
      {isActive && (
        <div className="bg-slate-900/90 border border-amber-500/30 p-6 rounded-[2rem] shadow-2xl animate-fadeIn max-w-xs backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex gap-1">
              <div className="w-1 h-3 bg-amber-500 animate-pulse"></div>
              <div className="w-1 h-5 bg-amber-500 animate-pulse delay-75"></div>
              <div className="w-1 h-2 bg-amber-500 animate-pulse delay-150"></div>
            </div>
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Canal de Voz Ativo</span>
          </div>
          <p className="text-white text-[11px] font-medium leading-relaxed italic">"Pode falar, Comandante. O pipeline de dados está aberto."</p>
        </div>
      )}
      <button onClick={toggleConnection} className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-2xl ${isActive ? 'bg-amber-500 scale-105' : 'bg-slate-900 border border-slate-800 hover:border-amber-500'}`}>
        {isConnecting ? <i className="fa-solid fa-circle-notch animate-spin text-white text-3xl"></i> : <i className={`fa-solid ${isActive ? 'fa-microphone-lines text-slate-950' : 'fa-brain-circuit text-amber-500'} text-3xl`}></i>}
      </button>
    </div>
  );
};

export default NexusVoice;
