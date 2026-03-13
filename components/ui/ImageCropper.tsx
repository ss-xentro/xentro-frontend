'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './Button';
import { X, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageCropperProps {
  imageSrc: string;
  aspectRatio?: number; // e.g., 1 for square/circle, 16/9 for landscape
  cropShape?: 'circle' | 'rect';
  onCropComplete: (croppedBlob: Blob) => void;
  onCancel: () => void;
  outputSize?: number; // max output dimension
}

export function ImageCropper({
  imageSrc,
  aspectRatio = 1,
  cropShape = 'circle',
  onCropComplete,
  onCancel,
  outputSize = 512,
}: ImageCropperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Core transform state
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0); // in degrees: 0, 90, 180, 270

  // Interaction state
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const cropStart = useRef({ left: 0, top: 0 });

  // Pinch zoom state
  const pinchStartDistance = useRef(0);
  const zoomStart = useRef(1);

  // Computed crop area state
  const [cropRect, setCropRect] = useState({ width: 0, height: 0, top: 0, left: 0 });

  // Constants
  const MIN_ZOOM = 1;
  const MAX_ZOOM = 3;
  const CROP_PADDING = 32;

  // 1. Initialize crop area based on container size and aspect ratio
  useEffect(() => {
    const updateCropArea = () => {
      if (!containerRef.current) return;
      const container = containerRef.current.getBoundingClientRect();

      const availableWidth = container.width - CROP_PADDING * 2;
      const availableHeight = container.height - CROP_PADDING * 2;

      let cropWidth = availableWidth;
      let cropHeight = cropWidth / aspectRatio;

      if (cropHeight > availableHeight) {
        cropHeight = availableHeight;
        cropWidth = cropHeight * aspectRatio;
      }

      if (cropShape === 'circle') {
        const size = Math.min(cropWidth, cropHeight);
        cropWidth = size;
        cropHeight = size;
      }

      setCropRect({
        width: cropWidth,
        height: cropHeight,
        left: (container.width - cropWidth) / 2,
        top: (container.height - cropHeight) / 2,
      });
    };

    // Delay slightly on mount so container has layout constraints applied
    const timeoutId = setTimeout(updateCropArea, 10);
    window.addEventListener('resize', updateCropArea);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateCropArea);
    };
  }, [aspectRatio, cropShape]);

  // 2. Pointer handlers for panning
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch' && e.clientX === 0 && e.clientY === 0) return;

    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    cropStart.current = { left: cropRect.left, top: cropRect.top };

    if (containerRef.current) containerRef.current.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !containerRef.current) return;

    const container = containerRef.current.getBoundingClientRect();

    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;

    const maxLeft = Math.max(0, container.width - cropRect.width);
    const maxTop = Math.max(0, container.height - cropRect.height);

    const nextLeft = Math.min(maxLeft, Math.max(0, cropStart.current.left + dx));
    const nextTop = Math.min(maxTop, Math.max(0, cropStart.current.top + dy));

    setCropRect((prev) => ({
      ...prev,
      left: nextLeft,
      top: nextTop,
    }));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    if (containerRef.current) containerRef.current.releasePointerCapture(e.pointerId);
  };

  // 3. Wheel / Pinch zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.01;
    setZoom((prev) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev + delta)));
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        pinchStartDistance.current = Math.sqrt(dx * dx + dy * dy);
        zoomStart.current = zoom;
        setIsDragging(false);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const scale = distance / pinchStartDistance.current;
        const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoomStart.current * scale));
        setZoom(newZoom);
      }
    };

    container.addEventListener('touchstart', onTouchStart, { passive: false });
    container.addEventListener('touchmove', onTouchMove, { passive: false });

    return () => {
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
    };
  }, [zoom]);

  // 4. Handle Rotation
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // 5. Final Crop math
  const handleCrop = async () => {
    if (!imageRef.current) return;
    const img = imageRef.current;

    const canvas = document.createElement('canvas');
    canvas.width = outputSize;
    canvas.height = outputSize / aspectRatio;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Bounding rect gives us the scale-transform visual footprint
    const imgRect = img.getBoundingClientRect();
    const containerRect = containerRef.current!.getBoundingClientRect();

    // cropRect values are container-relative (CSS left/top), while
    // imgRect values are viewport-relative. Convert to same system.
    const cropViewportLeft = containerRect.left + cropRect.left;
    const cropViewportTop = containerRect.top + cropRect.top;

    const ratioX = (cropViewportLeft - imgRect.left) / imgRect.width;
    const ratioY = (cropViewportTop - imgRect.top) / imgRect.height;
    const ratioWidth = cropRect.width / imgRect.width;
    const ratioHeight = cropRect.height / imgRect.height;

    const isRotatedOrSwapped = rotation === 90 || rotation === 270;
    const natW = isRotatedOrSwapped ? img.naturalHeight : img.naturalWidth;
    const natH = isRotatedOrSwapped ? img.naturalWidth : img.naturalHeight;

    // Use a temporary canvas to apply rotation to the original full image
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = natW;
    tempCanvas.height = natH;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    tempCtx.translate(natW / 2, natH / 2);
    tempCtx.rotate((rotation * Math.PI) / 180);
    tempCtx.drawImage(
      img,
      -img.naturalWidth / 2,
      -img.naturalHeight / 2
    );

    // Calculate source coordinates against the rotated image buffer
    const sourceX = ratioX * natW;
    const sourceY = ratioY * natH;
    const sourceWidth = ratioWidth * natW;
    const sourceHeight = ratioHeight * natH;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(
      tempCanvas,
      sourceX, sourceY, sourceWidth, sourceHeight,
      0, 0, canvas.width, canvas.height
    );

    canvas.toBlob((blob) => {
      if (blob) onCropComplete(blob);
    }, 'image/png', 1.0);
  };

  const renderZoomPercentage = () => {
    return Math.round((zoom - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM) * 100) + '%';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 sm:p-6 touch-none">
      {/* Modal Card */}
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">Edit Photo</h3>
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cropping Area */}
        <div
          className="relative w-full aspect-square sm:h-[400px] sm:aspect-auto bg-[#e5e7eb] overflow-hidden"
          ref={containerRef}
        >
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Crop preview"
              draggable={false}
              className="max-w-full max-h-full origin-center"
              style={{
                width: 'auto',
                height: 'auto',
                objectFit: 'contain',
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transition: isDragging ? 'none' : 'transform 0.1s ease-out',
              }}
            />
          </div>

          <div
            className="absolute inset-0 cursor-move hover:bg-black/5 transition-colors"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onWheel={handleWheel}
          >
            {/* Dim Overlay and Mask */}
            {cropRect.width > 0 && (
              <div className="absolute inset-0 pointer-events-none">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <mask id="crop-mask-white">
                      <rect width="100%" height="100%" fill="white" />
                      {cropShape === 'circle' ? (
                        <circle
                          cx={cropRect.left + cropRect.width / 2}
                          cy={cropRect.top + cropRect.height / 2}
                          r={cropRect.width / 2}
                          fill="black"
                        />
                      ) : (
                        <rect
                          x={cropRect.left}
                          y={cropRect.top}
                          width={cropRect.width}
                          height={cropRect.height}
                          fill="black"
                          rx="4"
                        />
                      )}
                    </mask>
                  </defs>
                  <rect
                    width="100%"
                    height="100%"
                    fill="rgba(255, 255, 255, 0.75)"
                    mask="url(#crop-mask-white)"
                  />
                </svg>

                {/* White Ring */}
                <div
                  className={cn(
                    "absolute border-[3px] border-white pointer-events-none shadow-sm",
                    cropShape === 'circle' ? 'rounded-full' : 'rounded-lg'
                  )}
                  style={{
                    left: cropRect.left,
                    top: cropRect.top,
                    width: cropRect.width,
                    height: cropRect.height,
                    boxShadow: '0 0 0 1px rgba(0,0,0,0.05), inset 0 0 0 1px rgba(0,0,0,0.05)'
                  }}
                >
                  {/* Subtle internal grid lines while dragging */}
                  <div className={cn("absolute inset-0 grid grid-cols-3 grid-rows-3 transition-opacity duration-200", isDragging ? 'opacity-100' : 'opacity-0')}>
                    {[...Array(9)].map((_, i) => (
                      <div key={i} className="border border-white/50" />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Controls */}
        <div className="px-6 py-4 flex flex-col sm:flex-row items-center gap-4 bg-white border-t border-gray-100">

          {/* Zoom & Slider */}
          <div className="flex-1 flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              className="p-1 text-gray-500 hover:text-gray-800 transition-colors"
              onClick={() => setZoom(Math.max(MIN_ZOOM, zoom - 0.25))}
            >
              <ZoomOut className="w-[18px] h-[18px]" />
            </button>

            <input
              type="range"
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              step="0.01"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="flex-1 accent-indigo-500 h-[3px] bg-gray-200 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:bg-indigo-600 [&::-webkit-slider-thumb]:rounded-full cursor-pointer hover:[&::-webkit-slider-thumb]:bg-indigo-700 hover:[&::-webkit-slider-thumb]:scale-110 [&::-webkit-slider-thumb]:transition-transform"
            />

            <button
              type="button"
              className="p-1 text-gray-500 hover:text-gray-800 transition-colors"
              onClick={() => setZoom(Math.min(MAX_ZOOM, zoom + 0.25))}
            >
              <ZoomIn className="w-[18px] h-[18px]" />
            </button>

            <span className="text-xs font-semibold text-gray-500 w-8 text-right tabular-nums">
              {renderZoomPercentage()}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end mt-2 sm:mt-0">
            <button
              type="button"
              onClick={handleRotate}
              className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors flex items-center justify-center ring-1 ring-inset ring-gray-200 hover:ring-indigo-100"
              aria-label="Rotate 90 degrees"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            <Button
              type="button"
              className="min-w-[100px] h-9 ml-2 bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
              onClick={handleCrop}
            >
              Save
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
