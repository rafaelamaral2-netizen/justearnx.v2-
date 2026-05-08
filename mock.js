const state = {
  view: "home",
  selectedCreator: "luna"
};

const creators = [
  {
    id: "luna",
    name: "Luna Rivera",
    username: "lunarivera",
    initials: "LR",
    category: "Lifestyle Creator",
    country: "Puerto Rico",
    bio: "Building a premium creator lane around wellness, visuals, discipline and daily momentum.",
    score: 428,
    followers: "18.4K",
    posts: 142,
    engagement: "9.8%",
    earnings: "$2.8K",
    verified: true
  },
  {
    id: "nova",
    name: "Nova Beats",
    username: "novabeats",
    initials: "NB",
    category: "Music Producer",
    country: "United States",
    bio: "Sound packs, creator drops and audience-first music experiments for the next wave.",
    score: 391,
    followers: "12.9K",
    posts: 96,
    engagement: "8.7%",
    earnings: "$1.9K",
    verified: true
  },
  {
    id: "kai",
    name: "Kai Visuals",
    username: "kaivisuals",
    initials: "KV",
    category: "Visual Artist",
    country: "Global",
    bio: "Visual direction, story systems and cinematic content for creators with ambition.",
    score: 344,
    followers: "9.7K",
    posts: 88,
    engagement: "7.4%",
    earnings: "$1.4K",
    verified: false
  },
  {
    id: "mia",
    name: "Mia Studio",
    username: "miastudio",
    initials: "MS",
    category: "Fashion Creator",
    country: "Spain",
    bio: "Fashion notes, capsule drops and creator commerce experiments with a premium edge.",
    score: 311,
    followers: "8.2K",
    posts: 75,
    engagement: "6.9%",
    earnings: "$980",
    verified: false
  }
];

const posts = [
  {
    id: "p1",
    creatorId: "luna",
    author: "Luna Rivera",
    username: "lunarivera",
    initials: "LR",
    time: "12 min ago",
    body: "Dropped a new creator pack today. Early supporters are moving first — momentum is everything."
  },
  {
    id: "p2",
    creatorId: "nova",
    author: "Nova Beats",
    username: "novabeats",
    initials: "NB",
    time: "28 min ago",
    body: "Audience growth feels different when the platform rewards consistency, taste and public traction."
  },
  {
    id: "p3",
    creatorId: "kai",
    author: "Kai Visuals",
    username: "kaivisuals",
    initials: "KV",
    time: "1 hr ago",
    body: "Testing a new visual series this week. If the engagement holds, this becomes the next content lane."
  }
];

function setView(view) {
  state.view = view;
  renderMock();
}

function openCreator(id) {
  state.selectedCreator = id;
  state.view = "profile";
  renderMock();
}

function getCreator(id) {
  return creators.find(c => c.id === id) || creators[0];
}

function sparkPoints(score) {
  const base = Math.max(20, Math.min(84, score / 5));
  return [
    `0,${90 - base}`,
    `18,${82 - base * 0.72}`,
    `36,${94 - base * 0.9}`,
    `56,${70 - base * 0.65}`,
    `74,${86 - base * 0.82}`,
    `92,${62 - base * 0.7}`
  ].join(" ");
}

function navButton(view, label) {
  return `
    <button class="${state.view === view ? "active" : ""}" onclick="setView('${view}')">
      <span class="nav-dot"></span>
      <span class="label">${label}</span>
    </button>
  `;
}

function renderSidebar() {
  return `
    <aside class="side">
      <div class="logo">
        <div class="logo-x">X</div>
        <div>EarnX</div>
      </div>

      <nav class="nav">
        ${navButton("home", "Home")}
        ${navButton("discover", "Discover")}
        ${navButton("profile", "Profile")}
      </nav>

      <div class="side-footer">
        <div class="side-footer-title">Creator Market</div>
        <div class="muted">Momentum, ranking and audience growth in one premium lane.</div>
      </div>
    </aside>
  `;
}

function renderTopbar() {
  return `
    <div class="topbar">
      <input class="search" placeholder="Search creators, drops, categories..." />
      <div class="user-chip">
        <div class="avatar">RA</div>
        <span>Rafael</span>
      </div>
    </div>
  `;
}

function renderRightbar() {
  return `
    <aside class="right">
      <div class="wallet-card">
        <div class="wallet-label">Creator Wallet</div>
        <div class="wallet-amount">$2,840</div>
        <div class="muted">Projected creator earnings</div>

        <div class="wallet-grid">
          <div class="wallet-mini">
            <strong>+18%</strong>
            <span class="muted">This week</span>
          </div>
          <div class="wallet-mini">
            <strong>42</strong>
            <span class="muted">New subs</span>
          </div>
        </div>
      </div>

      <div class="section-head">
        <div>
          <div class="section-title">Market Trends</div>
          <div class="section-sub">Creator momentum</div>
        </div>
      </div>

      <div class="trends">
        ${creators.map(renderTrendCard).join("")}
      </div>
    </aside>
  `;
}

function renderTrendCard(c) {
  return `
    <div class="trend-card" onclick="openCreator('${c.id}')">
      <div>
        <div class="trend-name">${c.name}</div>
        <div class="trend-symbol">@${c.username}</div>
      </div>

      <svg class="spark" viewBox="0 0 92 70" preserveAspectRatio="none">
        <polyline points="${sparkPoints(c.score)}"></polyline>
      </svg>

      <div class="trend-score">▲ ${c.score}</div>
    </div>
  `;
}

function renderStories() {
  const tags = ["RISING", "DROP", "HOT", "LIVE"];

  return `
    <div class="signal-strip">
      ${creators.map((c, index) => `
        <div class="signal-card" onclick="openCreator('${c.id}')">
          <div class="signal-avatar">${c.initials}</div>
          <div class="signal-tag">${tags[index % tags.length]}</div>
          <div class="signal-name">${c.name}</div>
          <div class="signal-meta">▲ ${c.score} · @${c.username}</div>
        </div>
      `).join("")}
    </div>
  `;
}

function renderStories() {
  const tags = ["RISING", "DROP", "HOT", "LIVE"];

  return `
    <div class="signal-strip">
      ${creators.map((c, index) => `
        <div class="signal-card" onclick="openCreator('${c.id}')">
          <div class="signal-avatar">${c.initials}</div>
          <div class="signal-tag">${tags[index % tags.length]}</div>
          <div class="signal-name">${c.name}</div>
          <div class="signal-meta">▲ ${c.score} · @${c.username}</div>
        </div>
      `).join("")}
    </div>
  `;
}

function renderHome() {
  return `
    <main class="main">
      ${renderTopbar()}

      <section class="hero v3">
        <div class="hero-content">
          <div class="kicker">EarnX Social Market</div>
          <div class="hero-title">Creator momentum, made visible.</div>
          <div class="hero-copy">
            A social market for creators where content, ranking, audience growth and monetization move together.
          </div>

          <div class="hero-actions">
            <button class="btn-primary" onclick="setView('discover')">Explore market</button>
            <button class="btn-secondary">Create drop</button>
          </div>
        </div>

        <div class="hero-market-card">
          <div class="hero-market-label">Market Pulse</div>
          <div class="hero-market-value">+24%</div>
          <div class="hero-market-up">Creator activity this week</div>
        </div>
      </section>

      <div class="section-head">
        <div>
          <div class="section-title">Creator Signals</div>
          <div class="section-sub">Drops, rising creators and public momentum</div>
        </div>
      </div>

      ${renderStories()}

      <section class="composer v3">
        <div class="avatar">RA</div>
        <div>
          <textarea placeholder="Share a drop, idea, win or creator update..."></textarea>

          <div class="composer-tools">
            <button class="tool-pill">Drop</button>
            <button class="tool-pill">Milestone</button>
            <button class="tool-pill">Behind the scenes</button>
            <button class="tool-pill">Creator note</button>
          </div>

          <div class="composer-row">
            <div class="muted">Build momentum through consistent public updates.</div>
            <button class="btn-primary">Publish post</button>
          </div>
        </div>
      </section>

      <div class="section-head">
        <div>
          <div class="section-title">Following Feed</div>
          <div class="section-sub">A premium feed shaped by creators you follow</div>
        </div>
      </div>

      <section class="feed">
        ${posts.map(renderFeedCard).join("")}
      </section>
    </main>
  `;
}
function renderDiscover() {
  const sorted = [...creators].sort((a, b) => b.score - a.score);

  return `
    <main class="main">
      ${renderTopbar()}

      <section class="hero">
        <div class="hero-content">
          <div class="kicker">Discover</div>
          <div class="hero-title">Creator market board.</div>
          <div class="hero-copy">
            Find rising creators, compare momentum and follow the creators building public traction.
          </div>
        </div>
      </section>

      <div class="section-head">
        <div>
          <div class="section-title">Market Momentum</div>
          <div class="section-sub">Minimal trend board inspired by market movement</div>
        </div>
      </div>

      <div class="trends" style="margin-bottom:18px;">
        ${sorted.map(renderTrendCard).join("")}
      </div>

      <div class="section-head">
        <div>
          <div class="section-title">Rising Creators</div>
          <div class="section-sub">Follow talent before they break out</div>
        </div>
      </div>

      <section class="discover-grid">
        ${sorted.map(renderCreatorCard).join("")}
      </section>
    </main>
  `;
}

function renderCreatorCard(c) {
  return `
    <div class="creator-card">
      <div class="creator-top" onclick="openCreator('${c.id}')">
        <div class="avatar">${c.initials}</div>
        <div>
          <div class="creator-name">${c.name}</div>
          <div class="creator-handle">@${c.username}</div>
        </div>
      </div>

      <div class="creator-bio">${c.bio}</div>

      <div class="creator-stats">
        <div class="creator-stat">
          <strong>${c.followers}</strong>
          <span>Followers</span>
        </div>
        <div class="creator-stat">
          <strong>${c.posts}</strong>
          <span>Posts</span>
        </div>
        <div class="creator-stat">
          <strong>${c.score}</strong>
          <span>Score</span>
        </div>
      </div>

      <button class="btn-primary" style="width:100%;">Follow</button>
    </div>
  `;
}

function renderProfile() {
  const c = getCreator(state.selectedCreator);
  const creatorPosts = posts.filter(p => p.creatorId === c.id);

  return `
    <main class="main">
      ${renderTopbar()}

      <section class="profile-card">
        <div class="profile-cover"></div>

        <div class="profile-body">
          <div class="profile-avatar">${c.initials}</div>

          <div class="profile-title">${c.name}</div>
          <div class="profile-handle">@${c.username}</div>

          <p class="profile-bio">${c.bio}</p>

          <div class="profile-stats">
            <div class="profile-stat">
              <strong>${c.followers}</strong>
              <span>Followers</span>
            </div>
            <div class="profile-stat">
              <strong>${c.posts}</strong>
              <span>Posts</span>
            </div>
            <div class="profile-stat">
              <strong>${c.engagement}</strong>
              <span>Engagement</span>
            </div>
            <div class="profile-stat">
              <strong>${c.earnings}</strong>
              <span>Earnings</span>
            </div>
          </div>

          <div class="hero-actions">
            <button class="btn-primary">Follow creator</button>
            <button class="btn-secondary" onclick="setView('discover')">Back to Discover</button>
          </div>
        </div>
      </section>

      <div class="section-head">
        <div>
          <div class="section-title">Creator Posts</div>
          <div class="section-sub">Recent creator activity</div>
        </div>
      </div>

      <section class="feed">
        ${
          creatorPosts.length
            ? creatorPosts.map(renderFeedCard).join("")
            : `<div class="feed-card"><div class="feed-body">No posts yet from this creator.</div></div>`
        }
      </section>
    </main>
  `;
}

function renderMain() {
  if (state.view === "discover") return renderDiscover();
  if (state.view === "profile") return renderProfile();
  return renderHome();
}

function renderMock() {
  document.getElementById("mockApp").innerHTML = `
    <div class="mock-shell">
      ${renderSidebar()}
      ${renderMain()}
      ${renderRightbar()}
    </div>
  `;
}

renderMock();
