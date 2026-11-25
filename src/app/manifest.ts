import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'GramGains - Modular Calorie & Macro Tracker',
    short_name: 'GramGains',
    description: 'Precision Indian Nutrition & Calorie Tracking powered by IFCT 2017 & INDB datasets',
    start_url: '/',
    display: 'standalone',
    background_color: '#090d16',
    theme_color: '#169b55',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/images/logo-bg-remove.png',
        sizes: '1024x1024',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
