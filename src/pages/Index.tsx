import { useState, useCallback } from 'react';
import EyeTrackingGrid from '@/components/EyeTrackingGrid';
import CalibrationOverlay from '@/components/CalibrationOverlay';
import { useWebGazer } from '@/hooks/useWebGazer';
import { AlertCircle, Loader2, Settings, Activity, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [currentCell, setCurrentCell] = useState<{ row: number; col: number } | null>(null);
  const [showCalibration, setShowCalibration] = useState(false);

  const {
    isLoaded,
    isCalibrated,
    isTracking,
    error,
    startCalibration,
    completeCalibration,
    startTracking,
    stopTracking,
    clearError,
  } = useWebGazer();

  const handleStartCalibration = useCallback(async () => {
    await startCalibration();
    setShowCalibration(true);
  }, [startCalibration]);

  const handleCalibrationComplete = useCallback(() => {
    setShowCalibration(false);
    completeCalibration();
  }, [completeCalibration]);

  const handleCalibrationCancel = useCallback(() => {
    setShowCalibration(false);
  }, []);

  const handleCellChange = useCallback((row: number, col: number) => {
    setCurrentCell({ row, col });
  }, []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading eye tracking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Error Toast */}
      {error && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className="glass-panel rounded-lg p-4 flex items-start gap-3 max-w-md border-destructive/50">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-foreground">{error}</p>
              <button
                onClick={clearError}
                className="text-xs text-muted-foreground hover:text-foreground mt-1"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Calibration Overlay */}
      {showCalibration && (
        <CalibrationOverlay
          onComplete={handleCalibrationComplete}
          onCancel={handleCalibrationCancel}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-border flex items-center px-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">GE</span>
            </div>
            <div>
              <h1 className="font-semibold text-foreground">GridEye</h1>
              <p className="text-xs text-muted-foreground">Zone-Based Eye Tracking</p>
            </div>
          </div>

          {isTracking && (
            <div className="ml-auto flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm text-primary font-medium">Live</span>
            </div>
          )}
        </header>

        {/* Grid Area */}
        <main className="flex-1 p-6 flex items-center justify-center">
          <div className="w-full max-w-3xl aspect-square rounded-2xl border-2 border-border bg-card/30 transition-all duration-300 overflow-hidden">
            <EyeTrackingGrid
              gridSize={3}
              isTracking={isTracking}
              onCellChange={handleCellChange}
            />
          </div>
        </main>
      </div>

      {/* Bottom controls */}
      <div className="w-full border-t border-border bg-background/95 backdrop-blur px-6 py-4 flex flex-col items-center gap-3">
        <div className="text-xs text-muted-foreground text-center">
          {isTracking && currentCell ? (
            <>
              Tracking cell{' '}
              <span className="font-mono font-semibold text-primary">
                {`(${currentCell.row + 1}, ${currentCell.col + 1})`}
              </span>
            </>
          ) : (
            <>1) Calibrate · 2) Start tracking · 3) Look at a square</>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleStartCalibration}
            variant="secondary"
            className="justify-center gap-2"
            disabled={isTracking}
          >
            <Settings className="w-4 h-4" />
            {isCalibrated ? 'Recalibrate' : 'Start calibration'}
          </Button>

          <Button
            onClick={isTracking ? stopTracking : startTracking}
            className={`justify-center gap-2 ${isTracking
                ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'
                : ''
              }`}
            disabled={!isCalibrated}
          >
            {isTracking ? (
              <>
                <EyeOff className="w-4 h-4" />
                Stop tracking
              </>
            ) : (
              <>
                <Activity className="w-4 h-4" />
                Start tracking
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
