const STORAGE_KEY = "earnx_clean_frontend_v1";

const initialState = {
  sessionUser: null,
  theme: "dark",
  authView: "login",
  appView: "home",
  settingsTab: "preferences",
  users: [
    {
      id: "u1",
      displayName: "Rafael Amaral",
      username: "rafa",
      email: "rafa@test.com",
      password: "1234",
      bio: "Building EARNX into a premium creator platform.",
      country: "PR",
      category: "creator",
      verified: true,
      avatarUrl: "",
      coverUrl: ""
    }
  ]
};

let state = loadState();

document.addEventListener("DOMContentLoaded", () => {
  applyTheme();
  render();
});

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...initialState };
    const parsed = JSON.parse(raw);
    return {
      ...initialState,
      ...parsed
    };
  } catch (err) {
    return { ...initialState };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function applyTheme() {
  document.body.classList.remove("dark-theme", "light-theme", "pink-theme");
  document.body.classList.add(`${state.theme}-theme`);
}

function toggleTheme() {
  const themes = ["dark", "light", "pink"];
  const index = themes.indexOf(state.theme);
  state.theme = themes[(index + 1) % themes.length];
  saveState();
  applyTheme();
  render();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getInitials(name) {
  const safe = String(name || "").trim();
  if (!safe) return "?";
  return safe
    .split(/\s+/)
    .map(part => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function currentUser() {
  return state.users.find(user => user.id === state.sessionUser) || null;
}

function renderAvatar(user, extraClass = "") {
  const initials = getInitials(user?.displayName || user?.username || "U");

  if (user?.avatarUrl) {
    return `
      <div class="avatar ${extraClass}">
        <img class="avatar-img" src="${escapeHtml(user.avatarUrl)}" alt="${escapeHtml(initials)}" />
      </div>
    `;
  }

  return `<div class="avatar ${extraClass}">${escapeHtml(initials)}</div>`;
}

function login(email, password) {
  const safeEmail = email.trim().toLowerCase();
  const safePassword = password.trim();

  const found = state.users.find(
    user =>
      user.email.toLowerCase() === safeEmail &&
      user.password === safePassword
  );

  if (!found) {
    alert("Invalid credentials");
    return;
  }

  state.sessionUser = found.id;
  state.appView = "home";
  saveState();
  render();
}

function signup({ displayName, username, email, password }) {
  const safeDisplayName = displayName.trim();
  const safeUsername = username.trim().toLowerCase();
  const safeEmail = email.trim().toLowerCase();
  const safePassword = password.trim();

  if (!safeDisplayName || !safeUsername || !safeEmail || !safePassword) {
    alert("Complete all fields");
    return;
  }

  const exists = state.users.find(
    user =>
      user.email.toLowerCase() === safeEmail ||
      user.username.toLowerCase() === safeUsername
  );

  if (exists) {
    alert("Email or username already exists");
    return;
  }

  state.users.push({
    id: `u${Date.now()}`,
    displayName: safeDisplayName,
    username: safeUsername,
    email: safeEmail,
    password: safePassword,
    bio: "New creator on EARNX.",
    country: "PR",
    category: "creator",
    verified: false,
    avatarUrl: "",
    coverUrl: ""
  });

  state.authView = "login";
  saveState();
  render();
  alert("Account created. Now login.");
}

function logout() {
  state.sessionUser = null;
  state.authView = "login";
  state.appView = "home";
  saveState();
  render();
}

function setAuthView(view) {
  state.authView = view;
  saveState();
  render();
}

function setAppView(view) {
  state.appView = view;
  saveState();
  render();
}

function setSettingsTab(tab) {
  state.settingsTab = tab;
  saveState();
  render();
}

function render() {
  const app = document.getElementById("app");
  if (!app) return;

  if (!state.sessionUser) {
    app.innerHTML = renderAuthShell();
  } else {
    app.innerHTML = renderAppShell();
  }

  bindEvents();
}

function renderAuthShell() {
  return `
    <main class="page">
      <section class="shell">
        <div class="brand">
          <div class="brand-icon">X</div>
          <div class="brand-copy">
            <h1>EarnX</h1>
            <p>Creator economy platform</p>
          </div>
        </div>

        <div class="intro">
          <h2>A premium social platform built around creator ambition, audience reach, and public ranking momentum.</h2>
          <p>Designed for creators who want stronger positioning, cleaner monetization, and a product that feels elevated from the first touch.</p>
          <div class="slogan">
            <span class="slogan-pill">Build.</span>
            <span class="slogan-pill">Create.</span>
            <span class="slogan-pill">Own.</span>
          </div>
        </div>

        ${state.authView === "login" ? renderLoginCard() : renderSignupCard()}
      </section>
    </main>
  `;
}

function renderLoginCard() {
  return `
    <div class="card">
      <h3>Login</h3>
      <p class="card-sub">Enter your creator account.</p>

      <form id="loginForm">
        <div class="field">
          <label class="label" for="loginEmail">Email</label>
          <input class="input" id="loginEmail" type="email" placeholder="you@example.com" />
        </div>

        <div class="field">
          <label class="label" for="loginPassword">Password</label>
          <input class="input" id="loginPassword" type="password" placeholder="••••••••" />
        </div>

        <button class="button" type="submit">Login</button>
      </form>

      <div class="links">
        <a href="#" id="goSignup">Create account</a>
        <a href="#" id="themeToggleLink">Theme: ${escapeHtml(state.theme)}</a>
      </div>
    </div>
  `;
}

function renderSignupCard() {
  return `
    <div class="card">
      <h3>Create account</h3>
      <p class="card-sub">Start building your EARNX identity.</p>

      <form id="signupForm">
        <div class="field">
          <label class="label" for="signupDisplayName">Display name</label>
          <input class="input" id="signupDisplayName" type="text" placeholder="Your name" />
        </div>

        <div class="field">
          <label class="label" for="signupUsername">Username</label>
          <input class="input" id="signupUsername" type="text" placeholder="username" />
        </div>

        <div class="field">
          <label class="label" for="signupEmail">Email</label>
          <input class="input" id="signupEmail" type="email" placeholder="you@example.com" />
        </div>

        <div class="field">
          <label class="label" for="signupPassword">Password</label>
          <input class="input" id="signupPassword" type="password" placeholder="••••••••" />
        </div>

        <button class="button" type="submit">Create account</button>
      </form>

      <div class="links">
        <a href="#" id="goLogin">Back to login</a>
        <a href="#" id="themeToggleLink">Theme: ${escapeHtml(state.theme)}</a>
      </div>
    </div>
  `;
}

function renderAppShell() {
  return `
    <div class="app-shell app-shell-mobile">
      <main class="page-content page-content-mobile">
        ${renderPage()}
      </main>
      ${renderNav()}
    </div>
  `;
}

function renderNav() {
  const items = [
    { key: "home", label: "Home", icon: "⌂" },
    { key: "discover", label: "Discover", icon: "⌕" },
    { key: "messages", label: "Messages", icon: "✉" },
    { key: "profile", label: "Profile", icon: "◉" },
    { key: "wallet", label: "Wallet", icon: "$" }
  ];

  return `
    <nav class="bottom-nav">
      ${items
        .map(
          item => `
            <button
              class="bottom-nav-btn ${state.appView === item.key ? "active" : ""}"
              data-nav="${item.key}"
              aria-label="${item.label}"
            >
              <span class="bottom-nav-icon-wrap">
                <span class="bottom-nav-icon">${item.icon}</span>
              </span>
              <span class="bottom-nav-label">${item.label}</span>
            </button>
          `
        )
        .join("")}
    </nav>
  `;
}

function renderPage() {
  switch (state.appView) {
    case "discover":
      return renderDiscover();
    case "messages":
      return renderMessages();
    case "profile":
      return renderProfile();
    case "wallet":
      return renderWallet();
    case "settings":
      return renderSettings();
    case "home":
    default:
      return renderHome();
  }
}

function renderHome() {
  const me = currentUser();

  return `
    <section class="hero-home">
      <div class="hero-home-copy">
        <div class="page-kicker">EarnX</div>
        <h2>Build. Create. Own.</h2>
        <p>Premium creator infrastructure for content, discovery, messaging, subscriptions, and audience momentum.</p>
      </div>

      <div class="hero-actions">
        <button class="btn btn-primary" data-nav="profile">Open profile</button>
        <button class="btn btn-secondary" data-nav="settings">Settings</button>
      </div>
    </section>

    <section class="section">
      <div class="section-head">
        <h3>Welcome back</h3>
        <span class="section-meta">${escapeHtml(me?.displayName || "Creator")}</span>
      </div>

      <div class="top5-grid">
        <article class="top5-card">
          <div class="top5-rank">#1</div>
          <div class="top5-user">
            ${renderAvatar(me, "avatar-md")}
            <div>
              <div class="top5-name">${escapeHtml(me?.displayName || "User")}</div>
              <div class="top5-handle">@${escapeHtml(me?.username || "creator")} · ${escapeHtml(me?.category || "creator")}</div>
            </div>
          </div>
          <div class="top5-stats">
            <span class="chip">Real account</span>
            <span class="chip">${escapeHtml(me?.country || "PR")}</span>
            <span class="chip">${me?.verified ? "Verified" : "Creator"}</span>
          </div>
        </article>
      </div>
    </section>

    <section class="section">
      <div class="section-head">
        <h3>Feed</h3>
        <span class="section-meta">Stable clean build</span>
      </div>

      <div class="feed-list">
        <article class="post-card">
          <div class="post-head">
            ${renderAvatar(me)}
            <div class="name-block">
              <div class="name-line">
                <h4>${escapeHtml(me?.displayName || "User")}</h4>
                ${me?.verified ? `<span class="badge badge-ambassador">Verified</span>` : ""}
              </div>
              <div class="handle">@${escapeHtml(me?.username || "creator")} · ${escapeHtml(me?.country || "PR")}</div>
            </div>
          </div>

          <div class="post-content">
            Your frontend has been rebuilt on a clean stable base. This is the correct point to reconnect real backend data later.
          </div>

          <div class="post-footer">
            <div class="post-reactions">
              <button class="reaction-btn">❤️ <span>0</span></button>
              <button class="reaction-btn">💬 <span>0</span></button>
            </div>
          </div>
        </article>
      </div>
    </section>
  `;
}

function renderDiscover() {
  const me = currentUser();

  return `
    <div class="topbar">
      <div class="topbar-row">
        <div>
          <span class="page-kicker">Discover</span>
          <h1 class="page-title">Discover creators</h1>
          <p class="page-subtitle">Browse positioning, profile presence, and creator identity.</p>
        </div>
      </div>
    </div>

    <section class="section">
      <div class="section-head">
        <h3>Creator browser</h3>
        <span class="section-meta">Local stable data</span>
      </div>

      <div class="list">
        <article class="creator-card">
          <div class="creator-head">
            ${renderAvatar(me, "avatar-md")}
            <div class="name-block">
              <div class="name-line">
                <h4>${escapeHtml(me?.displayName || "User")}</h4>
                ${me?.verified ? `<span class="badge badge-ambassador">Verified</span>` : ""}
              </div>
              <div class="handle">@${escapeHtml(me?.username || "creator")} · ${escapeHtml(me?.category || "creator")}</div>
            </div>
          </div>

          <div class="creator-bio">${escapeHtml(me?.bio || "No bio yet.")}</div>

          <div class="post-actions">
            <span class="chip">Discoverable</span>
            <span class="chip">${escapeHtml(me?.country || "PR")}</span>
            <span class="chip">${escapeHtml(me?.category || "creator")}</span>
          </div>

          <div class="creator-actions" style="margin-top:14px;">
            <button class="btn btn-secondary" data-nav="profile">View profile</button>
          </div>
        </article>
      </div>
    </section>
  `;
}

function renderMessages() {
  return `
    <div class="topbar">
      <div>
        <span class="page-kicker">Messages</span>
        <h1 class="page-title">Inbox</h1>
        <p class="page-subtitle">Private communication layer coming next.</p>
      </div>
    </div>

    <div class="messages-shell">
      <section class="inbox-panel">
        <div class="inbox-head">
          <div>
            <h3>Conversations</h3>
            <p class="page-subtitle">0 active chats</p>
          </div>
        </div>

        <div class="inbox-empty">
          <div class="inbox-empty-icon">💬</div>
          <h3>Your inbox is quiet</h3>
          <p>Messaging UI is stable and ready for real threads later.</p>
        </div>
      </section>

      <section class="chat-panel">
        <div class="inbox-empty">
          <div class="inbox-empty-icon">✉️</div>
          <h3>Select a conversation</h3>
          <p>This area is reserved for future live chats.</p>
        </div>
      </section>
    </div>
  `;
}

function renderProfile() {
  const me = currentUser();

  return `
    <section class="panel">
      <div class="profile-cover-zone">
        <div class="profile-cover-bg profile-cover-default"></div>

        <div class="profile-avatar-anchor">
          ${renderAvatar(me, "avatar-xl")}
          ${me?.verified ? `<span class="verified-checkmark">✓</span>` : ""}
        </div>
      </div>

      <div class="profile-identity-block">
        <div class="profile-name-area">
          <div>
            <h2 class="profile-display-name">${escapeHtml(me?.displayName || "User")}</h2>
            <div class="handle">@${escapeHtml(me?.username || "unknown")} · ${escapeHtml(me?.country || "PR")}</div>
          </div>

          <div class="profile-rank-col">
            <span class="chip">Profile</span>
          </div>
        </div>

        <p class="profile-bio-text">${escapeHtml(me?.bio || "No bio yet.")}</p>
        <div class="category-chip">${escapeHtml(me?.category || "creator")}</div>

        <div class="profile-stats-bar">
          <div class="pstat">
            <strong>0</strong>
            <span>Followers</span>
          </div>
          <div class="pstat-divider"></div>
          <div class="pstat">
            <strong>0</strong>
            <span>Following</span>
          </div>
          <div class="pstat-divider"></div>
          <div class="pstat">
            <strong>0</strong>
            <span>Posts</span>
          </div>
        </div>

        <div class="profile-action-row" style="margin-top:18px;">
          <button class="btn btn-primary" data-nav="settings">Edit profile</button>
          <button class="btn btn-secondary" data-nav="wallet">Creator wallet</button>
        </div>

        <div class="profile-tabs" style="margin-top:22px;">
          <div class="profile-tab active">Posts</div>
          <div class="profile-tab">Media</div>
          <div class="profile-tab">Premium</div>
        </div>

        <div class="feed-list" style="margin-top:18px;">
          <div class="profile-empty">
            <h3>No posts yet</h3>
            <p>This profile is stable and ready for backend connection.</p>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderWallet() {
  const me = currentUser();

  return `
    <div class="wallet-shell">
      <section class="wallet-hero">
        <div class="wallet-hero-top">
          <div>
            <div class="wallet-kicker">Wallet</div>
            <div class="wallet-balance-label">Available balance</div>
            <h1 class="wallet-balance">$0</h1>
            <div class="wallet-balance-sub">Financial layer ready for future data model.</div>
          </div>

          <div class="wallet-action-row">
            <button class="btn btn-primary">Withdraw</button>
            <button class="btn btn-secondary" data-nav="settings">Settings</button>
          </div>
        </div>
      </section>

      <section class="wallet-grid">
        <div class="wallet-card wallet-card-positive">
          <div class="wallet-card-label">Available</div>
          <h3 class="wallet-card-value">$0</h3>
          <div class="wallet-card-meta">Ready to use</div>
        </div>

        <div class="wallet-card">
          <div class="wallet-card-label">Pending</div>
          <h3 class="wallet-card-value">$0</h3>
          <div class="wallet-card-meta">Awaiting release</div>
        </div>

        <div class="wallet-card wallet-card-warning">
          <div class="wallet-card-label">Reserved</div>
          <h3 class="wallet-card-value">$0</h3>
          <div class="wallet-card-meta">Protected balance</div>
        </div>

        <div class="wallet-card">
          <div class="wallet-card-label">Paid out</div>
          <h3 class="wallet-card-value">$0</h3>
          <div class="wallet-card-meta">Lifetime payouts</div>
        </div>
      </section>

      <section class="wallet-panels">
        <div class="wallet-panel">
          <div class="wallet-panel-head">
            <div>
              <h3>Recent activity</h3>
              <p class="page-subtitle">Latest movements</p>
            </div>
          </div>

          <div class="wallet-activity-list">
            <div class="inbox-empty">
              <div class="wallet-activity-icon">💸</div>
              <h3>No transactions yet</h3>
              <p>${escapeHtml(me?.displayName || "User")} is ready for wallet data later.</p>
            </div>
          </div>
        </div>

        <div class="wallet-panel">
          <div class="wallet-panel-head">
            <div>
              <h3>Revenue summary</h3>
              <p class="page-subtitle">Quick overview</p>
            </div>
          </div>

          <div class="revenue-summary">
            <div class="revenue-pill-row">
              <span class="revenue-pill">Stable UI</span>
              <span class="revenue-pill">Wallet ready</span>
              <span class="revenue-pill">No backend errors</span>
            </div>

            <div class="revenue-visual">
              This section is ready for metrics once the data layer is connected.
            </div>
          </div>
        </div>
      </section>
    </div>
  `;
}

function renderSettings() {
  return `
    <div class="settings-shell">
      <aside class="settings-nav">
        <button class="settings-nav-btn ${state.settingsTab === "preferences" ? "active" : ""}" data-settings-tab="preferences">Preferences</button>
        <button class="settings-nav-btn ${state.settingsTab === "account" ? "active" : ""}" data-settings-tab="account">Account</button>
      </aside>

      <section class="settings-main">
        ${renderSettingsContent()}
      </section>
    </div>
  `;
}

function renderSettingsContent() {
  const me = currentUser();

  if (state.settingsTab === "preferences") {
    return `
      <div class="settings-section">
        <div class="settings-section-head">
          <h3>Preferences</h3>
          <p>Adjust how the product feels and behaves.</p>
        </div>

        <div class="settings-row">
          <div>
            <div class="settings-row-title">Theme</div>
            <div class="settings-row-sub">Switch between dark, light, and pink mode.</div>
          </div>
          <div>
            <button class="btn btn-secondary" id="themeToggleBtn">Theme: ${escapeHtml(state.theme)}</button>
          </div>
        </div>
      </div>
    `;
  }

  return `
    <div class="settings-section">
      <div class="settings-section-head">
        <h3>Account</h3>
        <p>Review your stable local account.</p>
      </div>

      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">Email</label>
          <input class="settings-field" value="${escapeHtml(me?.email || "")}" readonly />
        </div>

        <div class="form-group">
          <label class="form-label">Username</label>
          <input class="settings-field" value="${escapeHtml(me?.username || "")}" readonly />
        </div>
      </div>

      <div class="soft-divider"></div>

      <div class="account-card">
        <div class="account-card-title">Account status</div>
        <div class="account-card-sub">This clean frontend version is working correctly.</div>
      </div>

      <div class="hero-actions" style="margin-top:18px;">
        <button class="btn btn-secondary" id="logoutBtn">Logout</button>
      </div>
    </div>
  `;
}

function bindEvents() {
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", event => {
      event.preventDefault();
      login(
        document.getElementById("loginEmail").value,
        document.getElementById("loginPassword").value
      );
    });
  }

  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    signupForm.addEventListener("submit", event => {
      event.preventDefault();
      signup({
        displayName: document.getElementById("signupDisplayName").value,
        username: document.getElementById("signupUsername").value,
        email: document.getElementById("signupEmail").value,
        password: document.getElementById("signupPassword").value
      });
    });
  }

  const goSignup = document.getElementById("goSignup");
  if (goSignup) {
    goSignup.addEventListener("click", event => {
      event.preventDefault();
      setAuthView("signup");
    });
  }

  const goLogin = document.getElementById("goLogin");
  if (goLogin) {
    goLogin.addEventListener("click", event => {
      event.preventDefault();
      setAuthView("login");
    });
  }

  const themeToggleLink = document.getElementById("themeToggleLink");
  if (themeToggleLink) {
    themeToggleLink.addEventListener("click", event => {
      event.preventDefault();
      toggleTheme();
    });
  }

  const themeToggleBtn = document.getElementById("themeToggleBtn");
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", toggleTheme);
  }

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }

  document.querySelectorAll("[data-nav]").forEach(button => {
    button.addEventListener("click", () => {
      setAppView(button.dataset.nav);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  document.querySelectorAll("[data-settings-tab]").forEach(button => {
    button.addEventListener("click", () => {
      setSettingsTab(button.dataset.settingsTab);
    });
  });
}
