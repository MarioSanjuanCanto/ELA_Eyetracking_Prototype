import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Mic, Play, Pause, Trash2, Upload, Square, ArrowRight, RotateCw } from "lucide-react";
import { cloneVoiceAction, getClonedVoicesAction } from "@/lib/voice-actions";

type AudioFile = {
  name: string;
  durationSeconds: number;
  url: string;
  file: Blob | File;
};

type OnboardingTexts = {
  recordedAudios: string;
  uploadAudio: string;
  noAudios: string;
  totalData: string;
  minSecs: string;
  back: string;
  continue: string;
  startCloning?: string;
  cloning?: string;
  viewVoices?: string;
  success?: string;
  fail?: string;
};

const getSupportedMimeType = () => {
  const types = [
    "audio/mp4",
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/wav",
  ];
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return "";
};

const getAudioDuration = (file: File): Promise<number> =>
  new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio(url);
    audio.onloadedmetadata = () => {
      resolve(audio.duration);
      URL.revokeObjectURL(url);
    };
    audio.onerror = () => {
      resolve(0);
      URL.revokeObjectURL(url);
    };
  });

type RecordScreenProps = {
  t: OnboardingTexts;
  lang: "es" | "en";
  userName: string;
  isAdmin?: boolean;
  onBack: () => void;
  onContinue: () => void;
};

export function RecordScreen({ t, lang, userName, isAdmin = false, onBack, onContinue }: RecordScreenProps) {
  const [audios, setAudios] = useState<AudioFile[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const recordingStartTimeRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const playbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isCloning, setIsCloning] = useState(false);

  const startCloningLabel = t.startCloning ?? (lang === "es" ? "Empezar clonacion" : "Start cloning");
  const cloningLabel = t.cloning ?? (lang === "es" ? "Clonando..." : "Cloning...");
  const viewVoicesLabel = t.viewVoices ?? (lang === "es" ? "Ver voces" : "View voices");
  const successLabel = t.success ?? (lang === "es" ? "Voz clonada correctamente para" : "Voice cloned successfully for");
  const failLabel = t.fail ?? (lang === "es" ? "Error al clonar la voz" : "Voice cloning failed");

  const handleStartCloning = async () => {
    if (!audios.length) return;

    setIsCloning(true);
    try {
      const formData = new FormData();
      formData.append("name", userName || `voice-${Date.now()}`);
      audios.forEach((audio) => {
        formData.append("files", audio.file, audio.name);
      });

      const response = await cloneVoiceAction({ data: formData });
      if (response && response.voice_id) {
        localStorage.setItem("clonedVoiceId", response.voice_id);
      }
      alert(`${successLabel} ${userName}.`);
      onContinue();
    } catch (error) {
      console.error("Error cloning voice:", error);
      alert(failLabel);
    } finally {
      setIsCloning(false);
    }
  };



  const handleMicClick = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedMimeType();
      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const recordedMimeType = mediaRecorder.mimeType || "audio/webm";
        const blob = new Blob(audioChunksRef.current, { type: recordedMimeType });
        const url = URL.createObjectURL(blob);

        const start = recordingStartTimeRef.current;
        const duration = start ? (Date.now() - start) / 1000 : 0;
        recordingStartTimeRef.current = null;

        const extension = recordedMimeType.includes("mp4")
          ? "m4a"
          : recordedMimeType.includes("webm")
            ? "webm"
            : "wav";

        setAudios((prev) => [
          ...prev,
          {
            name: `${crypto.randomUUID()}.${extension}`,
            durationSeconds: duration,
            url,
            file: blob,
          },
        ]);
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start(100);
      recordingStartTimeRef.current = Date.now();
      setIsRecording(true);
    } catch (error) {
      console.error("Microphone access denied or error:", error);
      alert("Could not access microphone or recording failed. Please check browser permissions.");
    }
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const duration = await getAudioDuration(file);
      const url = URL.createObjectURL(file);
      setAudios((prev) => [...prev, { name: file.name, durationSeconds: duration, url, file }]);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePlayPause = (index: number, audio: AudioFile) => {
    if (playbackTimeoutRef.current) {
      clearTimeout(playbackTimeoutRef.current);
      playbackTimeoutRef.current = null;
    }

    if (playingIndex === index) {
      audioRef.current?.pause();
      setPlayingIndex(null);
      return;
    }

    if (audioRef.current) audioRef.current.pause();
    if (audio.url) {
      const newAudio = new Audio(audio.url);
      newAudio.onended = () => setPlayingIndex(null);
      void newAudio.play();
      audioRef.current = newAudio;
      setPlayingIndex(index);
    }
  };

  const handleDelete = (indexToRemove: number) => {
    setAudios((prev) => {
      const audioToDelete = prev[indexToRemove];
      if (audioToDelete?.url) URL.revokeObjectURL(audioToDelete.url);
      return prev.filter((_, index) => index !== indexToRemove);
    });
    if (playingIndex === indexToRemove) {
      audioRef.current?.pause();
      if (playbackTimeoutRef.current) clearTimeout(playbackTimeoutRef.current);
      setPlayingIndex(null);
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
      if (playbackTimeoutRef.current) clearTimeout(playbackTimeoutRef.current);
    };
  }, []);

  const totalSeconds = Math.round(audios.reduce((acc, curr) => acc + curr.durationSeconds, 0));
  const progressPercent = Math.min((totalSeconds / 60) * 100, 100);

  return (
    <div className="relative flex w-full flex-col items-center">
      <button
        onClick={handleMicClick}
        className={`relative flex h-64 w-64 items-center justify-center rounded-full text-white shadow-[0_20px_60px_-15px_rgba(120,80,220,0.55)] ring-8 ring-white/70 transition-all duration-300 ${isRecording ? "scale-105 animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]" : "hover:scale-105"}`}
        style={{
          background:
            "linear-gradient(160deg, var(--brand-from), var(--brand-via), var(--brand-to))",
        }}
      >
        {isRecording ? (
          <Square className="h-24 w-24 fill-white" strokeWidth={2} />
        ) : (
          <Mic className="h-24 w-24" strokeWidth={2} />
        )}
      </button>

      <div className="mt-10 w-full max-w-5xl rounded-2xl border border-border bg-background/80 p-6 shadow-md backdrop-blur">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-extrabold text-foreground">{t.recordedAudios}</h3>
          <input
            type="file"
            accept="audio/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={handleUploadClick}
            className="flex items-center gap-2 rounded-full bg-[oklch(0.92_0.05_220)] px-5 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-[oklch(0.88_0.06_220)]"
          >
            <Upload className="h-4 w-4" />
            {t.uploadAudio}
          </button>
        </div>

        <div className="mt-6 min-h-[80px] space-y-3">
          {audios.length === 0 ? (
            <div className="flex h-full items-center justify-center px-4 py-6 text-center italic text-foreground/50">
              {t.noAudios}
            </div>
          ) : (
            audios.map((audio, index) => (
              <div
                key={`${audio.name}-${index}`}
                className="flex items-center justify-between rounded-full border border-border bg-background px-6 py-4 shadow-sm"
              >
                <div className="flex flex-col">
                  <span className="max-w-md truncate font-semibold text-foreground">{audio.name}</span>
                  <span className="text-xs text-foreground/50">
                    {Math.round(audio.durationSeconds)} {lang === "es" ? "seg" : "secs"}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-foreground/70">
                  <button onClick={() => handlePlayPause(index, audio)} className="transition-colors hover:text-foreground">
                    {playingIndex === index ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </button>
                  <button onClick={() => handleDelete(index)} className="transition-colors hover:text-destructive">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-all duration-500 ease-in-out"
              style={{
                width: `${progressPercent}%`,
                background: "linear-gradient(90deg, var(--brand-from), var(--brand-to))",
              }}
            />
          </div>
          <p className="mt-3 text-base font-semibold text-foreground">
            {t.totalData}:{" "}
            <span className="font-normal">
              {totalSeconds} {lang === "es" ? "seg" : "secs"} ({t.minSecs})
            </span>
          </p>
        </div>
      </div>

      <div className="mt-8 flex w-full max-w-5xl flex-wrap items-center justify-end gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-3 rounded-full border border-border bg-background px-10 py-4 text-lg font-semibold text-foreground shadow-sm transition hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" /> {t.back}
        </button>

        <button
          disabled={totalSeconds < 10 || isCloning}
          onClick={handleStartCloning}
          className="flex items-center gap-2 rounded-full px-10 py-4 text-lg font-semibold text-foreground shadow-lg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ background: "linear-gradient(90deg, var(--cta-from), var(--cta-to))" }}
        >
          {isCloning ? (
            <>
              <RotateCw className="h-5 w-5 animate-spin" />
              {cloningLabel}
            </>
          ) : (
            startCloningLabel
          )}
        </button>
        {isAdmin && (
          <button
            onClick={onContinue}
            className="flex items-center gap-2 rounded-full px-10 py-4 text-lg font-semibold text-foreground shadow-lg transition hover:opacity-90"
            style={{ background: "linear-gradient(90deg, var(--cta-from), var(--cta-to))" }}
          >
            {t.continue} <ArrowRight className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}
