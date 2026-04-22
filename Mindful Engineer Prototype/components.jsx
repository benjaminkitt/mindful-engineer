// Shared components for The Mindful Engineer
// Depends on window.SITE, window.POSTS

const { useState, useEffect, useMemo, useRef } = React;

// ---------- Utilities ----------
function fmtDate(iso, opts = {}) {
  const d = new Date(iso);
  const day = d.getDate();
  const month = d.toLocaleString("en-US", { month: "short" });
  const year = d.getFullYear();
  if (opts.withTime) {
    const h = String(d.getHours()).padStart(2, "0");
    const m = String(d.getMinutes()).padStart(2, "0");
    return `${day} ${month} ${year} · ${h}:${m}`;
  }
  return `${day} ${month} ${year}`;
}
function fmtDateShort(iso) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")} ${d.toLocaleString("en-US", { month: "short" }).toLowerCase()}`;
}

// ---------- Nav ----------
function Nav({ route, onToggleTweaks }) {
  const mode = document.documentElement.getAttribute("data-mode") || "light";
  const [, force] = useState(0);
  const toggleMode = () => {
    const next = mode === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-mode", next);
    localStorage.setItem("tme_mode", next);
    force(x => x + 1);
    window.parent.postMessage({type:'__edit_mode_set_keys', edits:{ mode: next }}, '*');
  };
  return (
    <header className="nav">
      <div className="container nav-inner">
        <a href="#/" className="nav-brand">
          <span className="dot"></span>
          <span>The Mindful Engineer</span>
        </a>
        <nav className="nav-links">
          {SITE.nav.map(n => (
            <a key={n.href} href={n.href}
               className={"nav-link" + (routeMatches(route, n.href) ? " active" : "")}>
              {n.label}
            </a>
          ))}
        </nav>
        <div className="nav-actions">
          <button className="icon-btn" onClick={toggleMode} title="Toggle dark mode">
            {mode === "dark" ? "☀" : "☾"}
          </button>
          <button className="icon-btn" onClick={onToggleTweaks} title="Tweaks">⚙</button>
        </div>
      </div>
    </header>
  );
}

function routeMatches(route, href) {
  const path = href.replace("#", "");
  if (path === "/" && route === "/") return true;
  if (path !== "/" && route.startsWith(path)) return true;
  return false;
}

// ---------- Footer ----------
function Footer() {
  return (
    <footer className="footer">
      <DaVinciMechanism />
      <div className="container footer-inner">
        <div>
          <div className="footer-title">{SITE.domain}</div>
          <div style={{fontFamily:"var(--ff-serif)", fontSize:17, color:"var(--c-ink-soft)", fontStyle:"italic", maxWidth:"36ch", lineHeight:1.5}}>
            A quiet place to think out loud about software.
          </div>
        </div>
        <div>
          <div className="footer-title">Sections</div>
          <a href="#/essays">Articles</a>
          <a href="#/notes">Notes & fragments</a>
          <a href="#/archive">Full archive</a>
        </div>
        <div>
          <div className="footer-title">Elsewhere</div>
          <a href="#">RSS feed</a>
          <a href="#">Email newsletter</a>
          <a href="#">GitHub · benkitt</a>
          <a href="#">mail@mindful.engineer</a>
        </div>
      </div>
      <div className="container" style={{marginTop: "var(--s-7)", display:"flex", justifyContent:"space-between", fontFamily:"var(--ff-mono)", fontSize: "var(--fs-micro)", color:"var(--c-ink-mute)", letterSpacing:"0.08em"}}>
        <span>© {new Date().getFullYear()} Benjamin Kitt · Built by hand</span>
        <span>v. 0.3.1 — last deploy {fmtDate("2026-04-16")}</span>
      </div>
    </footer>
  );
}

// ---------- Cards ----------
function FeaturedCard({ post }) {
  return (
    <a className="featured-card" href={`#/essay/${post.id}`}>
      <div className="featured-kicker">
        <span>Article · {fmtDate(post.date)}</span>
        <span>{post.readMin} min</span>
      </div>
      <h2 className="featured-title">{post.title}</h2>
      <div className="featured-sub">{post.subtitle}</div>
      <p className="featured-excerpt">{post.excerpt}</p>
      <div className="featured-tags">
        {(post.tags || []).map(t => <span key={t}>{t}</span>)}
      </div>
    </a>
  );
}

function StreamCard({ post }) {
  if (post.type === "essay") {
    return (
      <a className="card card-essay" href={`#/essay/${post.id}`}>
        <div className="card-kicker">
          <span className="type-tag">Article</span>
          <span>{fmtDate(post.date)} · {post.readMin} min</span>
        </div>
        <h3 className="card-title">{post.title}</h3>
        <p className="card-body">{post.excerpt}</p>
      </a>
    );
  }
  if (post.type === "note") {
    return (
      <a className="card card-note" href={`#/note/${post.id}`}>
        <div className="card-kicker">
          <span className="type-tag">Note</span>
          <span>{fmtDate(post.date, {withTime:true})}</span>
        </div>
        <p className="card-body">{post.body}</p>
      </a>
    );
  }
  if (post.type === "link") {
    return (
      <a className="card card-link" href={`#/link/${post.id}`}>
        <div className="card-kicker">
          <span className="type-tag">Link</span>
          <span>{fmtDate(post.date)}</span>
        </div>
        <h3 className="card-title">{post.title}</h3>
        <div className="source">→ {post.source}</div>
        <p className="card-body">{post.body}</p>
      </a>
    );
  }
  if (post.type === "snippet") {
    return (
      <a className="card card-snippet" href={`#/snippet/${post.id}`}>
        <div className="card-kicker">
          <span className="type-tag">Snippet · {post.language}</span>
          <span>{fmtDate(post.date)}</span>
        </div>
        <h3 className="card-title">{post.title}</h3>
        <pre>{post.code}</pre>
        <p className="card-body">{post.body}</p>
      </a>
    );
  }
  return null;
}

// ---------- Section head ----------
function SectionHead({ title, count, right }) {
  return (
    <div className="section-head">
      <h2>{title}</h2>
      {right ? right : <span className="count">{count}</span>}
    </div>
  );
}

// Export to window
Object.assign(window, {
  fmtDate, fmtDateShort,
  Nav, Footer,
  FeaturedCard, StreamCard, SectionHead,
});
