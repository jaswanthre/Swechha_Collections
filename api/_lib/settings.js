import { HttpError } from './http.js';

// Defaults mirror the copy in the Stitch design so the site looks right before anything is edited.
export const DEFAULT_SETTINGS = {
  collectionName: "Spring/Summer '25 Bridal Edit",
  categories: [
    { key: 'Sarees', label: 'Sarees', singular: 'Saree', blurb: 'Classic silhouettes' },
    { key: 'Lehengas', label: 'Lehengas', singular: 'Lehenga', blurb: 'Festive favorites' },
    { key: 'Kurti', label: 'Kurti', singular: 'Kurti', blurb: 'Everyday elegance' },
    { key: 'Leggings', label: 'Leggings', singular: 'Leggings', blurb: 'Comfort and style' },
    { key: 'Tops', label: 'Tops', singular: 'Top', blurb: 'Minimal essentials' },
    { key: 'Co-Ord sets', label: 'Co-Ord sets', singular: 'Co-Ord set', blurb: 'Matching separates' },
    { key: 'Dresses(3-pcs)', label: 'Dresses(3-pcs)', singular: 'Dress(3-pcs)', blurb: 'Set styling' },
    { key: 'Frocks', label: 'Frocks', singular: 'Frock', blurb: 'Light and playful' },
    { key: 'Night dresses', label: 'Night dresses', singular: 'Night dress', blurb: 'Soft comfort' },
    { key: 'Bamboo night dresses', label: 'Bamboo night dresses', singular: 'Bamboo night dress', blurb: 'Breathable lounge' },
  ],
  banners: [
    {
      tag: 'AUTUMN / FESTIVE 2025',
      title: 'The Festive Edit',
      subtitle: 'Curated handlooms & celebratory silhouettes crafted for timeless grace.',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDChVNI7g20FjxpdcWu7r3sxgxC886hd8M1p7-Kqq6s5x4h9SUIvNCls_s60ZSX2TwiAfN_1mxa0KkSJNO4oUBraxQSfwdkH3WiayJyrSrAsVSk8groiAtLv8SjhgVhLFf4PKO5dmGx4d3XOFaJR-MfM5KfuaC4_w9RZ1m0PkiIVzlawe00bUrlSIZD3Pe-FMd2--9Pn5UtzS7UZ9hGRzB-EbWcZbPMSvdsrCKrXwsuUPasQZjnF9A',
      ctaLabel: 'Explore Collection',
      ctaLink: '/collection',
    },
  ],
  whatsapp: '9154246254',
  email: 'concierge@swechhacollections.com',
  locations: 'Jubilee Hills, Hyderabad • Mehrauli, New Delhi',
  instagram: '',
};

const str = (v, max = 300) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export function sanitizeSettings(body) {
  const categories = (Array.isArray(body.categories) ? body.categories : DEFAULT_SETTINGS.categories)
    .map((category) => {
      const label = str(category?.label || category?.key, 80);
      return { key: str(category?.key || label, 80), label, singular: str(category?.singular || label, 80), blurb: str(category?.blurb, 120) };
    })
    .filter((category) => category.key && category.label)
    .slice(0, 50);
  const banners = (Array.isArray(body.banners) ? body.banners : [])
    .map((b) => ({
      tag: str(b?.tag, 40),
      title: str(b?.title, 80),
      subtitle: str(b?.subtitle, 200),
      image: str(b?.image, 1000),
      ctaLabel: str(b?.ctaLabel, 40),
      ctaLink: str(b?.ctaLink, 300),
    }))
    .filter((b) => b.title && /^https:\/\//i.test(b.image))
    .slice(0, 6);
  if (!banners.length) throw new HttpError(400, 'Keep at least one banner with a title and an image.');
  const whatsapp = str(body.whatsapp, 20).replace(/\D/g, '');
  if (whatsapp && whatsapp.length < 10) throw new HttpError(400, 'WhatsApp number needs the country code, e.g. 919876543210.');
  const instagram = str(body.instagram, 300);
  return {
    collectionName: str(body.collectionName, 80),
    categories,
    banners,
    whatsapp,
    email: str(body.email, 120),
    locations: str(body.locations, 200),
    instagram: /^https?:\/\//i.test(instagram) || !instagram ? instagram : `https://instagram.com/${instagram.replace(/^@/, '')}`,
  };
}
