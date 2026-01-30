import { useState, useEffect, useRef } from 'react';
import { useWebcam } from '../hooks/useWebcam';
import { useObjectDetection } from '../hooks/useObjectDetection';

// List of classes updated with real-world heights
const LIVING_BEINGS_HEIGHTS = {
    'person': 1.7, 'cat': 0.3, 'dog': 0.5, 'bird': 0.2,
    'horse': 1.6, 'sheep': 0.8, 'cow': 1.5, 'elephant': 3.0,
    'bear': 2.0, 'zebra': 1.5, 'giraffe': 5.0
};

const LiveCameraView = ({ onLog }) => {
    const { videoRef, isLoading: isCameraLoading, error: cameraError, isStreaming, startCamera, stopCamera } = useWebcam();
    const [videoElement, setVideoElement] = useState(null);
    const canvasRef = useRef(null);
    const [latency, setLatency] = useState(0);

    const lastLogTimeRef = useRef({});

    useEffect(() => {
        if (videoRef.current) setVideoElement(videoRef.current);
    }, [videoRef]);

    const { detections, isModelLoading, modelError, fps } = useObjectDetection(videoElement, isStreaming);

    useEffect(() => {
        startCamera();
    }, [startCamera]);

    // Canvas drawing logic
    useEffect(() => {
        const canvas = canvasRef.current;
        const video = videoRef.current;

        if (!canvas || !video || !isStreaming) {
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
            return;
        }

        if (video.videoWidth > 0 && video.videoHeight > 0) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
        }

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        detections.forEach((detection) => {
            const [x, y, width, height] = detection.bbox;
            const label = detection.class;
            const score = Math.round(detection.score * 100);

            // ... distance logic same as before ...
            let distanceMsg = "";
            let distanceVal = "0.0";
            if (LIVING_BEINGS_HEIGHTS[label]) {
                const realHeight = LIVING_BEINGS_HEIGHTS[label];
                const estimatedFocalLength = 600;
                if (height > 0) {
                    distanceVal = ((realHeight * estimatedFocalLength) / height).toFixed(1);
                    distanceMsg = `${distanceVal}m`;
                }
            }

            // ... logging logic same as before ...
            if (onLog && LIVING_BEINGS_HEIGHTS[label] && score > 60) {
                const now = Date.now();
                const lastLog = lastLogTimeRef.current[label] || 0;
                if (now - lastLog > 5000) {
                    lastLogTimeRef.current[label] = now;
                    const msg = `- ${label.charAt(0).toUpperCase() + label.slice(1)} detected at distance ${distanceVal}m`;
                    onLog(msg, 'alert');
                }
            }

            // Green box style from reference image (Bright green)
            const color = '#4ade80';
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, width, height);

            // Label style - Green block with white text opacity
            const text = `${label} ${score}%`;
            ctx.font = 'bold 16px Inter, sans-serif';
            const textMetrics = ctx.measureText(text);
            const textWidth = textMetrics.width;

            ctx.fillStyle = color;
            ctx.fillRect(x, y - 28, textWidth + 14, 28);

            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = "rgba(0,0,0,0.5)";
            ctx.shadowBlur = 2;
            ctx.fillText(text, x + 7, y - 8);
            ctx.shadowBlur = 0;
        });

        setLatency((1000 / (fps || 1)).toFixed(2));

    }, [detections, isStreaming, fps, onLog]);

    const handleToggleStream = () => {
        if (isStreaming) {
            stopCamera();
        } else {
            startCamera();
        }
    };

    return (
        <div className="dashboard-card h-full border-2 border-slate-300 overflow-hidden flex flex-col">
            {/* Dark Header matching reference */}
            <div className="bg-[#1e293b] text-white flex justify-between items-center py-2 px-4 shadow-md z-10 h-10 shrink-0">
                <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span className="font-bold tracking-wide uppercase text-sm">LIVE CAMERA VIEW</span>
                </div>
                {/* Connection Icons */}
                <div className="flex items-center gap-3 opacity-80">
                    <span className="text-xs font-mono tracking-widest text-slate-400">:: : : :: :</span>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" /></svg>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
                </div>
            </div>

            {/* Video Container */}
            <div className="flex-1 relative bg-slate-900 border-x-8 border-white">

                {/* Stats Overlay - Bottom Left (Floating) */}
                <div className="absolute bottom-4 left-4 z-20 space-y-1">
                    <div className="bg-slate-900/80 backdrop-blur text-white text-xs px-2 py-1.5 rounded flex items-center gap-2 border-l-2 border-green-500 shadow-lg min-w-[120px]">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" /></svg>
                        <span>FPS: {isStreaming ? fps : '00'}</span>
                        <span className="text-green-400 ml-auto font-bold opacity-80">Lemet</span>
                    </div>
                    <div className="bg-slate-900/80 backdrop-blur text-white text-xs px-2 py-1.5 rounded flex items-center gap-2 border-l-2 border-blue-500 shadow-lg min-w-[120px]">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
                        <span>Latency:</span>
                        <span className="ml-auto font-mono text-cyan-300">{latency}s</span>
                    </div>
                </div>

                {/* Main Video */}
                <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                    {/* Error State */}
                    {cameraError && (
                        <div className="flex flex-col items-center justify-center text-red-400 p-4 text-center z-10">
                            <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span className="text-sm font-bold uppercase tracking-wider mb-1">Camera Error</span>
                            <span className="text-xs text-slate-400">{cameraError}</span>
                            <button
                                onClick={startCamera}
                                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-bold transition"
                            >
                                Retry Camera
                            </button>
                        </div>
                    )}

                    {/* Loading State */}
                    {(isCameraLoading || isModelLoading) && !cameraError && (
                        <div className="flex flex-col items-center justify-center text-slate-400 z-10">
                            <div className="w-10 h-10 border-4 border-slate-600 border-t-blue-400 rounded-full animate-spin mb-3"></div>
                            <span className="text-xs font-bold uppercase tracking-wider">
                                {isCameraLoading ? 'Connecting Camera...' : 'Loading AI Model...'}
                            </span>
                        </div>
                    )}

                    {/* Not Started State - Show button to start */}
                    {!isStreaming && !isCameraLoading && !cameraError && (
                        <div className="flex flex-col items-center justify-center text-slate-400 z-10">
                            <svg className="w-16 h-16 mb-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm font-bold uppercase tracking-wider mb-2">Camera Not Active</span>
                            <button
                                onClick={startCamera}
                                className="mt-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold transition flex items-center gap-2 shadow-lg"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                                Start Camera
                            </button>
                        </div>
                    )}

                    {/* Video Element - always rendered, becomes visible when streaming */}
                    <video
                        ref={videoRef}
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isStreaming ? 'opacity-100' : 'opacity-0'}`}
                        autoPlay
                        playsInline
                        muted
                    />
                    {/* Detection Overlay Canvas */}
                    <canvas
                        ref={canvasRef}
                        className={`absolute inset-0 w-full h-full object-cover pointer-events-none ${isStreaming ? 'opacity-100' : 'opacity-0'}`}
                    />
                </div>
            </div>

            {/* Bottom Control Bar - White */}
            <div className="h-12 bg-white flex justify-between items-center px-4 shrink-0 border-t border-slate-200">
                {/* Left Button - Blue/Grey STOP */}
                <button className="flex items-center gap-2 bg-[#64748b] hover:bg-slate-600 text-white px-8 py-1.5 rounded shadow-sm transition font-bold text-sm tracking-wide active:scale-95">
                    STOP
                    <span className="text-[10px] ml-1">▶</span>
                </button>

                {/* Right Button - Red STOP */}
                <button
                    onClick={handleToggleStream}
                    className="flex items-center gap-2 bg-[#dc2626] hover:bg-red-700 text-white px-8 py-1.5 rounded shadow-sm transition font-bold text-sm tracking-wide active:scale-95"
                >
                    STOP
                    <span className="text-lg">›</span>
                </button>
            </div>
        </div>
    );
};

export default LiveCameraView;
