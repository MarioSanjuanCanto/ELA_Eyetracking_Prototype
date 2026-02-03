import { cn } from '@/lib/utils';
import { Eye, EyeOff, Settings, Grid3X3, Target, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ControlPanelProps {
  isTracking: boolean;
  isCalibrated: boolean;
  gridSize: number;
  currentCell: { row: number; col: number } | null;
  onStartTracking: () => void;
  onStopTracking: () => void;
  onCalibrate: () => void;
  onGridSizeChange: (size: number) => void;
}

const ControlPanel = ({
  isTracking,
  isCalibrated,
  gridSize,
  currentCell,
  onStartTracking,
  onStopTracking,
  onCalibrate,
  onGridSizeChange,
}: ControlPanelProps) => {
  const getCellLabel = (row: number, col: number) => {
    const letter = String.fromCharCode(65 + col);
    return `${letter}${row + 1}`;
  };

  return (
    <div className="glass-panel rounded-xl p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Eye className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="font-semibold text-foreground">Grid Eye Tracker</h2>
          <p className="text-xs text-muted-foreground">Zone-based gaze detection</p>
        </div>
      </div>

      {/* Status */}
      <div className="space-y-3">
        <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50">
          <span className="text-sm text-muted-foreground">Status</span>
          <span className={cn(
            "text-sm font-medium flex items-center gap-2",
            isTracking ? "text-primary" : "text-muted-foreground"
          )}>
            <span className={cn(
              "w-2 h-2 rounded-full",
              isTracking ? "bg-primary animate-pulse" : "bg-muted-foreground"
            )} />
            {isTracking ? 'Tracking' : 'Idle'}
          </span>
        </div>

        <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50">
          <span className="text-sm text-muted-foreground">Calibration</span>
          <span className={cn(
            "text-sm font-medium",
            isCalibrated ? "text-primary" : "text-amber-500"
          )}>
            {isCalibrated ? 'Ready' : 'Required'}
          </span>
        </div>

        {currentCell && isTracking && (
          <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-primary/10 border border-primary/20">
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              Active Zone
            </span>
            <span className="text-sm font-mono font-bold text-primary glow-text">
              {getCellLabel(currentCell.row, currentCell.col)}
            </span>
          </div>
        )}
      </div>

      {/* Grid Size */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Grid3X3 className="w-4 h-4" />
          <span>Grid Size</span>
        </div>
        <div className="flex gap-2">
          {[3, 4, 5, 6].map((size) => (
            <button
              key={size}
              onClick={() => onGridSizeChange(size)}
              className={cn(
                "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200",
                gridSize === size
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {size}×{size}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <Button
          onClick={onCalibrate}
          variant="secondary"
          className="w-full justify-center gap-2"
          disabled={isTracking}
        >
          <Settings className="w-4 h-4" />
          {isCalibrated ? 'Recalibrate' : 'Start Calibration'}
        </Button>

        <Button
          onClick={isTracking ? onStopTracking : onStartTracking}
          className={cn(
            "w-full justify-center gap-2",
            isTracking
              ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              : ""
          )}
          disabled={!isCalibrated}
        >
          {isTracking ? (
            <>
              <EyeOff className="w-4 h-4" />
              Stop Tracking
            </>
          ) : (
            <>
              <Activity className="w-4 h-4" />
              Start Tracking
            </>
          )}
        </Button>
      </div>

      {/* Footer hint */}
      <p className="text-xs text-muted-foreground/60 text-center">
        Position yourself ~50cm from screen for best results
      </p>
    </div>
  );
};

export default ControlPanel;
