import { useState } from 'react';
import { Phone, Mail, MapPin, MessageCircle, Clock, Send, CheckCircle } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import PublicLayout from '../layouts/PublicLayout';

const ContactPage = () => {
  const { settings } = useSettings();
  const [form, setForm] = useState({ name: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleWhatsApp = (e) => {
    e.preventDefault();
    if (!form.name || !form.message) return;
    const msg = `Hi TUYEL ELECTRICALS!\n\nName: ${form.name}\nPhone: ${form.phone}\n\nMessage: ${form.message}`;
    window.open(`https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(msg)}`, '_blank');
    setSent(true);
  };

  return (
    <PublicLayout>
      <div className="bg-navy-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display font-bold text-4xl mb-3">Contact Us</h1>
          <p className="text-blue-200">We're here to help. Reach out to us anytime.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <h2 className="font-display font-bold text-2xl text-navy-900 mb-6">Get in Touch</h2>
            <div className="space-y-5">
              {[
                { icon: <Phone className="text-electric-500" size={22} />, title: 'Call / WhatsApp', content: settings.shop_phone, link: `tel:${settings.shop_phone}` },
                { icon: <MessageCircle className="text-green-500" size={22} />, title: 'WhatsApp', content: 'Chat with us on WhatsApp', link: `https://wa.me/${settings.whatsapp_number}` },
                { icon: <MapPin className="text-red-500" size={22} />, title: 'Shop Address', content: settings.shop_address },
                { icon: <Clock className="text-orange-500" size={22} />, title: 'Business Hours', content: 'Mon–Sat: 8:00 AM – 8:00 PM\nSunday: 9:00 AM – 6:00 PM' },
                { icon: <Mail className="text-purple-500" size={22} />, title: 'Email', content: settings.shop_email, link: `mailto:${settings.shop_email}` },
              ].map(item => (
                <div key={item.title} className="flex gap-4">
                  <div className="w-11 h-11 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">{item.icon}</div>
                  <div>
                    <div className="font-semibold text-gray-700 text-sm">{item.title}</div>
                    {item.link ? (
                      <a href={item.link} target={item.link.startsWith('https') ? '_blank' : undefined} rel="noopener noreferrer" className="text-electric-600 hover:underline whitespace-pre-line">{item.content}</a>
                    ) : (
                      <div className="text-gray-600 whitespace-pre-line">{item.content}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Map placeholder */}
            <div className="mt-8 bg-gray-100 rounded-2xl h-56 flex items-center justify-center border-2 border-dashed border-gray-300">
              <div className="text-center text-gray-400">
                <MapPin size={32} className="mx-auto mb-2" />
                <p className="text-sm">Map integration coming soon</p>
                <p className="text-xs">{settings.shop_address}</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <div className="card p-8">
              <h2 className="font-display font-bold text-2xl text-navy-900 mb-2">Send a Message</h2>
              <p className="text-gray-500 text-sm mb-6">Your message will be sent via WhatsApp for fastest response</p>

              {sent ? (
                <div className="text-center py-8">
                  <CheckCircle className="text-green-500 mx-auto mb-3" size={48} />
                  <h3 className="font-bold text-lg text-gray-700 mb-2">Message Sent!</h3>
                  <p className="text-gray-500 text-sm">We'll respond to you on WhatsApp shortly.</p>
                  <button onClick={() => { setSent(false); setForm({ name: '', phone: '', message: '' }); }} className="btn-outline mt-4">Send Another</button>
                </div>
              ) : (
                <form onSubmit={handleWhatsApp} className="space-y-4">
                  <div>
                    <label className="label">Your Name *</label>
                    <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Enter your name" className="input-field" />
                  </div>
                  <div>
                    <label className="label">Mobile Number</label>
                    <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Your WhatsApp number" className="input-field" />
                  </div>
                  <div>
                    <label className="label">Message *</label>
                    <textarea required rows={5} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="How can we help you? Ask about products, services, pricing..." className="input-field resize-none" />
                  </div>
                  <button type="submit" className="btn-primary w-full justify-center py-3 bg-green-500 hover:bg-green-600">
                    <MessageCircle size={18} /> Send via WhatsApp
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default ContactPage;

