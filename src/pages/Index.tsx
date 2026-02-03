import { useState, useCallback } from 'react';
import EyeTrackingGrid from '@/components/EyeTrackingGrid';
import ControlPanel from '@/components/ControlPanel';
import CalibrationOverlay from '@/components/CalibrationOverlay';
import { useWebGazer } from '@/hooks/useWebGazer';
import { AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const Index = () => {
  const [gridSize, setGridSize] = useState(4);
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
    <div className="min-h-screen bg-background flex">
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
        <main className="flex-1 p-6">
          <div
            className={cn(
              "w-full h-full rounded-2xl border-2 transition-all duration-300",
              isTracking
                ? "border-primary/30 bg-card/50"
                : "border-border bg-card/30"
            )}
          >
            <EyeTrackingGrid
              gridSize={gridSize}
              isTracking={isTracking}
              onCellChange={handleCellChange}
            />
          </div>
        </main>
      </div>

      {/* Sidebar */}
      <aside className="w-80 border-l border-border p-6 flex flex-col">
        <ControlPanel
          isTracking={isTracking}
          isCalibrated={isCalibrated}
          gridSize={gridSize}
          currentCell={isTracking ? currentCell : null}
          onStartTracking={startTracking}
          onStopTracking={stopTracking}
          onCalibrate={handleStartCalibration}
          onGridSizeChange={setGridSize}
        />

        {/* Instructions */}
        <div className="mt-auto pt-6">
          <div className="glass-panel rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-medium text-foreground">Quick Start</h3>
            <ol className="text-xs text-muted-foreground space-y-2">
              <li className="flex gap-2">
                <span className="text-primary font-mono">1.</span>
                Click "Start Calibration" and follow the dots
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-mono">2.</span>
                Click each dot 5 times while looking at it
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-mono">3.</span>
                Start tracking to see which zone you're looking at
              </li>
            </ol>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Index;
