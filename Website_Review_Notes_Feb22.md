# Artist Bungalow Website Review Notes
**Date:** February 22, 2026
**URL:** https://artist-bungalow.vercel.app/

---

## CRITICAL ISSUES

### 1. Massive Empty Spaces / Broken Scroll Sections
The biggest issue on the site. There are multiple areas with enormous blank ivory/cream space that feel broken rather than intentional:
- Between the About section and the Gallery section (full viewport of empty ivory)
- Below the exterior property photo (another full viewport of empty ivory before the Neighborhood section)
- Between the Gallery grid bottom and the exterior photo

These might be placeholder areas for content that was removed, or CSS height values that are too large. Either way, it makes the page feel unfinished and kills scrolling momentum. A visitor would likely think the page is broken and stop scrolling.

**Fix:** Audit all section heights and remove excessive padding/margin. Generous whitespace is great, but multiple full-viewport gaps are not whitespace, they're dead zones.

### 2. Gallery Images Have Rounded Corners
The brand guide explicitly states: "Sharp edges (no rounded corners on images)." The gallery grid images in "The Space" section all have visible border-radius applied. This contradicts the brand spec and softens what should be a sharper, more editorial aesthetic.

**Fix:** Remove border-radius from all gallery images. Keep edges sharp per the brand guide.

### 3. Nav Active State Not Tracking Correctly
The "NEIGHBORHOOD" nav link stays bold/highlighted even when viewing the About or Dining sections. The scroll-spy or active state logic seems broken, it doesn't update as you scroll through sections.

**Fix:** Review the intersection observer or scroll listener that toggles the active nav class. Make sure it properly detects which section is currently in the viewport.

---

## DESIGN & LAYOUT NOTES

### 4. Neighborhood Section is Text-Only, Visually Flat
The Neighborhood section ("Above It All, Close to Everything") is just a list of distances pushed to the left half of the page with the entire right side empty. Compared to the rest of the site, it feels like an afterthought.

**Suggestion:** Add a photo or map on the right side to balance the layout. Consider a neighborhood photo grid (Hollywood Bowl, Runyon Canyon, Griffith Observatory) or even a stylized illustrated map. The brand guide lists specific key photography subjects, this is a missed opportunity to use them.

### 5. Dining Section, Low Text Contrast on Dark Background
In the restaurant/cafe cards, the description body text and the "X min drive" labels are quite faint against the dark background. The restaurant descriptions appear to use a gray that doesn't meet accessibility contrast standards. The brass-colored category labels ("SINGLE-ORIGIN COFFEE," etc.) read well, but the actual descriptions are hard to scan.

**Fix:** Bump up the body text opacity/brightness in the dining cards. Aim for at least WCAG AA contrast (4.5:1 ratio). The ivory (#FAF6F0) or a lighter gray would work better for descriptions.

### 6. Review Cards Clipping at Viewport Edges
In the "What They're Saying" reviews section, the left-column review cards (Carley, Rachel) are clipped at the left edge of the viewport. Text starts cut off ("Even with rain..." is partially hidden). The right column cards also clip slightly at the right edge.

**Fix:** Add proper horizontal padding/margin to the masonry grid container so cards don't overflow the viewport.

### 7. Dark Box Overlay on Koi Pond Photo
In the About section, there's a dark semi-transparent rectangle at the bottom-left of the koi pond photo. In earlier scrolling it appeared to be the "4.97 / SUPERHOST / GUEST FAVORITE" badge, but at the About section anchor it appears as just a dark box. This might be a z-index or visibility issue where the badge text isn't rendering properly at certain scroll positions.

**Fix:** Check the CSS positioning and opacity of the rating badge on the koi pond photo. Make sure it renders consistently.

### 8. Footer Navigation Mismatch
The footer nav links are: GALLERY | ABOUT | NEIGHBORHOOD | REVIEWS | AIRBNB. But the header nav order is: ABOUT | GALLERY | NEIGHBORHOOD | DINING | REVIEWS | RESERVE. The footer is missing "DINING" and has "AIRBNB" instead of "RESERVE." These should be consistent.

**Fix:** Align footer nav links with header nav, same order, same labels.

---

## TYPOGRAPHY & COPY NOTES

### 9. Screenplay Intro, Typewriter Effect Timing
The screenplay intro ("EXT. HOLLYWOOD HILLS, GOLDEN HOUR") with the typewriter animation is a strong concept that fits the cinematic brand. However, it takes a while to complete. Consider whether first-time visitors will wait for it or scroll past. There's no skip option.

**Suggestion:** Add a subtle "skip" link or make the typewriter faster. Alternatively, have it already rendered on return visits (session storage flag).

### 10. "EST. 2024" Label
The intro tagline section shows "EST. 2024 - GUEST FAVORITE." If the property has been hosting before 2024, this might be inaccurate. Also, if this is the year the website launched rather than the property, it could be confusing.

**Suggestion:** Verify the "EST." year is accurate. If it's referring to the Guest Favorite badge, rephrase to avoid implying the property was established in 2024.

### 11. Subtitle Copy, "Where the hills meet the music."
This tagline is strong and appears in the hero and footer. It's the brand's signature line per the brand guide. No changes needed, just noting it's well-placed.

### 12. "5 ways to brew" Under Full Kitchen
The amenity subtitle "5 ways to brew" is charming but might confuse guests who aren't coffee enthusiasts. Consider whether this communicates the kitchen's value clearly enough.

---

## TECHNICAL / UX NOTES

### 13. No Mobile Check Done
This review was desktop only. The site needs a mobile walkthrough, especially for the gallery grid, the dining cards, the review masonry layout, and the screenplay intro. All of these are complex layouts that often break on small screens.

### 14. Reserve/Book CTAs
The "RESERVE" button in the nav and "BOOK YOUR STAY" in the hero both link to the Airbnb listing. The "CHECK AVAILABILITY" CTA at the bottom also presumably links to Airbnb. This is fine for now, but if direct booking is ever added, these should be updated.

### 15. No Favicon Visible
The browser tab shows "The Artist Bungalow, Hollywood Hills" but no custom favicon was visible. A small gold "AB" monogram or bungalow icon would polish the experience.

### 16. Superhost/Guest Favorite Badge Images
The Airbnb Superhost and Guest Favorite badge images in the About section look like they might be raster images that could appear blurry on high-DPI screens. Consider using SVG versions if available, or ensuring these are at 2x resolution.

---

## WHAT'S WORKING WELL

- **Cinematic brand identity** is consistent throughout, the screenplay intro, bold Bebas Neue headlines, brass accents, and dark/ivory contrast all feel cohesive
- **Photography is excellent**, the koi pond, exterior, bedroom, and courtyard photos sell the property beautifully
- **The dining section content** is genuinely useful and well-curated with real local knowledge
- **The hero section** with the Hollywood Sign backdrop is immediately striking and location-grounding
- **Typography pairing** (Instrument Serif + Space Grotesk + Bebas Neue) is well-executed per the brand guide
- **Stat badges** (2 Bedrooms, 2 Bathrooms, 4.97, Superhost, Guest Favorite) in the hero provide instant credibility

---

*Review conducted by Claude, February 22, 2026*
