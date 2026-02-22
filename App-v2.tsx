import { useState, useEffect, useRef, useCallback } from "react";
import "./index.css";

/* ── Photo CDN ─────────────────────────────────────────── */
const CDN = "https://a0.muscache.com/im/pictures/miso/Hosting-736417448669019623/original/";
const img = (id: string, w = 1200) => `${CDN}${id}.jpeg?im_w=${w}`;

const PHOTOS = {
  hero: img("21de2c8a-9f9c-48c1-b566-8305a952b1dc"),
  bedroom1: img("69dc25b4-f315-41d1-a150-2a8504974878"),
  kitchen: img("8080019c-281c-43af-b893-43ee20193232"),
  living2: img("5644d5a0-6485-4007-9688-8a6d68c1387e"),
  art: img("3a68d75b-927f-4c7a-992e-ace6c127b34d"),
  dining: img("f9685988-7e27-4054-b173-114e690aab26"),
  detail: img("e990aae8-3151-4bfc-9f8f-347eadf859df"),
  exterior: img("8d447807-c078-4593-8cad-2712de6a8d90"),
  garden: img("f2a0fe1c-b2f3-445a-91e5-dfd8784f50f0"),
  patioDining: img("b9948b43-d3f1-4c21-ba60-425e766a0c29"),
  livingWide: img("34a6bfd8-d85a-47a3-aa78-8e410fd334d6"),
  steamShower: img("10abb5a6-4d20-4c9d-881e-a42e28803185"),
  bedroom2: img("d525b436-1a3c-4722-bca1-619373a234c4"),
  backyard: img("04325ef8-c51b-476a-9686-a64f9d1fff76"),
  panoramic: img("d2236a4b-bcf1-4993-91d2-85a710f8192e"),
  umbrella: img("0bc956c9-352c-4831-9e27-b16f2afe9e3d"),
  houseExterior: img("517bf334-7c36-444c-9696-382495180c3b"),
  lounge: img("5c3c8a51-f813-4edf-968a-05c1fd3163ae"),
  palms: img("e3f592c9-d172-4f2a-a252-b9b153eedd0e"),
  bedroom1Detail: img("e534271b-59ca-46a5-a7c6-5d0a0ee6e71f"),
  showerDetail: img("005b510f-7c71-4476-9ef6-7574c5c421a2"),
  desk: img("75d19ae8-912c-4f1f-bafd-28b42c4a856f"),
  gardenView: img("80446755-772d-40b7-b6bd-8f5acd7a14f0"),
  vanity: img("c9a44b20-2b73-4448-962c-40718fcf3aa9"),
  laundry: img("944586ea-ea29-4b3c-a801-9e7762a50339"),
};

/* ── Intersection Observer Hook ────────────────────────── */
function useInView(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.unobserve(el); } },
      { threshold: 0.15, ...options }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, inView };
}

/* ── Animated Section Wrapper ──────────────────────────── */
function Reveal({ children, className = "", delay = 0 }: {
  children: React.ReactNode; className?: string; delay?: number;
}) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}s, transform 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

/* ── Gallery Lightbox ──────────────────────────────────── */
function Lightbox({ photos, index, onClose, onNav }: {
  photos: { src: string; label: string }[];
  index: number;
  onClose: () => void;
  onNav: (dir: -1 | 1) => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onNav(-1);
      if (e.key === "ArrowRight") onNav(1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, onNav]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-onyx/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-ivory/80 hover:text-ivory text-2xl font-body tracking-wider z-50"
      >
        CLOSE
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onNav(-1); }}
        className="absolute left-4 md:left-8 text-ivory/60 hover:text-ivory text-5xl font-display z-50"
      >
        &#8249;
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onNav(1); }}
        className="absolute right-4 md:right-8 text-ivory/60 hover:text-ivory text-5xl font-display z-50"
      >
        &#8250;
      </button>
      <div className="max-w-5xl max-h-[85vh] px-4" onClick={(e) => e.stopPropagation()}>
        <img
          src={photos[index].src}
          alt={photos[index].label}
          className="w-full h-full object-contain"
        />
        <p className="text-ivory/70 text-center mt-4 font-body text-sm tracking-widest uppercase">
          {photos[index].label} &mdash; {index + 1} / {photos.length}
        </p>
      </div>
    </div>
  );
}

/* ── Gallery Photos ────────────────────────────────────── */
const GALLERY = [
  { src: PHOTOS.hero, label: "Sun-filled living room" },
  { src: PHOTOS.panoramic, label: "City-to-ocean panorama" },
  { src: PHOTOS.umbrella, label: "The deck" },
  { src: PHOTOS.bedroom1, label: "Primary bedroom" },
  { src: PHOTOS.kitchen, label: "Kitchen and dining" },
  { src: PHOTOS.exterior, label: "Spanish-style facade" },
  { src: PHOTOS.steamShower, label: "Steam shower" },
  { src: PHOTOS.bedroom2, label: "Guest bedroom" },
  { src: PHOTOS.backyard, label: "Tropical garden" },
  { src: PHOTOS.art, label: "Artistic details" },
  { src: PHOTOS.lounge, label: "Outdoor lounge" },
  { src: PHOTOS.living2, label: "Cozy seating nook" },
];

/* ── Amenities ─────────────────────────────────────────── */
const AMENITIES = [
  { icon: "&#9782;", label: "Sweeping Views", desc: "City lights to ocean, sunrise to sunset" },
  { icon: "&#9835;", label: "Piano & Guitar", desc: "Upright piano and acoustic guitar" },
  { icon: "&#9832;", label: "Steam Shower", desc: "Full steam shower, spa-quality" },
  { icon: "&#9788;", label: "Sun-drenched", desc: "Floor-to-ceiling natural light" },
  { icon: "&#8258;", label: "Curated Art", desc: "Original works and collected pieces" },
  { icon: "&#9733;", label: "Private Deck", desc: "Striped umbrellas, panoramic views" },
];

/* ── Neighborhoods ─────────────────────────────────────── */
const NEIGHBORHOOD = [
  { place: "Hollywood Bowl", time: "5 min walk", note: "Walk downhill to concerts" },
  { place: "Runyon Canyon", time: "8 min drive", note: "Iconic LA hiking trails" },
  { place: "Griffith Observatory", time: "12 min drive", note: "The best view in LA" },
  { place: "Hollywood Farmers Market", time: "10 min drive", note: "Every Sunday morning" },
  { place: "Sunset Blvd dining", time: "7 min drive", note: "Every cuisine imaginable" },
  { place: "Lake Hollywood", time: "6 min drive", note: "The Hollywood Sign up close" },
];

/* ══════════════════════════════════════════════════════════
   MAIN APP
   ══════════════════════════════════════════════════════════ */
export default function App() {
  const [scrollY, setScrollY] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const handler = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const navBg = scrollY > 80;

  const openLightbox = useCallback((i: number) => {
    setLightbox(i);
    document.body.style.overflow = "hidden";
  }, []);

  const closeLightbox = useCallback(() => {
    setLightbox(null);
    document.body.style.overflow = "";
  }, []);

  const navLightbox = useCallback((dir: -1 | 1) => {
    setLightbox((prev) => {
      if (prev === null) return null;
      return (prev + dir + GALLERY.length) % GALLERY.length;
    });
  }, []);

  return (
    <div className="min-h-screen bg-ivory overflow-x-hidden">

      {/* ── NAV ────────────────────────────────────────── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
          navBg
            ? "bg-ivory/95 backdrop-blur-md shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between h-16 md:h-20">
          <a href="#home" className="flex items-center gap-3">
            <span
              className={`font-impact text-2xl md:text-3xl tracking-[0.15em] transition-colors duration-500 ${
                navBg ? "text-onyx" : "text-ivory"
              }`}
            >
              THE ARTIST BUNGALOW
            </span>
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {["Gallery", "About", "Neighborhood", "Book"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className={`font-body text-xs tracking-[0.2em] uppercase transition-colors duration-300 hover:text-brass ${
                  navBg ? "text-onyx/70" : "text-ivory/80"
                }`}
              >
                {item}
              </a>
            ))}
            <a
              href="https://www.airbnb.com/rooms/736417448669019623"
              target="_blank"
              rel="noopener"
              className="font-body text-xs tracking-[0.2em] uppercase bg-brass text-ivory px-5 py-2.5 hover:bg-brass/90 transition-colors"
            >
              Reserve
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className={`md:hidden flex flex-col gap-1.5 ${navBg ? "text-onyx" : "text-ivory"}`}
          >
            <span className={`block w-6 h-px ${navBg ? "bg-onyx" : "bg-ivory"} transition-all ${mobileMenu ? "rotate-45 translate-y-[3.5px]" : ""}`} />
            <span className={`block w-6 h-px ${navBg ? "bg-onyx" : "bg-ivory"} transition-all ${mobileMenu ? "-rotate-45 -translate-y-[3.5px]" : ""}`} />
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileMenu && (
          <div className="md:hidden bg-ivory/98 backdrop-blur-md border-t border-sand/30 px-6 py-6 space-y-4">
            {["Gallery", "About", "Neighborhood", "Book"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                onClick={() => setMobileMenu(false)}
                className="block font-body text-sm tracking-[0.15em] uppercase text-onyx/70 hover:text-brass"
              >
                {item}
              </a>
            ))}
            <a
              href="https://www.airbnb.com/rooms/736417448669019623"
              target="_blank"
              rel="noopener"
              className="block font-body text-sm tracking-[0.15em] uppercase text-brass"
            >
              Reserve
            </a>
          </div>
        )}
      </nav>

      {/* ── HERO ───────────────────────────────────────── */}
      <section id="home" className="relative h-screen overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ transform: `scale(1.1) translateY(${scrollY * 0.25}px)` }}
        >
          <img
            src={PHOTOS.panoramic}
            alt="Panoramic view from the bungalow"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-onyx/40 via-onyx/20 to-onyx/60" />
        </div>

        <div className="relative z-10 h-full flex flex-col justify-end pb-16 md:pb-24 px-6 md:px-10 max-w-7xl mx-auto">
          <div className="space-y-4">
            <p
              className="font-body text-ivory/70 text-xs tracking-[0.35em] uppercase"
              style={{ animation: "fadeUp 0.8s cubic-bezier(0.22,1,0.36,1) 0.3s forwards", opacity: 0 }}
            >
              Hollywood Hills &middot; Los Angeles
            </p>
            <h1
              className="font-display text-ivory text-5xl sm:text-6xl md:text-8xl lg:text-9xl leading-[0.9] tracking-tight"
              style={{ animation: "fadeUp 0.8s cubic-bezier(0.22,1,0.36,1) 0.5s forwards", opacity: 0 }}
            >
              The Artist<br />
              <em className="text-brass">Bungalow</em>
            </h1>
            <p
              className="font-body text-ivory/60 text-sm md:text-base max-w-md mt-4 leading-relaxed"
              style={{ animation: "fadeUp 0.8s cubic-bezier(0.22,1,0.36,1) 0.7s forwards", opacity: 0 }}
            >
              Where the hills meet the music. A light-filled retreat perched above
              the Hollywood Bowl, with sweeping views from city to ocean.
            </p>
            <div
              className="flex items-center gap-6 mt-6"
              style={{ animation: "fadeUp 0.8s cubic-bezier(0.22,1,0.36,1) 0.9s forwards", opacity: 0 }}
            >
              <a
                href="https://www.airbnb.com/rooms/736417448669019623"
                target="_blank"
                rel="noopener"
                className="font-body text-xs tracking-[0.2em] uppercase bg-brass text-ivory px-7 py-3.5 hover:bg-brass/85 transition-all"
              >
                Book your stay
              </a>
              <a
                href="#gallery"
                className="font-body text-xs tracking-[0.2em] uppercase text-ivory/70 hover:text-ivory border-b border-ivory/30 hover:border-ivory pb-0.5 transition-all"
              >
                Explore
              </a>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div
          className="absolute bottom-0 left-0 right-0 z-10 bg-onyx/50 backdrop-blur-sm border-t border-ivory/10"
          style={{ animation: "fadeIn 0.6s ease 1.2s forwards", opacity: 0 }}
        >
          <div className="max-w-7xl mx-auto px-6 md:px-10 py-3 flex items-center justify-between text-ivory/70">
            <div className="flex items-center gap-6 md:gap-10 font-body text-xs tracking-[0.15em] uppercase">
              <span>2 Bedrooms</span>
              <span className="hidden sm:inline text-ivory/30">|</span>
              <span className="hidden sm:inline">2 Baths</span>
              <span className="text-ivory/30">|</span>
              <span>Entire Home</span>
            </div>
            <div className="flex items-center gap-2 font-body text-xs tracking-wider">
              <span className="text-brass">&#9733;</span>
              <span>4.97</span>
              <span className="text-ivory/40 ml-1">Superhost</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── INTRO STATEMENT ────────────────────────────── */}
      <section className="py-24 md:py-32 px-6 md:px-10">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div className="grid md:grid-cols-[1fr_2fr] gap-8 md:gap-16 items-start">
              <div>
                <p className="font-body text-xs tracking-[0.3em] uppercase text-brass mb-2">Est. 2024</p>
                <p className="font-body text-xs tracking-[0.15em] uppercase text-onyx/40">Guest Favorite</p>
              </div>
              <div>
                <p className="font-display text-3xl md:text-4xl lg:text-5xl text-onyx leading-[1.15] tracking-tight">
                  An intimate, art-filled retreat in the Hollywood Hills.
                  Steps from the Hollywood Bowl, with sweeping views from
                  downtown to the Pacific.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── DIVIDER ────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <hr className="border-none h-px bg-onyx/10" />
      </div>

      {/* ── GALLERY ────────────────────────────────────── */}
      <section id="gallery" className="py-24 md:py-32 px-6 md:px-10">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="flex items-end justify-between mb-12 md:mb-16">
              <div>
                <p className="font-body text-xs tracking-[0.3em] uppercase text-brass mb-3">The Space</p>
                <h2 className="font-display text-4xl md:text-6xl text-onyx tracking-tight">Gallery</h2>
              </div>
              <p className="hidden md:block font-body text-xs tracking-[0.15em] uppercase text-onyx/40">
                {GALLERY.length} Photos
              </p>
            </div>
          </Reveal>

          {/* Asymmetric grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
            {GALLERY.map((photo, i) => (
              <Reveal
                key={i}
                delay={i * 0.06}
                className={
                  i === 0 ? "col-span-2 md:col-span-2 row-span-2" :
                  i === 3 ? "col-span-2 md:col-span-1" : ""
                }
              >
                <button
                  onClick={() => openLightbox(i)}
                  className="group relative w-full overflow-hidden block"
                  style={{ aspectRatio: i === 0 ? "16/10" : i === 3 ? "16/9" : "1/1" }}
                >
                  <img
                    src={photo.src}
                    alt={photo.label}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-onyx/0 group-hover:bg-onyx/30 transition-colors duration-500 flex items-end p-4">
                    <span className="font-body text-xs tracking-[0.15em] uppercase text-ivory opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      {photo.label}
                    </span>
                  </div>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FULL-BLEED IMAGE BREAK ─────────────────────── */}
      <Reveal>
        <div className="relative h-[50vh] md:h-[70vh] overflow-hidden">
          <img
            src={PHOTOS.umbrella}
            alt="Striped umbrella deck"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-onyx/40 to-transparent" />
          <div className="absolute bottom-8 md:bottom-12 left-6 md:left-10 right-6">
            <p className="font-impact text-ivory text-4xl md:text-7xl tracking-[0.1em] leading-none">
              CLASSIC HOLLYWOOD<br/>MEETS CALIFORNIA COOL
            </p>
          </div>
        </div>
      </Reveal>

      {/* ── ABOUT / AMENITIES ──────────────────────────── */}
      <section id="about" className="py-24 md:py-32 px-6 md:px-10">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-start">
              {/* Left: image */}
              <div className="relative">
                <img
                  src={PHOTOS.hero}
                  alt="Sun-filled living room"
                  className="w-full aspect-[4/5] object-cover"
                />
                <div className="absolute -bottom-6 -right-6 bg-brass px-6 py-4 hidden md:block">
                  <p className="font-impact text-ivory text-2xl tracking-[0.1em]">SUPERHOST</p>
                  <p className="font-body text-ivory/80 text-xs tracking-wider">4.97 Stars</p>
                </div>
              </div>

              {/* Right: text + amenities */}
              <div className="space-y-10">
                <div>
                  <p className="font-body text-xs tracking-[0.3em] uppercase text-brass mb-3">About the Space</p>
                  <h2 className="font-display text-4xl md:text-5xl text-onyx tracking-tight mb-6">
                    Creative energy meets California calm
                  </h2>
                  <div className="space-y-4 font-body text-onyx/70 text-base leading-relaxed">
                    <p>
                      Perched on a quiet cul-de-sac in the Hollywood Hills, The Artist Bungalow
                      is a sun-drenched 2-bedroom retreat filled with original art, a piano, guitar,
                      and books. The kind of place where you slow down and feel something.
                    </p>
                    <p>
                      Step onto the deck for sweeping views stretching from downtown LA to the Pacific.
                      Walk five minutes downhill to the Hollywood Bowl. Come home to natural light
                      pouring through every room and the quiet hum of the hills.
                    </p>
                  </div>
                </div>

                <hr className="border-none h-px bg-onyx/10" />

                {/* Amenities grid */}
                <div>
                  <p className="font-body text-xs tracking-[0.3em] uppercase text-brass mb-6">Highlights</p>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                    {AMENITIES.map((a, i) => (
                      <div key={i} className="space-y-1">
                        <p className="font-body text-sm font-medium text-onyx">{a.label}</p>
                        <p className="font-body text-xs text-onyx/50">{a.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── COLOR PALETTE STRIP ────────────────────────── */}
      <Reveal>
        <div className="py-16 md:py-20 px-6 md:px-10 bg-cream">
          <div className="max-w-7xl mx-auto">
            <p className="font-body text-xs tracking-[0.3em] uppercase text-onyx/40 mb-8 text-center">
              Our Palette
            </p>
            <div className="flex gap-2 md:gap-3 justify-center">
              {[
                { color: "#1A1A1A", name: "Onyx" },
                { color: "#C49A3C", name: "Brass" },
                { color: "#C2614B", name: "Terracotta" },
                { color: "#5A6B4A", name: "Olive" },
                { color: "#3B6B8A", name: "Ocean" },
                { color: "#D4C5A9", name: "Sand" },
                { color: "#E8CFC0", name: "Blush" },
                { color: "#FAF6F0", name: "Ivory" },
              ].map((c) => (
                <div key={c.name} className="text-center">
                  <div
                    className="w-12 h-12 md:w-16 md:h-16"
                    style={{ backgroundColor: c.color, border: c.name === "Ivory" ? "1px solid #D4C5A9" : "none" }}
                  />
                  <p className="font-body text-[10px] tracking-[0.15em] uppercase text-onyx/50 mt-2">{c.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      {/* ── NEIGHBORHOOD ───────────────────────────────── */}
      <section id="neighborhood" className="py-24 md:py-32 px-6 md:px-10">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-start">
              {/* Left: text */}
              <div>
                <p className="font-body text-xs tracking-[0.3em] uppercase text-brass mb-3">The Neighborhood</p>
                <h2 className="font-display text-4xl md:text-5xl text-onyx tracking-tight mb-6">
                  Above the city, in the heart of it all
                </h2>
                <p className="font-body text-onyx/70 text-base leading-relaxed mb-10">
                  Tucked into the hills above the Hollywood Bowl, you're minutes from LA's
                  best hikes, restaurants, and cultural landmarks. But up here, it's just
                  birdsong, views, and the occasional coyote.
                </p>

                <div className="space-y-0">
                  {NEIGHBORHOOD.map((n, i) => (
                    <div
                      key={i}
                      className="flex items-start justify-between py-4 border-b border-onyx/8 last:border-none"
                    >
                      <div>
                        <p className="font-body text-sm font-medium text-onyx">{n.place}</p>
                        <p className="font-body text-xs text-onyx/40 mt-0.5">{n.note}</p>
                      </div>
                      <p className="font-body text-xs tracking-[0.1em] uppercase text-brass whitespace-nowrap ml-4">
                        {n.time}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: stacked images */}
              <div className="space-y-3">
                <img
                  src={PHOTOS.exterior}
                  alt="Spanish-style exterior"
                  className="w-full aspect-[4/3] object-cover"
                />
                <div className="grid grid-cols-2 gap-3">
                  <img
                    src={PHOTOS.garden}
                    alt="Lush garden"
                    className="w-full aspect-square object-cover"
                  />
                  <img
                    src={PHOTOS.palms}
                    alt="Palm trees"
                    className="w-full aspect-square object-cover"
                  />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── HOSTS ──────────────────────────────────────── */}
      <Reveal>
        <div className="bg-onyx py-24 md:py-32 px-6 md:px-10">
          <div className="max-w-4xl mx-auto text-center">
            <p className="font-body text-xs tracking-[0.3em] uppercase text-brass mb-6">Your Hosts</p>
            <h2 className="font-display text-4xl md:text-5xl text-ivory tracking-tight mb-6">
              Patrick &amp; Jimena
            </h2>
            <p className="font-body text-ivory/60 text-base leading-relaxed max-w-2xl mx-auto">
              We fell in love with this home for the same reasons our guests do: the light, the views,
              and the feeling that you're somewhere special. We've filled it with art, music,
              and everything you need to feel at home in the hills.
            </p>
            <div className="flex items-center justify-center gap-6 mt-8">
              <div className="text-center">
                <p className="font-impact text-3xl text-brass tracking-wider">4.97</p>
                <p className="font-body text-xs text-ivory/40 tracking-wider uppercase mt-1">Rating</p>
              </div>
              <div className="w-px h-10 bg-ivory/15" />
              <div className="text-center">
                <p className="font-impact text-3xl text-brass tracking-wider">50+</p>
                <p className="font-body text-xs text-ivory/40 tracking-wider uppercase mt-1">Reviews</p>
              </div>
              <div className="w-px h-10 bg-ivory/15" />
              <div className="text-center">
                <p className="font-impact text-3xl text-brass tracking-wider">&#9733;</p>
                <p className="font-body text-xs text-ivory/40 tracking-wider uppercase mt-1">Superhost</p>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* ── TYPOGRAPHY SHOWCASE ─────────────────────────── */}
      <Reveal>
        <div className="py-16 md:py-20 px-6 md:px-10 bg-cream">
          <div className="max-w-7xl mx-auto">
            <p className="font-body text-xs tracking-[0.3em] uppercase text-onyx/40 mb-8 text-center">
              Typography System
            </p>
            <div className="grid md:grid-cols-3 gap-10 md:gap-16">
              <div>
                <p className="font-body text-[10px] tracking-[0.2em] uppercase text-brass mb-3">Display / Headlines</p>
                <p className="font-display text-4xl text-onyx tracking-tight">Instrument Serif</p>
                <p className="font-display text-xl text-onyx/50 mt-1 italic">Warm, editorial, artistic</p>
              </div>
              <div>
                <p className="font-body text-[10px] tracking-[0.2em] uppercase text-brass mb-3">Body / UI</p>
                <p className="font-body text-2xl text-onyx font-medium">Space Grotesk</p>
                <p className="font-body text-sm text-onyx/50 mt-1">Clean geometric sans, modernist roots</p>
              </div>
              <div>
                <p className="font-body text-[10px] tracking-[0.2em] uppercase text-brass mb-3">Impact / Accents</p>
                <p className="font-impact text-4xl text-onyx tracking-[0.1em]">BEBAS NEUE</p>
                <p className="font-body text-sm text-onyx/50 mt-1">Bold, cinematic, mid-century posters</p>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* ── BOOK CTA ───────────────────────────────────── */}
      <section id="book" className="relative py-32 md:py-44 px-6 md:px-10 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={PHOTOS.lounge}
            alt="Outdoor deck lounge"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-onyx/50" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <Reveal>
            <p className="font-body text-xs tracking-[0.3em] uppercase text-brass mb-4">Ready?</p>
            <h2 className="font-display text-5xl md:text-7xl text-ivory tracking-tight mb-6">
              Your <em className="text-brass">Hollywood Hills</em> escape awaits
            </h2>
            <p className="font-body text-ivory/60 text-base leading-relaxed max-w-xl mx-auto mb-8">
              2 bedrooms, 2 baths, sweeping views, and a five-minute walk to the Bowl.
              Check availability and reserve your dates.
            </p>
            <a
              href="https://www.airbnb.com/rooms/736417448669019623"
              target="_blank"
              rel="noopener"
              className="inline-block font-body text-sm tracking-[0.2em] uppercase bg-brass text-ivory px-10 py-4 hover:bg-brass/85 transition-all"
            >
              Check Availability
            </a>
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────── */}
      <footer className="bg-onyx px-6 md:px-10 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 items-start">
            <div>
              <p className="font-impact text-xl tracking-[0.15em] text-ivory">THE ARTIST BUNGALOW</p>
              <p className="font-body text-xs text-ivory/30 mt-2">Hollywood Hills, Los Angeles</p>
            </div>
            <div className="flex gap-8">
              {["Gallery", "About", "Neighborhood", "Book"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="font-body text-xs tracking-[0.15em] uppercase text-ivory/40 hover:text-brass transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>
            <div className="md:text-right">
              <a
                href="https://www.airbnb.com/rooms/736417448669019623"
                target="_blank"
                rel="noopener"
                className="font-body text-xs tracking-[0.15em] uppercase text-brass hover:text-brass/80 transition-colors"
              >
                View on Airbnb &rarr;
              </a>
              <p className="font-body text-xs text-ivory/20 mt-3">
                Hosted by Patrick &amp; Jimena
              </p>
            </div>
          </div>
          <hr className="border-none h-px bg-ivory/8 my-8" />
          <p className="font-body text-[10px] text-ivory/20 tracking-wider">
            &copy; 2026 The Artist Bungalow. All rights reserved.
          </p>
        </div>
      </footer>

      {/* ── LIGHTBOX ───────────────────────────────────── */}
      {lightbox !== null && (
        <Lightbox
          photos={GALLERY}
          index={lightbox}
          onClose={closeLightbox}
          onNav={navLightbox}
        />
      )}
    </div>
  );
}
