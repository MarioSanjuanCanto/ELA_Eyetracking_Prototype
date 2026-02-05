import { useState, useCallback } from "react";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { CalibrationScreen } from "@/components/CalibrationScreen";
import { TrackingScreen } from "@/components/TrackingScreen";
import { useWebGazer } from "@/hooks/useWebGazer";

type AppState = "welcome" | "calibrating" | "tracking";

const Index = () => {
  const [appState, setAppState] = useState<AppState>("welcome");
  const {
    isLoading,
    isTracking,
    gazeZone,
    initialize,
    stop,
    pause,
    resume,
    recordClick,
  } = useWebGazer();

  const handleStart = useCallback(async () => {
    setAppState("calibrating");
    await initialize();
  }, [initialize]);

  const handleCalibrationComplete = useCallback(() => {
    setAppState("tracking");
  }, []);

  const handleRecalibrate = useCallback(() => {
    stop();
    setAppState("welcome");
  }, [stop]);

  const handleTogglePause = useCallback(() => {
    if (isTracking) {
      pause();
    } else {
      resume();
    }
  }, [isTracking, pause, resume]);

  if (appState === "welcome") {
    return <WelcomeScreen onStart={handleStart} />;
  }

  if (appState === "calibrating") {
    return (
      <CalibrationScreen
        onComplete={handleCalibrationComplete}
        onRecordClick={recordClick}
        isLoading={isLoading}
      />
    );
  }

  return (
    <TrackingScreen
      gazeZone={gazeZone}
      isTracking={isTracking}
      onRecalibrate={handleRecalibrate}
      onTogglePause={handleTogglePause}
    />
  );
};

export default Index;
