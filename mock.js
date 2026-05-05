const creators = [
  {
    name: "Luna Rivera",
    username: "lunarivera",
    initials: "LR",
    score: 428,
    followers: "18.4K"
  },
  {
    name: "Nova Beats",
    username: "novabeats",
    initials: "NB",
    score: 391,
    followers: "12.9K"
  },
  {
    name: "Kai Visuals",
    username: "kaivisuals",
    initials: "KV",
    score: 344,
    followers: "9.7K"
  },
  {
    name: "Mia Studio",
    username: "miastudio",
    initials: "MS",
    score: 311,
    followers: "8.2K"
  }
];

const posts = [
  {
    author: "Luna Rivera",
    username: "lunarivera",
    initials: "LR",
    time: "12 min ago",
    body: "Dropped a new creator pack today. Early supporters are moving first — momentum is everything."
  },
  {
    author: "Nova Beats",
    username: "novabeats",
    initials: "NB",
    time: "28 min ago",
    body: "Audience growth feels different when the platform rewards consistency, taste and public traction."
  },
  {
    author: "Kai Visuals",
    username: "kaivisuals",
    initials: "KV",
    time: "1 hr ago",
    body: "Testing a new visual series this week. If the engagement holds, this becomes the next content lane."
  }
];

function sparkPoints(score) {
  const base = Math.max(20, Math.min(84, score / 5));
  return [
    `0,${90 - base}`,
    `22,${80 - base * .8}`,
    `44,${92 - base}`,
    `66,${74 - base * .7}`,
    `90,${85 - base}`
  ].join(" ");
}

function renderStories() {
  return creators.map(c => `
    <div class="story">
      <div class="story-ring">
        <div class="story-avatar">${c.initials}</div>
      </div>
      <div class="story-name">${c.username}</div>
    </div>
  `).join("");
}

function renderFeed() {
  return posts.map(p => `
    <article class="feed-card">
      <div class="feed-head">
        <div class="avatar">${p.initials}</div>
        <div>
          <div class="feed-name">${p.author}</div>
          <div class="feed-meta">@${p.username} · ${p.time}</div>
        </div>
      </div>

      <div class="feed-text">${p.body}</div>

      <div class="feed-actions">
        <button>Like</button>
        <button>Comment</button>
        <button>Share</button>
      </div>
    </article>
  `).join("");
}

function renderTrends() {
  return creators.map(c => `
    <div class="trend-card">
      <div>
        <div class="trend-name">${c.name}</div>
        <div class="trend-symbol">@${c.username}</div>
      </div>

      <svg class="spark" viewBox="0 0 90 70" preserveAspectRatio="none">
        <polyline points="${sparkPoints(c.score)}"></polyline>
      </svg>

      <div class="trend-score">▲ ${c.score}</div>
    </div>
  `).join("");
}

function renderCreators() {
  return creators.map(c => `
    <div class="creator-card">
      <div class="avatar">${c.initials}</div>
      <div class="creator-info">
        <div class="creator-name">${c.name}</div>
        <div class="creator-handle">@${c.username} · ${c.followers}</div>
      </div>
      <button class="btn-secondary">Follow</button>
    </div>
  `).join("");
}

function renderMock() {
  document.getElementById("mockApp").innerHTML = `
    <div class="mock-shell">

      <aside class="sidebar">
        <div class="logo">
          <div class="logo-badge">X</div>
          <div>EarnX</div>
        </div>

        <nav class="nav">
          <button class="active">Home</button>
          <button>Discover</button>
          <button>Messages</button>
          <button>Wallet</button>
          <button>Profile</button>
        </nav>
      </aside>

      <main class="main">
        <section class="hero">
          <div class="hero-kicker">Creator Market</div>
          <div class="hero-title">Move with momentum.</div>
          <div class="hero-copy">
            EarnX blends creator discovery, social content and market-style rankings into one premium experience.
          </div>
        </section>

        <div class="section-title">Stories</div>
        <section class="stories">
          ${renderStories()}
        </section>

        <section class="composer card">
          <textarea placeholder="Share a drop, idea, win or creator update..."></textarea>
          <div class="action-row">
            <div class="muted">Audience momentum starts with consistency.</div>
            <button class="btn-primary">Publish post</button>
          </div>
        </section>

        <div class="section-title">Following Feed</div>
        <section class="feed">
          ${renderFeed()}
        </section>
      </main>

      <aside class="rightbar">
        <div class="wallet-pill">
          <div class="muted">Creator Wallet</div>
          <div class="wallet-amount">$2,840.00</div>
          <div class="muted">Projected creator earnings</div>
        </div>

        <div class="section-title">Market Trends</div>
        <div class="trends">
          ${renderTrends()}
        </div>

        <div class="section-title">Rising Creators</div>
        <div class="creator-list">
          ${renderCreators()}
        </div>
      </aside>

    </div>
  `;
}

renderMock();
