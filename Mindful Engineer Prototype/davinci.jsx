// Da Vinci overlay variants for monastery theme
// Line-only, sketch-feel SVG — currentColor responds to light/dark

// Shared: a small jitter-path generator so lines feel hand-drawn
function sketchLine(x1, y1, x2, y2, wobble = 0.6) {
  const mx = (x1 + x2) / 2 + (Math.random() - 0.5) * wobble;
  const my = (y1 + y2) / 2 + (Math.random() - 0.5) * wobble;
  return `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
}

// Deterministic pseudo-random for consistent sketch each render
function makeRng(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function DaVinciGeometry() {
  // Hand-drawn hexagonal construction + proportional studies + marginalia
  const rnd = makeRng(42);
  const j = (v, amt = 1.2) => v + (rnd() - 0.5) * amt;

  // Hexagon points around circle r=140 at (200,200)
  const hexPts = [0,1,2,3,4,5].map(i => {
    const a = (i / 6) * Math.PI * 2 - Math.PI/2;
    return [200 + Math.cos(a) * 140, 200 + Math.sin(a) * 140];
  });

  // Double-stroke path — creates sketched "gone over twice" feel
  const doubleStroke = (d, sw = 0.7, key) => (
    <g key={key}>
      <path d={d} strokeWidth={sw} />
      <path d={d} strokeWidth={sw * 0.5} opacity="0.6" transform="translate(0.6,0.4)" />
    </g>
  );

  // Construction arcs (the 6 circles used to construct a hexagon)
  const constructionCircles = [0,1,2,3,4,5].map(i => {
    const [cx, cy] = hexPts[i];
    return <circle key={"cc"+i} cx={cx} cy={cy} r="140" strokeWidth="0.25" opacity="0.55" />;
  });

  return (
    <svg data-variant="geometry" className="dv-geometry"
         viewBox="0 0 500 500" fill="none" stroke="currentColor"
         strokeLinecap="round" strokeLinejoin="round"
         fontFamily="'EB Garamond', serif"
         aria-hidden="true">

      {/* outer bounding rectangle — like a manuscript page frame */}
      <path d={`M ${j(50)} ${j(50)} L ${j(450)} ${j(50)} L ${j(450)} ${j(450)} L ${j(50)} ${j(450)} Z`}
            strokeWidth="0.4" opacity="0.5" />

      {/* the faint construction circles behind */}
      {constructionCircles}

      {/* main circle (double-stroked) */}
      <circle cx="200" cy="200" r="140" strokeWidth="0.9" />
      <circle cx={j(200,1)} cy={j(200,1)} r="140" strokeWidth="0.4" opacity="0.55" />

      {/* hexagon (ink, with slight overrun at vertices for sketch-feel) */}
      {hexPts.map(([x,y],i) => {
        const [nx,ny] = hexPts[(i+1) % 6];
        return <path key={"h"+i} d={sketchLine(x, y, nx, ny, 0.8)} strokeWidth="1.0" />;
      })}

      {/* inscribed triangle */}
      {[[0,2],[2,4],[4,0]].map(([a,b],i) => {
        const [x1,y1] = hexPts[a], [x2,y2] = hexPts[b];
        return <path key={"t"+i} d={sketchLine(x1,y1,x2,y2,0.6)} strokeWidth="0.7" opacity="0.8" />;
      })}

      {/* Construction lines (compass radii) from center to hex points */}
      {hexPts.map(([x,y],i) => (
        <line key={"r"+i} x1="200" y1="200" x2={x} y2={y} strokeWidth="0.25" opacity="0.5" strokeDasharray="1.5 2" />
      ))}

      {/* Center mark — small cross */}
      <line x1="195" y1="200" x2="205" y2="200" strokeWidth="0.4" />
      <line x1="200" y1="195" x2="200" y2="205" strokeWidth="0.4" />

      {/* Golden spiral arcs — multiple quarters */}
      <path d="M 200 200 a 40 40 0 0 1 40 40 a 65 65 0 0 1 -65 65 a 105 105 0 0 1 -105 -105 a 170 170 0 0 1 170 -170" strokeWidth="0.45" opacity="0.75" />

      {/* Dimension line across diameter with tick marks */}
      <line x1="60" y1="360" x2="340" y2="360" strokeWidth="0.4" />
      <line x1="60" y1="355" x2="60" y2="365" strokeWidth="0.4" />
      <line x1="340" y1="355" x2="340" y2="365" strokeWidth="0.4" />
      <line x1="200" y1="356" x2="200" y2="364" strokeWidth="0.35" />
      <text x="170" y="372" fontSize="7" fill="currentColor" stroke="none" fontStyle="italic">ii · diameter</text>

      {/* Angle arc + label on one hex vertex */}
      <path d="M 220 85 a 18 18 0 0 1 -3 18" strokeWidth="0.3" />
      <text x="224" y="96" fontSize="6" fill="currentColor" stroke="none" fontStyle="italic">60°</text>

      {/* Leader line + annotation to the hexagon */}
      <path d="M 340 140 L 390 120" strokeWidth="0.3" />
      <text x="392" y="118" fontSize="7" fill="currentColor" stroke="none" fontStyle="italic">hexagonum</text>
      <text x="392" y="127" fontSize="5.5" fill="currentColor" stroke="none" opacity="0.75">regulare</text>

      {/* Leader + annotation to the construction circle */}
      <path d="M 80 90 L 40 70" strokeWidth="0.3" />
      <text x="10" y="65" fontSize="6.5" fill="currentColor" stroke="none" fontStyle="italic">circulus</text>
      <text x="10" y="74" fontSize="5" fill="currentColor" stroke="none" opacity="0.7">constructionis</text>

      {/* A small separate study: squared circle, top-right */}
      <g transform="translate(390, 250)">
        <rect x="-30" y="-30" width="60" height="60" strokeWidth="0.5" />
        <circle cx="0" cy="0" r="30" strokeWidth="0.5" />
        <line x1="-30" y1="0" x2="30" y2="0" strokeWidth="0.25" strokeDasharray="1.5 2" />
        <line x1="0" y1="-30" x2="0" y2="30" strokeWidth="0.25" strokeDasharray="1.5 2" />
        <text x="-38" y="48" fontSize="6" fill="currentColor" stroke="none" fontStyle="italic">quadratura</text>
        <text x="-38" y="56" fontSize="5" fill="currentColor" stroke="none" opacity="0.7">circuli</text>
      </g>

      {/* Small study: vesica piscis, bottom-left */}
      <g transform="translate(90, 420)">
        <circle cx="-12" cy="0" r="20" strokeWidth="0.5" />
        <circle cx="12" cy="0" r="20" strokeWidth="0.5" />
        <text x="-18" y="38" fontSize="6" fill="currentColor" stroke="none" fontStyle="italic">vesica piscis</text>
      </g>

      {/* Marginalia — handwritten-feeling notes, mirror style */}
      <g opacity="0.8">
        <text x="60" y="30" fontSize="5.5" fill="currentColor" stroke="none" fontStyle="italic">
          Geometria est fundamentum — omnes figurae ex circulo oriuntur
        </text>
        <text x="250" y="465" fontSize="5.5" fill="currentColor" stroke="none" fontStyle="italic">
          ratio diametri ad latus · √3
        </text>
        <text x="60" y="465" fontSize="5" fill="currentColor" stroke="none" opacity="0.7">folium xxiv</text>
      </g>

      {/* Tiny ink-blot / accent dots */}
      <circle cx="200" cy="200" r="0.9" fill="currentColor" stroke="none" />
      {hexPts.map(([x,y],i) => (
        <circle key={"d"+i} cx={x} cy={y} r="0.7" fill="currentColor" stroke="none" />
      ))}
    </svg>
  );
}

function DaVinciMechanism() {
  // A more convincing Da Vinci-style mechanism: escapement-like geared drive
  // with a crank, a weight on a rope over a pulley, and a ratchet pawl.
  // Larger, more parts, more annotation.
  const rnd = makeRng(7);
  const j = (v, amt = 0.8) => v + (rnd() - 0.5) * amt;

  // Build teeth for a gear as a jagged polygon-ish path (closer to real gear)
  function gearPath(cx, cy, rOuter, rInner, teeth) {
    let d = "";
    const step = (Math.PI * 2) / (teeth * 2);
    for (let i = 0; i < teeth * 2; i++) {
      const r = i % 2 === 0 ? rOuter : rInner;
      const a = i * step - Math.PI / 2;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      d += (i === 0 ? "M " : "L ") + x.toFixed(2) + " " + y.toFixed(2) + " ";
    }
    return d + "Z";
  }

  return (
    <svg className="dv-mechanism-footer"
         viewBox="0 0 440 340" fill="none" stroke="currentColor"
         strokeLinecap="round" strokeLinejoin="round"
         fontFamily="'EB Garamond', serif"
         aria-hidden="true">

      {/* Frame / mount — wooden beam outline */}
      <path d={`M ${j(20)} ${j(40)} L ${j(380)} ${j(40)} L ${j(380)} ${j(60)} L ${j(20)} ${j(60)} Z`}
            strokeWidth="0.7" />
      <line x1="30" y1="60" x2="30" y2="260" strokeWidth="0.7" />
      <line x1="30" y1="260" x2="380" y2="260" strokeWidth="0.7" />
      <line x1="370" y1="60" x2="370" y2="260" strokeWidth="0.7" />
      {/* Frame hatching (wood grain) */}
      {Array.from({length: 7}).map((_, i) => (
        <line key={"g"+i} x1={30 + i * 50} y1="40" x2={32 + i * 50} y2="60" strokeWidth="0.25" opacity="0.55" />
      ))}

      {/* Main gear: 20 teeth, large */}
      <path d={gearPath(140, 180, 62, 54, 20)} strokeWidth="0.8" />
      <path d={gearPath(140, 180, 62, 54, 20)} strokeWidth="0.35" transform="translate(0.6,0.5)" opacity="0.55" />
      <circle cx="140" cy="180" r="46" strokeWidth="0.4" />
      <circle cx="140" cy="180" r="8" strokeWidth="0.7" />
      <circle cx="140" cy="180" r="2.5" fill="currentColor" stroke="none" />
      {/* Spokes */}
      {[0,1,2,3].map(i => {
        const a = (i / 4) * Math.PI * 2 + Math.PI/8;
        return <line key={"sp"+i}
                     x1={140 + Math.cos(a)*10} y1={180 + Math.sin(a)*10}
                     x2={140 + Math.cos(a)*46} y2={180 + Math.sin(a)*46}
                     strokeWidth="0.5" />;
      })}

      {/* Pinion gear (small) meshing with main, upper-right */}
      <path d={gearPath(240, 130, 22, 17, 10)} strokeWidth="0.7" />
      <circle cx="240" cy="130" r="13" strokeWidth="0.35" />
      <circle cx="240" cy="130" r="3" strokeWidth="0.5" />
      <circle cx="240" cy="130" r="1" fill="currentColor" stroke="none" />
      {/* Shaft from pinion up into frame */}
      <line x1="240" y1="117" x2="240" y2="62" strokeWidth="0.6" />
      <line x1="237" y1="117" x2="237" y2="62" strokeWidth="0.3" opacity="0.6" />

      {/* Secondary gear driven by pinion */}
      <path d={gearPath(300, 185, 38, 31, 14)} strokeWidth="0.75" />
      <circle cx="300" cy="185" r="28" strokeWidth="0.35" />
      <circle cx="300" cy="185" r="5" strokeWidth="0.5" />
      <circle cx="300" cy="185" r="1.5" fill="currentColor" stroke="none" />
      {/* Spokes */}
      {[0,1,2].map(i => {
        const a = (i / 3) * Math.PI * 2;
        return <line key={"sp2"+i}
                     x1={300 + Math.cos(a)*6} y1={185 + Math.sin(a)*6}
                     x2={300 + Math.cos(a)*28} y2={185 + Math.sin(a)*28}
                     strokeWidth="0.45" />;
      })}

      {/* Ratchet pawl engaged with secondary gear */}
      <path d="M 340 160 L 320 165 L 312 176 L 325 172 Z" strokeWidth="0.55" />
      <circle cx="340" cy="160" r="2.5" strokeWidth="0.4" />
      <line x1="340" y1="160" x2="355" y2="120" strokeWidth="0.4" />
      <circle cx="355" cy="120" r="3" strokeWidth="0.45" />
      {/* Spring squiggle */}
      <path d="M 355 125 q -3 4 0 8 t 0 8 t 0 8" strokeWidth="0.3" />

      {/* Crank arm from main gear */}
      <line x1="140" y1="180" x2="95" y2="240" strokeWidth="1.1" />
      <line x1="143" y1="180" x2="98" y2="240" strokeWidth="0.4" opacity="0.55" />
      <circle cx="95" cy="240" r="5" strokeWidth="0.6" />
      <circle cx="95" cy="240" r="1.2" fill="currentColor" stroke="none" />
      {/* Crank handle */}
      <line x1="95" y1="240" x2="70" y2="265" strokeWidth="0.8" />
      <rect x="60" y="260" width="16" height="12" strokeWidth="0.5" transform="rotate(-35 68 266)" />

      {/* Pulley top-left, with rope to weight */}
      <circle cx="60" cy="100" r="12" strokeWidth="0.7" />
      <circle cx="60" cy="100" r="8" strokeWidth="0.35" opacity="0.7" />
      <circle cx="60" cy="100" r="1.5" fill="currentColor" stroke="none" />
      {/* Pulley mount bracket */}
      <path d="M 48 88 L 48 80 L 72 80 L 72 88" strokeWidth="0.6" />
      {/* Rope: over pulley, one end tied to main gear rim, other end with weight */}
      <path d="M 60 112 L 60 260" strokeWidth="0.55" />
      <path d="M 72 100 q 25 20 35 55 q 10 20 33 25" strokeWidth="0.55" />
      {/* Weight (block) */}
      <rect x="48" y="260" width="24" height="22" strokeWidth="0.65" />
      <line x1="48" y1="266" x2="72" y2="266" strokeWidth="0.3" opacity="0.6" />
      <line x1="48" y1="272" x2="72" y2="272" strokeWidth="0.3" opacity="0.6" />
      <text x="52" y="278" fontSize="5" fill="currentColor" stroke="none" fontStyle="italic">xii lb</text>

      {/* Floor / ground line with hatching */}
      <line x1="20" y1="295" x2="420" y2="295" strokeWidth="0.5" />
      {Array.from({length: 22}).map((_, i) => (
        <line key={"h"+i} x1={20 + i * 18} y1="295" x2={12 + i * 18} y2="308" strokeWidth="0.3" opacity="0.55" />
      ))}

      {/* Rotation arrow on main gear */}
      <path d="M 180 140 a 50 50 0 0 1 -18 -55" strokeWidth="0.45" />
      <path d="M 160 86 L 163 89 L 165 84" strokeWidth="0.45" />

      {/* Annotations + leader lines (authentically cluttered) */}
      <g>
        <line x1="200" y1="180" x2="225" y2="160" strokeWidth="0.3" />
        <text x="198" y="178" fontSize="6.5" fill="currentColor" stroke="none" fontStyle="italic">xx dentes</text>

        <line x1="260" y1="130" x2="290" y2="95" strokeWidth="0.3" />
        <text x="293" y="93" fontSize="6.5" fill="currentColor" stroke="none" fontStyle="italic">pinion</text>
        <text x="293" y="101" fontSize="5" fill="currentColor" stroke="none" opacity="0.7">x dentes</text>

        <line x1="320" y1="180" x2="345" y2="205" strokeWidth="0.3" />
        <text x="347" y="207" fontSize="6.5" fill="currentColor" stroke="none" fontStyle="italic">rota secunda</text>

        <line x1="340" y1="162" x2="380" y2="148" strokeWidth="0.3" />
        <text x="382" y="147" fontSize="6" fill="currentColor" stroke="none" fontStyle="italic">dens retinens</text>

        <line x1="95" y1="246" x2="55" y2="225" strokeWidth="0.3" />
        <text x="8" y="222" fontSize="6" fill="currentColor" stroke="none" fontStyle="italic">manubrium</text>

        <line x1="72" y1="100" x2="102" y2="70" strokeWidth="0.3" />
        <text x="103" y="68" fontSize="6.5" fill="currentColor" stroke="none" fontStyle="italic">trochlea</text>

        <line x1="55" y1="260" x2="30" y2="240" strokeWidth="0.3" />
        <text x="0" y="238" fontSize="6" fill="currentColor" stroke="none" fontStyle="italic">pondus</text>
      </g>

      {/* Ratio note */}
      <text x="248" y="100" fontSize="6" fill="currentColor" stroke="none" fontStyle="italic">ratio · 2 : 1</text>

      {/* Page caption / figure number */}
      <text x="18" y="28" fontSize="8" fill="currentColor" stroke="none" fontStyle="italic">FIG. IX</text>
      <text x="55" y="28" fontSize="6.5" fill="currentColor" stroke="none" opacity="0.8" fontStyle="italic">— machina ad pondus levandum</text>
      <text x="320" y="28" fontSize="5.5" fill="currentColor" stroke="none" opacity="0.7" fontStyle="italic">folium xxxii · recto</text>

      {/* Bottom mirror-script scribble (decorative) */}
      <g opacity="0.6">
        <path d="M 18 320 q 6 -4 12 0 t 12 0 t 12 0 t 12 0 t 12 0 t 12 0 t 12 0" strokeWidth="0.3" />
        <path d="M 18 328 q 6 -3 12 0 t 12 0 t 12 0 t 12 0 t 12 0" strokeWidth="0.3" />
      </g>
    </svg>
  );
}

function DaVinciMarginalia() {
  // Subtle, sparse marginalia — small line studies + short latin phrases
  // spread across the full page height. Rendered inside .main as a full-
  // height absolute column; SVG uses preserveAspectRatio none so items
  // distribute along the column regardless of page length.
  const phrases = [
    "folium i",
    "de volatu",
    "motus",
    "cochlea",
    "ratio",
    "nota bene",
    "de aqua",
    "proportio",
    "quies",
    "natura",
    "trigonum",
    "observa",
    "festina lente",
    "finis",
  ];

  // Positions along a 0..1000 virtual column. Sparse — each item gets room.
  const items = [
    { y: 30,  kind: "text", t: phrases[0] },
    { y: 70,  kind: "circle" },
    { y: 110, kind: "text", t: phrases[1] },
    { y: 170, kind: "spiral" },
    { y: 225, kind: "text", t: phrases[2] },
    { y: 275, kind: "tick" },
    { y: 330, kind: "text", t: phrases[3] },
    { y: 390, kind: "square-circle" },
    { y: 455, kind: "text", t: phrases[4] },
    { y: 505, kind: "arrow" },
    { y: 560, kind: "text", t: phrases[5] },
    { y: 615, kind: "wave" },
    { y: 670, kind: "text", t: phrases[6] },
    { y: 725, kind: "triangle" },
    { y: 785, kind: "text", t: phrases[7] },
    { y: 835, kind: "arc" },
    { y: 885, kind: "text", t: phrases[12] }, // festina lente
    { y: 935, kind: "tick" },
    { y: 975, kind: "text", t: phrases[13] },
  ];

  return (
    <aside className="dv-marginalia" aria-hidden="true">
      <svg viewBox="0 0 60 1000" fill="none" stroke="currentColor"
           strokeLinecap="round" strokeLinejoin="round"
           fontFamily="'EB Garamond', serif"
           preserveAspectRatio="none">

        {/* Faint vertical rule running the full column */}
        <line x1="48" y1="0" x2="48" y2="1000" strokeWidth="0.2" strokeDasharray="1 3" opacity="0.6" />

        {items.map((it, i) => {
          if (it.kind === "text") {
            return (
              <text key={i} x="8" y={it.y}
                    fontSize="4" fill="currentColor" stroke="none"
                    fontStyle="italic" opacity="0.9">{it.t}</text>
            );
          }
          if (it.kind === "circle") {
            return <circle key={i} cx="30" cy={it.y} r="8" strokeWidth="0.35" />;
          }
          if (it.kind === "spiral") {
            return (
              <path key={i}
                    d={`M 30 ${it.y} a 3 3 0 0 1 3 -3 a 7 7 0 0 1 -7 -7`}
                    transform={`rotate(-30 30 ${it.y})`}
                    strokeWidth="0.35" />
            );
          }
          if (it.kind === "tick") {
            return (
              <g key={i}>
                <line x1="18" y1={it.y} x2="42" y2={it.y} strokeWidth="0.35" />
                <line x1="18" y1={it.y - 2} x2="18" y2={it.y + 2} strokeWidth="0.35" />
                <line x1="42" y1={it.y - 2} x2="42" y2={it.y + 2} strokeWidth="0.35" />
                <line x1="30" y1={it.y - 1.5} x2="30" y2={it.y + 1.5} strokeWidth="0.3" />
              </g>
            );
          }
          if (it.kind === "square-circle") {
            return (
              <g key={i}>
                <rect x="20" y={it.y - 10} width="20" height="20" strokeWidth="0.35" />
                <circle cx="30" cy={it.y} r="10" strokeWidth="0.35" />
                <circle cx="30" cy={it.y} r="0.6" fill="currentColor" stroke="none" />
              </g>
            );
          }
          if (it.kind === "arrow") {
            return (
              <g key={i}>
                <line x1="18" y1={it.y} x2="44" y2={it.y - 4} strokeWidth="0.3" />
                <path d={`M 44 ${it.y - 4} L 40 ${it.y - 5.5} L 40.5 ${it.y - 2.5}`} strokeWidth="0.3" />
              </g>
            );
          }
          if (it.kind === "wave") {
            return (
              <path key={i}
                    d={`M 14 ${it.y} q 4 -3 8 0 t 8 0 t 8 0 t 8 0 t 8 0`}
                    strokeWidth="0.3" />
            );
          }
          if (it.kind === "triangle") {
            return (
              <path key={i}
                    d={`M 16 ${it.y + 8} L 44 ${it.y + 8} L 30 ${it.y - 8} Z`}
                    strokeWidth="0.35" />
            );
          }
          if (it.kind === "arc") {
            return (
              <path key={i}
                    d={`M 14 ${it.y + 6} q 16 -22 32 0`}
                    strokeWidth="0.35" />
            );
          }
          return null;
        })}
      </svg>
    </aside>
  );
}

function DaVinciCodex() {
  // For Articles page: an open manuscript / codex — two-page spread
  // with ruled text lines, drop cap, a small marginal diagram, and a
  // leather-like binding suggestion. Title-tie: "article" = a written leaf.
  return (
    <svg className="dv-codex" viewBox="0 0 520 360" fill="none" stroke="currentColor"
         strokeLinecap="round" strokeLinejoin="round"
         fontFamily="'EB Garamond', serif" aria-hidden="true">
      {/* Outer page frame */}
      <path d="M 20 40 L 500 40 L 500 320 L 20 320 Z" strokeWidth="0.7" />
      {/* Spine / center fold */}
      <line x1="260" y1="40" x2="260" y2="320" strokeWidth="0.5" />
      {/* Shadow of opposite page at fold */}
      <line x1="258" y1="44" x2="258" y2="316" strokeWidth="0.3" opacity="0.55" />
      <line x1="262" y1="44" x2="262" y2="316" strokeWidth="0.3" opacity="0.55" />
      {/* Subtle binding curve at top/bottom */}
      <path d="M 20 40 Q 260 28 500 40" strokeWidth="0.4" />
      <path d="M 20 320 Q 260 332 500 320" strokeWidth="0.4" />

      {/* LEFT page — ruled text lines + drop cap + small diagram */}
      {/* Drop cap */}
      <rect x="38" y="58" width="22" height="22" strokeWidth="0.45" />
      <text x="41" y="76" fontSize="18" fill="currentColor" stroke="none" fontStyle="italic" fontFamily="'EB Garamond', serif">Q</text>
      {/* First ~3 lines wrap around drop cap */}
      {[0,1,2].map(i => (
        <line key={"dc"+i} x1="64" y1={66 + i * 8} x2="244" y2={66 + i * 8} strokeWidth="0.35" opacity="0.75" />
      ))}
      {/* Remaining text lines */}
      {Array.from({length: 20}).map((_, i) => (
        <line key={"l"+i} x1="38" y1={96 + i * 8} x2="244" y2={96 + i * 8} strokeWidth="0.35" opacity="0.75" />
      ))}
      {/* A small in-text diagram (tiny circle + arrow) on the left page */}
      <g transform="translate(70, 224)">
        <circle cx="20" cy="20" r="14" strokeWidth="0.5" />
        <line x1="20" y1="6" x2="20" y2="34" strokeWidth="0.3" strokeDasharray="1.5 2" />
        <line x1="6" y1="20" x2="34" y2="20" strokeWidth="0.3" strokeDasharray="1.5 2" />
        <text x="-6" y="56" fontSize="5" fill="currentColor" stroke="none" fontStyle="italic">fig. a</text>
      </g>
      {/* Last few lines */}
      {Array.from({length: 4}).map((_, i) => (
        <line key={"b"+i} x1="38" y1={292 + i * 8} x2={i === 3 ? 180 : 244} y2={292 + i * 8} strokeWidth="0.35" opacity="0.75" />
      ))}
      {/* Page number / folio */}
      <text x="130" y="316" fontSize="5.5" fill="currentColor" stroke="none" fontStyle="italic" opacity="0.7">· xxiv ·</text>

      {/* RIGHT page — illuminated initial + more lines + marginal note */}
      {/* Illuminated capital */}
      <rect x="278" y="58" width="26" height="26" strokeWidth="0.55" />
      <rect x="281" y="61" width="20" height="20" strokeWidth="0.3" opacity="0.55" />
      {/* Floral flourish inside */}
      <path d="M 284 80 q 8 -12 18 -2" strokeWidth="0.3" opacity="0.7" />
      <path d="M 284 74 q 10 -6 18 0" strokeWidth="0.3" opacity="0.7" />
      <text x="283" y="79" fontSize="18" fill="currentColor" stroke="none" fontStyle="italic">A</text>
      {/* Wrap lines */}
      {[0,1,2].map(i => (
        <line key={"dc2"+i} x1="308" y1={66 + i * 8} x2="484" y2={66 + i * 8} strokeWidth="0.35" opacity="0.75" />
      ))}
      {Array.from({length: 22}).map((_, i) => (
        <line key={"l2"+i} x1="278" y1={96 + i * 8} x2={i === 10 || i === 17 ? 420 : 484} y2={96 + i * 8} strokeWidth="0.35" opacity="0.75" />
      ))}

      {/* Marginal leader + latin note on right page */}
      <line x1="430" y1="180" x2="490" y2="170" strokeWidth="0.3" opacity="0.75" />
      <text x="448" y="166" fontSize="5.5" fill="currentColor" stroke="none" fontStyle="italic">articulus</text>
      <text x="448" y="174" fontSize="4.5" fill="currentColor" stroke="none" opacity="0.75" fontStyle="italic">folium scriptum</text>

      {/* Page number right */}
      <text x="388" y="316" fontSize="5.5" fill="currentColor" stroke="none" fontStyle="italic" opacity="0.7">· xxv ·</text>

      {/* Running head */}
      <text x="100" y="34" fontSize="5" fill="currentColor" stroke="none" fontStyle="italic" opacity="0.7">de scriptura</text>
      <text x="340" y="34" fontSize="5" fill="currentColor" stroke="none" fontStyle="italic" opacity="0.7">caput iv</text>
    </svg>
  );
}

function DaVinciFragments() {
  // For Notes & fragments page: scatter of small studies loosely connected by
  // a dotted thread — many tiny pieces rather than one large composition.
  // Title-tie: "fragmenta" = broken pieces, many small figures.
  const items = [
    { x: 40,  y: 50,  kind: "circle" },
    { x: 110, y: 80,  kind: "triangle" },
    { x: 180, y: 40,  kind: "spiral" },
    { x: 250, y: 90,  kind: "square" },
    { x: 320, y: 50,  kind: "arc" },
    { x: 90,  y: 170, kind: "square" },
    { x: 170, y: 200, kind: "circle" },
    { x: 240, y: 160, kind: "triangle" },
    { x: 310, y: 200, kind: "spiral" },
    { x: 60,  y: 250, kind: "arc" },
    { x: 140, y: 280, kind: "circle" },
    { x: 220, y: 280, kind: "triangle" },
    { x: 300, y: 260, kind: "square" },
  ];
  return (
    <svg className="dv-fragments" viewBox="0 0 400 360" fill="none" stroke="currentColor"
         strokeLinecap="round" strokeLinejoin="round"
         fontFamily="'EB Garamond', serif" aria-hidden="true">
      {/* Connecting thread — dotted line weaving through items */}
      <path d={
        items.map((it, i) => (i === 0 ? `M ${it.x} ${it.y}` : `L ${it.x} ${it.y}`)).join(" ")
      } strokeWidth="0.3" strokeDasharray="1.5 3" opacity="0.55" />

      {items.map((it, i) => {
        if (it.kind === "circle") return (
          <g key={i}><circle cx={it.x} cy={it.y} r="10" strokeWidth="0.5" />
                     <circle cx={it.x} cy={it.y} r="0.9" fill="currentColor" stroke="none" /></g>
        );
        if (it.kind === "triangle") return (
          <path key={i} d={`M ${it.x-10} ${it.y+8} L ${it.x+10} ${it.y+8} L ${it.x} ${it.y-10} Z`} strokeWidth="0.5" />
        );
        if (it.kind === "spiral") return (
          <path key={i}
                d={`M ${it.x} ${it.y} a 3 3 0 0 1 3 -3 a 7 7 0 0 1 -7 -7 a 12 12 0 0 1 12 12`}
                strokeWidth="0.5" />
        );
        if (it.kind === "square") return (
          <rect key={i} x={it.x - 10} y={it.y - 10} width="20" height="20" strokeWidth="0.5" />
        );
        if (it.kind === "arc") return (
          <path key={i}
                d={`M ${it.x - 12} ${it.y + 4} q 12 -16 24 0`}
                strokeWidth="0.5" />
        );
        return null;
      })}

      {/* Sparse latin labels */}
      <text x="28" y="36" fontSize="6" fill="currentColor" stroke="none" fontStyle="italic" opacity="0.85">fragmenta</text>
      <text x="28" y="44" fontSize="4.5" fill="currentColor" stroke="none" fontStyle="italic" opacity="0.65">non ordine</text>
      <text x="300" y="340" fontSize="5" fill="currentColor" stroke="none" fontStyle="italic" opacity="0.75">notae breves</text>

      {/* Torn-edge suggestion at bottom */}
      <path d="M 20 350 q 10 -4 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0"
            strokeWidth="0.3" opacity="0.5" />
    </svg>
  );
}

function DaVinciArchive() {
  // For Archive page: stack of bound folios / library shelf — ordered rows.
  // Title-tie: "archivum" = storage of documents.
  return (
    <svg className="dv-archive" viewBox="0 0 440 340" fill="none" stroke="currentColor"
         strokeLinecap="round" strokeLinejoin="round"
         fontFamily="'EB Garamond', serif" aria-hidden="true">

      {/* Shelf lines */}
      {[90, 180, 270].map((y, row) => (
        <g key={row}>
          <line x1="20" y1={y} x2="420" y2={y} strokeWidth="0.6" />
          <line x1="20" y1={y + 2} x2="420" y2={y + 2} strokeWidth="0.25" opacity="0.6" />
        </g>
      ))}
      {/* Vertical ends */}
      <line x1="20" y1="20" x2="20" y2="300" strokeWidth="0.6" />
      <line x1="420" y1="20" x2="420" y2="300" strokeWidth="0.6" />

      {/* Books on each shelf — varying widths + heights */}
      {(() => {
        const shelves = [
          { y: 88, widths: [22, 28, 18, 34, 20, 26, 24, 30, 16, 28, 22, 18, 20, 30, 26] },
          { y: 178, widths: [30, 18, 24, 20, 36, 22, 26, 28, 20, 18, 32, 22, 20, 24] },
          { y: 268, widths: [18, 22, 28, 20, 26, 32, 18, 24, 20, 28, 22, 30, 20, 26, 18, 22] },
        ];
        const out = [];
        shelves.forEach((s, si) => {
          let x = 28;
          s.widths.forEach((w, i) => {
            if (x + w > 412) return;
            const h = 60 + (i % 4) * 2;
            const top = s.y - h;
            // Book body
            out.push(<rect key={`b${si}${i}`} x={x} y={top} width={w} height={h} strokeWidth="0.5" />);
            // Spine bands
            out.push(<line key={`b1${si}${i}`} x1={x + 2} y1={top + 10} x2={x + w - 2} y2={top + 10} strokeWidth="0.3" opacity="0.7" />);
            out.push(<line key={`b2${si}${i}`} x1={x + 2} y1={top + h - 10} x2={x + w - 2} y2={top + h - 10} strokeWidth="0.3" opacity="0.7" />);
            // Title hatch
            if (w >= 22) {
              out.push(<line key={`b3${si}${i}`} x1={x + 4} y1={top + 26} x2={x + w - 4} y2={top + 26} strokeWidth="0.3" opacity="0.6" />);
              out.push(<line key={`b4${si}${i}`} x1={x + 4} y1={top + 32} x2={x + w - 4} y2={top + 32} strokeWidth="0.3" opacity="0.6" />);
            }
            x += w + 1;
          });
        });
        return out;
      })()}

      {/* Shelf labels (right-aligned, italic) */}
      <text x="380" y="86" fontSize="5" fill="currentColor" stroke="none" fontStyle="italic" opacity="0.75">· mmxxvi ·</text>
      <text x="380" y="176" fontSize="5" fill="currentColor" stroke="none" fontStyle="italic" opacity="0.75">· mmxxv ·</text>
      <text x="380" y="266" fontSize="5" fill="currentColor" stroke="none" fontStyle="italic" opacity="0.75">· mmxxiv ·</text>

      {/* Cabinet header */}
      <line x1="20" y1="20" x2="420" y2="20" strokeWidth="0.4" />
      <text x="28" y="15" fontSize="5.5" fill="currentColor" stroke="none" fontStyle="italic" opacity="0.85">archivum</text>
      <text x="358" y="15" fontSize="4.5" fill="currentColor" stroke="none" fontStyle="italic" opacity="0.7">bibliotheca</text>

      {/* A couple of "pulled out" books (slightly askew) */}
      <g transform="rotate(-6 110 88)">
        <rect x="98" y="30" width="24" height="60" strokeWidth="0.5" />
      </g>
    </svg>
  );
}

function DaVinciVitruvian() {
  // For About page ("I'm Benjamin"): vitruvian-style proportional figure.
  // Title-tie: self-portrait / homo ad circulum / study of the man.
  return (
    <svg className="dv-vitruvian" viewBox="0 0 400 400" fill="none" stroke="currentColor"
         strokeLinecap="round" strokeLinejoin="round"
         fontFamily="'EB Garamond', serif" aria-hidden="true">
      {/* Circle + square */}
      <circle cx="200" cy="210" r="150" strokeWidth="0.7" />
      <circle cx="201" cy="211" r="150" strokeWidth="0.35" opacity="0.55" />
      <rect x="60" y="80" width="280" height="280" strokeWidth="0.7" />
      {/* Center cross */}
      <line x1="60" y1="220" x2="340" y2="220" strokeWidth="0.25" strokeDasharray="1.5 3" opacity="0.65" />
      <line x1="200" y1="80" x2="200" y2="360" strokeWidth="0.25" strokeDasharray="1.5 3" opacity="0.65" />

      {/* Head */}
      <circle cx="200" cy="112" r="20" strokeWidth="0.55" />
      {/* Face hint */}
      <line x1="194" y1="108" x2="196" y2="108" strokeWidth="0.3" />
      <line x1="204" y1="108" x2="206" y2="108" strokeWidth="0.3" />
      <path d="M 196 118 q 4 3 8 0" strokeWidth="0.3" />
      {/* Neck/torso */}
      <line x1="200" y1="132" x2="200" y2="232" strokeWidth="0.6" />
      {/* Arms spread horizontal */}
      <line x1="60" y1="190" x2="340" y2="190" strokeWidth="0.5" />
      {/* Arms raised alternate */}
      <line x1="78" y1="112" x2="322" y2="112" strokeWidth="0.4" strokeDasharray="2 2" opacity="0.7" />
      {/* Hands */}
      <circle cx="60" cy="190" r="4" strokeWidth="0.4" />
      <circle cx="340" cy="190" r="4" strokeWidth="0.4" />
      {/* Legs apart */}
      <line x1="200" y1="232" x2="126" y2="356" strokeWidth="0.6" />
      <line x1="200" y1="232" x2="274" y2="356" strokeWidth="0.6" />
      {/* Legs together alternate */}
      <line x1="200" y1="232" x2="186" y2="356" strokeWidth="0.4" strokeDasharray="2 2" opacity="0.7" />
      <line x1="200" y1="232" x2="214" y2="356" strokeWidth="0.4" strokeDasharray="2 2" opacity="0.7" />
      {/* Feet */}
      <line x1="120" y1="356" x2="132" y2="356" strokeWidth="0.4" />
      <line x1="268" y1="356" x2="280" y2="356" strokeWidth="0.4" />
      {/* Proportion marks */}
      <line x1="60" y1="112" x2="56" y2="112" strokeWidth="0.35" />
      <line x1="60" y1="190" x2="56" y2="190" strokeWidth="0.35" />
      <line x1="60" y1="232" x2="56" y2="232" strokeWidth="0.35" />
      <line x1="60" y1="356" x2="56" y2="356" strokeWidth="0.35" />
      <line x1="54" y1="112" x2="54" y2="356" strokeWidth="0.3" />

      {/* Annotations */}
      <text x="30" y="80" fontSize="6" fill="currentColor" stroke="none" fontStyle="italic">homo</text>
      <text x="30" y="88" fontSize="4.5" fill="currentColor" stroke="none" fontStyle="italic" opacity="0.7">ad circulum</text>
      <text x="345" y="210" fontSize="5.5" fill="currentColor" stroke="none" fontStyle="italic">brachium</text>
      <text x="345" y="218" fontSize="4.5" fill="currentColor" stroke="none" fontStyle="italic" opacity="0.7">viii pars</text>
      <text x="208" y="126" fontSize="5" fill="currentColor" stroke="none" fontStyle="italic">caput</text>
      <text x="114" y="380" fontSize="5" fill="currentColor" stroke="none" fontStyle="italic">pes</text>
      <text x="270" y="380" fontSize="5" fill="currentColor" stroke="none" fontStyle="italic">pes</text>

      {/* Running annotation top */}
      <text x="62" y="60" fontSize="4.5" fill="currentColor" stroke="none" fontStyle="italic" opacity="0.75">
        homo quadratus — mensura omnium
      </text>
    </svg>
  );
}

function DaVinciHorologium() {
  // For Now page: astronomical sundial / clock face with gnomon and
  // zodiac-style outer ring. Title-tie: "what I'm doing now" = time.
  const hours = Array.from({length: 12}, (_, i) => i);
  return (
    <svg className="dv-horologium" viewBox="0 0 420 420" fill="none" stroke="currentColor"
         strokeLinecap="round" strokeLinejoin="round"
         fontFamily="'EB Garamond', serif" aria-hidden="true">
      {/* Outer ring (zodiac) */}
      <circle cx="210" cy="210" r="180" strokeWidth="0.5" />
      <circle cx="210" cy="210" r="168" strokeWidth="0.3" opacity="0.55" />
      {/* Main dial */}
      <circle cx="210" cy="210" r="150" strokeWidth="0.7" />
      <circle cx="210" cy="210" r="138" strokeWidth="0.3" opacity="0.55" />
      {/* Inner dial */}
      <circle cx="210" cy="210" r="90" strokeWidth="0.5" />
      <circle cx="210" cy="210" r="30" strokeWidth="0.4" />
      {/* Center pin */}
      <circle cx="210" cy="210" r="2" fill="currentColor" stroke="none" />

      {/* Hour ticks + numerals */}
      {hours.map(i => {
        const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
        const x1 = 210 + Math.cos(a) * 150;
        const y1 = 210 + Math.sin(a) * 150;
        const x2 = 210 + Math.cos(a) * 138;
        const y2 = 210 + Math.sin(a) * 138;
        const tx = 210 + Math.cos(a) * 126;
        const ty = 210 + Math.sin(a) * 126 + 3;
        const roman = ["XII","I","II","III","IV","V","VI","VII","VIII","IX","X","XI"][i];
        return (
          <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth="0.5" />
            <text x={tx} y={ty} fontSize="7" fill="currentColor" stroke="none" fontStyle="italic" textAnchor="middle">{roman}</text>
          </g>
        );
      })}

      {/* Minor ticks (every 5 min) */}
      {Array.from({length: 60}).map((_, i) => {
        if (i % 5 === 0) return null;
        const a = (i / 60) * Math.PI * 2 - Math.PI / 2;
        return <line key={"m"+i}
                     x1={210 + Math.cos(a) * 150} y1={210 + Math.sin(a) * 150}
                     x2={210 + Math.cos(a) * 144} y2={210 + Math.sin(a) * 144}
                     strokeWidth="0.25" opacity="0.6" />;
      })}

      {/* Zodiac-style outer marks */}
      {Array.from({length: 12}).map((_, i) => {
        const a = (i / 12) * Math.PI * 2 - Math.PI / 2 + (Math.PI / 12);
        return <line key={"z"+i}
                     x1={210 + Math.cos(a) * 180} y1={210 + Math.sin(a) * 180}
                     x2={210 + Math.cos(a) * 168} y2={210 + Math.sin(a) * 168}
                     strokeWidth="0.3" opacity="0.65" />;
      })}

      {/* Gnomon / hour hand — pointing ~ 10 o'clock */}
      <line x1="210" y1="210" x2="130" y2="140" strokeWidth="1.1" />
      <line x1="210" y1="210" x2="130" y2="140" strokeWidth="0.5" opacity="0.55" transform="translate(1,1)" />
      {/* Minute hand */}
      <line x1="210" y1="210" x2="280" y2="120" strokeWidth="0.7" />
      {/* Shadow suggestion */}
      <path d="M 210 210 L 132 260" strokeWidth="0.35" strokeDasharray="2 2" opacity="0.6" />

      {/* Annotation leaders */}
      <line x1="360" y1="100" x2="395" y2="75" strokeWidth="0.3" />
      <text x="310" y="70" fontSize="5.5" fill="currentColor" stroke="none" fontStyle="italic">horologium</text>
      <text x="310" y="78" fontSize="4.5" fill="currentColor" stroke="none" fontStyle="italic" opacity="0.7">hora praesens</text>

      <line x1="130" y1="290" x2="80" y2="340" strokeWidth="0.3" />
      <text x="14" y="346" fontSize="5" fill="currentColor" stroke="none" fontStyle="italic">umbra — nunc</text>

      <line x1="210" y1="90" x2="210" y2="70" strokeWidth="0.3" opacity="0.6" />
      <text x="196" y="64" fontSize="5" fill="currentColor" stroke="none" fontStyle="italic" opacity="0.75">meridies</text>

      {/* Running sun symbol */}
      <g transform="translate(340, 340)" opacity="0.75">
        <circle cx="0" cy="0" r="10" strokeWidth="0.45" />
        {Array.from({length: 8}).map((_, i) => {
          const a = (i / 8) * Math.PI * 2;
          return <line key={i} x1={Math.cos(a) * 13} y1={Math.sin(a) * 13} x2={Math.cos(a) * 18} y2={Math.sin(a) * 18} strokeWidth="0.35" />;
        })}
      </g>

      {/* Latin foot */}
      <text x="170" y="406" fontSize="5" fill="currentColor" stroke="none" fontStyle="italic" opacity="0.7">tempus fugit</text>
    </svg>
  );
}

function DaVinci() {
  return null;
}

Object.assign(window, {
  DaVinci, DaVinciMechanism, DaVinciMarginalia, DaVinciGeometry,
  DaVinciCodex, DaVinciFragments, DaVinciArchive, DaVinciVitruvian, DaVinciHorologium
});
