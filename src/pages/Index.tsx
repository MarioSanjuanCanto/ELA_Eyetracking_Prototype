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
    <div className="min-h-screen bg-[#d9dde3] flex flex-col items-center justify-center px-6 py-6">
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
      <div className="w-full max-w-5xl">
        {/* Big white card like the mockup */}
        <div className="bg-white rounded-[32px] shadow-xl px-10 py-10 flex flex-col gap-8">
          {/* Top row: text bar + controls on the right */}
          <div className="w-full flex items-center gap-4">
            <div className="flex-1">
              <div className="w-full h-16 rounded-full bg-[#f3f4f6] border border-[#e5e7eb] flex items-center px-10 text-xl text-[#9ca3af]">
                Hola buenos día...
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex gap-2">
                <Button
                  onClick={handleStartCalibration}
                  className="justify-center gap-2 bg-white border border-[#d1d5db] text-[#111827] hover:bg-[#f3f4f6]"
                  variant="outline"
                  disabled={isTracking}
                >
                  <Settings className="w-4 h-4 text-[#6b7280]" />
                  <span className="text-sm font-medium">
                    {isCalibrated ? 'Recalibrate' : 'Calibrate'}
                  </span>
                </Button>
                <Button
                  onClick={isTracking ? stopTracking : startTracking}
                  className={`justify-center gap-2 ${isTracking
                    ? 'bg-[#ef4444] hover:bg-[#dc2626] text-white'
                    : 'bg-[#3b82f6] hover:bg-[#2563eb] text-white'
                    }`}
                  disabled={!isCalibrated}
                >
                  {isTracking ? (
                    <>
                      <EyeOff className="w-4 h-4" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Activity className="w-4 h-4" />
                      Start
                    </>
                  )}
                </Button>
              </div>
              <div className="text-[11px] text-[#9ca3af]">
                {isTracking && currentCell
                  ? `Tracking cell (${currentCell.row + 1}, ${currentCell.col + 1})`
                  : '1) Calibrate · 2) Start tracking · 3) Look to the squares'}
              </div>
            </div>
          </div>

          {/* 3x3 grid - slightly larger to use corner space */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-5xl aspect-square">
              <EyeTrackingGrid
                gridSize={3}
                isTracking={isTracking}
                onCellChange={handleCellChange}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Index;
