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
    const [recordingTime, setRecordingTime] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isHDR, setIsHDR] = useState(true);
    const [levelValue, setLevelValue] = useState(50);
    const [showColorChannels, setShowColorChannels] = useState({ R: true, G: true, B: true, Y: true });
    const [exposureValue, setExposureValue] = useState(2.85);

    const lastLogTimeRef = useRef({});

    useEffect(() => {
        if (videoRef.current) setVideoElement(videoRef.current);
    }, [videoRef]);

    const { detections, isModelLoading, modelError, fps } = useObjectDetection(videoElement, isStreaming && !isPaused);

    useEffect(() => {
        startCamera();
    }, [startCamera]);

    // Recording timer
    useEffect(() => {
        let interval;
        if (isStreaming && isRecording && !isPaused) {
            interval = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isStreaming, isRecording, isPaused]);

    // Start recording when streaming starts
    useEffect(() => {
        if (isStreaming) {
            setIsRecording(true);
            setRecordingTime(0);
        } else {
            setIsRecording(false);
        }
    }, [isStreaming]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    const handlePauseResume = () => {
        setIsPaused(!isPaused);
        if (onLog) {
            onLog(`- Recording ${isPaused ? 'resumed' : 'paused'}`, 'info');
        }
    };

    const handleHDRToggle = () => {
        setIsHDR(!isHDR);
        if (onLog) {
            onLog(`- HDR mode ${!isHDR ? 'enabled' : 'disabled'}`, 'info');
        }
    };

    const handleLevelChange = (e) => {
        setLevelValue(e.target.value);
    };

    const handleColorChannelToggle = (channel) => {
        setShowColorChannels(prev => ({
            ...prev,
            [channel]: !prev[channel]
        }));
    };

    const handleExposureChange = (delta) => {
        setExposureValue(prev => Math.max(0, Math.min(5, +(prev + delta).toFixed(2))));
    };

    // Canvas drawing logic
    useEffect(() => {
        const canvas = canvasRef.current;
        const video = videoRef.current;

        if (!canvas || !video || !isStreaming || isPaused) {
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

        // Draw crosshair/targeting overlay in center
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1;

        // Horizontal line
        ctx.beginPath();
        ctx.moveTo(centerX - 60, centerY);
        ctx.lineTo(centerX - 20, centerY);
        ctx.moveTo(centerX + 20, centerY);
        ctx.lineTo(centerX + 60, centerY);
        ctx.stroke();

        // Vertical line
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - 60);
        ctx.lineTo(centerX, centerY - 20);
        ctx.moveTo(centerX, centerY + 20);
        ctx.lineTo(centerX, centerY + 60);
        ctx.stroke();

        // Center circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
        ctx.stroke();

        // Target box
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;
        const boxSize = 120;
        ctx.strokeRect(centerX - boxSize, centerY - boxSize / 1.5, boxSize * 2, boxSize * 1.3);

        detections.forEach((detection) => {
            const [x, y, width, height] = detection.bbox;
            const label = detection.class;
            const score = Math.round(detection.score * 100);

            let distanceVal = "0.0";
            if (LIVING_BEINGS_HEIGHTS[label]) {
                const realHeight = LIVING_BEINGS_HEIGHTS[label];
                const estimatedFocalLength = 600;
                if (height > 0) {
                    distanceVal = ((realHeight * estimatedFocalLength) / height).toFixed(1);
                }
            }

            if (onLog && LIVING_BEINGS_HEIGHTS[label] && score > 60) {
                const now = Date.now();
                const lastLog = lastLogTimeRef.current[label] || 0;
                if (now - lastLog > 5000) {
                    lastLogTimeRef.current[label] = now;
                    const msg = `- ${label.charAt(0).toUpperCase() + label.slice(1)} detected at distance ${distanceVal}m`;
                    onLog(msg, 'alert');
                }
            }

            // Green box style
            const color = '#4ade80';
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, width, height);

            // Label style
            const text = `${label} ${score}%`;
            ctx.font = 'bold 14px Inter, sans-serif';
            const textMetrics = ctx.measureText(text);
            const textWidth = textMetrics.width;

            ctx.fillStyle = color;
            ctx.fillRect(x, y - 24, textWidth + 12, 24);

            ctx.fillStyle = '#000000';
            ctx.fillText(text, x + 6, y - 7);
        });

        setLatency((1000 / (fps || 1)).toFixed(0));

    }, [detections, isStreaming, isPaused, fps, onLog]);

    return (
        <div className="dashboard-card h-full overflow-hidden flex flex-col">
            {/* Video Container */}
            <div className="flex-1 relative bg-[#0a0a0a]">

                {/* Top-Left Overlays - Glassmorphism Panel */}
                <div className="absolute top-4 left-4 z-20">
                    <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-4 flex flex-col gap-3 shadow-2xl">
                        {/* HDR Badge - Clickable */}
                        <button
                            onClick={handleHDRToggle}
                            className={`border rounded-lg px-4 py-2 transition-all ${isHDR
                                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                                : 'bg-white/5 border-white/20 text-gray-400 hover:text-white'
                                }`}
                        >
                            <span className="text-xs font-bold tracking-wider">HDR</span>
                        </button>

                        {/* Resolution & FPS */}
                        <div className="flex items-center gap-2 text-[11px]">
                            <span className="text-cyan-400 font-bold">4K</span>
                            <span className="text-white/40">•</span>
                            <span className="text-white/80">{fps || 0}FPS</span>
                        </div>

                        {/* Level slider - Interactive */}
                        <div className="flex flex-col gap-1.5">
                            <span className="text-white/50 text-[10px] uppercase tracking-wide">Level</span>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={levelValue}
                                onChange={handleLevelChange}
                                className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                            />
                        </div>

                        {/* KT Badge */}
                        <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 w-fit">
                            <span className="text-white/60 text-xs font-medium">KT</span>
                        </div>

                        {/* Color Channels - Interactive */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                            {['R', 'G', 'B', 'Y'].map((channel) => (
                                <button
                                    key={channel}
                                    onClick={() => handleColorChannelToggle(channel)}
                                    className="flex items-center gap-2 group"
                                >
                                    <div className={`w-2.5 h-2.5 rounded-full transition-all ${channel === 'R' ? 'bg-red-500' :
                                            channel === 'G' ? 'bg-green-500' :
                                                channel === 'B' ? 'bg-blue-500' : 'bg-yellow-500'
                                        } ${showColorChannels[channel] ? 'opacity-100 shadow-lg' : 'opacity-30'}`}></div>
                                    <span className={`text-xs font-medium transition-opacity ${showColorChannels[channel] ? 'text-white/90' : 'text-white/30'
                                        }`}>{channel}</span>
                                </button>
                            ))}
                        </div>

                        {/* Exposure Value - Interactive */}
                        <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 flex items-center justify-between">
                            <button
                                onClick={() => handleExposureChange(-0.1)}
                                className="text-white/40 hover:text-white text-sm font-bold w-6 h-6 flex items-center justify-center rounded hover:bg-white/10 transition"
                            >−</button>
                            <span className="text-white text-sm font-mono">H{exposureValue.toFixed(2)}</span>
                            <button
                                onClick={() => handleExposureChange(0.1)}
                                className="text-white/40 hover:text-white text-sm font-bold w-6 h-6 flex items-center justify-center rounded hover:bg-white/10 transition"
                            >+</button>
                        </div>

                        {/* Histogram */}
                        <div className="w-full h-14 bg-white/5 border border-white/10 rounded-lg overflow-hidden p-2">
                            <div className="h-full flex items-end justify-around gap-0.5">
                                {[3, 5, 8, 12, 10, 7, 4, 6, 9, 11, 8, 5, 7, 10, 8].map((h, i) => (
                                    <div key={i} className="flex-1 bg-white/60 rounded-t" style={{ height: `${h * 3}px` }}></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top-Center Recording Controls */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
                    {/* Pause/Play Button - Functional */}
                    <button
                        onClick={handlePauseResume}
                        className={`w-10 h-10 border rounded-lg flex items-center justify-center transition ${isPaused
                            ? 'bg-green-600 border-green-500 hover:bg-green-700'
                            : 'bg-[#1a1a1a] border-[#333] hover:bg-[#252525]'
                            }`}
                    >
                        {isPaused ? (
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <rect x="6" y="4" width="4" height="16" />
                                <rect x="14" y="4" width="4" height="16" />
                            </svg>
                        )}
                    </button>

                    {/* Recording Timer */}
                    <div className={`border rounded-lg px-4 py-2 flex items-center gap-2 ${isPaused ? 'bg-[#2a2a2a] border-[#444]' : 'bg-[#1a1a1a] border-[#333]'
                        }`}>
                        <div className={`w-2.5 h-2.5 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'
                            }`}></div>
                        <span className="text-white font-mono text-sm">{formatTime(recordingTime)}</span>
                    </div>
                </div>

                {/* Paused Overlay */}
                {isPaused && isStreaming && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                        <div className="text-white text-xl font-bold uppercase tracking-widest flex items-center gap-2">
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                <rect x="6" y="4" width="4" height="16" />
                                <rect x="14" y="4" width="4" height="16" />
                            </svg>
                            PAUSED
                        </div>
                    </div>
                )}

                {/* Main Video Area */}
                <div className="absolute inset-0 flex items-center justify-center bg-black">
                    {/* Error State */}
                    {cameraError && (
                        <div className="flex flex-col items-center justify-center text-red-400 p-4 text-center z-10">
                            <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span className="text-sm font-bold uppercase tracking-wider mb-1">Camera Error</span>
                            <span className="text-xs text-gray-400">{cameraError}</span>
                            <button
                                onClick={startCamera}
                                className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-bold transition"
                            >
                                Retry Camera
                            </button>
                        </div>
                    )}

                    {/* Loading State */}
                    {(isCameraLoading || isModelLoading) && !cameraError && (
                        <div className="flex flex-col items-center justify-center text-gray-400 z-10">
                            <div className="w-10 h-10 border-4 border-gray-600 border-t-cyan-400 rounded-full animate-spin mb-3"></div>
                            <span className="text-xs font-bold uppercase tracking-wider">
                                {isCameraLoading ? 'Connecting Camera...' : 'Loading AI Model...'}
                            </span>
                        </div>
                    )}

                    {/* Not Started State */}
                    {!isStreaming && !isCameraLoading && !cameraError && (
                        <div className="flex flex-col items-center justify-center text-gray-400 z-10">
                            <svg className="w-16 h-16 mb-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm font-bold uppercase tracking-wider mb-2">Camera Not Active</span>
                            <button
                                onClick={startCamera}
                                className="mt-2 bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold transition flex items-center gap-2 shadow-lg"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                                Start Camera
                            </button>
                        </div>
                    )}

                    {/* Video Element */}
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
        </div>
    );
};

export default LiveCameraView;
