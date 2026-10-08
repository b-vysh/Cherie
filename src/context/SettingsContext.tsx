import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

interface Settings {
  whatsapp_number: string | null;
  instagram_url: string | null;
  shipping_text: string | null;
  free_shipping_threshold: number | null;
  upi_id: string | null;
  payee_name: string | null;
}

interface SettingsContextType {
  settings: Settings | null;
  isLoading: boolean;
}

const defaultSettings: Settings = {
  whatsapp_number: null,
  instagram_url: null,
  shipping_text: 'Shipping ₹80',
  free_shipping_threshold: null,
  upi_id: null,
  payee_name: null,
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  isLoading: true,
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase
        .from('settings')
        .select('whatsapp_number, instagram_url, shipping_text, free_shipping_threshold, upi_id, payee_name')
        .limit(1)
        .maybeSingle();

      setSettings(data ?? defaultSettings);
      setIsLoading(false);
    }
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings: settings ?? defaultSettings, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
