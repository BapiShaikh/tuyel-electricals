import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { settingsAPI } from '../services/api';

const SettingsContext = createContext({});

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    shop_name: 'TUYEL ELECTRICALS',
    shop_tagline: 'Your Trusted Partner for Electrical Products & Services.',
    shop_phone: '+91 6294 156854',
    whatsapp_number: '916294156854',
    shop_address: 'Vill- Sherpur (Near Primary School), West Bengal',
    shop_village: 'Sherpur',
    shop_pin: '742165',
    currency_symbol: '₹',
    announcement_text: '⚡ TUYEL ELECTRICALS - Free Home Visit for Motor & Fan Repairs in Sherpur & Nearby Villages!',
    announcement_active: '1',
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const { data } = await settingsAPI.getPublic();
      if (data.success) setSettings(data.data);
    } catch (err) {
      console.warn('Could not load settings, using defaults');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const getWhatsAppUrl = (message) => {
    const num = settings.whatsapp_number || '916294156854';
    return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, refetch: fetchSettings, getWhatsAppUrl }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);

