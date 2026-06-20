/**
 * Hex glyph geometry.
 *
 * The CTRL mark is a flat-top hexagon subdivided into six wedge segments
 * (center + two adjacent outer vertices). A flat-top hex has a horizontal
 * edge at the top, so one wedge always sits cleanly at "12 o'clock" — which
 * is what the navigation device (V05) rotates the active section into.
 *
 * Coordinate space is a 0..100 viewBox with the hex centered at (50,50).
 * Screen coordinates: +y points DOWN, so "top" is the -y direction.
 */

export const HEX_CENTER = { x: 50, y: 50 };
export const HEX_RADIUS = 42; // outer vertex radius within the 100x100 box

/** Vertex k sits at angle (-120 + 60k)°. Vertices 0..5 wind clockwise. */
function vertexAngleDeg(k: number): number {
  return -120 + 60 * k;
}

function pointOnCircle(angleDeg: number, radius: number) {
  const a = (angleDeg * Math.PI) / 180;
  return {
    x: HEX_CENTER.x + radius * Math.cos(a),
    y: HEX_CENTER.y + radius * Math.sin(a),
  };
}

/**
 * Wedge i is the triangle (center, vertex[i], vertex[i+1]).
 * Its centroid angle is -90 + 60i, so wedge 0 is the TOP wedge.
 * We inset every point toward the wedge centroid by `gap` to manufacture
 * the thin machined seams between segments — the hex should read as six
 * milled plates, not a drawn outline.
 */
export function segmentPath(i: number, gap = 0.07): string {
  const a = pointOnCircle(vertexAngleDeg(i), HEX_RADIUS);
  const b = pointOnCircle(vertexAngleDeg(i + 1), HEX_RADIUS);
  const c = HEX_CENTER;

  const cx = (a.x + b.x + c.x) / 3;
  const cy = (a.y + b.y + c.y) / 3;

  const inset = (p: { x: number; y: number }) => ({
    x: p.x + (cx - p.x) * gap,
    y: p.y + (cy - p.y) * gap,
  });

  const ai = inset(a);
  const bi = inset(b);
  const ci = inset(c);

  return `M ${ai.x.toFixed(2)} ${ai.y.toFixed(2)} L ${bi.x.toFixed(2)} ${bi.y.toFixed(
    2
  )} L ${ci.x.toFixed(2)} ${ci.y.toFixed(2)} Z`;
}

/** Centroid of wedge i in viewBox units — used to place labels & glows. */
export function segmentCentroid(i: number, radius = HEX_RADIUS) {
  const a = pointOnCircle(vertexAngleDeg(i), radius);
  const b = pointOnCircle(vertexAngleDeg(i + 1), radius);
  return {
    x: (a.x + b.x + HEX_CENTER.x) / 3,
    y: (a.y + b.y + HEX_CENTER.y) / 3,
  };
}

/** Outward direction (unit vector) of wedge i — used for label placement. */
export function segmentOutward(i: number) {
  const angle = (-90 + 60 * i) * (Math.PI / 180);
  return { x: Math.cos(angle), y: Math.sin(angle) };
}

/** Degrees to rotate the whole hex so wedge i lands at the top (12 o'clock). */
export function rotationToTop(i: number): number {
  return -60 * i;
}

/** Full outer hexagon outline — used for frames, reticles and masks. */
export function hexOutline(radius = HEX_RADIUS): string {
  const pts = Array.from({ length: 6 }, (_, k) => pointOnCircle(vertexAngleDeg(k), radius));
  return (
    pts.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ") +
    " Z"
  );
}
