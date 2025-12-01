"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface ImageComparisonSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
}

export function ImageComparisonSlider({
  beforeImage,
  afterImage,
  beforeLabel = "Önce",
  afterLabel = "Sonra",
  className = "",
}: ImageComparisonSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = (x / rect.width) * 100;
    setSliderPosition(percentage);
  };

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      ref={containerRef}
      className={`relative select-none overflow-hidden ${className}`}
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
    >
      {/* Before Image (Kıyafetsiz) */}
      <div className="relative h-full w-full">
        <Image
          src={beforeImage}
          alt={beforeLabel}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute left-4 top-4 rounded-full bg-black/50 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
          {beforeLabel}
        </div>
      </div>

      {/* After Image (Try-on yapılmış) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <Image
          src={afterImage}
          alt={afterLabel}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute right-4 top-4 rounded-full bg-brand-600/90 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
          {afterLabel}
        </div>
      </div>

      {/* Slider Line */}
      <div
        className="absolute inset-y-0 w-0.5 cursor-ew-resize bg-white shadow-lg"
        style={{ left: `${sliderPosition}%` }}
      >
        {/* Slider Handle */}
        <div className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-xl">
          <div className="flex items-center gap-1">
            <svg
              className="h-3 w-3 text-slate-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <svg
              className="h-3 w-3 text-slate-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Hint Text */}
      {!isDragging && (
        <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 transform">
          <div className="animate-pulse rounded-full bg-black/50 px-4 py-2 text-xs font-medium text-white backdrop-blur-sm">
            ← Slider&apos;ı kaydırın →
          </div>
        </div>
      )}
    </div>
  );
}
