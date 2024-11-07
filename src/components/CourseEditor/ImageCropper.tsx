import React, { useState, useRef, useEffect } from 'react';
import { Move } from 'lucide-react';

interface ImageCropperProps {
  imageUrl: string;
  onCropComplete: (croppedImageUrl: string) => void;
  onCancel: () => void;
}

export default function ImageCropper({ imageUrl, onCropComplete, onCancel }: ImageCropperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  
  useEffect(() => {
    const image = imageRef.current;
    const container = containerRef.current;
    
    if (image && container) {
      // Calculate initial scale to fit the image within the container
      const containerAspect = container.offsetWidth / container.offsetHeight;
      const imageAspect = image.naturalWidth / image.naturalHeight;
      
      if (imageAspect > containerAspect) {
        setScale(container.offsetHeight / image.naturalHeight);
      } else {
        setScale(container.offsetWidth / image.naturalWidth);
      }
    }
  }, [imageUrl]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartPos({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const container = containerRef.current;
    const image = imageRef.current;
    
    if (!container || !image) return;
    
    const newX = e.clientX - startPos.x;
    const newY = e.clientY - startPos.y;
    
    // Calculate boundaries
    const scaledWidth = image.naturalWidth * scale;
    const scaledHeight = image.naturalHeight * scale;
    
    const minX = container.offsetWidth - scaledWidth;
    const minY = container.offsetHeight - scaledHeight;
    
    // Constrain movement within boundaries
    const boundedX = Math.min(0, Math.max(minX, newX));
    const boundedY = Math.min(0, Math.max(minY, newY));
    
    setPosition({
      x: boundedX,
      y: boundedY
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoom = (delta: number) => {
    const newScale = Math.max(0.5, Math.min(3, scale + delta * 0.1));
    setScale(newScale);
  };

  const handleCropComplete = () => {
    const container = containerRef.current;
    const image = imageRef.current;
    
    if (!container || !image) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // Set canvas size to container size
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
    
    // Draw the image with current position and scale
    ctx.drawImage(
      image,
      -position.x / scale,
      -position.y / scale,
      image.naturalWidth,
      image.naturalHeight,
      0,
      0,
      image.naturalWidth * scale,
      image.naturalHeight * scale
    );
    
    const croppedImageUrl = canvas.toDataURL('image/jpeg', 0.9);
    onCropComplete(croppedImageUrl);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">Ajustar imagen</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleZoom(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                -
              </button>
              <span className="min-w-[3rem] text-center">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={() => handleZoom(1)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                +
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div 
            ref={containerRef}
            className="relative w-full h-[400px] overflow-hidden rounded-lg bg-gray-100 cursor-move border-2 border-dashed border-gray-300"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Crop preview"
              className="absolute select-none"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transformOrigin: '0 0',
                transition: isDragging ? 'none' : 'transform 0.1s ease-out'
              }}
              draggable={false}
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Move className="w-8 h-8 text-gray-400/50" />
            </div>
          </div>
          
          <p className="mt-2 text-sm text-gray-500">
            Arrastra la imagen para ajustar la posición. Usa los controles de zoom para ajustar el tamaño.
          </p>
        </div>
        
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleCropComplete}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Aplicar cambios
          </button>
        </div>
      </div>
    </div>
  );
}