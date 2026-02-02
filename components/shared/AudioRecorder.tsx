"use client";

import React, { useState, useRef, useEffect } from 'react';

interface AudioRecorderProps {
    onRecordingComplete: (audioDataUri: string) => void;
    onCancel?: () => void;
}

export default function AudioRecorder({ onRecordingComplete, onCancel }: AudioRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (mediaRecorderRef.current && isRecording) {
                mediaRecorderRef.current.stop();
            }
        };
    }, [isRecording]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mpeg' });
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = () => {
                    const base64data = reader.result as string;
                    onRecordingComplete(base64data);
                };

                // Stop all tracks to release the microphone
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);

            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (err) {
            console.error("Failed to start recording:", err);
            setError("Ging iets mis bij het openen van de microfoon. Controleer je rechten.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col items-center gap-4 p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex items-center gap-4">
                <div className={`size-16 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 animate-pulse scale-110 shadow-lg shadow-red-500/20' : 'bg-primary'}`}>
                    <span className="material-symbols-outlined text-white text-3xl">
                        {isRecording ? 'mic' : 'mic_none'}
                    </span>
                </div>
                <div>
                    <p className="font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                        {isRecording ? 'Aan het opnemen...' : 'Klaar om op te nemen'}
                    </p>
                    <p className="text-xl font-mono font-bold text-slate-500">
                        {formatTime(recordingTime)}
                    </p>
                </div>
            </div>

            {error && <p className="text-red-500 text-xs font-bold">{error}</p>}

            <div className="flex gap-3 w-full">
                {!isRecording ? (
                    <button
                        onClick={startRecording}
                        className="flex-1 bg-primary hover:bg-primary-dark text-white font-black py-4 rounded-2xl transition-all active:scale-95 uppercase tracking-widest text-xs"
                    >
                        Start Opname
                    </button>
                ) : (
                    <button
                        onClick={stopRecording}
                        className="flex-1 bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black py-4 rounded-2xl transition-all active:scale-95 uppercase tracking-widest text-xs"
                    >
                        Stop & Evalueer
                    </button>
                )}
                <button
                    onClick={onCancel}
                    className="px-6 py-4 text-slate-400 hover:text-slate-600 font-bold uppercase tracking-widest text-xs"
                >
                    Annuleren
                </button>
            </div>
        </div>
    );
}
