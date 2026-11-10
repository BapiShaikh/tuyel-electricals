import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import WhatsAppButton from '../components/common/WhatsAppButton';

const PublicLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default PublicLayout;

