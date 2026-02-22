import { useState, useEffect, useRef, useCallback } from "react";

// ── Photo data ──────────────────────────────────────────────
const P = "https://a0.muscache.com/im/pictures/miso/Hosting-736417448669019623/original/";
const ph = (id: string) => `${P}${id}.jpeg?im_w=1200`;

const PHOTOS = {
  hero: ph("21de2c8a-9f9c-48c1-b566-8305a952b1dc"),
  bedroom1: ph("69dc25b4-f315-41d1-a150-2a8504974878"),
  kitchen: ph("8080019c-281c-43af-b893-43ee20193232"),
  living2: ph("5644d5a0-6485-4007-9688-8a6d68c1387e"),
  art: ph("3a68d75b-927f-4c7a-992e-ace6c127b34d"),
  dining: ph("f9685988-7e27-4054-b173-114e690aab26"),
  detail: ph("e990aae8-3151-4bfc-9f8f-347eadf859df"),
  exterior: ph("8d447807-c078-4593-8cad-2712de6a8d90"),
  garden: ph("f2a0fe1c-b2f3-445a-91e5-dfd8784f50f0"),
  patioDining: ph("b9948b43-d3f1-4c21-ba60-425e766a0c29"),
  livingWide: ph("34a6bfd8-d85a-47a3-aa78-8e410fd334d6"),
  steamShower: ph("10abb5a6-4d20-4c9d-881e-a42e28803185"),
  bedroom2blue: ph("d525b436-1a3c-4722-bca1-619373a234c4"),
  backyard: ph("04325ef8-c51b-476a-9686-a64f9d1fff76"),
  viewPanoramic: ph("d2236a4b-bcf1-4993-91d2-85a710f8192e"),
  deckUmbrella: ph("0bc956c9-352c-4831-9e27-b16f2afe9e3d"),
  deckLounge: ph("5c3c8a51-f813-4edf-968a-05c1fd3163ae"),
  deckPalms: ph("e3f592c9-d172-4f2a-a252-b9b153eedd0e"),
};

const GALLERY_PHOTOS = [
  { src: PHOTOS.hero, label: "Sun-filled living room" },
  { src: PHOTOS.bedroom1, label: "Primary bedroom" },
  { src: PHOTOS.kitchen, label: "Kitchen & dining" },
  { src: PHOTOS.viewPanoramic, label: "City-to-ocean views" },
  { src: PHOTOS.deckUmbrella, label: "The deck" },
  { src: PHOTOS.exterior, label: "Spanish-style exterior" },
  { src: PHOTOS.steamShower, label: "Steam shower" },
  { src: PHOTOS.bedroom2blue, label: "Guest bedroom" },
  { src: PHOTOS.backyard, label: "Tropical garden" },
  { src: PHOTOS.living2, label: "Cozy seating" },
  { src: PHOTOS.deckLounge, label: "Outdoor lounge" },
  { src: PHOTOS.art, label: "Artistic details" },
];

// ── GSAP Hook ───────────────────────────────────────────────
declare global {
  interface Window {
    gsap: any;
    ScrollTrigger: any;
  }
}

function useGsap(callback: (gsap: any, ScrollTrigger: any) => void, deps: any[] = []) {
  useEffect(() => {
    const check = () => {
      if (window.gsap && window.ScrollTrigger) {
        window.gsap.registerPlugin(window.ScrollTrigger);
        callback(window.gsap, window.ScrollTrigger);
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  }, deps);
}

// ── Parallax Hero Image Hook ────────────────────────────────
function useParallax(ref: React.RefObject<HTMLDivElement | null>, speed = 0.4) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = () => {
      const y = window.scrollY;
      el.style.transform = `translate3d(0, ${y * speed}px, 0) scale(1.15)`;
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [ref, speed]);
}

// ── Nav ─────────────────────────────────────────────────────
type Section = "home" | "gallery" | "welcome" | "neighborhood" | "book";

function Nav({ active, setActive }: { active: Section; setActive: (s: Section) => void }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const items: { id: Section; label: string }[] = [
    { id: "home", label: "Home" },
    { id: "gallery", label: "Gallery" },
    { id: "welcome", label: "Welcome Book" },
    { id: "neighborhood", label: "Neighborhood" },
    { id: "book", label: "Book Now" },
  ];

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? "rgba(250, 248, 245, 0.97)" : "transparent",
      backdropFilter: scrolled ? "blur(16px)" : "none",
      WebkitBackdropFilter: scrolled ? "blur(16px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(44, 44, 44, 0.08)" : "none",
      transition: "all 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto", padding: "0 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 72,
      }}>
        <div style={{
          fontFamily: "'Playfair Display', Georgia, serif", fontSize: 20,
          color: scrolled ? "#2C2C2C" : "#FAF8F5", letterSpacing: "-0.02em",
          transition: "color 0.4s",
        }}>
          The Artist Bungalow
        </div>
        <div style={{ display: "flex", gap: 32 }}>
          {items.map(item => (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif", fontSize: 13,
                color: active === item.id ? "#C4704B" : (scrolled ? "#2C2C2C" : "rgba(255,255,255,0.85)"),
                fontWeight: active === item.id ? 500 : 400,
                letterSpacing: "0.05em", textTransform: "uppercase",
                padding: "4px 0",
                borderBottom: active === item.id ? "1.5px solid #C4704B" : "1.5px solid transparent",
                transition: "all 0.3s",
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

// ── Hero ────────────────────────────────────────────────────
function Hero({ onBook }: { onBook: () => void }) {
  const bgRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  useParallax(bgRef, 0.35);

  useGsap((gsap) => {
    const el = contentRef.current;
    if (!el) return;
    const tl = gsap.timeline({ delay: 0.3 });
    tl.from(el.querySelector(".hero-eyebrow"), { y: 30, opacity: 0, duration: 0.8, ease: "power3.out" })
      .from(el.querySelector(".hero-title"), { y: 60, opacity: 0, duration: 1, ease: "power3.out" }, "-=0.5")
      .from(el.querySelector(".hero-desc"), { y: 40, opacity: 0, duration: 0.8, ease: "power3.out" }, "-=0.6")
      .from(el.querySelector(".hero-cta"), { y: 30, opacity: 0, duration: 0.7, ease: "power3.out" }, "-=0.5")
      .from(el.querySelectorAll(".hero-stat"), { y: 20, opacity: 0, duration: 0.5, stagger: 0.12, ease: "power3.out" }, "-=0.4");
  });

  return (
    <section id="home" style={{ position: "relative", height: "100vh", overflow: "hidden" }}>
      <div ref={bgRef} style={{
        position: "absolute", inset: "-15% 0",
        backgroundImage: `url(${PHOTOS.viewPanoramic})`,
        backgroundSize: "cover", backgroundPosition: "center 35%",
        willChange: "transform",
      }} />
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(170deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.5) 100%)",
      }} />
      <div ref={contentRef} style={{
        position: "relative", zIndex: 2, height: "100%",
        display: "flex", flexDirection: "column", justifyContent: "flex-end",
        maxWidth: 1200, margin: "0 auto", padding: "0 24px 90px",
      }}>
        <p className="hero-eyebrow" style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: 13, letterSpacing: "0.2em",
          color: "rgba(255,255,255,0.7)", textTransform: "uppercase", marginBottom: 20,
        }}>
          Hollywood Hills, Los Angeles
        </p>
        <h1 className="hero-title" style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "clamp(44px, 6.5vw, 80px)", color: "#FAF8F5",
          lineHeight: 1.02, marginBottom: 24, maxWidth: 700,
          letterSpacing: "-0.03em", fontWeight: 400,
        }}>
          The Artist<br />Bungalow
        </h1>
        <p className="hero-desc" style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: 18, color: "rgba(255,255,255,0.85)",
          maxWidth: 480, lineHeight: 1.7, marginBottom: 36, fontWeight: 300,
        }}>
          Where the hills meet the music. A light-filled retreat with sweeping city-to-ocean views, steps from the Hollywood Bowl.
        </p>
        <div className="hero-cta" style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
          <button onClick={onBook} className="cta-btn" style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 14,
            background: "#C4704B", color: "#FAF8F5", border: "none",
            padding: "16px 40px", cursor: "pointer", letterSpacing: "0.06em",
            textTransform: "uppercase", fontWeight: 500,
            transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
          }}>
            Book Your Stay
          </button>
          <div style={{ display: "flex", gap: 28, alignItems: "center", marginLeft: 20 }}>
            {[
              { n: "4.97", l: "Rating" },
              { n: "2", l: "Bedrooms" },
              { n: "2", l: "Bathrooms" },
            ].map(s => (
              <div key={s.l} className="hero-stat" style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 24, color: "#FAF8F5", fontWeight: 400 }}>{s.n}</div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "rgba(255,255,255,0.55)", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Scroll indicator */}
      <div className="scroll-indicator" style={{
        position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)",
        zIndex: 3, display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
      }}>
        <div style={{ width: 1, height: 40, background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.5))" }} />
      </div>
    </section>
  );
}

// ── Horizontal Divider with text ────────────────────────────
function Divider({ text }: { text: string }) {
  return (
    <div className="reveal-up" style={{
      display: "flex", alignItems: "center", gap: 24,
      maxWidth: 1200, margin: "0 auto", padding: "0 24px",
    }}>
      <div style={{ flex: 1, height: 1, background: "rgba(196, 112, 75, 0.2)" }} />
      <span style={{
        fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: "0.2em",
        color: "#C4704B", textTransform: "uppercase", fontWeight: 500,
      }}>{text}</span>
      <div style={{ flex: 1, height: 1, background: "rgba(196, 112, 75, 0.2)" }} />
    </div>
  );
}

// ── About ───────────────────────────────────────────────────
function About() {
  const imgRef = useRef<HTMLDivElement>(null);
  useParallax(imgRef, 0.08);

  return (
    <section style={{ background: "#FAF8F5", padding: "120px 24px 140px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
        <div>
          <p className="reveal-up" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: "0.2em", color: "#C4704B", textTransform: "uppercase", marginBottom: 20, fontWeight: 500 }}>
            Your Hosts
          </p>
          <h2 className="reveal-up" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 42, color: "#2C2C2C", lineHeight: 1.15, marginBottom: 28, letterSpacing: "-0.02em", fontWeight: 400 }}>
            Welcome from<br />Patrick & Jimena
          </h2>
          <div className="reveal-up">
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: "#666", lineHeight: 1.85, marginBottom: 20, fontWeight: 300 }}>
              We fell in love with this place the moment we walked through the door. The way the afternoon light pours through the windows, the view that stretches from downtown all the way to the Pacific, the quiet of the cul-de-sac above it all.
            </p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: "#666", lineHeight: 1.85, marginBottom: 20, fontWeight: 300 }}>
              We've filled the bungalow with things we love: a piano, guitars, books, art, and a painter's easel by the window. There's a steam shower that will change how you start your mornings, and a deck where every sunset feels like a private show.
            </p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: "#666", lineHeight: 1.85, fontWeight: 300 }}>
              Whether you're here for a show at the Bowl (it's a five-minute stroll down the hill), exploring Runyon Canyon, or just need a beautiful place to slow down, we hope this feels like home.
            </p>
          </div>
          <div className="reveal-up" style={{ display: "flex", gap: 32, marginTop: 36, paddingTop: 24, borderTop: "1px solid rgba(44,44,44,0.08)" }}>
            {[{ icon: "★", text: "Superhost" }, { icon: "♥", text: "Guest Favorite" }].map(b => (
              <div key={b.text} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 16, color: "#C4704B" }}>{b.icon}</span>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#2C2C2C", letterSpacing: "0.03em" }}>{b.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="reveal-scale" style={{ position: "relative" }}>
          <div ref={imgRef} style={{ overflow: "hidden" }}>
            <img src={PHOTOS.hero} alt="Light-filled living room" style={{ width: "100%", height: 540, objectFit: "cover", transition: "transform 0.6s ease" }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.03)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
            />
          </div>
          <div className="reveal-left" style={{
            position: "absolute", bottom: -32, left: -32, width: 180, height: 240,
            overflow: "hidden", border: "5px solid #FAF8F5",
            boxShadow: "0 16px 48px rgba(0,0,0,0.15)",
          }}>
            <img src={PHOTOS.art} alt="Artistic details" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Gallery ─────────────────────────────────────────────────
function Gallery() {
  const [selected, setSelected] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section style={{ background: "#1a1a1a", padding: "100px 24px" }} id="gallery">
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <p className="reveal-up" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: "0.2em", color: "#C4704B", textTransform: "uppercase", marginBottom: 20, textAlign: "center", fontWeight: 500 }}>
          The Space
        </p>
        <h2 className="reveal-up" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 42, color: "#FAF8F5", textAlign: "center", marginBottom: 56, letterSpacing: "-0.02em", fontWeight: 400 }}>
          Take a Look Around
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
          {GALLERY_PHOTOS.map((photo, i) => (
            <div
              key={i}
              className="gallery-item"
              onClick={() => setSelected(i)}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                cursor: "pointer", overflow: "hidden", position: "relative",
                gridColumn: i === 0 || i === 3 ? "span 2" : "span 1",
                gridRow: i === 0 ? "span 2" : "span 1",
                aspectRatio: i === 0 ? "auto" : i === 3 ? "2/1" : "1/1",
              }}
            >
              <img src={photo.src} alt={photo.label} style={{
                width: "100%", height: "100%", objectFit: "cover",
                transition: "transform 0.7s cubic-bezier(0.22, 1, 0.36, 1), filter 0.5s ease",
                transform: hovered === i ? "scale(1.08)" : "scale(1)",
                filter: hovered !== null && hovered !== i ? "brightness(0.6)" : "brightness(1)",
              }} />
              <div style={{
                position: "absolute", inset: 0,
                background: hovered === i ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0)",
                transition: "background 0.4s",
              }} />
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                padding: "40px 20px 16px",
                background: "linear-gradient(transparent, rgba(0,0,0,0.55))",
                transform: hovered === i ? "translateY(0)" : "translateY(8px)",
                opacity: hovered === i ? 1 : 0.7,
                transition: "all 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
              }}>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#fff", letterSpacing: "0.03em", fontWeight: 300 }}>
                  {photo.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Lightbox */}
      {selected !== null && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(0,0,0,0.95)", display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", animation: "fadeIn 0.3s ease",
          }}
        >
          <img src={GALLERY_PHOTOS[selected].src} alt="" style={{
            maxWidth: "88vw", maxHeight: "82vh", objectFit: "contain",
            animation: "scaleIn 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
          }} />
          <button onClick={(e) => { e.stopPropagation(); setSelected(null); }} style={{
            position: "absolute", top: 28, right: 28,
            background: "none", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "50%",
            color: "#fff", width: 44, height: 44, fontSize: 18, cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center",
            transition: "border-color 0.3s",
          }}>✕</button>
          <div style={{ position: "absolute", bottom: 36, display: "flex", gap: 12, alignItems: "center" }}>
            <button onClick={(e) => { e.stopPropagation(); setSelected(Math.max(0, selected - 1)); }} style={{
              background: "none", border: "1px solid rgba(255,255,255,0.2)", color: "#fff",
              padding: "10px 20px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              fontSize: 13, letterSpacing: "0.05em", transition: "all 0.3s",
            }}>← Prev</button>
            <p style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.6)", fontSize: 13, margin: "0 20px", letterSpacing: "0.03em" }}>
              {GALLERY_PHOTOS[selected].label} &nbsp;·&nbsp; {selected + 1} / {GALLERY_PHOTOS.length}
            </p>
            <button onClick={(e) => { e.stopPropagation(); setSelected(Math.min(GALLERY_PHOTOS.length - 1, selected + 1)); }} style={{
              background: "none", border: "1px solid rgba(255,255,255,0.2)", color: "#fff",
              padding: "10px 20px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              fontSize: 13, letterSpacing: "0.05em", transition: "all 0.3s",
            }}>Next →</button>
          </div>
        </div>
      )}
    </section>
  );
}

// ── Welcome Book ────────────────────────────────────────────
function WelcomeBook() {
  const [openSection, setOpenSection] = useState<number | null>(0);
  const sections = [
    { title: "Getting Here", icon: "📍", content: [
      "The address is 6910 Paseo Del Serra, Hollywood Hills, Los Angeles, CA 90068. GPS will get you close, but the last stretch up the hill can be tricky if you've never driven in the hills before. Take it slow, the streets are narrow and winding.",
      "From LAX, the drive is about 45 minutes without traffic (plan for more during rush hour). From Burbank Airport, it's about 20 minutes.",
      "The driveway fits 1 to 2 cars and is ideal for one. There are also three parking spaces in the cul-de-sac, first come first served. If you're here for a Hollywood Bowl show, we strongly recommend walking (5 minutes downhill) rather than dealing with event parking."
    ]},
    { title: "Check-In & Check-Out", icon: "🔑", content: [
      "Check-in is at 4:00 PM and check-out is at 11:00 AM. We use a smart lock, so you'll receive a code before arrival. No need to coordinate timing with us.",
      "When you leave, we just ask that you start the dishwasher if you've used dishes, take out any trash, and leave the keys on the kitchen counter."
    ]},
    { title: "The Kitchen", icon: "☕", content: [
      "Coffee lovers, we've got you covered. The kitchen has a Cuisinart drip coffee maker, a Nespresso Vertuo machine, and a pourover filter, so you can brew however you like. We keep a starter supply of Nespresso pods and ground coffee.",
      "The kitchen is fully stocked with everything you'd need to cook a proper meal: pots, pans, good knives, a blender, cutting boards, spices, olive oil, salt, and pepper. The fridge is full-size."
    ]},
    { title: "The Steam Shower", icon: "🚿", content: [
      "The primary bathroom has a full steam shower. Turn the steam dial to your preferred temperature and give it about 3 minutes to fill the room. It's a great way to wind down after a hike or a long travel day. Towels and robes are provided."
    ]},
    { title: "Entertainment", icon: "🎹", content: [
      "There's a piano in the living room and a guitar, both available for you to play. We have a curated library of books and a painter's easel by the window if you're feeling inspired by the light.",
      "WiFi network and password are on the card by the front door. The TV has streaming apps, and there's a Bluetooth speaker on the bookshelf."
    ]},
    { title: "The Hollywood Bowl", icon: "🎶", content: [
      "We're a five-minute walk downhill from the Hollywood Bowl. It's one of the best parts about staying here. The walk back up after a show is uphill but it's lovely at night with the city lights below.",
      "For Bowl shows, the gates usually open 1.5 to 2 hours before showtime. You can bring your own food and wine (glass bottles are fine). We recommend getting there early to enjoy a picnic on the grounds.",
      "Pro tip: walk down, don't drive. Bowl parking is expensive and the traffic leaving can take over an hour. Walking, you'll be home in 5 minutes while everyone else sits in their cars."
    ]},
    { title: "House Rules", icon: "🏠", content: [
      "No smoking inside (the deck is fine). Please keep noise reasonable after 10 PM since we're in a residential neighborhood. No parties or events. Pets are welcome with prior approval.",
      "The plants on the patio are on an automatic watering system, so no need to worry about those."
    ]},
  ];

  return (
    <section style={{ background: "#FAF8F5", padding: "120px 24px" }} id="welcome">
      <div style={{ maxWidth: 780, margin: "0 auto" }}>
        <p className="reveal-up" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: "0.2em", color: "#C4704B", textTransform: "uppercase", marginBottom: 20, textAlign: "center", fontWeight: 500 }}>
          For Our Guests
        </p>
        <h2 className="reveal-up" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 42, color: "#2C2C2C", textAlign: "center", marginBottom: 12, letterSpacing: "-0.02em", fontWeight: 400 }}>
          Welcome Book
        </h2>
        <p className="reveal-up" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: "#999", textAlign: "center", marginBottom: 64, lineHeight: 1.6, fontWeight: 300 }}>
          Everything you need to know to make yourself at home.
        </p>
        {sections.map((section, i) => (
          <div key={i} className="reveal-up" style={{ marginBottom: 1 }}>
            <button
              onClick={() => setOpenSection(openSection === i ? null : i)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 16,
                padding: "22px 24px",
                background: openSection === i ? "#fff" : "transparent",
                border: "none", borderBottom: "1px solid rgba(44,44,44,0.06)",
                cursor: "pointer", textAlign: "left",
                transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              <span style={{ fontSize: 18, width: 36, textAlign: "center", opacity: 0.8 }}>{section.icon}</span>
              <h3 style={{
                fontFamily: "'Playfair Display', Georgia, serif", fontSize: 19, color: "#2C2C2C",
                letterSpacing: "-0.01em", flex: 1, margin: 0, fontWeight: 400,
              }}>
                {section.title}
              </h3>
              <span style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 18, color: "#C4704B",
                transform: openSection === i ? "rotate(45deg)" : "none",
                transition: "transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
                display: "inline-block",
              }}>
                +
              </span>
            </button>
            <div style={{
              maxHeight: openSection === i ? 600 : 0,
              overflow: "hidden",
              transition: "max-height 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
              background: "#fff",
            }}>
              <div style={{ padding: "16px 24px 28px 76px" }}>
                {section.content.map((p, j) => (
                  <p key={j} style={{
                    fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: "#666",
                    lineHeight: 1.85, marginBottom: 14, fontWeight: 300,
                  }}>{p}</p>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Neighborhood ────────────────────────────────────────────
function Neighborhood() {
  const spots = [
    { name: "Hollywood Bowl", distance: "5 min walk", desc: "Legendary outdoor amphitheater. Walk downhill for concerts under the stars." },
    { name: "Runyon Canyon", distance: "8 min drive", desc: "The iconic LA hike. Stunning views of the city from the top." },
    { name: "Hollywood Farmers Market", distance: "10 min drive", desc: "Sunday mornings on Ivar Ave. Fresh produce, pastries, and people-watching." },
    { name: "Griffith Observatory", distance: "12 min drive", desc: "Free admission, planetarium shows, and the best views of the Hollywood sign." },
    { name: "Lake Hollywood", distance: "5 min drive", desc: "A quiet loop trail around the reservoir with Hollywood sign views." },
    { name: "Sunset Blvd Dining", distance: "8 min drive", desc: "Dozens of great restaurants. We love Kismet, Sqirl, and Osteria Mozza." },
  ];

  return (
    <section style={{ padding: "120px 24px", background: "#FAF8F5" }} id="neighborhood">
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <p className="reveal-up" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: "0.2em", color: "#C4704B", textTransform: "uppercase", marginBottom: 20, textAlign: "center", fontWeight: 500 }}>
          Explore
        </p>
        <h2 className="reveal-up" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 42, color: "#2C2C2C", textAlign: "center", marginBottom: 12, letterSpacing: "-0.02em", fontWeight: 400 }}>
          The Neighborhood
        </h2>
        <p className="reveal-up" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: "#999", textAlign: "center", marginBottom: 64, lineHeight: 1.6, fontWeight: 300 }}>
          Our favorite spots, all within minutes of the bungalow.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {spots.map((spot, i) => (
            <div key={i} className="neighborhood-card" style={{
              padding: "36px 32px", background: "#fff",
              border: "1px solid rgba(44,44,44,0.04)",
              transition: "all 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
              cursor: "default",
            }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 16px 48px rgba(0,0,0,0.08)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#C4704B", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10, fontWeight: 500 }}>
                {spot.distance}
              </div>
              <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 21, color: "#2C2C2C", marginBottom: 14, fontWeight: 400 }}>
                {spot.name}
              </h3>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#888", lineHeight: 1.75, fontWeight: 300 }}>
                {spot.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Book Now ────────────────────────────────────────────────
function BookNow() {
  const bgRef = useRef<HTMLDivElement>(null);

  return (
    <section style={{ position: "relative", padding: "140px 24px", overflow: "hidden" }} id="book">
      <div ref={bgRef} style={{
        position: "absolute", inset: "-10% 0",
        backgroundImage: `url(${PHOTOS.deckUmbrella})`,
        backgroundSize: "cover", backgroundPosition: "center",
      }} />
      <div style={{ position: "absolute", inset: 0, background: "rgba(28, 28, 28, 0.72)", backdropFilter: "blur(2px)" }} />
      <div className="reveal-up" style={{ position: "relative", zIndex: 2, maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 48, color: "#FAF8F5", marginBottom: 20, letterSpacing: "-0.03em", lineHeight: 1.1, fontWeight: 400 }}>
          Ready to<br />Come Stay?
        </h2>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: "rgba(255,255,255,0.75)", lineHeight: 1.75, marginBottom: 44, fontWeight: 300 }}>
          2 bedrooms, 2 bathrooms, sweeping views, and a five-minute walk to the Hollywood Bowl. We'd love to host you.
        </p>
        <a href="https://www.airbnb.com/rooms/736417448669019623" target="_blank" rel="noopener noreferrer"
          className="cta-btn"
          style={{
            display: "inline-block", fontFamily: "'DM Sans', sans-serif", fontSize: 14,
            background: "#C4704B", color: "#FAF8F5", border: "none",
            padding: "17px 52px", cursor: "pointer", letterSpacing: "0.06em",
            textDecoration: "none", textTransform: "uppercase", fontWeight: 500,
            transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
          }}>
          Book on Airbnb
        </a>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 24, letterSpacing: "0.08em" }}>
          Superhost · Guest Favorite · 4.97 ★
        </p>
      </div>
    </section>
  );
}

// ── Footer ──────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ background: "#1a1a1a", padding: "56px 24px 48px", textAlign: "center" }}>
      <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 20, color: "#FAF8F5", marginBottom: 10, fontWeight: 400, letterSpacing: "-0.01em" }}>
        The Artist Bungalow
      </div>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.3)", letterSpacing: "0.05em" }}>
        Hollywood Hills, Los Angeles · Hosted by Patrick & Jimena
      </p>
      <div style={{ width: 40, height: 1, background: "rgba(196,112,75,0.3)", margin: "24px auto 0" }} />
    </footer>
  );
}

// ── Main App ────────────────────────────────────────────────
export default function App() {
  const [active, setActive] = useState<Section>("home");

  const handleNav = useCallback((section: Section) => {
    setActive(section);
    document.getElementById(section)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // GSAP scroll-triggered reveals
  useGsap((gsap, ScrollTrigger) => {
    // Reveal-up animations
    gsap.utils.toArray(".reveal-up").forEach((el: any) => {
      gsap.from(el, {
        y: 40, opacity: 0, duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" },
      });
    });

    // Reveal-scale animations
    gsap.utils.toArray(".reveal-scale").forEach((el: any) => {
      gsap.from(el, {
        scale: 0.92, opacity: 0, duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none" },
      });
    });

    // Reveal-left animations
    gsap.utils.toArray(".reveal-left").forEach((el: any) => {
      gsap.from(el, {
        x: -60, opacity: 0, duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 90%", toggleActions: "play none none none" },
      });
    });

    // Gallery items staggered
    gsap.utils.toArray(".gallery-item").forEach((el: any, i: number) => {
      gsap.from(el, {
        y: 50, opacity: 0, duration: 0.7,
        delay: i * 0.06,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 92%", toggleActions: "play none none none" },
      });
    });

    // Neighborhood cards staggered
    gsap.utils.toArray(".neighborhood-card").forEach((el: any, i: number) => {
      gsap.from(el, {
        y: 40, opacity: 0, duration: 0.7,
        delay: i * 0.08,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 90%", toggleActions: "play none none none" },
      });
    });
  });

  return (
    <div style={{ background: "#FAF8F5", margin: 0, padding: 0 }}>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin: 0; padding: 0; background: #FAF8F5; overflow-x: hidden; }
        ::selection { background: #C4704B; color: #FAF8F5; }
        img { display: block; }
        .cta-btn:hover { background: #A85D3D !important; transform: translateY(-1px); }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
      <Nav active={active} setActive={handleNav} />
      <Hero onBook={() => handleNav("book")} />
      <Divider text="Est. 2024" />
      <About />
      <Gallery />
      <Divider text="Your Stay" />
      <WelcomeBook />
      <Divider text="Around Here" />
      <Neighborhood />
      <BookNow />
      <Footer />
    </div>
  );
}
