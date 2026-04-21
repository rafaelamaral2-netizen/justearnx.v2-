import { createClient } from "https://esm.sh/@supabase/supabase-js";

const supabaseUrl = "https://duyltyirtffzomrnielr.supabase.co";
const supabaseKey = "sb_publishable_Pk6U7o0UpRuYx2eMyhFWwA_3C53R32C";
const supabase = createClient(supabaseUrl, supabaseKey);

const STORAGE_KEY = "earnx_master_real_v1";

const initialUI = {
  authView: "login",
  appView: "home",
  theme: "dark",
  profileUserId: null,
  settingsTab: "preferences"
};

let state = {
  sessionUserId: null,
  session: null,
  profile: null,
  ui: { ...initialUI }
};

document.addEventListener("DOMContentLoaded", async () => {
  loadState();
  applyTheme();

  const {
    data: { session }
  } = await supabase.auth.getSession();

  state.session = session;

  if (session?.user) {
    await syncSessionIntoState(session.user);
  }

  supabase.auth.onAuthStateChange(async (_event, session) => {
    state.session = session;

    if (session?.user) {
      await syncSessionIntoState(session.user);
    } else {
      state.sessionUserId = null;
      state.profile = null;
      state.ui.authView = "login";
      state.ui.appView = "home";
      state.ui.profileUserId = null;
    }

    saveState();
    applyTheme();
    render();
  });

  render();
});

/* -------------------------
   STORAGE
------------------------- */
function saveState() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      ui: state.ui
    })
  );
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    const parsed = JSON.parse(raw);
    state.ui = {
      ...initialUI,
      ...(parsed.ui || {})
    };
  } catch (err) {
    console.warn("Could not load state", err);
  }
}

/* -------------------------
   HELPERS
------------------------- */
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
  return state.profile;
}

async function syncSessionIntoState(user) {
  const email = (user.email || "").toLowerCase();

  let profileData = null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.warn("Profile fetch failed", error.message);
  } else {
    profileData = data;
  }

  if (!profileData) {
    const fallbackProfile = {
      id: user.id,
      username: user.user_metadata?.username || email.split("@")[0],
      display_name:
        user.user_metadata?.display_name ||
        email.split("@")[0],
      email,
      bio: "New creator on EARNX.",
      avatar_url: "",
      cover_url: "",
      country: "PR",
      category: "creator",
      verified: false
    };

    const insertResult = await supabase
      .from("profiles")
      .upsert(fallbackProfile)
      .select()
      .maybeSingle();

    if (!insertResult.error) {
      profileData = insertResult.data;
    } else {
      console.warn("Profile upsert failed", insertResult.error.message);
      profileData = fallbackProfile;
    }
  }

  state.sessionUserId = user.id;
  state.profile = {
    id: user.id,
    username: profileData?.username || email.split("@")[0],
    email,
    displayName:
      profileData?.display_name ||
      user.user_metadata?.display_name ||
      email.split("@")[0],
    bio: profileData?.bio || "New creator on EARNX.",
    avatarUrl: profileData?.avatar_url || "",
    coverUrl: profileData?.cover_url || "",
    country: profileData?.country || "PR",
    category: profileData?.category || "creator",
    verified: !!profileData?.verified
  };

  state.ui.profileUserId = user.id;
}

/* -------------------------
   THEME
------------------------- */
function applyTheme() {
  document.body.classList.remove("dark-theme", "light-theme", "pink-theme");

  if (state.ui.theme === "light") {
    document.body.classList.add("light-theme");
  } else if (state.ui.theme === "pink") {
    document.body.classList.add("pink-theme");
  } else {
    document.body.classList.add("dark-theme");
  }
}

function toggleTheme() {
  const themes = ["dark", "light", "pink"];
  const currentIndex = themes.indexOf(state.ui.theme);
  const nextIndex = (currentIndex + 1) % themes.length;

  state.ui.theme = themes[nextIndex];
  saveState();
  applyTheme();
  render();
}

/* -------------------------
   AUTH
------------------------- */
async function login(email, password) {
  const safeEmail = email.trim().toLowerCase();

  const { error } = await supabase.auth.signInWithPassword({
    email: safeEmail,
    password
  });

  if (error) {
    alert(error.message);
  }
}

async function signup({ displayName, username, email, password }) {
  const safeEmail = email.trim().toLowerCase();
  const safeUsername = username.trim().toLowerCase();
  const safeDisplayName = displayName.trim();

  if (!safeDisplayName || !safeUsername || !safeEmail || !password.trim()) {
    alert("Complete all fields");
    return;
  }

  const { data, error } = await supabase.auth.signUp({
    email: safeEmail,
    password: password.trim(),
    options: {
      data: {
        username: safeUsername,
        display_name: safeDisplayName
      }
    }
  });

  if (error) {
    alert(error.message);
    return;
  }

  if (data.user) {
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: data.user.id,
      username: safeUsername,
      display_name: safeDisplayName,
      email: safeEmail,
      bio: "New creator on EARNX.",
      avatar_url: "",
      cover_url: "",
      country: "PR",
      category: "creator",
      verified: false
    });

    if (profileError) {
      console.warn("Profile create failed", profileError.message);
    }
  }

  alert("Cuenta creada. Ahora haz login.");
  state.ui.authView = "login";
  saveState();
  render();
}

async function logout() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    alert(error.message);
    return;
  }

  state.sessionUserId = null;
  state.session = null;
  state.profile = null;
  state.ui.authView = "login";
  state.ui.appView = "home";
  state.ui.profileUserId = null;

  saveState();
  render();
}

/* -------------------------
   APP ACTIONS
------------------------- */
function setAppView(view) {
  state.ui.appView = view;
  saveState();
  render();
}

function setSettingsTab(tab) {
  state.ui.settingsTab = tab;
  saveState();
  render();
}

/* -------------------------
   RENDER HELPERS
------------------------- */
function renderAvatarFromProfile(profile, extraClass = "") {
  const url = profile?.avatarUrl || "";
  const initials = getInitials(profile?.displayName || profile?.username || "?");

  if (url) {
    return `
      <div class="avatar ${extraClass} has-img">
        <img class="avatar-img" src="${escapeHtml(url)}" alt="${escapeHtml(initials)}" />
      </div>
    `;
  }

  return `<div class="avatar ${extraClass}">${escapeHtml(initials)}</div>`;
}

/* -------------------------
   ROOT RENDER
------------------------- */
function render() {
  const app = document.getElementById("app");
  if (!app) return;

  if (!state.sessionUserId) {
    app.innerHTML = renderAuthShell();
  } else {
    app.innerHTML = renderAppShell();
  }

  bindEvents();
}

/* -------------------------
   AUTH UI
------------------------- */
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

        ${state.ui.authView === "login" ? renderLoginCard() : renderSignupCard()}
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
          <label class="label" for="loginIdentifier">Email</label>
          <input class="input" id="loginIdentifier" type="email" placeholder="you@example.com" />
        </div>

        <div class="field">
          <label class="label" for="loginPassword">Password</label>
          <input class="input" id="loginPassword" type="password" placeholder="••••••••" />
        </div>

        <button class="button" type="submit">Login</button>
      </form>

      <div class="links">
        <a href="#" id="goSignup">Create account</a>
        <a href="#" id="themeToggleLink">Theme: ${escapeHtml(state.ui.theme)}</a>
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
        <a href="#" id="themeToggleLink">Theme: ${escapeHtml(state.ui.theme)}</a>
      </div>
    </div>
  `;
}

/* -------------------------
   APP SHELL
------------------------- */
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
              class="bottom-nav-btn ${state.ui.appView === item.key ? "active" : ""}"
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
  switch (state.ui.appView) {
    case "home":
      return renderHome();
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
    default:
      return renderHome();
  }
}

/* -------------------------
   HOME
------------------------- */
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
        <span class="section-meta">${escapeHtml(me?.displayName || me?.username || "Creator")}</span>
      </div>

      <div class="top5-grid">
        <article class="top5-card">
          <div class="top5-rank">#1</div>
          <div class="top5-user">
            ${renderAvatarFromProfile(me, "avatar-md")}
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
        <span class="section-meta">Real backend connected. Feed comes next.</span>
      </div>

      <div class="feed-list" style="margin-top:18px;">
        <article class="post-card">
          <div class="post-head">
            ${renderAvatarFromProfile(me)}
            <div class="name-block">
              <div class="name-line">
                <h4>${escapeHtml(me?.displayName || "User")}</h4>
                ${me?.verified ? `<span class="badge badge-ambassador">Verified</span>` : ""}
              </div>
              <div class="handle">@${escapeHtml(me?.username || "creator")} · ${escapeHtml(me?.country || "PR")}</div>
            </div>
          </div>

          <div class="post-content">
            Your real auth and profile are connected. The next step is replacing empty states with real posts, followers, and messages.
          </div>
        </article>
      </div>
    </section>
  `;
}

/* -------------------------
   DISCOVER
------------------------- */
function renderDiscover() {
  return `
    <div class="topbar">
      <div class="topbar-row">
        <div>
          <span class="page-kicker">Discover</span>
          <h1 class="page-title">Discover creators</h1>
          <p class="page-subtitle">Real auth is live. Creator discovery comes next.</p>
        </div>
      </div>
    </div>

    <section class="section">
      <div class="section-head">
        <h3>Talent browser</h3>
        <span class="section-meta">Backend foundation ready</span>
      </div>

      <div class="list">
        <article class="creator-card">
          <div class="creator-head">
            ${renderAvatarFromProfile(currentUser(), "avatar-md")}
            <div class="name-block">
              <div class="name-line">
                <h4>${escapeHtml(currentUser()?.displayName || "You")}</h4>
                ${currentUser()?.verified ? `<span class="badge badge-ambassador">Verified</span>` : ""}
              </div>
              <div class="handle">@${escapeHtml(currentUser()?.username || "creator")} · ${escapeHtml(currentUser()?.category || "creator")}</div>
            </div>
          </div>

          <div class="creator-bio">${escapeHtml(currentUser()?.bio || "No bio yet.")}</div>

          <div class="post-actions">
            <span class="chip">Real profile</span>
            <span class="chip">Supabase</span>
            <span class="chip">No mock</span>
          </div>

          <div class="creator-actions" style="margin-top:14px;">
            <button class="btn btn-secondary" data-nav="profile">View profile</button>
          </div>
        </article>
      </div>
    </section>
  `;
}

/* -------------------------
   PROFILE
------------------------- */
function renderProfile() {
  const profile = currentUser();

  if (!profile) {
    return `
      <section class="panel">
        <div class="profile-empty">
          <h3>Profile unavailable</h3>
          <p>No active user loaded yet.</p>
        </div>
      </section>
    `;
  }

  return `
    <section class="panel">
      <div class="profile-cover-zone">
        <div class="profile-cover-bg ${profile.coverUrl ? "" : "profile-cover-default"}">
          ${
            profile.coverUrl
              ? `<img class="profile-cover-img" src="${escapeHtml(profile.coverUrl)}" alt="Cover" />`
              : ""
          }
        </div>

        <div class="profile-avatar-anchor">
          ${renderAvatarFromProfile(profile, "avatar-xl")}
          ${profile.verified ? `<span class="verified-checkmark">✓</span>` : ""}
        </div>
      </div>

      <div class="profile-identity-block">
        <div class="profile-name-area">
          <div>
            <h2 class="profile-display-name">${escapeHtml(profile.displayName || "User")}</h2>
            <div class="handle">@${escapeHtml(profile.username || "unknown")} · ${escapeHtml(profile.country || "PR")}</div>
          </div>

          <div class="profile-rank-col">
            <span class="chip">Real profile</span>
          </div>
        </div>

        <p class="profile-bio-text">${escapeHtml(profile.bio || "No bio yet.")}</p>
        <div class="category-chip">${escapeHtml(profile.category || "creator")}</div>

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
            <p>Your real account is loaded. Posts come next.</p>
          </div>
        </div>
      </div>
    </section>
  `;
}

/* -------------------------
   MESSAGES
------------------------- */
function renderMessages() {
  return `
    <div class="topbar">
      <div>
        <span class="page-kicker">Messages</span>
        <h1 class="page-title">Inbox</h1>
        <p class="page-subtitle">Messaging UI preserved. Real threads come next.</p>
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
          <p>Start with real message tables after profile editing is finished.</p>
        </div>
      </section>

      <section class="chat-panel">
        <div class="inbox-empty">
          <div class="inbox-empty-icon">✉️</div>
          <h3>Select a conversation</h3>
          <p>Message threads will be connected in the next backend phase.</p>
        </div>
      </section>
    </div>
  `;
}

/* -------------------------
   WALLET
------------------------- */
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
            <div class="wallet-balance-sub">Real auth connected. Wallet ledger comes next.</div>
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
              <p class="page-subtitle">Your latest transactions</p>
            </div>
          </div>

          <div class="wallet-activity-list">
            <div class="inbox-empty">
              <div class="inbox-empty-icon">💸</div>
              <h3>No transactions yet</h3>
              <p>${escapeHtml(me?.displayName || "User")} is connected, but wallet data has not been modeled yet.</p>
            </div>
          </div>
        </div>

        <div class="wallet-panel">
          <div class="wallet-panel-head">
            <div>
              <h3>Revenue summary</h3>
              <p class="page-subtitle">Quick performance indicators</p>
            </div>
          </div>

          <div class="revenue-summary">
            <div class="revenue-pill-row">
              <span class="revenue-pill">Real account</span>
              <span class="revenue-pill">${escapeHtml(me?.username || "creator")}</span>
              <span class="revenue-pill">Supabase live</span>
            </div>
            <div class="revenue-visual">Wallet metrics will live here next.</div>
          </div>
        </div>
      </section>
    </div>
  `;
}

/* -------------------------
   SETTINGS
------------------------- */
function renderSettings() {
  return `
    <div class="settings-shell">
      <aside class="settings-nav">
        <button class="settings-nav-btn ${state.ui.settingsTab === "preferences" ? "active" : ""}" data-settings-tab="preferences">Preferences</button>
        <button class="settings-nav-btn ${state.ui.settingsTab === "account" ? "active" : ""}" data-settings-tab="account">Account</button>
      </aside>

      <section class="settings-main">
        ${renderSettingsContent()}
      </section>
    </div>
  `;
}

function renderSettingsContent() {
  if (state.ui.settingsTab === "preferences") {
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
            <button class="btn btn-secondary" id="themeToggleInlineBtn">Theme: ${escapeHtml(state.ui.theme)}</button>
          </div>
        </div>
      </div>
    `;
  }

  const me = currentUser();

  return `
    <div class="settings-section">
      <div class="settings-section-head">
        <h3>Account</h3>
        <p>Review your account and creator mode setup.</p>
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
        <div class="account-card-sub">Your EARNX creator profile is active and connected to Supabase.</div>
      </div>

      <div class="hero-actions" style="margin-top:18px;">
        <button class="btn btn-secondary" id="logoutBtn">Logout</button>
      </div>
    </div>
  `;
}

/* -------------------------
   EVENTS
------------------------- */
function bindEvents() {
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.onsubmit = event => {
      event.preventDefault();
      login(
        document.getElementById("loginIdentifier").value,
        document.getElementById("loginPassword").value
      );
    };
  }

  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    signupForm.onsubmit = event => {
      event.preventDefault();
      signup({
        displayName: document.getElementById("signupDisplayName").value,
        username: document.getElementById("signupUsername").value,
        email: document.getElementById("signupEmail").value,
        password: document.getElementById("signupPassword").value
      });
    };
  }

  const goSignup = document.getElementById("goSignup");
  if (goSignup) {
    goSignup.onclick = event => {
      event.preventDefault();
      state.ui.authView = "signup";
      saveState();
      render();
    };
  }

  const goLogin = document.getElementById("goLogin");
  if (goLogin) {
    goLogin.onclick = event => {
      event.preventDefault();
      state.ui.authView = "login";
      saveState();
      render();
    };
  }

  const themeToggleLink = document.getElementById("themeToggleLink");
  if (themeToggleLink) {
    themeToggleLink.onclick = event => {
      event.preventDefault();
      toggleTheme();
    };
  }

  const themeToggleInlineBtn = document.getElementById("themeToggleInlineBtn");
  if (themeToggleInlineBtn) {
    themeToggleInlineBtn.onclick = toggleTheme;
  }

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.onclick = logout;
  }

  document.querySelectorAll("[data-nav]").forEach(button => {
    button.onclick = () => {
      setAppView(button.dataset.nav);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
  });

  document.querySelectorAll("[data-settings-tab]").forEach(button => {
    button.onclick = () => {
      setSettingsTab(button.dataset.settingsTab);
    };
  });
}
