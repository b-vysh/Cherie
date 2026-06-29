import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { MessageCircle } from 'lucide-react';

interface SettingsData {
  whatsapp_number: string;
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
        .select('whatsapp_number, instagram_url, shipping_text, free_shipping_threshold')
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
  const whatsappNumber = settings?.whatsapp_number || '';

  return (
    <div className="bg-brand-primary text-[#115E63] py-2 px-4 flex justify-center items-center text-sm relative min-h-[40px]">
      <div className="text-center px-16">
        {shippingText}{thresholdText} | Bulk orders accepted
      </div>
      <div className="absolute right-4 flex items-center gap-4">
        {whatsappNumber && (
          <a 
            href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hi CHERIE! I absolutely love your collection and would like to inquire about some products. Looking forward to hearing from you!')}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:opacity-70 transition-opacity flex items-center justify-center"
            title="WhatsApp Us"
          >
            <MessageCircle size={18} />
          </a>
        )}
        <a 
          href={instagramUrl}
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:opacity-70 transition-opacity flex items-center justify-center"
          title="Instagram"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
          </svg>
        </a>
      </div>
    </div>
  );
}
