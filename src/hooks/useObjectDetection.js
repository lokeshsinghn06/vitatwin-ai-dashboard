import { useState, useRef, useCallback, useEffect } from 'react';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import * as tf from '@tensorflow/tfjs';

/**
 * Hook for real-time object detection using COCO-SSD model
 * @param {HTMLVideoElement} videoElement - Video element to run detection on
 * @param {boolean} isVideoReady - Whether video is ready for detection
 * @returns {Object} - detections, isModelLoading, modelError, fps
 */
export const useObjectDetection = (videoElement, isVideoReady) => {
    const [detections, setDetections] = useState([]);
    const [isModelLoading, setIsModelLoading] = useState(true);
    const [modelError, setModelError] = useState(null);
    const [fps, setFps] = useState(0);

    const modelRef = useRef(null);
    const animationRef = useRef(null);
    const lastTimeRef = useRef(performance.now());
    const frameCountRef = useRef(0);

    // Initialize TensorFlow and load model
    useEffect(() => {
        let isMounted = true;

        const initTF = async () => {
            try {
                setIsModelLoading(true);
                console.log('Initializing TensorFlow...');

                // Wait for TF to be ready
                await tf.ready();
                console.log('TensorFlow ready, backend:', tf.getBackend());

                console.log('Loading COCO-SSD model...');
                const model = await cocoSsd.load({
                    base: 'lite_mobilenet_v2' // Lighter model for better performance
                });

                if (isMounted) {
                    modelRef.current = model;
                    console.log('COCO-SSD model loaded successfully!');
                    setIsModelLoading(false);
                }
            } catch (err) {
                console.error('Failed to load model:', err);
                if (isMounted) {
                    setModelError(err.message || 'Failed to load detection model');
                    setIsModelLoading(false);
                }
            }
        };

        initTF();

        return () => {
            isMounted = false;
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    // Run detection loop
    const runDetection = useCallback(async () => {
        if (!modelRef.current || !videoElement || !isVideoReady) {
            if (isVideoReady && videoElement) {
                // If video is ready but loop stopped, try again in a bit
                animationRef.current = requestAnimationFrame(runDetection);
            }
            return;
        }

        // Ensure video is actually playing and has data
        if (videoElement.readyState < 2) {
            animationRef.current = requestAnimationFrame(runDetection);
            return;
        }

        try {
            // Run detection
            const predictions = await modelRef.current.detect(videoElement);
            setDetections(predictions);

            // Calculate FPS
            frameCountRef.current++;
            const now = performance.now();
            const elapsed = now - lastTimeRef.current;

            if (elapsed >= 1000) {
                setFps(Math.round((frameCountRef.current * 1000) / elapsed));
                frameCountRef.current = 0;
                lastTimeRef.current = now;
            }
        } catch (err) {
            console.error('Detection error:', err);
        }

        // Continue detection loop
        animationRef.current = requestAnimationFrame(runDetection);
    }, [videoElement, isVideoReady]);

    // Start detection when model is loaded and video is ready
    useEffect(() => {
        if (!isModelLoading && isVideoReady && videoElement && modelRef.current) {
            console.log('Starting detection loop...');
            runDetection();
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isModelLoading, isVideoReady, videoElement, runDetection]);

    return {
        detections,
        isModelLoading,
        modelError,
        fps
    };
};

export default useObjectDetection;
