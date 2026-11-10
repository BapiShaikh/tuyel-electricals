import { MessageCircle } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

const WhatsAppButton = ({ message }) => {
  const { settings } = useSettings();
  const defaultMsg = `Hello TUYEL ELECTRICALS! I need assistance.`;
  const url = `https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(message || defaultMsg)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float"
      aria-label="Chat on WhatsApp"
    >
      <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors">
        <MessageCircle size={28} className="text-white fill-current" />
      </div>
    </a>
  );
};

export default WhatsAppButton;

