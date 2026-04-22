// Page components for The Mindful Engineer

const { useState: useState2, useEffect: useEffect2, useMemo: useMemo2, useRef: useRef2 } = React;

// ---------- Home ----------
function HomePage() {
  const featured = POSTS.filter(p => p.type === "essay" && p.featured);
  const stream = POSTS.filter(p => !(p.type === "essay" && p.featured))
    .sort((a,b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="container">
      <section className="hero">
        <DaVinciGeometry />
        <div className="hero-kicker">
          <span>mindful.engineer · a working notebook</span>
        </div>
        <h1 className="hero-title full-width" style={{whiteSpace: "nowrap", fontSize: "clamp(36px, 5.2vw, 60px)"}}>
          Moving fast. <em>Being Present.</em>
        </h1>
        <p className="hero-sub">
          A working notebook by Benjamin Kitt — articles, notes, and fragments on
          shipping software quickly, choosing intentionally, and caring about the
          people along for the ride.
        </p>
        <div className="hero-meta">
          <span>articles <strong>{POSTS.filter(p=>p.type==="essay").length}</strong></span>
          <span>notes <strong>{POSTS.filter(p=>p.type==="note").length}</strong></span>
          <span>links <strong>{POSTS.filter(p=>p.type==="link").length}</strong></span>
          <span>snippets <strong>{POSTS.filter(p=>p.type==="snippet").length}</strong></span>
        </div>
      </section>

      <SectionHead title="Featured writing" count={`${featured.length} articles`} />
      <div className="featured-grid">
        {featured.map(p => <FeaturedCard key={p.id} post={p} />)}
      </div>

      <SectionHead
        title="Recent stream"
        right={<a href="#/archive" className="micro" style={{textDecoration:"none"}}>View archive →</a>}
      />
      <div className="stream">
        {stream.map(p => <StreamCard key={p.id} post={p} />)}
      </div>
    </div>
  );
}

// ---------- Essays (list) ----------
function EssaysPage() {
  const essays = POSTS.filter(p => p.type === "essay")
    .sort((a,b) => new Date(b.date) - new Date(a.date));
  return (
    <div className="container">
      <section className="hero" style={{paddingTop:"var(--s-5)", paddingBottom:"var(--s-6)"}}>
        <DaVinciCodex />
        <div className="hero-kicker"><span>collected · articles</span></div>
        <h1 className="hero-title" style={{fontSize:"clamp(32px,4.5vw,52px)"}}>Articles</h1>
        <p className="hero-sub">Longer pieces. Published when they're ready, not to a schedule.</p>
      </section>
      <div className="featured-grid">
        {essays.map(p => <FeaturedCard key={p.id} post={p} />)}
      </div>
    </div>
  );
}

// ---------- Notes (list) ----------
function NotesPage() {
  const notes = POSTS.filter(p => p.type === "note" || p.type === "link")
    .sort((a,b) => new Date(b.date) - new Date(a.date));
  return (
    <div className="container">
      <section className="hero" style={{paddingTop:"var(--s-5)", paddingBottom:"var(--s-6)"}}>
        <DaVinciFragments />
        <div className="hero-kicker"><span>short-form · notes & links</span></div>
        <h1 className="hero-title" style={{fontSize:"clamp(32px,4.5vw,52px)"}}>Notes & fragments</h1>
        <p className="hero-sub">Small thoughts, in their original size. Roughly daily, sometimes not.</p>
      </section>
      <div className="notes-grid">
        {notes.map(n => (
          <a key={n.id} href={`#/${n.type}/${n.id}`} className="note-row">
            <div className="date">
              {fmtDateShort(n.date)}<br/>
              <span style={{color:"var(--c-ink-mute)"}}>{new Date(n.date).getFullYear()}</span>
              <br/><span className="micro" style={{letterSpacing:"0.12em", marginTop:4, display:"inline-block"}}>{n.type}</span>
            </div>
            <div className="note-text">
              {n.type === "link" ? (
                <>
                  <div style={{fontFamily:"var(--ff-mono)", fontSize:"var(--fs-ui)", color:"var(--c-ink-mute)", marginBottom:6}}>→ {n.source}</div>
                  <div style={{fontWeight:500, marginBottom:6}}>{n.title}</div>
                  <div style={{color:"var(--c-ink-soft)"}}>{n.body}</div>
                </>
              ) : (
                <em style={{fontStyle:"italic"}}>{n.body}</em>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

// ---------- Essay detail ----------
function EssayPage({ id }) {
  const post = POSTS.find(p => p.id === id && p.type === "essay");
  const bodyRef = useRef2(null);
  const [progress, setProgress] = useState2(0);

  useEffect2(() => {
    function onScroll() {
      if (!bodyRef.current) return;
      const el = bodyRef.current;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight + rect.top + window.scrollY;
      const done = Math.min(1, Math.max(0, window.scrollY / Math.max(1, total)));
      setProgress(done * 100);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [id]);

  useEffect2(() => { window.scrollTo(0,0); }, [id]);

  if (!post) return <div className="container"><p>Not found.</p></div>;

  const essays = POSTS.filter(p=>p.type==="essay").sort((a,b)=>new Date(b.date)-new Date(a.date));
  const idx = essays.findIndex(e=>e.id===id);
  const prev = essays[idx+1];
  const next = essays[idx-1];

  return (
    <div className="container">
      <div className="progress-bar" style={{width: progress+"%"}}></div>

      <header className="essay-header">
        <div className="essay-kicker">
          <span>Article</span>
          <span>·</span>
          <span>{fmtDate(post.date)}</span>
          <span>·</span>
          <span>{post.readMin} minute read</span>
        </div>
        <h1 className="essay-title">{post.title}</h1>
        <p className="essay-sub">{post.subtitle}</p>
        <div className="essay-meta">
          <span>Benjamin Kitt</span>
          <span>Filed under: {(post.tags||[]).join(", ")}</span>
        </div>
      </header>

      <article className="essay-body" ref={bodyRef}>
        {post.body.map((b, i) => {
          if (b.k === "p") return <p key={i}>{b.t}</p>;
          if (b.k === "h2") return <h2 key={i}>{b.t}</h2>;
          if (b.k === "pull") return <blockquote key={i} className="pullquote">“{b.t}”</blockquote>;
          if (b.k === "ol") return <ol key={i}>{b.items.map((it,j)=><li key={j}>{it}</li>)}</ol>;
          return null;
        })}
        <div className="essay-end">◇   ◇   ◇</div>
      </article>

      <footer className="essay-footer">
        <div className="essay-nav">
          {prev ? (
            <a href={`#/essay/${prev.id}`}>
              <div className="dir">← Previous</div>
              <h4>{prev.title}</h4>
            </a>
          ) : <div/>}
        </div>
        <div className="essay-nav next">
          {next ? (
            <a href={`#/essay/${next.id}`}>
              <div className="dir">Next →</div>
              <h4>{next.title}</h4>
            </a>
          ) : <div/>}
        </div>
      </footer>
    </div>
  );
}

// ---------- Note / Link / Snippet detail ----------
function SingleItemPage({ id, type }) {
  const post = POSTS.find(p => p.id === id);
  if (!post) return <div className="container"><p>Not found.</p></div>;
  useEffect2(() => { window.scrollTo(0,0); }, [id]);

  return (
    <div className="container">
      <div className="essay-header" style={{maxWidth: "var(--measure-narrow)"}}>
        <div className="essay-kicker">
          <span>{type}</span>
          <span>·</span>
          <span>{fmtDate(post.date, {withTime: type==="note"})}</span>
          {post.language && <><span>·</span><span>{post.language}</span></>}
        </div>
        {post.title && <h1 className="essay-title" style={{fontSize:"clamp(28px,4vw,42px)"}}>{post.title}</h1>}
      </div>
      <div className="essay-body" style={{maxWidth:"var(--measure-narrow)"}}>
        {type === "note" && (
          <p style={{fontSize:26, lineHeight:1.45, fontStyle:"italic"}}>{post.body}</p>
        )}
        {type === "link" && (
          <>
            <p style={{fontFamily:"var(--ff-mono)", fontSize:"var(--fs-ui)", color:"var(--c-ink-mute)"}}>
              Source · <a href={post.url || "#"}>{post.source} ↗</a>
            </p>
            <p>{post.body}</p>
          </>
        )}
        {type === "snippet" && (
          <>
            <pre style={{fontFamily:"var(--ff-mono)", fontSize:14, lineHeight:1.65, background:"var(--c-bg-soft)", border:"1px solid var(--c-rule)", padding:"var(--s-5)", overflowX:"auto", whiteSpace:"pre"}}>{post.code}</pre>
            <p>{post.body}</p>
          </>
        )}
      </div>
    </div>
  );
}

// ---------- Archive ----------
function ArchivePage() {
  const all = [...POSTS].sort((a,b)=>new Date(b.date)-new Date(a.date));
  const byYear = {};
  all.forEach(p => {
    const y = new Date(p.date).getFullYear();
    (byYear[y] = byYear[y] || []).push(p);
  });
  const years = Object.keys(byYear).sort().reverse();

  return (
    <div className="container">
      <section className="hero" style={{paddingTop:"var(--s-5)", paddingBottom:"var(--s-6)"}}>
        <DaVinciArchive />
        <div className="hero-kicker"><span>complete · archive</span></div>
        <h1 className="hero-title" style={{fontSize:"clamp(32px,4.5vw,52px)"}}>Archive</h1>
        <p className="hero-sub">Everything published, in chronological order.</p>
      </section>
      <div className="archive-table">
        {years.map(y => (
          <div key={y}>
            <div className="archive-year">§ {y} — {byYear[y].length} entries</div>
            {byYear[y].map(p => (
              <a key={p.id} href={`#/${p.type==="essay"?"essay":p.type}/${p.id}`} className="archive-row">
                <span className="archive-date">{fmtDateShort(p.date)}</span>
                <span className="archive-type">{p.type === "essay" ? "article" : p.type}</span>
                <span className="archive-title">{p.title || (p.body ? p.body.slice(0, 80) + (p.body.length > 80 ? "…" : "") : "")}</span>
                <span className="archive-read">{p.readMin ? p.readMin + " min" : ""}</span>
              </a>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- About ----------
function AboutPage() {
  return (
    <div className="container">
      <section className="hero" style={{paddingTop:"var(--s-5)", paddingBottom:"var(--s-6)"}}>
        <DaVinciVitruvian />
        <div className="hero-kicker"><span>about · colophon</span></div>
        <h1 className="hero-title" style={{fontSize:"clamp(32px,4.5vw,52px)"}}>I'm Benjamin.</h1>
        <p className="hero-sub">Tech is my passion, people are my purpose. I thrive at the intersection of both.</p>
      </section>

      <div className="about-grid">
        <div className="about-portrait">
          <span>portrait</span>
        </div>
        <div className="about-text">
          <p>
            I've been writing software professionally for fourteen years. My version
            of the craft is about velocity — shipping constantly, rewriting without
            ceremony, treating speed as a form of respect for the problem.
          </p>
          <p>
            <em>Mindful</em>, in the name, is not a counterweight to that. It is
            what makes the speed sustainable. It is the practice of staying present
            to the choices I'm making at that pace, to the people on the team who
            might feel a version behind, and to the fact that FOMO will never
            go away — so I had better learn to choose inside of it.
          </p>
          <p>
            This site is where I work that out in public. Long articles when a thought
            earns it, short notes when it doesn't. Both count.
          </p>

          <dl className="about-facts">
            <div><dt>Currently</dt><dd>Independent · Lisbon, Portugal</dd></div>
            <div><dt>Previously</dt><dd>Stripe, a compiler startup, a research lab</dd></div>
            <div><dt>Writing in</dt><dd>EB Garamond & JetBrains Mono</dd></div>
            <div><dt>Built with</dt><dd>A single handwritten HTML file</dd></div>
            <div><dt>Updated</dt><dd>Weekly-ish, never on schedule</dd></div>
            <div><dt>Contact</dt><dd>mail@mindful.engineer</dd></div>
          </dl>
        </div>
      </div>
    </div>
  );
}

// ---------- Now ----------
function NowPage() {
  return (
    <div className="container">
      <section className="hero" style={{paddingTop:"var(--s-5)", paddingBottom:"var(--s-6)"}}>
        <DaVinciHorologium />
        <div className="hero-kicker"><span>/now · updated {fmtDate(NOW.updated)}</span></div>
        <h1 className="hero-title" style={{fontSize:"clamp(32px,4.5vw,52px)"}}>What I'm doing now</h1>
        <p className="hero-sub">
          A <a href="https://nownownow.com/about" target="_blank">now page</a> in the
          tradition of Derek Sivers. A snapshot, not a statement.
        </p>
      </section>

      <div className="now-grid">
        <div className="now-block wide">
          <div className="now-label">Working on</div>
          <p>{NOW.working}</p>
        </div>
        <div className="now-block">
          <div className="now-label">Located</div>
          <p>{NOW.location}</p>
        </div>
        <div className="now-block">
          <div className="now-label">Learning</div>
          <p>{NOW.learning}</p>
        </div>
        <div className="now-block wide">
          <div className="now-label">Reading</div>
          <ul>
            {NOW.reading.map((r,i) => (
              <li key={i}>{r.title} <span className="author">— {r.author}</span></li>
            ))}
          </ul>
        </div>
        <div className="now-block wide">
          <div className="now-label">Listening</div>
          <p>{NOW.listening}</p>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  HomePage, EssaysPage, NotesPage, EssayPage, SingleItemPage,
  ArchivePage, AboutPage, NowPage,
});
