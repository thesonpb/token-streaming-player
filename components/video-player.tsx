"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ban, Volume2, VolumeX, Pause, Play } from "lucide-react";
import { checkToken, TokenCheckResult } from "@/lib/actions";

interface VideoPlayerProps {
    token: string;
    username: string;
}

export function VideoPlayer({ token, username }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isTokenValid, setIsTokenValid] = useState(true);
    const [apiResponseMessage, setApiResponseMessage] = useState<string | null>(
        null
    );
    const [userMode, setUserMode] = useState<"Legitimate" | "Pirate">(
        "Legitimate"
    );

    useEffect(() => {
        setUserMode(username ? "Legitimate" : "Pirate");
    }, [username]);

    // Set up video source with token
    useEffect(() => {
        if (videoRef.current && token) {
            videoRef.current.src = `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4?token=${token}`;
        } else if (videoRef.current) {
            videoRef.current.src = "";
        }
    }, [token]);

    const generateRandomIp = (): string => {
        const octet = () => Math.floor(Math.random() * 256);
        return `${octet()}.${octet()}.${octet()}.${octet()}`;
    };

    useEffect(() => {
        if (!token) {
            setIsTokenValid(false);
            setApiResponseMessage("No token provided.");
            if (videoRef.current && !videoRef.current.paused) {
                videoRef.current.pause();
            }
            return;
        }

        let isActive = true;
        const simulatedIpForThisSession = generateRandomIp();

        const checkTokenValidity = async () => {
            let videoPath = "/gtv-videos-bucket/sample/BigBuckBunny.mp4";

            const payloadForApi = {
                token: token,
                token_claim: "access-video",
                request_useragent: navigator.userAgent,
                request_ip: simulatedIpForThisSession,
                request_hostname: window.location.hostname,
                request_path: videoPath,
            };

            try {
                const result: TokenCheckResult = await checkToken(
                    payloadForApi
                );

                if (!isActive) return;

                setIsTokenValid(result.isValid);
                setApiResponseMessage(result.message);

                if (!result.isValid) {
                    if (videoRef.current && !videoRef.current.paused) {
                        videoRef.current.pause();
                        setIsPlaying(false); // Ensure playing state is updated
                    }
                }
            } catch (error) {
                // This catch is for errors within this async function itself
                if (!isActive) return;
                console.error(
                    "useEffect - Error calling checkToken or processing result:",
                    error
                );
                setIsTokenValid(false);
                setApiResponseMessage(
                    "Client-side error during token validation."
                );
                if (videoRef.current && !videoRef.current.paused) {
                    videoRef.current.pause();
                    setIsPlaying(false);
                }
            }
        };

        checkTokenValidity(); // Initial check
        const intervalId = setInterval(checkTokenValidity, 2000); // Increased interval

        return () => {
            isActive = false;
            clearInterval(intervalId);
        };
    }, [token, username]); // Added username to dependencies as it affects userMode which might be related

    // Video event handlers
    const handlePlay = async () => {
        if (videoRef.current && isTokenValid) {
            try {
                if (videoRef.current.paused) {
                    await videoRef.current.play();
                    setIsPlaying(true);
                } else {
                    videoRef.current.pause();
                    setIsPlaying(false);
                }
            } catch (error) {
                console.error("Error toggling video playback:", error);
                setIsPlaying(videoRef.current?.paused ? false : true); // Sync with actual state
            }
        }
    };

    const handleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    };

    const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (videoRef.current && isTokenValid) {
            const newTime = Number.parseFloat(e.target.value);
            videoRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            {apiResponseMessage && (
                <div
                    className={`p-3 mb-2 rounded-md text-sm flex items-center`}
                >
                    <span>You are watching in location ... with IP: </span>
                </div>
            )}

            <Card className="w-full bg-gray-900 border-gray-800 overflow-hidden relative">
                <CardContent className="p-0">
                    <div className="relative">
                        <video
                            ref={videoRef}
                            className="w-full aspect-video bg-black"
                            onTimeUpdate={handleTimeUpdate}
                            onLoadedMetadata={handleLoadedMetadata}
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                        />

                        {/* Token invalid overlay (replaces "banned" overlay) */}
                        {!isTokenValid && (
                            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10">
                                <div className="w-[80%] max-w-md bg-red-800/60 p-6 flex flex-col items-center justify-center rounded-lg text-center shadow-xl">
                                    <Ban className="w-16 h-16 text-red-500 mb-4" />
                                    <h2 className="text-2xl font-bold text-white mb-2">
                                        Access Denied
                                    </h2>
                                    <p className="text-gray-300">
                                        {apiResponseMessage ||
                                            "Your access to this video is restricted."}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-3">
                                        Please ensure you have a valid session
                                        or contact support.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* User mode indicator */}
                        <div className="absolute top-4 left-4 bg-gray-800/80 px-3 py-1 rounded-md text-sm z-[5]">
                            <span
                                className={
                                    userMode === "Legitimate"
                                        ? "text-green-400"
                                        : "text-red-400"
                                }
                            >
                                {userMode} Mode
                            </span>
                            {username && (
                                <span className="ml-2 text-gray-300">
                                    | User: {username}
                                </span>
                            )}
                        </div>

                        {/* Video controls */}
                        <div
                            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
                                !isTokenValid
                                    ? "opacity-50 pointer-events-none"
                                    : "opacity-100"
                            }`}
                        >
                            <input
                                type="range"
                                min="0"
                                max={duration || 100}
                                value={currentTime}
                                onChange={handleProgressChange}
                                className="w-full h-1 bg-gray-700 rounded-full appearance-none cursor-pointer"
                                style={{
                                    background: `linear-gradient(to right, #ef4444 ${
                                        (currentTime / (duration || 1)) * 100
                                    }%, #374151 ${
                                        (currentTime / (duration || 1)) * 100
                                    }%)`,
                                }}
                                disabled={!isTokenValid}
                            />

                            <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center gap-2">
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={handlePlay}
                                        disabled={!isTokenValid}
                                        className="text-white hover:bg-gray-800/50"
                                        aria-label={
                                            isPlaying ? "Pause" : "Play"
                                        }
                                    >
                                        {isPlaying ? (
                                            <Pause className="h-5 w-5" />
                                        ) : (
                                            <Play className="h-5 w-5" />
                                        )}
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={handleMute}
                                        disabled={!isTokenValid} // Mute can be independent or also disabled
                                        className="text-white hover:bg-gray-800/50"
                                        aria-label={isMuted ? "Unmute" : "Mute"}
                                    >
                                        {isMuted ? (
                                            <VolumeX className="h-5 w-5" />
                                        ) : (
                                            <Volume2 className="h-5 w-5" />
                                        )}
                                    </Button>
                                    <span className="text-sm text-gray-300">
                                        {formatTime(currentTime)} /{" "}
                                        {formatTime(duration)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
