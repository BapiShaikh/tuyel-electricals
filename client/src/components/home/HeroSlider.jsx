import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Zap, Wrench, MessageCircle, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { getImageUrl } from '../../utils/helpers';

// Default high-resolution slides with professional electrical imagery
const DEFAULT_SLIDES = [
  {
    id: 'def-1',
    title: 'Complete Electrical Solutions for Home & Business',
    subtitle: 'Shop top-quality electrical products and get reliable repair & installation services in Sherpur & nearby villages.',
    image_path: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1920&q=80',
    button_text: 'Explore Products',
    button_link: '/shop',
    tag: 'Trusted Since 2010',
  },
  {
    id: 'def-2',
    title: 'High-Speed Ceiling Fans & Summer Coolers',
    subtitle: 'Premium brands like Orient, Havells, Crompton, and Usha at unbeatable wholesale & retail rates with full warranty.',
    image_path: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=1920&q=80',
    button_text: 'Shop Fans & Coolers',
    button_link: '/shop?category=ceiling-fans',
    tag: 'Beat The Heat',
  },
  {
    id: 'def-3',
    title: 'Energy-Saving LED Lights & Modern Chandeliers',
    subtitle: 'Brighten your home and storefront with high-lumen, long-lasting LED panels, spotlights, and decorative fittings.',
    image_path: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1920&q=80',
    button_text: 'Explore LED Lighting',
    button_link: '/shop?category=led-lights',
    tag: 'Up to 80% Energy Saving',
  },
  {
    id: 'def-4',
    title: 'Expert Motor Rewinding & Appliance Repairs',
    subtitle: 'Doorstep repair and diagnostic support for water pumps, ceiling fans, inverters, and heavy machinery with quick turnaround.',
    image_path: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1920&q=80',
    button_text: 'Book a Service',
    button_link: '/book-service',
    tag: 'Certified Technicians',
  },
  {
    id: 'def-5',
    title: '100% Genuine Modular Switches & Safe Wiring',
    subtitle: 'Authorized dealer of Anchor, Polycab, Finolex, and Goldmedal with flame-retardant safety standards.',
    image_path: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1920&q=80',
    button_text: 'View Wiring & Switches',
    button_link: '/shop?category=wires-cables',
    tag: 'Govt. ISI Certified',
  },
];

const HeroSlider = ({ banners = [], settings = {} }) => {
  // Use banners from DB if available, else fallback to default slides
  const slides = banners && banners.length > 0 ? banners : DEFAULT_SLIDES;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const slideInterval = useRef(null);

  const totalSlides = slides.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  // Autoplay timer (5 seconds)
  useEffect(() => {
    if (isPaused || totalSlides <= 1) return;
    slideInterval.current = setInterval(() => {
      nextSlide();
    }, 5500);

    return () => {
      if (slideInterval.current) clearInterval(slideInterval.current);
    };
  }, [nextSlide, isPaused, totalSlides, currentIndex]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) {
      nextSlide();
    } else if (diff < -50) {
      prevSlide();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const currentSlide = slides[currentIndex] || slides[0];
  const whatsappNum = settings.whatsapp_number || '916294156854';

  return (
    <div
      className="relative w-full overflow-hidden bg-navy-950 text-white select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides Container */}
      <div className="relative min-h-[520px] sm:min-h-[580px] md:min-h-[620px] lg:min-h-[660px] flex items-center">
        {slides.map((slide, index) => {
          const isActive = index === currentIndex;
          const bgImg = getImageUrl(slide.image_path, slide.title);

          return (
            <div
              key={slide.id || index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Slide Background Image with subtle Ken-Burns effect */}
              <div
                className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-7000 ease-out ${
                  isActive ? 'scale-105' : 'scale-100'
                }`}
                style={{ backgroundImage: `url(${bgImg})` }}
              />

              {/* Multi-layer Gradient Overlays for readable text & brand aesthetics */}
              <div className="absolute inset-0 bg-gradient-to-r from-navy-950/95 via-navy-950/80 to-navy-950/40" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-navy-950/40" />
              <div className="absolute inset-0 bg-electric-950/20 mix-blend-multiply" />

              {/* Decorative Accent Glows */}
              <div className="absolute top-12 left-10 w-72 h-72 rounded-full bg-electric-500/20 filter blur-3xl pointer-events-none" />
              <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-brand-orange/20 filter blur-3xl pointer-events-none" />

              {/* Slide Content */}
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center relative z-20">
                <div className="max-w-2xl lg:max-w-3xl py-16 sm:py-20 md:py-24">
                  {/* Tag / Badge */}
                  <div
                    className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-electric-600/30 border border-electric-400/40 text-electric-300 text-xs sm:text-sm font-semibold mb-4 sm:mb-5 backdrop-blur-md shadow-lg transition-all duration-700 delay-100 ${
                      isActive ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
                    }`}
                  >
                    <Sparkles size={14} className="text-yellow-400 animate-pulse" />
                    <span>{slide.tag || 'TUYEL ELECTRICALS • SHERPUR'}</span>
                  </div>

                  {/* Main Title */}
                  <h1
                    className={`font-display font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white leading-tight sm:leading-tight md:leading-[1.15] mb-4 sm:mb-5 drop-shadow-md transition-all duration-700 delay-200 ${
                      isActive ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                    }`}
                  >
                    {slide.title}
                  </h1>

                  {/* Subtitle */}
                  {slide.subtitle && (
                    <p
                      className={`text-base sm:text-lg md:text-xl text-blue-100/90 leading-relaxed max-w-2xl mb-8 sm:mb-10 drop-shadow transition-all duration-700 delay-300 ${
                        isActive ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                      }`}
                    >
                      {slide.subtitle}
                    </p>
                  )}

                  {/* CTA Buttons */}
                  <div
                    className={`flex flex-wrap items-center gap-3 sm:gap-4 transition-all duration-700 delay-400 ${
                      isActive ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                    }`}
                  >
                    {slide.button_text && (
                      <Link
                        to={slide.button_link || '/shop'}
                        className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-brand-orange hover:bg-orange-600 text-white font-bold text-sm sm:text-base shadow-xl hover:shadow-orange-500/25 transition-all duration-200 hover:-translate-y-0.5"
                      >
                        <Zap size={18} className="text-yellow-300" />
                        <span>{slide.button_text}</span>
                        <ArrowRight size={16} />
                      </Link>
                    )}

                    <Link
                      to="/book-service"
                      className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3.5 sm:py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm sm:text-base border border-white/20 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5"
                    >
                      <Wrench size={18} className="text-blue-300" />
                      <span>Book Service</span>
                    </Link>

                    <a
                      href={`https://wa.me/${whatsappNum}?text=${encodeURIComponent('Hello Tuyel Electricals, I am interested in your products and services.')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3.5 sm:py-4 rounded-xl bg-green-600 hover:bg-green-500 text-white font-semibold text-sm sm:text-base shadow-lg transition-all duration-200 hover:-translate-y-0.5"
                      title="Chat on WhatsApp"
                    >
                      <MessageCircle size={18} />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows (OwlCarousel style) */}
      {totalSlides > 1 && (
        <>
          <button
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-navy-900/60 hover:bg-brand-orange text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all duration-200 hover:scale-110 shadow-xl"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={nextSlide}
            aria-label="Next Slide"
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-navy-900/60 hover:bg-brand-orange text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all duration-200 hover:scale-110 shadow-xl"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Bottom Bar: Indicators / Dots & Quick Features */}
      <div className="relative z-20 border-t border-white/10 bg-navy-950/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* OwlCarousel-style Dots with active pill indicator */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-blue-300 font-bold mr-1">
                {String(currentIndex + 1).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}
              </span>
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goToSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    idx === currentIndex
                      ? 'w-8 bg-brand-orange shadow-lg shadow-orange-500/50'
                      : 'w-2.5 bg-white/30 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>

            {/* Quick Badges in Bottom Bar */}
            <div className="flex items-center gap-4 sm:gap-6 text-xs text-blue-200/80 overflow-x-auto py-1">
              <div className="flex items-center gap-1.5 shrink-0">
                <ShieldCheck size={14} className="text-green-400" />
                <span>100% Genuine Brands</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Zap size={14} className="text-yellow-400" />
                <span>Doorstep Repair Service</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Wrench size={14} className="text-electric-400" />
                <span>Certified Electricians</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSlider;

