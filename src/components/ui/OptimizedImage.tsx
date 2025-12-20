'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  fill?: boolean;
  loading?: 'lazy' | 'eager';
  blurDataURL?: string;
  placeholder?: 'blur' | 'empty';
}

export function OptimizedVillaImage({
  src,
  alt,
  className,
  width = 800,
  height = 600,
  priority = false,
  quality = 80,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  fill = false,
  loading = 'lazy',
  blurDataURL,
  placeholder = 'blur',
  ...props
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // ใช้ optimized path ที่ได้รับมาโดยตรง (ไม่แปลงซ้ำ)
  const getOptimizedSrc = (originalSrc: string) => {
    // ใช้ path ที่ได้รับมาตามเดิม (VillaCard จะแปลงให้แล้ว)
    console.log('[OptimizedImage] Using pre-optimized path:', originalSrc);
    return originalSrc;
  };

  // Optimized fallback system - ถ้า WebP ไม่ได้ ลอง JPG
  const getFallbackSrc = (originalSrc: string) => {
    // ถ้าเป็น optimized path และเป็น webp ที่ล้มเหลว ลอง jpg
    if (originalSrc.startsWith('/optimized-villas/') && originalSrc.endsWith('.webp')) {
      const jpgPath = originalSrc.replace('.webp', '.jpg');
      console.log('[OptimizedImage] Falling back from WebP to JPG:', originalSrc, '->', jpgPath);
      return jpgPath;
    }
    
    // Last resort: placeholder image
    return '/images/placeholder-villa.jpg';
  };

  const handleError = () => {
    if (!imageError) {
      // First error: try fallback
      setImageError(true);
      setIsLoading(false);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // Default blur data URL (lightweight base64 image)
  const defaultBlurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==';

  // Choose image source based on error state
  const imageSrc = imageError ? getFallbackSrc(src) : getOptimizedSrc(src);

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        </div>
      )}
      
      <Image
        src={imageSrc}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        quality={quality}
        sizes={sizes}
        loading={loading}
        placeholder={placeholder}
        blurDataURL={blurDataURL || defaultBlurDataURL}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'object-cover transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          className
        )}
        {...props}
      />
    </div>
  );
}

// Specialized component for villa thumbnails (small, fast-loading)
export function VillaThumbnail({
  src,
  alt,
  className,
  ...props
}: OptimizedImageProps) {
  return (
    <OptimizedVillaImage
      src={src}
      alt={alt}
      width={400}
      height={267}
      quality={75}
      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
      className={cn('rounded-lg', className)}
      {...props}
    />
  );
}

// Specialized component for hero images (large, high-quality)
export function VillaHeroImage({
  src,
  alt,
  className,
  ...props
}: OptimizedImageProps) {
  return (
    <OptimizedVillaImage
      src={src}
      alt={alt}
      width={1920}
      height={1080}
      quality={90}
      priority={true}
      sizes="100vw"
      className={cn('w-full h-[60vh] object-cover', className)}
      {...props}
    />
  );
}

// Gallery image component with lazy loading
export function VillaGalleryImage({
  src,
  alt,
  className,
  ...props
}: OptimizedImageProps) {
  return (
    <OptimizedVillaImage
      src={src}
      alt={alt}
      width={800}
      height={600}
      quality={85}
      loading="lazy"
      sizes="(max-width: 768px) 100vw, 50vw"
      className={cn('aspect-[4/3] rounded-lg', className)}
      {...props}
    />
  );
}