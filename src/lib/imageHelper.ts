// Fallback high-resolution Islamic streetwear t-shirt images
export const DEFAULT_IMAGES = {
  heroBanner: '/images/hero_islamic_tshirt_banner_1791712348157.jpg',
  fallbackHeroBanner: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1200&auto=format&fit=crop&q=80',
  tshirtBlack: '/images/tshirt_sabr_calligraphy_1791712281050.jpg',
  fallbackTshirtBlack: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80',
  tshirtGreen: '/images/tshirt_tawakkul_green_1791712291944.jpg',
  fallbackTshirtGreen: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&auto=format&fit=crop&q=80',
  tshirtCream: '/images/tshirt_al_ummah_cream_1791712303018.jpg',
  fallbackTshirtCream: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=80',
};

// Normalize image path to handle any outdated /src/assets/images/ paths
export const normalizeImageUrl = (url?: string): string => {
  if (!url) return DEFAULT_IMAGES.tshirtBlack;
  if (url.startsWith('/src/assets/images/')) {
    return url.replace('/src/assets/images/', '/images/');
  }
  return url;
};

// Image onError event handler fallback to prevent broken images
export const handleImageFallback = (
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  fallbackUrl: string = DEFAULT_IMAGES.fallbackTshirtBlack
) => {
  const target = e.currentTarget;
  if (!target.src.includes('unsplash.com')) {
    target.src = fallbackUrl;
  }
};
