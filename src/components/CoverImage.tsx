import Image from 'next/image';

import { isStorageUrl } from '@/lib/storage';

interface CoverImageProps {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
}

/**
 * Cover images are usually uploaded to this project's storage bucket, which
 * next/image optimises. A pasted link from another host is rendered as-is,
 * because the optimiser only accepts the hosts configured in next.config.mjs.
 */
export function CoverImage({ src, alt, sizes, className = 'object-cover', priority = false }: CoverImageProps) {
  if (!isStorageUrl(src)) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={`absolute inset-0 h-full w-full ${className}`} />;
  }

  return <Image src={src} alt={alt} fill sizes={sizes} className={className} priority={priority} />;
}
