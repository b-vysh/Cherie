import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';

interface SettingsData {
  instagram_url: string;
  shipping_text: string;
  free_shipping_threshold: number | null;
}

export default function AnnouncementBar() {
  const [settings, setSettings] = useState<SettingsData | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase
        .from('settings')
        .select('instagram_url, shipping_text, free_shipping_threshold')
        .limit(1)
        .single();
      
      if (data) {
        setSettings(data as SettingsData);
      }
    }
    fetchSettings();
  }, []);

  const shippingText = settings?.shipping_text || 'Shipping ₹80';
  const thresholdText = settings?.free_shipping_threshold 
    ? ` | Free shipping on orders above ₹${settings.free_shipping_threshold}` 
    : '';
  const instagramUrl = settings?.instagram_url || 'https://instagram.com';

  return (
    <div className="bg-brand-primary text-brand-bg py-2 px-4 flex justify-between items-center text-sm">
      <div className="flex-1 text-center">
        {shippingText}{thresholdText} | Bulk orders accepted
      </div>
      <a 
        href={instagramUrl}
        target="_blank" 
        rel="noopener noreferrer"
        className="hover:text-brand-accent transition-colors flex items-center justify-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
        </svg>
      </a>
    </div>
  );
}
