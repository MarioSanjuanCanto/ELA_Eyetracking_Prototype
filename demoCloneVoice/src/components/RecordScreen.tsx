import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Mic, Play, Pause, RotateCw, Trash2, Upload, Square } from "lucide-react";

type AudioFile = {
  name: string;
  durationSeconds: number;
  url?: string;
};

const getAudioDuration = (file: File): Promise<number> => {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio(url);
    audio.onloadedmetadata = () => {
      resolve(audio.duration);
      URL.revokeObjectURL(url);
    };
    audio.onerror = () => {
      resolve(0); // fallback if parsing fails
      URL.revokeObjectURL(url);
    };
  });
};

export function RecordScreen({ onBack }: { onBack: () => void }) {
  const [audios, setAudios] = useState<AudioFile[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  const handleMicClick = () => {
    if (isRecording) {
      setIsRecording(false);
      const duration = recordingStartTime ? (Date.now() - recordingStartTime) / 1000 : 0;
      setAudios((prev) => [...prev, { name: `${crypto.randomUUID()}.mp3`, durationSeconds: duration }]);
      setRecordingStartTime(null);
    } else {
      setIsRecording(true);
      setRecordingStartTime(Date.now());
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const duration = await getAudioDuration(file);
      const url = URL.createObjectURL(file);
      setAudios((prev) => [...prev, { name: file.name, durationSeconds: duration, url }]);
    }
    // Clear input so same file can be uploaded again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePlayPause = (index: number, url?: string) => {
    if (!url) return;
    
    if (playingIndex === index) {
      audioRef.current?.pause();
      setPlayingIndex(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const newAudio = new Audio(url);
      newAudio.onended = () => setPlayingIndex(null);
      newAudio.play();
      audioRef.current = newAudio;
      setPlayingIndex(index);
    }
  };

  const handleDelete = (indexToRemove: number) => {
    setAudios((prev) => {
      const audioToDelete = prev[indexToRemove];
      if (audioToDelete.url) {
        URL.revokeObjectURL(audioToDelete.url);
      }
      return prev.filter((_, index) => index !== indexToRemove);
    });
    if (playingIndex === indexToRemove) {
      audioRef.current?.pause();
      setPlayingIndex(null);
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
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
        {isRecording ? <Square className="h-24 w-24 fill-white" strokeWidth={2} /> : <Mic className="h-24 w-24" strokeWidth={2} />}
      </button>

      <div className="mt-10 w-full max-w-5xl rounded-2xl border border-border bg-background/80 p-6 shadow-md backdrop-blur">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-extrabold text-foreground">Recorded audios</h3>
          <input
            type="file"
            accept="audio/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={handleUploadClick}
            className="flex items-center gap-2 rounded-full bg-[oklch(0.92_0.05_220)] px-5 py-2 text-sm font-semibold text-foreground hover:bg-[oklch(0.88_0.06_220)] transition-colors"
          >
            <Upload className="h-4 w-4" />
            Upload audio file
          </button>
        </div>

        <div className="mt-6 space-y-3 min-h-[80px]">
          {audios.length === 0 ? (
            <div className="flex h-full items-center justify-center py-6 text-foreground/50 italic">
              No audios recorded yet. Start recording or upload a file.
            </div>
          ) : (
            audios.map((a, index) => (
              <div
                key={`${a.name}-${index}`}
                className="flex items-center justify-between rounded-full border border-border bg-background px-6 py-4 shadow-sm"
              >
                <div className="flex flex-col">
                  <span className="font-semibold text-foreground max-w-md truncate">{a.name}</span>
                  <span className="text-xs text-foreground/50">{Math.round(a.durationSeconds)} secs</span>
                </div>
                <div className="flex items-center gap-4 text-foreground/70">
                  <button 
                    onClick={() => handlePlayPause(index, a.url)}
                    className="hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    disabled={!a.url}
                  >
                    {playingIndex === index ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </button>
                  <button className="hover:text-foreground transition-colors"><RotateCw className="h-5 w-5" /></button>
                  <button
                    onClick={() => handleDelete(index)}
                    className="hover:text-destructive transition-colors"
                  >
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
                background: "linear-gradient(90deg, var(--brand-from), var(--brand-to))"
              }}
            />
          </div>
          <p className="mt-3 text-base font-semibold text-foreground">
            Total data provided: <span className="font-normal">{totalSeconds} secs (min 10 secs)</span>
          </p>
        </div>
      </div>

      <div className="mt-8 flex w-full max-w-5xl justify-end gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-3 rounded-full border border-border bg-background px-10 py-4 text-lg font-semibold text-foreground shadow-sm transition hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" /> Back
        </button>
        <button
          disabled={totalSeconds < 10}
          className="rounded-full px-10 py-4 text-lg font-semibold text-foreground shadow-lg transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: "linear-gradient(90deg, var(--cta-from), var(--cta-to))",
          }}
        >
          Start Cloning
        </button>
      </div>
    </div>
  );
}