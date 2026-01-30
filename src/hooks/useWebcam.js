import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Hook to access user's webcam - Fixed play() interruption error
 * @returns {Object} - videoRef, isLoading, error, startCamera, stopCamera
 */
export const useWebcam = () => {
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const mountingRef = useRef(true);

    const startCamera = useCallback(async () => {
        // Use streamRef to check for active stream (stable check)
        if (streamRef.current) return;

        setIsLoading(true);
        setError(null);
        console.log('Requesting camera access...');

        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Browser API navigator.mediaDevices.getUserMedia not available');
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                },
                audio: false
            });

            if (!mountingRef.current) {
                stream.getTracks().forEach(t => t.stop());
                return;
            }

            console.log('Camera access granted');
            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;

                // Wait for video metadata to load before playing
                videoRef.current.onloadedmetadata = async () => {
                    if (!videoRef.current) return;
                    try {
                        await videoRef.current.play();
                        console.log('Video playback started');
                        if (mountingRef.current) {
                            setIsStreaming(true);
                        }
                    } catch (playErr) {
                        if (playErr.name !== 'AbortError') {
                            console.error('Video play error:', playErr);
                        }
                    }
                };
            }
        } catch (err) {
            console.error('Camera error:', err);
            if (mountingRef.current) {
                setError(err.message || 'Failed to access camera.');
                setIsStreaming(false);
            }
        } finally {
            if (mountingRef.current) {
                setIsLoading(false);
            }
        }
    }, []); // Empty dependency array ensures stability

    const stopCamera = useCallback(() => {
        console.log('Stopping camera...');
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => {
                track.stop();
            });
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setIsStreaming(false);
        setIsLoading(false);
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        mountingRef.current = true;
        return () => {
            mountingRef.current = false;
            stopCamera();
        };
    }, [stopCamera]);

    return {
        videoRef,
        isLoading,
        error,
        isStreaming,
        startCamera,
        stopCamera
    };
};

export default useWebcam;
