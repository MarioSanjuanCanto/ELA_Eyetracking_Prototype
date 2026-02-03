import { useState, useEffect, useCallback } from 'react';

export const useWebGazer = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCalibrated, setIsCalibrated] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWebGazer = async () => {
      try {
        const webgazer = await import('webgazer');
        (window as any).webgazer = webgazer.default;
        
        // Configure webgazer
        webgazer.default
          .setRegression('ridge')
          .saveDataAcrossSessions(true);
        
        setIsLoaded(true);
      } catch (err) {
        console.error('Failed to load WebGazer:', err);
        setError('Failed to load eye tracking library');
      }
    };

    loadWebGazer();

    return () => {
      const webgazer = (window as any).webgazer;
      if (webgazer) {
        try {
          webgazer.end();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, []);

  const startCalibration = useCallback(async () => {
    const webgazer = (window as any).webgazer;
    if (!webgazer || !isLoaded) return;

    try {
      await webgazer.begin();
      
      // Hide the video preview and prediction point by default
      webgazer.showVideoPreview(false);
      webgazer.showPredictionPoints(false);
      
      setIsCalibrated(false);
    } catch (err: any) {
      console.error('Calibration error:', err);
      if (err.name === 'NotAllowedError') {
        setError('Camera access denied. Please allow camera access to use eye tracking.');
      } else {
        setError('Failed to start calibration. Please check camera permissions.');
      }
    }
  }, [isLoaded]);

  const completeCalibration = useCallback(() => {
    setIsCalibrated(true);
  }, []);

  const startTracking = useCallback(() => {
    const webgazer = (window as any).webgazer;
    if (!webgazer || !isCalibrated) return;

    try {
      webgazer.resume();
      setIsTracking(true);
    } catch (err) {
      console.error('Failed to start tracking:', err);
      setError('Failed to start eye tracking');
    }
  }, [isCalibrated]);

  const stopTracking = useCallback(() => {
    const webgazer = (window as any).webgazer;
    if (!webgazer) return;

    try {
      webgazer.pause();
      setIsTracking(false);
    } catch (err) {
      console.error('Failed to stop tracking:', err);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoaded,
    isCalibrated,
    isTracking,
    error,
    startCalibration,
    completeCalibration,
    startTracking,
    stopTracking,
    clearError,
  };
};
