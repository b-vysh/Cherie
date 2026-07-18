import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AdminLayout from '../../components/layout/AdminLayout';
import { supabase } from '../../services/supabase';

interface SettingsData {
  id?: string;
  whatsapp_number: string;
  instagram_url: string;
  shipping_text: string;
  free_shipping_threshold: string | number;
  upi_id: string;
  payee_name: string;
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<SettingsData>({
    whatsapp_number: '',
    instagram_url: '',
    shipping_text: '',
    free_shipping_threshold: '',
    upi_id: '',
    payee_name: ''
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase
        .from('settings')
        .select('*')
        .limit(1)
        .single();
        
      if (data) {
        setSettings({
          id: data.id,
          whatsapp_number: data.whatsapp_number || '',
          instagram_url: data.instagram_url || '',
          shipping_text: data.shipping_text || '',
          free_shipping_threshold: data.free_shipping_threshold || '',
          upi_id: data.upi_id || '',
          payee_name: data.payee_name || ''
        });
      }
      setIsLoading(false);
    }
    
    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const payload = {
        whatsapp_number: settings.whatsapp_number,
        instagram_url: settings.instagram_url,
        shipping_text: settings.shipping_text,
        free_shipping_threshold: settings.free_shipping_threshold === '' ? null : Number(settings.free_shipping_threshold),
        upi_id: settings.upi_id,
        payee_name: settings.payee_name
      };

      if (settings.id) {
        // Update existing
        const { error } = await supabase
          .from('settings')
          .update(payload)
          .eq('id', settings.id);
        if (error) throw error;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('settings')
          .insert([payload])
          .select()
          .single();
        if (error) throw error;
        if (data) setSettings(prev => ({ ...prev, id: data.id }));
      }
      
      toast.success('Settings saved successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-heading text-[#115E63] mb-8">Store Settings</h1>

        {isLoading ? (
          <div className="py-10 text-center text-[#115E63] animate-pulse font-bold">Loading settings...</div>
        ) : (
          <form onSubmit={handleSave} className="bg-brand-peach p-6 md:p-8 rounded-[16px] shadow-sm space-y-6">
            
            <div className="space-y-2">
              <label className="block text-[#115E63] font-bold">WhatsApp Number</label>
              <p className="text-sm text-[#115E63]/60 mb-2">Used for support/inquiries (include country code, e.g. +91XXXXXXXXXX)</p>
              <input 
                type="text" 
                name="whatsapp_number"
                value={settings.whatsapp_number}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-3 bg-brand-bg border border-brand-primary/20 rounded-[10px] text-[#115E63] focus:outline-none focus:border-brand-primary transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[#115E63] font-bold">Instagram URL</label>
              <p className="text-sm text-[#115E63]/60 mb-2">Link for the icon in the announcement bar</p>
              <input 
                type="url" 
                name="instagram_url"
                value={settings.instagram_url}
                onChange={handleChange}
                placeholder="https://instagram.com/yourstore"
                className="w-full px-4 py-3 bg-brand-bg border border-brand-primary/20 rounded-[10px] text-[#115E63] focus:outline-none focus:border-brand-primary transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[#115E63] font-bold">Shipping Text</label>
                <p className="text-sm text-[#115E63]/60 mb-2">Base shipping fee (e.g. Shipping ₹80)</p>
                <input 
                  type="text" 
                  name="shipping_text"
                  value={settings.shipping_text}
                  onChange={handleChange}
                  placeholder="Shipping ₹80"
                  className="w-full px-4 py-3 bg-brand-bg border border-brand-primary/20 rounded-[10px] text-[#115E63] focus:outline-none focus:border-brand-primary transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[#115E63] font-bold">Free Shipping Threshold (₹)</label>
                <p className="text-sm text-[#115E63]/60 mb-2">Amount needed for free shipping (e.g. 2000)</p>
                <input 
                  type="number" 
                  name="free_shipping_threshold"
                  value={settings.free_shipping_threshold}
                  onChange={handleChange}
                  placeholder="2000"
                  min="0"
                  className="w-full px-4 py-3 bg-brand-bg border border-brand-primary/20 rounded-[10px] text-[#115E63] focus:outline-none focus:border-brand-primary transition-colors"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-brand-primary/10">
              <h2 className="text-2xl font-heading text-[#115E63] mb-4">Payment Settings (UPI)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[#115E63] font-bold">UPI ID</label>
                  <p className="text-sm text-[#115E63]/60 mb-2">e.g. yourname@okicici</p>
                  <input 
                    type="text" 
                    name="upi_id"
                    value={settings.upi_id}
                    onChange={handleChange}
                    placeholder="yourname@okicici"
                    className="w-full px-4 py-3 bg-brand-bg border border-brand-primary/20 rounded-[10px] text-[#115E63] focus:outline-none focus:border-brand-primary transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[#115E63] font-bold">Payee Name</label>
                  <p className="text-sm text-[#115E63]/60 mb-2">The name registered with this UPI ID</p>
                  <input 
                    type="text" 
                    name="payee_name"
                    value={settings.payee_name}
                    onChange={handleChange}
                    placeholder="CHERIE Store"
                    className="w-full px-4 py-3 bg-brand-bg border border-brand-primary/20 rounded-[10px] text-[#115E63] focus:outline-none focus:border-brand-primary transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-brand-primary/10 flex justify-end">
              <button 
                type="submit"
                disabled={isSaving}
                className="bg-brand-primary text-[#115E63] px-8 py-3 rounded-[10px] font-bold flex items-center gap-2 hover:bg-brand-primary/90 transition-colors disabled:opacity-70"
              >
                <Save size={20} />
                {isSaving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>

          </form>
        )}
      </div>
    </AdminLayout>
  );
}
