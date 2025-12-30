"use client";
import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Grid3X3, Expand } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VillaImageGalleryProps {
  images: string[];
  villaName: string;
  className?: string;
}

export default function VillaImageGallery({ images, villaName, className = '' }: VillaImageGalleryProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Helper function to convert API path to optimized path
  const getOptimizedImageUrl = (imageUrl: string): string => {
    if (imageUrl.startsWith('/api/images/')) {
      let staticPath = imageUrl.replace('/api/images/', '/optimized-villas/');
      
      // URL encode villa folder name
      const pathParts = staticPath.split('/');
      if (pathParts.length >= 3) {
        pathParts[2] = encodeURIComponent(pathParts[2]);
        staticPath = pathParts.join('/');
      }
      
      return staticPath;
    }
    
    return imageUrl;
  };

  // Default fallback image
  const defaultImages = ['/optimized-villas/5-stars-beachfront-villa/hero/909.webp'];

  const processedImages = images?.length > 0 
    ? images.map(getOptimizedImageUrl) 
    : defaultImages;
  
  const galleryImages = processedImages;
  const totalImages = galleryImages.length;

  const openModal = (index: number) => {
    setCurrentImageIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % totalImages);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  // Minimum swipe distance (in px) to trigger swipe
  const minSwipeDistance = 50;

  // Touch handlers for mobile swipe
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextImage();
    } else if (isRightSwipe) {
      prevImage();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  return (
    <>
      {/* Gallery Grid */}
      <div className={`relative ${className}`}>
        <div className="grid grid-cols-4 gap-1 h-[400px] overflow-hidden rounded-3xl shadow-lg">
          {/* Main large image */}
          <div className="col-span-2 row-span-2 relative group cursor-pointer" onClick={() => openModal(0)}>
            <img
              src={galleryImages[0]}
              alt={`${villaName} - Main view`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <Expand className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Right side smaller images */}
          {galleryImages.slice(1, 5).map((image, index) => (
            <div
              key={index}
              className="relative group cursor-pointer"
              onClick={() => openModal(index + 1)}
            >
              <img
                src={image}
                alt={`${villaName} - View ${index + 2}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <Expand className="w-6 h-6 text-white" />
              </div>
            </div>
          ))}
        </div>

        {/* View All Photos Button */}
        {totalImages > 5 && (
          <Button
            onClick={() => openModal(0)}
            className="absolute bottom-4 right-4 bg-white text-gray-800 hover:bg-gray-50 border shadow-lg rounded-2xl"
          >
            <Grid3X3 className="w-4 h-4 mr-2" />
            Show all {totalImages} photos
          </Button>
        )}
      </div>

      {/* Lightbox Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center p-4 bg-gradient-to-b from-black/50 to-transparent">
            <div className="text-white">
              <h3 className="font-semibold">{villaName}</h3>
              <p className="text-sm text-gray-300">
                {currentImageIndex + 1} of {totalImages} photos
              </p>
            </div>
            <Button
              onClick={closeModal}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>

          {/* Main Image */}
          <div className="relative w-full h-full max-w-5xl max-h-[80vh] mx-4 flex items-center justify-center">
            <img
              src={galleryImages[currentImageIndex]}
              alt={`${villaName} - View ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Navigation Buttons */}
          {totalImages > 1 && (
            <>
              <Button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 rounded-3xl p-3 hover:scale-105 transition-all duration-200"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <Button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 rounded-3xl p-3 hover:scale-105 transition-all duration-200"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </>
          )}

          {/* Thumbnail Strip - Enhanced styling */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-2 bg-black/50 rounded-3xl px-4 py-2 max-w-4xl overflow-x-auto">
            {galleryImages.map((image, index) => (
              <div
                key={index}
                className={`relative w-16 h-12 rounded-2xl cursor-pointer border-2 transition-all duration-200 flex-shrink-0 ${
                  index === currentImageIndex ? 'border-white' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
                onClick={() => goToImage(index)}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover rounded-2xl"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}