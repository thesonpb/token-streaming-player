"use client";

import type React from "react";

import { useState, useEffect, useRef, use } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ban, Volume2, VolumeX, Pause, Play } from "lucide-react";
import { checkToken } from "@/lib/actions";

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
  const [isTokenBanned, setIsTokenBanned] = useState(false);
  const [userMode, setUserMode] = useState<"Legitimate" | "Pirate">(
    "Legitimate"
  );

  useEffect(() => {
    if (username === "") {
      setUserMode("Pirate");
    } else {
      setUserMode("Legitimate");
    }
  }, [token]);

  // Set up video source with token
  useEffect(() => {
    if (videoRef.current && token) {
      videoRef.current.src = `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4?token=${token}`;
    }
  }, [token]);

  const generateRandomIp = (): string => {
    const octet = () => Math.floor(Math.random() * 256);
    return `${octet()}.${octet()}.${octet()}.${octet()}`;
  };

  useEffect(() => {
    if (!token) return;

    let isActive = true;
    const simulatedIpForThisSession = generateRandomIp();
    const checkTokenValidity = async () => {
      const payloadForApi = {
        token: token,
        token_claim: "access-video",
        request_useragent: navigator.userAgent,
        request_ip: simulatedIpForThisSession,
        request_hostname: window.location.hostname,
        request_path: videoRef.current
          ? new URL(videoRef.current.src).pathname
          : "/unknown_path",
      };

      try {
        const isValid = await checkToken(payloadForApi);

        if (!isActive) return;

        console.log("useEffect - IP:", simulatedIpForThisSession);

        if (!isValid) {
          setIsTokenBanned(true);
        
        } else {
          setIsTokenBanned(false);
        }
      } catch (error) {
        if (!isActive) return;
        console.error("useEffect - Error checking token:", error);
        setIsTokenBanned(true);
        if (videoRef.current && !videoRef.current.paused) {
          videoRef.current.pause();
        }
      }
    };

    checkTokenValidity();
    const intervalId = setInterval(checkTokenValidity, 2000);

    return () => {
      isActive = false;
      clearInterval(intervalId);
    };
  }, [token, setIsTokenBanned, videoRef]);

  // Video event handlers
  const handlePlay = () => {
    if (videoRef.current && !isTokenBanned) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
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
    if (videoRef.current) {
      const newTime = Number.parseFloat(e.target.value);
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  return (
    <Card className="w-full max-w-4xl bg-gray-900 border-gray-800 overflow-hidden relative">
      <CardContent className="p-0">
        <div className="relative">
          <video
            ref={videoRef}
            className="w-full aspect-video bg-black"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
          />

          {/* Token banned overlay */}
          {isTokenBanned && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10">
              <div className="w-80% h-80% bg-red-800/80 p-4 flex flex-col items-center justify-center rounded-md text-center">
                <Ban className="w-16 h-16 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">
                  Token Banned: Access Denied
                </h2>
                <p className="text-gray-300">
                  Pirate access detected. Please contact for support.
                </p>
              </div>
            </div>
          )}

          {/* User mode indicator */}
          <div className="absolute top-4 left-4 bg-gray-800/80 px-3 py-1 rounded-md text-sm">
            <span
              className={
                userMode === "Legitimate" ? "text-green-400" : "text-red-400"
              }
            >
              {userMode} Mode
            </span>
            {username && (
              <span className="ml-2 text-gray-300">| User: {username}</span>
            )}
          </div>

          {/* Video controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
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
                }%, #374151 ${(currentTime / (duration || 1)) * 100}%)`,
              }}
              disabled={isTokenBanned}
            />

            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handlePlay}
                  disabled={isTokenBanned}
                  className="text-white hover:bg-gray-800/50"
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
                  disabled={isTokenBanned}
                  className="text-white hover:bg-gray-800/50"
                >
                  {isMuted ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </Button>
                <span className="text-sm text-gray-300">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
