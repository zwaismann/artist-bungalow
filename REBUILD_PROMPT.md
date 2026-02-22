# The Artist Bungalow - Complete Website Rebuild Prompt

> Use this prompt to rebuild the Artist Bungalow website from scratch. It contains every design decision, structural detail, copy block, image reference, and behavioral specification needed to recreate the site as a single self-contained HTML file.

---

## THE PROPERTY

**The Artist Bungalow** is a 2-bedroom, 2-bathroom Airbnb Superhost property (4.97 stars, Guest Favorite) in the Hollywood Hills, Los Angeles. It's a Spanish-style bungalow with mid-century interiors, original art, a piano, a guitar, a steam shower, a private deck with sweeping city-to-ocean views, and a tropical garden. It sits on a quiet cul-de-sac, a 5-minute walk from the Hollywood Bowl.

- **Airbnb listing:** `https://www.airbnb.com/rooms/736417448669019623`
- **Tagline:** "Where the hills meet the music."

---

## DESIGN DIRECTION & VIBE

**The aesthetic lives at the intersection of:** Stahl House clean lines + Chateau Marmont storied warmth + Eames playful geometry + Palm Springs golden hour. Classic Hollywood glamour meets mid-century modernism meets California warmth.

**Tone:** Cinematic, editorial, sophisticated but never corporate. The visual language of a well-traveled creative who knows good design but doesn't take themselves too seriously. Think: a luxury travel magazine layout, not a generic vacation rental site.

**Key principles:**
- Photography-forward, full-bleed hero images
- Warm, natural light aesthetic (golden hour energy)
- Asymmetric grids, not uniform boxes
- Generous whitespace (but never dead space)
- Sharp edges - **no rounded corners on images, ever**
- Horizontal rules as minimal dividers
- No heavy drop shadows or bordered cards
- Film grain overlay across the entire page (very subtle, ~2% opacity SVG noise texture on body::after, fixed position, pointer-events: none)
- Subtle scroll-triggered reveals (fade up 24px, 0.8s, cubic-bezier(0.22, 1, 0.36, 1))
- Parallax on hero images
- Hover zoom on gallery items (scale 1.05, pointer devices only)
- Never use pure white (#FFFFFF) or pure black (#000000)
- Custom scrollbar (5px width, ivory track, sand thumb)
- Selection highlight: brass background, ivory text

---

## COLOR PALETTE (CSS Custom Properties)

```css
:root {
    --onyx: #1A1A1A;       /* Deep near-black. Text, dark sections, grounding contrast */
    --brass: #C49A3C;       /* THE signature accent. Warm gold with patina. CTAs, labels, highlights */
    --ivory: #FAF6F0;       /* Warm off-white background. Sun-washed, not clinical */
    --terracotta: #C2614B;  /* Spanish tile, warm earth. Accent for warmth */
    --olive: #5A6B4A;       /* Hillside greenery, tropical garden. Natural, grounding */
    --ocean: #3B6B8A;       /* City-to-ocean views, bedroom linens. Cool counterpoint */
    --sand: #D4C5A9;        /* Rugs, wood tones, natural texture. Warm mid-tone */
    --blush: #E8CFC0;       /* Soft warmth, terracotta's lighter sibling */
    --cream: #F0E8D8;       /* Section backgrounds, subtle contrast against ivory */
}
```

**Usage rules:**
- Brass is the hero accent for all CTAs, section labels, star ratings, active nav states
- Onyx + Ivory is the primary contrast pair
- Terracotta, Olive, Ocean are supporting accents (used on testimonial avatars), never competing leads
- Dark sections (gallery, reviews, hero) use Onyx background with Ivory/Brass text
- Warm sections (about) use Cream background
- Dining section uses a slightly warm dark: `#2A2520` (not pure onyx)

---

## TYPOGRAPHY

Three Google Fonts, loaded via:
```
https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Bebas+Neue&family=Space+Grotesk:wght@300;400;500;600;700&family=Courier+Prime&display=swap
```

### Bebas Neue (Impact / Brand Moments)
- CSS var: `--font-impact`
- Role: Hero title, section headings, nav brand, stat values, footer brand, neighborhood place names
- Always uppercase, letter-spacing 0.04em, tight line-height (~0.85)
- The dominant visual typeface - used for all major headings

### Instrument Serif (Display / Editorial)
- CSS var: `--font-display`
- Role: Subtitles, taglines, intro text, dining card names, detail panel names
- Often italic for softer moments (subtitle, tagline, subheads)
- Negative letter-spacing (-0.025em) for elegant feel

### Space Grotesk (Body / UI / Navigation)
- CSS var: `--font-body`
- Role: Body copy, navigation links, buttons, labels, captions, amenity text, dining descriptions, review text
- Small caps for labels: font-size 10-11px, font-weight 500, letter-spacing 0.2-0.35em, text-transform uppercase, color brass
- Body text: 0.875rem, line-height 1.75, color rgba(26, 26, 26, 0.6) on light backgrounds

### Courier Prime (Typewriter Only)
- Used exclusively for the screenplay splash page typewriter text
- Monospace, 0.95rem base scaling up to 1.2rem on desktop

---

## EASING & ANIMATION TOKENS

```css
--ease-brand: cubic-bezier(0.22, 1, 0.36, 1);  /* Smooth, confident ease-out */
--ease-default: cubic-bezier(0.4, 0, 0.2, 1);   /* Standard Material ease */
```

---

## TONE OF VOICE (ALL COPY)

- **Property-centric voice** for descriptions: "A retreat perched in the hills..." / "The bungalow sits steps from the Hollywood Bowl..."
- **Second-person guest-focused** for experiential moments: "Your mornings start with canyon light..." / "Step onto the deck and the city unfolds below you..."
- **No host names or personal host identity** - never mention Patrick, Jimena, "we," or "our"
- Conversational but polished. Short sentences. Confident pacing.
- Evocative, sensory language (light, breeze, views, warmth)
- **No em dashes anywhere** - use commas, periods, or hyphens instead
- Local expertise, casual authority on neighborhood recommendations

---

## PAGE STRUCTURE (Top to Bottom)

### 1. FIXED NAV BAR
- Position fixed, z-index 100, hidden initially (opacity 0, pointer-events none)
- Fades in via the hero scroll handler (at ~60-85% scroll progress)
- On scroll past 80px, gains: `background: rgba(26, 26, 26, 0.88)`, `backdrop-filter: blur(20px) saturate(1.4)`, subtle brass border-bottom
- Left: brand name "THE ARTIST BUNGALOW" in Bebas Neue, ivory, uppercase, letter-spacing 0.15em
- Right (desktop): horizontal link list - About | Gallery | Neighborhood | Dining | Reviews | Reserve
  - Links: Space Grotesk 10px, weight 500, letter-spacing 0.2em, uppercase, color rgba(ivory, 0.4), hover to ivory
  - Active link (scroll spy): color brass
  - "Reserve" button: brass background, onyx text, weight 600, padding 10px 24px, hover darkens to #a07e2f
- Mobile (<900px): hide link list, show hamburger button. Full-screen overlay menu with Bebas Neue 2rem links, center-aligned

### 2. HERO SCROLL WRAPPER
This is the signature opening experience. A scroll-driven animation that transitions from a screenplay splash page into the hero.

**Architecture:**
- Outer wrapper: `position: relative`, height `calc(1500px + 200vh)` (desktop) / `calc(900px + 200vh)` (mobile), background onyx
- **Hero Welcome** (screenplay splash): `position: fixed`, full viewport, z-index 10, pointer-events none. Contains the typewriter text and scroll indicator
- **Hero Section** (the actual hero): `position: sticky`, top 0, height 100vh, min-height 600px. The only child in normal document flow

**Screenplay Typewriter Splash:**
- Centered vertically, Courier Prime monospace, muted ivory text (opacity 0.55), max-width 420-520px responsive
- Six rotating screenplay-format intros, randomly selected on load. Each has a three-beat structure:
  1. Scene heading (e.g., "EXT. HOLLYWOOD HILLS - DAY") - uppercase, bold, slightly brighter (opacity 0.7)
  2. Detail line(s) - setting description
  3. Closing payoff - always poetic, always about the feeling of the place

**The six intros:**

```
Intro 1:
EXT. HOLLYWOOD HILLS - DAY
Sun over the canyon. Palm trees stand still.
A bungalow perched above the city. White stucco. Clean lines.
The kind of place that feels like yours the moment you walk in.

Intro 2:
EXT. HOLLYWOOD HILLS - GOLDEN HOUR
Jasmine on the breeze. A canyon stretched out below, glowing.
A bungalow. Spanish stucco. A piano through an open window.
The kind of place you find and never want to leave...

Intro 3:
EXT. HOLLYWOOD HILLS - DAY
WIDE ON the canyon. A hawk circles.
PUSH IN on a bungalow above it all. Views for miles. A guitar leaning against a chair.
The kind of place where every morning feels like the opening scene.

Intro 4:
EXT. HOLLYWOOD HILLS - MAGIC HOUR
The city sprawls. The hills don't care.
A bungalow above the noise. Art on the walls. Light through every window.
The kind of place you keep coming back to.

Intro 5:
EXT. HOLLYWOOD HILLS - SUNSET
Canyon light. The distant sound of the Bowl tuning up.
A bungalow tucked into the hillside. A deck with nowhere better to be.
The kind of place that makes you wonder why you'd ever leave...

Intro 6:
EXT. HOLLYWOOD HILLS - DAWN
Fog in the canyon. The city still asleep.
A bungalow above the clouds. A view that earns the climb.
The kind of place where you finally stop scrolling and start living.
```

- Typewriter speed: ~30ms base + random 0-25ms per character
- Line pauses: scene heading 450ms, action lines 300ms, final line 225ms
- Blinking cursor (2px wide, ivory, 0.6s blink) follows the typing, fades out 2s after completion
- Scroll indicator below: thin 1px line + chevron, fades in after 3s, chevron drifts 5px with 2s ease animation
- **Skip functionality:** ArrowDown key or clicking the scroll indicator instantly completes all text

**Hero Scroll-Driven Animation (the clip-path reveal):**

As the user scrolls through the wrapper, these things happen simultaneously via requestAnimationFrame:

- **Progress** = how far wrapper has scrolled / scrollHeight (1500px desktop, 900px mobile), clamped 0-1
- **Clip-path**: Hero starts as a 16:9-ish window (polygon inset 10% horizontal, 22% vertical) and expands to fill the full viewport linearly with progress
- **Background zoom**: Hero background image starts at scale 1.5x and zooms down to 1x
- **Welcome text** fades out: opacity goes from 1 to 0 over 0-20% progress, then display:none
- **Hero content** (title, subtitle, CTAs) fades in: 40-65% progress
- **Hero stats bar** fades in: same timing as content
- **Nav** fades in: 60-85% progress
- After progress reaches 1.0, there is ~200vh of scroll dwell time where the hero sits fully complete before the next section scrolls into view

This creates the experience of: typewriter plays -> user scrolls -> text fades, windowed image zooms open -> title resolves -> hero "lands" and holds -> user continues scrolling to content

**Hero Content (inside the sticky hero):**
- Background: `hollywood_sign_hero.jpg` (local file), full-cover, with gradient overlay (dark at top and bottom for text readability)
- Bottom-left: hero-content block
  - Label: "Hollywood Hills, Los Angeles" - brass, Space Grotesk label style
  - Title: "The Artist" (line break) "Bungalow" - Bebas Neue, 3rem mobile / 6rem tablet / 9.375rem desktop, ivory with "Bungalow" in brass
  - Subtitle: "Where the hills meet the music." - Instrument Serif italic, 1.25rem/1.875rem, muted ivory (opacity 0.6)
  - CTAs: "Book Your Stay" brass button with arrow SVG + "Explore" text link (muted, hover to brass)
- Bottom-right (desktop only, hidden <900px): stats bar with frosted glass background
  - 5 stats: 2 Bedrooms | 2 Bathrooms | 4.97 Rating | Star Superhost | Heart Guest Favorite
  - Bebas Neue values, tiny Space Grotesk labels

### 3. INTRO SECTION
- Ivory background, centered text
- Padding: 5rem/6rem
- Top meta line: "Guest Favorite 2024" [40px sand rule] "Superhost" in brass label style
- Body: Instrument Serif, 1.5rem/1.875rem, onyx
- Copy: "An intimate, art-filled retreat perched in the Hollywood Hills, steps from the legendary Hollywood Bowl. *Sun-drenched rooms, sweeping views, a piano waiting to be played*, and the kind of quiet that makes you forget the city is right below."
- Italic text within is slightly muted (opacity 0.6)

### 4. ABOUT SECTION
- Cream (#F0E8D8) background, id="about"
- Two-column grid (stacks on mobile): image left, content right
- **Left column**: Property exterior photo (Airbnb photo #8, Spanish-style front), aspect-ratio 4:5
  - Overlay badge at bottom-left: frosted ivory glass, "4.97" in large Bebas Neue + "SUPERHOST / GUEST FAVORITE" in tiny label text
- **Right column**:
  - Label: "About the Space" (brass)
  - Heading: "Spanish Charm, Mid-Century Soul" (Bebas Neue)
  - Body: "Perched on a quiet cul-de-sac in the Hollywood Hills, the Artist Bungalow is a light-filled retreat where original art, an upright piano, and city-to-ocean views come together. Spanish-style architecture meets curated mid-century interiors, a tropical garden, and a private deck with sweeping LA panoramas."
  - 6-item amenity grid (2 columns on desktop): Panoramic Views (City to ocean) | Steam Shower (Spa-quality) | Piano & Guitar (Play something) | Full Kitchen (5 ways to brew) | Private Deck (With lounge seating) | Original Art (Curated collection)
  - Below grid: Superhost badge PNG + Guest Favorite badge PNG, side by side, 140px wide, 70% opacity

### 5. VIEW MOMENT (Photo Break)
- Full-bleed panoramic view photo, 40vh height, object-fit cover
- Image: `https://a0.muscache.com/im/pictures/miso/Hosting-736417448669019623/original/42a982e3-8279-4120-8281-1c925fde7d58.jpeg?im_w=1200`
- Subtle gradient overlay at top and bottom edges

### 6. GALLERY SECTION ("The Space")
- Onyx background, id="gallery"
- Header: brass label "Gallery" + Bebas Neue heading "The Space"
- **Infinite horizontal scroll gallery:**
  - All 26 Airbnb listing photos in a continuous loop (duplicated for seamless wrapping)
  - Auto-scrolls at 0.3px/frame
  - Draggable with momentum (mouse and touch), grab/grabbing cursors
  - Edge fade mask (transparent 0% -> black 8% -> black 92% -> transparent 100%)
  - Items: 280px square (mobile) / 510px (tablet) / 600px (desktop), no border-radius, 20px gap
  - Click opens a lightbox (dark overlay, centered image, caption from label, close button)
  - Hover: scale 1.05 + brightness 1.08 (pointer devices only)

### 7. PHOTO BREAK
- Full-bleed interior detail photo (Airbnb photo #7, living room detail), 40vh

### 8. NEIGHBORHOOD SECTION
- Ivory background, id="neighborhood"
- Label: "The Neighborhood" (brass)
- Heading: "Above It All, Close to Everything" (Bebas Neue)
- Body: "Tucked into the Hills but minutes from LA's best. Walk to the Hollywood Bowl, hike Runyon Canyon, or drive to the Observatory for sunset. The city is at your doorstep."
- **Two-column interactive layout:**
  - **Left: Location list** (7 items, each with hover and click behavior)
    - Hollywood Bowl - 5 min walk
    - Runyon Canyon - 8 min drive
    - Griffith Observatory - 12 min drive
    - Walk of Fame - 10 min drive
    - Universal Studios - 12 min drive
    - Warner Bros. Studio - 15 min drive
    - Hollywood Reservoir - 10 min drive
  - Each item: Bebas Neue place name + brass distance label + arrow (hidden, slides in on hover)
  - Hover: item slides right 1.5rem, place name turns brass, right-column shows matching isometric illustration
  - Click: opens a slide-in detail panel from the right edge
  - **Right (desktop only): Isometric illustration stage** - 320x320 stacked images, crossfade on hover
  - **Background: Survey-style line drawings** - faded (20% opacity) architectural/survey illustrations that crossfade per location, radial gradient mask for soft edges

**Detail Panel (slide-in from right):**
- 480px wide (55% max, 85-90% on mobile), ivory background, slides in with cubic-bezier transform
- Close button (round, bordered)
- Header: isometric icon + location name (Instrument Serif italic) + travel time with clock SVG
- Description paragraph
- MapLibre GL JS interactive map showing:
  - Terracotta dot for "home" (the bungalow location: lng -118.3387, lat 34.1158)
  - Brass dot for destination
  - Dashed brass line connecting them
  - Light basemap (Carto Positron)
  - Time label overlay
- Photo grid: first photo full-width (16:9), remaining in 2-column grid (4:3)
  - Photos fade in on load
  - Click opens a lightbox

**Required local assets for Neighborhood:**
- 6 isometric illustrations: `Isometric_Hollywood_Bowl.png`, `Isometric_Runyon_Canyon.png`, `Isometric_Griffith_Observatory.png`, `Isometric_Walk_of_Fame.png`, `Isometric_Universal_Studios.png`, `Isometric_Warner_Bros.png`
- 7 survey/line drawings: `survey_hollywood_bowl.png`, `survey_runyon_canyon.png`, `survey_griffith_observatory.png`, `survey_walk_of_fame.png`, `survey_universal_studios.png`, `survey_warner_bros.png`, `survey_hollywood_reservoir.png`
- Dozens of neighborhood photos (JPGs) stored locally alongside the HTML file, referenced by filename

### 9. DINING SECTION ("The Local Table")
- Dark warm background (#2A2520), id="dining"
- Label: "Eat & Drink" (brass)
- Heading: "The Local Table" (Bebas Neue, ivory)
- Subhead: "The best spots nearby, from morning coffee to late-night dinners" (Instrument Serif italic, muted)
- **Two categories, each with a 2-column card grid:**

**Coffee & Cafes (4 cards):**
1. Groundwork Coffee ($) - Specialty Roaster - 3 min drive
2. Alcove Cafe & Bakery ($$) - All-Day Cafe & Bakery - 5 min drive
3. Bru Coffeebar ($) - Single-Origin Coffee - 5 min drive
4. Maru Coffee ($) - Minimalist Pour-Over - 7 min drive

**Restaurants (6 cards):**
1. Kismet ($$) - Cal-Med, Vegetable-Forward - 4 min drive
2. Musso & Frank Grill ($$$) - Classic American - 5 min drive
3. Figaro Bistrot ($$) - French Bistro - 5 min drive
4. Osteria Mozza ($$$) - Italian, Upscale - 7 min drive
5. Cafe Stella ($$$) - French, Date Night - 8 min drive
6. Edendale ($$) - Modern American - 8 min drive

- Each card: Instrument Serif name (links to restaurant website) + price range + brass type label + Space Grotesk description (ivory at 0.7 opacity) + distance + Google Maps directions link with pin SVG
- Cards separated by 1px gap lines (rgba ivory 0.08), hover darkens background slightly (#332E28)
- Category labels: brass, small uppercase, with bottom border

### 10. TESTIMONIALS SECTION ("What They're Saying")
- Onyx background, id="reviews"
- Label: "Guest Reviews" (brass, light variant)
- Heading: "What They're Saying" (Bebas Neue, ivory)
- Subtitle: "4.97 out of 5 from 59+ reviews" (Instrument Serif italic, muted)
- **Three-column auto-scrolling vertical marquee:**
  - Columns scroll at different speeds (0.26, -0.195, 0.2275 px/frame - middle column scrolls in reverse)
  - Cards are duplicated for seamless looping
  - Vertical fade mask at top and bottom (transparent -> black 12% -> black 88% -> transparent)
  - Container height: 480px, overflow hidden
  - Pause on hover/touch
  - Third column hidden <900px, second column hidden <540px
- **Review cards:** Ivory background, 1px subtle border, 320px wide (280px mobile)
  - 5 brass stars
  - Quote text in Space Grotesk
  - Footer: colored circle avatar (initial letter, Bebas Neue) + name + date
  - Avatar colors rotate through: brass, terracotta, olive, ocean

**18 unique reviews across 3 columns (6 per column):**

Column 1: Sara (Jan 2026, brass), Carley (Dec 2025, terracotta), Rachel (Oct 2025, olive), David (Aug 2025, ocean), Maria (Jul 2025, terracotta), Jakob (Jan 2026, brass)

Column 2: Thomas (Jan 2026, ocean), Synthia (Nov 2025, olive), Nate (Sep 2025, brass), Anika (Jun 2025, terracotta), Ellen (Feb 2026, olive), Kevin (May 2025, ocean)

Column 3: Liz (Sep 2025, brass), Brett (Aug 2025, terracotta), Jessica (Apr 2025, olive), Reena (Feb 2026, ocean), Linda (Feb 2026, brass), Priya (Mar 2025, terracotta)

(Full review text is in the HTML - preserve each one exactly.)

### 11. CTA SECTION
- Full-bleed background photo (Airbnb photo #10, outdoor dining on patio), 70vh min 500px
- Dark overlay (rgba onyx, 0.55)
- Centered content:
  - Label: "Book" (brass, light)
  - Heading: "Your Hollywood Hills (break) Escape Awaits" - "Escape" in brass
  - Sub: "Come for the views. Stay for the vibe." (Instrument Serif italic)
  - Button: "Check Availability" with arrow SVG (same brass button style)

### 12. FOOTER
- Onyx background, centered
- Brand name: Bebas Neue, muted ivory (0.6)
- Tagline: Instrument Serif italic, very muted (0.25)
- Nav links matching header order: About | Gallery | Neighborhood | Dining | Reviews | Reserve
- Meta: "Hollywood Hills, Los Angeles" in very faint label text (0.15)

---

## IMAGES

### Airbnb Listing Photos (26 total)
All hosted on Airbnb's CDN. Base URL pattern:
```
https://a0.muscache.com/im/pictures/miso/Hosting-736417448669019623/original/{ID}.jpeg?im_w=1200
```

Use `im_w=1200` for full-res, `im_w=720` for medium, `im_w=320` for thumbnails.

| # | ID | Label |
|---|-----|-------|
| 1 | 21de2c8a-9f9c-48c1-b566-8305a952b1dc | The Living Room (Cover) |
| 2 | 69dc25b4-f315-41d1-a150-2a8504974878 | Primary Bedroom |
| 3 | 8080019c-281c-43af-b893-43ee20193232 | Kitchen & Dining |
| 4 | 5644d5a0-6485-4007-9688-8a6d68c1387e | Living Room Seating |
| 5 | 3a68d75b-927f-4c7a-992e-ace6c127b34d | Original Artwork |
| 6 | f9685988-7e27-4054-b173-114e690aab26 | Dining Area |
| 7 | e990aae8-3151-4bfc-9f8f-347eadf859df | Living Room Detail |
| 8 | 8d447807-c078-4593-8cad-2712de6a8d90 | The Front (Exterior) |
| 9 | f2a0fe1c-b2f3-445a-91e5-dfd8784f50f0 | The Garden |
| 10 | b9948b43-d3f1-4c21-ba60-425e766a0c29 | Outdoor Dining |
| 11 | 34a6bfd8-d85a-47a3-aa78-8e410fd334d6 | Living Room Wide |
| 12 | e534271b-59ca-46a5-a7c6-5d0a0ee6e71f | Bedroom Detail |
| 13 | 944586ea-ea29-4b3c-a801-9e7762a50339 | Laundry |
| 14 | 10abb5a6-4d20-4c9d-881e-a42e28803185 | Steam Shower |
| 15 | b10f46b6-6c3d-4938-8975-17be9456495e | Guest Room |
| 16 | d525b436-1a3c-4722-bca1-619373a234c4 | Guest Bedroom |
| 17 | c9a44b20-2b73-4448-962c-40718fcf3aa9 | Bathroom Vanity |
| 18 | 04325ef8-c51b-476a-9686-a64f9d1fff76 | Tropical Backyard |
| 19 | 005b510f-7c71-4476-9ef6-7574c5c421a2 | Shower Detail |
| 20 | 75d19ae8-912c-4f1f-bafd-28b42c4a856f | Desk Nook |
| 21 | d2236a4b-bcf1-4993-91d2-85a710f8192e | Panoramic View |
| 22 | 0bc956c9-352c-4831-9e27-b16f2afe9e3d | The Deck |
| 23 | 517bf334-7c36-444c-9696-382495180c3b | House Exterior |
| 24 | 5c3c8a51-f813-4edf-968a-05c1fd3163ae | Patio Lounge |
| 25 | 80446755-772d-40b7-b6bd-8f5acd7a14f0 | Garden View |
| 26 | e3f592c9-d172-4f2a-a252-b9b153eedd0e | Palm Trees |

**Additional photo used for View Moment (not in listing):**
- `42a982e3-8279-4120-8281-1c925fde7d58` - Sweeping city-to-ocean view from the deck at golden hour

### Local Assets Required
These must be in the same directory as the HTML file:
- `hollywood_sign_hero.jpg` - Hero background photo
- `superhost-badge.png` - Airbnb Superhost badge
- `guest-favorite.png` - Airbnb Guest Favorite badge
- 6 isometric illustration PNGs (see Neighborhood section above)
- 7 survey line drawing PNGs (see Neighborhood section above)
- Neighborhood photos: dozens of JPGs for each location's detail panel (Griffith Observatory ~13, Hollywood Bowl ~5, Runyon Canyon ~11, Walk of Fame ~13, Universal Studios ~15, Warner Bros ~10, Hollywood Reservoir ~22)

---

## EXTERNAL DEPENDENCIES

- **Google Fonts:** Instrument Serif, Bebas Neue, Space Grotesk, Courier Prime
- **MapLibre GL JS v4.7.1:** For the neighborhood detail panel maps (CDN: unpkg)
  - Basemap: Carto Positron (`https://basemaps.cartocdn.com/gl/positron-gl-style/style.json`)
- No other frameworks. No build tools. Pure vanilla HTML/CSS/JS in a single file.

---

## FAVICON

SVG data URI: brass "AB" monogram on onyx background, serif font, 32x32 viewBox.

---

## RESPONSIVE BREAKPOINTS

- `540px` - Stack hero CTAs vertically, single testimonial column, narrower review cards
- `767px` - Mobile gallery items (280px), neighborhood detail panel 90% width, simplified dining cards
- `768px` - Tablet up: 2-column grids activate (about, amenities, dining, neighborhood)
- `900px` - Desktop nav links visible (hide hamburger), hero stats visible, 3 testimonial columns
- `1024px` - Larger typewriter text, hero title scales up
- `1200px` - Full-size gallery items (600px)

---

## KEY JAVASCRIPT BEHAVIORS

1. **Scroll restoration:** `history.scrollRestoration = 'auto'` (browser manages position on refresh)
2. **Typewriter:** Random script selection, character-by-character typing with cursor, skip on ArrowDown or scroll indicator click
3. **Hero scroll handler:** requestAnimationFrame loop, clip-path polygon expansion, coordinated opacity fades for welcome/content/nav
4. **Nav scroll spy:** window scroll listener, checks section offsets, toggles `.nav-active` class on matching nav link
5. **Mobile menu:** click to open overlay, click link or close button to dismiss
6. **Scroll reveal:** IntersectionObserver at 12% threshold with -60px root margin, adds `.visible` class once (unobserves after)
7. **Gallery:** Auto-scrolling infinite loop with drag support, momentum decay (0.95 damping), seamless wrap at half-width
8. **Neighborhood:** Hover swaps isometric images + preloads photos, click opens detail panel with map initialization, lightbox for photos
9. **Testimonials:** Three independent requestAnimationFrame loops at different speeds, pause on hover/touch, seamless wrap at half-height
10. **Smooth scroll:** All `#` links use `scrollIntoView({ behavior: 'smooth', block: 'start' })`

---

## WHAT MAKES THIS SITE DISTINCTIVE

- The **screenplay typewriter intro** is the signature moment. It sets a cinematic tone before you see anything. It communicates that this isn't a generic vacation rental.
- The **scroll-driven clip-path hero reveal** creates a theatrical entrance, like a camera iris opening.
- The **neighborhood interactive section** with isometric illustrations, survey drawings, maps, and photo grids gives real utility and local knowledge while staying visually rich.
- The **dining section** functions as a curated local guide, not just a list. Every restaurant has personality in its description.
- The **auto-scrolling testimonial columns** (3 speeds, one reversed) create visual energy without requiring user interaction.
- Everything ties back to the **cinematic/editorial voice** - this feels like a page from a travel magazine, not a booking platform.
