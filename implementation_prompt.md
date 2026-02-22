# Artist Bungalow Website - Implementation Prompt

You are updating the Artist Bungalow direct booking website at https://artist-bungalow.vercel.app/. Below is a comprehensive list of fixes, improvements, and tweaks to implement. Reference the brand guide for all design decisions (colors, typography, visual style rules).

---

## CRITICAL FIXES (Do These First)

### 1. Remove Massive Empty Gaps Between Sections
There are multiple full-viewport blank ivory/cream gaps that make the page look broken:
- Between the About section and the Gallery ("The Space") section
- Below the exterior property photo before the Neighborhood section
- Between the Gallery grid and the exterior photo

Audit all section containers and remove excessive padding, margin, or hardcoded height values. The brand guide calls for "generous whitespace," but these are dead zones, not whitespace. Each gap is roughly a full viewport height of nothing. Reduce to a comfortable breathing room (80-120px between major sections max).

### 2. Remove Rounded Corners on All Images
The gallery images in "The Space" section have border-radius applied. The brand guide explicitly states: "Sharp edges (no rounded corners on images)." Remove all border-radius from every image on the site. This applies to the gallery grid photos, any card images, and any other image containers.

### 3. Fix Navigation Active State / Scroll Spy
The nav active state (bold/highlighted link) is stuck on "NEIGHBORHOOD" regardless of which section is in the viewport. Fix the intersection observer or scroll listener so the correct nav link highlights as the user scrolls through each section. Each section (About, Gallery, Neighborhood, Dining, Reviews) should activate its corresponding nav link when in view.

---

## LAYOUT & DESIGN IMPROVEMENTS

### 4. Neighborhood Section - Add Visual Content to Right Side
The Neighborhood section ("Above It All, Close to Everything") has the distances list on the left half with the entire right side empty. Add visual content to the right to balance the layout. Options:
- A photo grid of nearby landmarks (Hollywood Bowl, Runyon Canyon, Griffith Observatory)
- A stylized map graphic
- A single atmospheric neighborhood photo

Also consider giving the Hollywood Bowl entry more visual prominence than the other list items, since it's the anchor of the brand tagline ("Where the hills meet the music"). It could be slightly larger, have a subtle accent treatment, or be broken out as a featured callout above the list.

### 5. Dining Section - Improve Text Contrast
The restaurant/cafe description body text and "X min drive" labels have very low contrast against the dark background. They're nearly illegible. Increase the text color brightness to meet at least WCAG AA contrast ratio (4.5:1). Use Ivory (#FAF6F0) or a light gray for body descriptions. The brass-colored category labels ("SINGLE-ORIGIN COFFEE," etc.) are fine as-is.

### 6. Reviews Section - Fix Card Clipping
The review cards in "What They're Saying" are clipping at the left and right viewport edges. The left-column cards (Carley, Rachel) have text cut off, and right-column cards clip slightly too. Add proper horizontal padding or margin to the masonry grid container so no cards overflow the viewport. Ensure all review text is fully visible.

### 7. Fix Dark Box Overlay on Koi Pond Photo
In the About section, there's a dark semi-transparent rectangle at the bottom-left of the koi pond/garden photo. This appears to be a rating badge ("4.97 / SUPERHOST / GUEST FAVORITE") that isn't rendering its text consistently. Fix the z-index, opacity, or positioning so the badge either displays correctly at all scroll positions or is removed in favor of showing the badges separately (which already exists below the amenity grid).

### 8. Align Footer Navigation with Header Navigation
The footer nav currently shows: GALLERY | ABOUT | NEIGHBORHOOD | REVIEWS | AIRBNB
The header nav shows: ABOUT | GALLERY | NEIGHBORHOOD | DINING | REVIEWS | RESERVE

Fix the footer to match the header: same link order, same labels, same destinations. Include "Dining" and use "Reserve" instead of "Airbnb" (or keep "Airbnb" if intentional, but the order and completeness should match).

---

## SCREENPLAY SPLASH PAGE IMPROVEMENTS

### 9. Fix Scroll Transition from Splash to Hero (IMPORTANT)
The scroll behavior from the screenplay splash page into the hero section is broken. When you scroll past the splash, the full hero image appears but there's no scroll snap or stopping point. By the time the "THE ARTIST BUNGALOW" title text comes into view, you've already scrolled halfway through the homepage and missed the hero moment entirely. The hero section needs to catch and hold the viewport so visitors actually see it.

**Fix:** Add a scroll-snap or anchor point so that when the user scrolls past the splash, the viewport locks onto the top of the hero section. The hero (with the Hollywood Sign photo, title, tagline, CTAs, and stat badges) should be a full, intentional landing moment, not something you blow past.

### 10. Optimize the Typewriter Intro
The screenplay intro is a strong brand moment but creates friction before visitors see the property. Implement these improvements:
- Speed up the typewriter animation (tighten character timing)
- Make the scroll-down arrow at the bottom skip the animation instantly and scroll to the hero
- Consider storing a session flag so returning visitors skip the splash and go straight to the hero section
- Alternatively, consider making this a section within the normal page flow rather than a full-screen gate, so it reads as a cinematic opening beat rather than a loading barrier

There are six rotating intros. Each follows a three-beat structure: setting line, detail line, payoff/closing line. The closing line always nods to the feeling of the place. Here they are:

**Intro 1:**
EXT. HOLLYWOOD HILLS – DAY
Sun over the canyon. Palm trees stand still.
A bungalow perched above the city. White stucco. Clean lines.
The kind of place that feels like yours the moment you walk in.

**Intro 2:**
EXT. HOLLYWOOD HILLS – GOLDEN HOUR
Jasmine on the breeze. A canyon stretched out below, glowing.
A bungalow. Spanish stucco. A piano through an open window.
The kind of place you find and never want to leave...

**Intro 3:**
EXT. HOLLYWOOD HILLS – DAY
WIDE ON the canyon. A hawk circles.
PUSH IN on a bungalow above it all. Views for miles. A guitar leaning against a chair.
The kind of place where every morning feels like the opening scene.

**Intro 4:**
EXT. HOLLYWOOD HILLS – MAGIC HOUR
The city sprawls. The hills don't care.
A bungalow above the noise. Art on the walls. Light through every window.
The kind of place you keep coming back to.

**Intro 5:**
EXT. HOLLYWOOD HILLS – SUNSET
Canyon light. The distant sound of the Bowl tuning up.
A bungalow tucked into the hillside. A deck with nowhere better to be.
The kind of place that makes you wonder why you'd ever leave...

**Intro 6:**
EXT. HOLLYWOOD HILLS – DAWN
Fog in the canyon. The city still asleep.
A bungalow above the clouds. A view that earns the climb.
The kind of place where you finally stop scrolling and start living.

---

## BRAND VOICE UPDATE

### 11. Update All Copy to New Voice Direction
The brand voice has been updated. Remove all first-person plural references ("we," "our") and any host names (Patrick, Jimena). Replace with a blend of:
- **Property-centric voice** for descriptions: "A retreat perched in the hills..." / "The bungalow sits steps from the Hollywood Bowl..."
- **Second-person guest-focused voice** for experiential moments: "Your mornings start with canyon light..." / "Step onto the deck and the city unfolds below you..."

Audit all copy on the page for this change, including the About section description, any button microcopy, the dining section intro, and the CTA sections.

---

## POLISH & SMALL FIXES

### 12. Add a Favicon
Add a custom favicon. A small brass-colored "AB" monogram or a minimal bungalow icon in the brand's Brass (#C49A3C) on a dark background would work well.

### 13. Verify "EST. 2024" Label
The intro tagline area shows "EST. 2024 - GUEST FAVORITE." Verify this date is accurate. If the property was hosting before 2024, update accordingly. If it refers to the Guest Favorite award year, rephrase to clarify (e.g., "GUEST FAVORITE 2024" without "EST.").

### 14. Add a Dedicated View/Deck Moment
The brand guide lists "the sweeping city-to-ocean view from the deck" as the #1 key photography subject, but there's no dedicated section or full-bleed moment for it. Consider adding a full-width parallax photo of the panoramic view, either as a section divider or as its own feature moment. This is likely the property's strongest selling point and deserves more than just a mention in the amenity grid.

### 15. Check Superhost/Guest Favorite Badge Resolution
The Airbnb Superhost and Guest Favorite badge images in the About section may appear blurry on high-DPI/Retina screens. Ensure these are SVG or at least 2x resolution raster images.

### 16. Mobile Responsiveness Audit
After implementing all the above, do a full mobile audit. Pay special attention to:
- The gallery grid layout on small screens
- The dining cards stacking and text readability
- The review masonry layout not clipping
- The screenplay intro on mobile (typing speed, text size)
- The neighborhood distances list layout
- The hero title sizing and CTA button positioning

---

## REFERENCE: Brand Guide Color Palette
- **Onyx** #1A1A1A (dark sections, text)
- **Brass** #C49A3C (CTAs, labels, accents)
- **Ivory** #FAF6F0 (light backgrounds)
- **Terracotta** #C2614B (warm accents)
- **Olive** #5A6B4A (natural accents)
- **Ocean** #3B6B8A (cool accents)
- **Sand** #D4C5A9 (mid-tone neutral)
- Never use pure white (#FFFFFF) or pure black (#000000)

## REFERENCE: Typography
- **Instrument Serif** - Headlines, hero text, editorial
- **Space Grotesk** - Body, nav, buttons, labels (small caps for labels, letter-spacing 0.2-0.35em)
- **Bebas Neue** - Large brand moments, cinematic statements, all-caps

## REFERENCE: Visual Style Rules
- Sharp edges, no rounded corners on images
- Asymmetric grids, not uniform boxes
- Horizontal rules as minimal dividers
- No heavy drop shadows or bordered cards
- Subtle scroll-triggered reveals (fade up, 0.7s)
- Parallax on hero images
- Hover zoom on gallery (scale 1.05)
