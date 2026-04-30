// ================================
// EARNX MASTER SCRIPT
// Supabase real + Auth + Profile + Home + Discover + Messages + Wallet + Themes
// ================================

const SUPABASE_URL = "https://duyltyirtffzomrnielr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1eWx0eWlydGZmem9tcm5pZWxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3Mjc3NzIsImV4cCI6MjA5MjMwMzc3Mn0.sy4lobYoxzFWcni2Umc1k-IHUGRojTgmP416tDltgD8";

let supabase = null;

const state = {
  session: null,
  user: null,
  profile: null,
  creators: [],
  posts: [],
  messages: [],
  walletTx: [],
  followingIds: [],
  followingIds: [],
  authView: "login",
  appView: "home",
  theme: localStorage.getItem("earnx-theme") || "dark",
  discoverQuery: ""
};

document.addEventListener("DOMContentLoaded", boot);

// ================================
// BOOT
// ================================
async function boot() {
  applyTheme(state.theme);
  renderLoading();

  try {
    const mod = await import("https://esm.sh/@supabase/supabase-js@2");
    supabase = mod.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error(error);
      renderAuth(); // 👈 fallback inmediato
      return;
    }

    state.session = data.session || null;
    state.user = state.session ? state.session.user : null;

    if (state.user) {
      await hydrateApp();
    }

    supabase.auth.onAuthStateChange(async (_event, session) => {
      state.session = session || null;
      state.user = session ? session.user : null;

      if (state.user) {
        await hydrateApp();
      } else {
        resetState();
      }

      render();
    });

    render();

  } catch (err) {
    console.error(err);

    // 👇 CLAVE: nunca más pantalla infinita
    setTimeout(() => {
      renderAuth();
    }, 800);
  }
}
function resetState() {
  state.session = null;
  state.user = null;
  state.profile = null;
  state.creators = [];
  state.posts = [];
  state.messages = [];
  state.walletTx = [];
  state.followingIds = [];
  state.authView = "login";
  state.appView = "home";
}

async function hydrateApp() {
  await ensureProfile(state.user);

  await Promise.all([
    loadProfile(),
    loadCreators(),
    loadMessages(),
    loadWallet(),
    loadFollowing()
  ]);

  await loadPosts();
}

// ================================
// HELPERS
// ================================
function setHTML(html) {
  const app = document.getElementById("app");
  if (app) app.innerHTML = html;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safeNum(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function sanitizeUsername(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9._-]/g, "")
    .slice(0, 24);
}

function getInitials(name) {
  const safe = String(name || "").trim();
  if (!safe) return "?";
  return safe
    .split(/\s+/)
    .map(x => x[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(value) {
  if (!value) return "just now";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return String(value);
  }
}

function timeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}

// ================================
// THEME
// ================================
function applyTheme(theme) {
  document.body.classList.remove("dark-theme", "light-theme", "pink-theme");
  document.body.classList.add(theme + "-theme");
  state.theme = theme;
  localStorage.setItem("earnx-theme", theme);
}

function cycleTheme() {
  const themes = ["dark", "light", "pink"];
  const current = themes.indexOf(state.theme);
  const next = themes[(current + 1) % themes.length];
  applyTheme(next);
  render();
}

// ================================
// DATA
// ================================
async function ensureProfile(user) {
  if (!user) return;

  try {
    const { data: existing } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (existing) return;

    const email = user.email || "";
    const username = sanitizeUsername(
      user.user_metadata?.username ||
      email.split("@")[0] ||
      "creator"
    );

    const displayName =
      user.user_metadata?.display_name ||
      user.user_metadata?.displayName ||
      username;

    await supabase.from("profiles").insert({
      id: user.id,
      username,
      display_name: displayName,
      email,
      avatar_url: "",
      cover_url: "",
      bio: "No bio yet.",
      country: "PR",
      category: "creator",
      verified: false,
      followers_count: 0,
      posts_count: 0,
      earnings_total: 0,
      engagement_score: 0
    });
  } catch (err) {
    console.warn("ensureProfile:", err);
  }
}

async function loadProfile() {
  if (!state.user) return;

  try {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", state.user.id)
      .maybeSingle();

    state.profile = data || null;
  } catch {
    state.profile = null;
  }
}

async function loadCreators() {
  try {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("followers_count", { ascending: false })
      .limit(40);

    state.creators = Array.isArray(data) ? data : [];
  } catch {
    state.creators = [];
  }
}

async function loadPosts() {
  if (!state.user) return;

  try {
    const { data: followsData, error: followsError } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", state.user.id);

    if (followsError) {
      console.warn("follows load error:", followsError);
    }

    const followingIds = Array.isArray(followsData)
      ? followsData.map(row => row.following_id)
      : [];

    const allowedUsers = [
      state.user.id,
      ...followingIds
    ];

    const result = await supabase
      .from("posts")
      .select("*")
      .in("user_id", allowedUsers)
      .order("created_at", { ascending: false })
      .limit(30);

    state.posts = result.error
      ? []
      : (Array.isArray(result.data) ? result.data : []);

  } catch (err) {
    console.error("loadPosts error:", err);
    state.posts = [];
  }
}

async function loadMessages() {
  if (!state.user) return;

  try {
    const result = await supabase
      .from("messages")
      .select("*")
      .or("sender_id.eq." + state.user.id + ",receiver_id.eq." + state.user.id)
      .order("created_at", { ascending: false })
      .limit(30);

    state.messages = result.error ? [] : (Array.isArray(result.data) ? result.data : []);
  } catch {
    state.messages = [];
  }
}

async function loadWallet() {
  if (!state.user) return;

  try {
    const result = await supabase
      .from("wallet_transactions")
      .select("*")
      .eq("user_id", state.user.id)
      .order("created_at", { ascending: false })
      .limit(30);

    state.walletTx = result.error ? [] : (Array.isArray(result.data) ? result.data : []);
  } catch {
    state.walletTx = [];
  }
}
async function loadFollowing() {
  if (!state.user) return;

  try {
    const result = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", state.user.id);

    state.followingIds = result.error
      ? []
      : result.data.map(row => row.following_id);

  } catch (err) {
    console.error("loadFollowing error:", err);
    state.followingIds = [];
  }
}
// ================================
// RENDER CORE
// ================================
function render() {
  if (!state.user) {
    setHTML(renderAuthShell());
    bindAuth();
    return;
  }

  setHTML(renderAppShell());
  bindApp();
}
setTimeout(() => {
  document.body.style.opacity = "1";
}, 50);
function renderLoading() {
  setHTML(`
    <div class="loading-screen">
      <div>
        <div class="loading-brand">Earn<span>X</span></div>
        <div class="spinner" style="margin:20px auto 0;"></div>
      </div>
    </div>
  `);
}

function renderFatal(err) {
  setHTML(`
    <div class="page">
      <div class="card">
        <h2>App error</h2>
        <p class="muted">${escapeHtml(err.message || err)}</p>
      </div>
    </div>
  `);
}

// ================================
// AUTH
// ================================
function renderAuthShell() {
  return `
    <div class="auth-wrap">
      <div class="auth-card">

        <div>
          <div class="auth-brand"></div>
          <div class="auth-tagline">
            A premium social platform built around creator ambition, audience reach, and public ranking momentum.
          </div>
          <div class="auth-copy">
            A creator economy platform with rankings, monetization, messaging and public momentum.
          </div>
        </div>

        <div>
          <div class="auth-tabs">
            <button class="auth-tab ${state.authView === "login" ? "active" : ""}" data-auth="login" type="button">
              Sign in
            </button>
            <button class="auth-tab ${state.authView === "signup" ? "active" : ""}" data-auth="signup" type="button">
              Create
            </button>
          </div>

          <div id="auth-form">
            ${state.authView === "login" ? renderLoginCard() : renderSignupCard()}
          </div>
        </div>

      </div>
    </div>
  `;
}
function renderLoginCard() {
  return `
    <form id="authForm" class="card">
      <h2>Login</h2>

      <div class="field">
        <label>Email</label>
        <input name="email" type="email" placeholder="you@example.com" autocomplete="email" />
      </div>

      <div class="field">
        <label>Password</label>
        <input name="password" type="password" placeholder="••••••••" autocomplete="current-password" />
      </div>

      <div class="auth-actions">
        <button class="btn-primary" type="submit">Login</button>
        <button class="btn-secondary" id="forgotBtn" type="button">Reset password</button>
      </div>
    </form>
  `;
}

function renderSignupCard() {
  return `
    <form id="authForm" class="card">
      <h2>Create account</h2>

      <div class="field">
        <label>Username</label>
        <input name="username" type="text" placeholder="rafax" autocomplete="username" />
      </div>

      <div class="field">
        <label>Display name</label>
        <input name="displayName" type="text" placeholder="Rafael" autocomplete="name" />
      </div>

      <div class="field">
        <label>Email</label>
        <input name="email" type="email" placeholder="you@example.com" autocomplete="email" />
      </div>

      <div class="field">
        <label>Password</label>
        <input name="password" type="password" placeholder="At least 8 characters" autocomplete="new-password" />
      </div>

      <button class="btn-primary" type="submit">Create account</button>
    </form>
  `;
}

function bindAuth() {
  document.querySelectorAll("[data-auth]").forEach(btn => {
    btn.onclick = () => {
      state.authView = btn.dataset.auth;
      render();
    };
  });

  const forgotBtn = document.getElementById("forgotBtn");
  if (forgotBtn) {
    forgotBtn.onclick = async () => {
      const form = document.getElementById("authForm");
      const fd = new FormData(form);
      const email = (fd.get("email") || "").toString().trim();

      if (!email) {
        alert("Enter your email first.");
        return;
      }

      const result = await supabase.auth.resetPasswordForEmail(email);
      if (result.error) alert(result.error.message);
      else alert("Reset email sent.");
    };
  }

  const form = document.getElementById("authForm");
  if (!form) return;

  form.onsubmit = async e => {
    e.preventDefault();

    const fd = new FormData(form);
    const email = (fd.get("email") || "").toString().trim();
    const password = (fd.get("password") || "").toString();

    if (!email || !password) {
      alert("Fill all fields");
      return;
    }

    renderLoading();

    try {
      if (state.authView === "login") {
        const result = await supabase.auth.signInWithPassword({ email, password });

        if (result.error) {
          alert(result.error.message);
          render();
          return;
        }

        state.session = result.data.session;
        state.user = result.data.user;
        await hydrateApp();
        render();
        return;
      }

      const username = (fd.get("username") || "").toString().trim();
      const displayName = (fd.get("displayName") || "").toString().trim();

      if (!username || !displayName) {
        alert("Fill all fields");
        render();
        return;
      }

      const result = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: sanitizeUsername(username),
            display_name: displayName
          }
        }
      });

      if (result.error) {
        alert(result.error.message);
        render();
        return;
      }

      state.authView = "login";
      alert("Account created. Sign in now.");
      render();
      return;

    } catch (err) {
      alert(err.message || String(err));
      render();
    }
  };
}

// ================================
// APP SHELL
// ================================
function renderAppShell() {
  return `
    ${renderCurrentView()}
    ${renderBottomNav()}
  `;
}

function renderTopbar() {
  const name =
    state.profile?.display_name ||
    state.profile?.username ||
    state.user?.email ||
    "EarnX";

  return `
    <div class="topbar">
      <div class="topbar-inner">
        <div class="brand-mini">
          <div class="brand-mini-badge">X</div>
          <div>${escapeHtml(name)}</div>
        </div>

        <div class="topbar-actions">
          <button class="icon-btn" id="themeCycleBtn" type="button">☀</button>
          ${renderAvatarButton(state.profile)}
        </div>
      </div>
    </div>
  `;
}

function renderCurrentView() {
  if (state.appView === "discover") return renderDiscover();
  if (state.appView === "messages") return renderMessages();
  if (state.appView === "wallet") return renderWallet();
  if (state.appView === "profile") return renderProfile();
  if (state.appView === "settings") return renderSettings();
  return renderHome();
}

function renderBottomNav() {
  const items = [
    ["home", "Home"],
    ["discover", "Discover"],
    ["messages", "Messages"],
    ["wallet", "Wallet"],
    ["profile", "Profile"]
  ];

  return `
    <nav class="bottom-nav">
      ${items.map(([route, label]) => `
        <button class="nav-item ${state.appView === route ? "active" : ""}" data-go="${route}" type="button">
          <div>${label}</div>
        </button>
      `).join("")}
    </nav>
  `;
}
function bindApp() {
  document.body.onclick = async function (e) {
    const goBtn = e.target.closest("[data-go]");
    if (goBtn) {
      state.appView = goBtn.dataset.go;
      render();
      return;
    }

    const themeBtn = e.target.closest("[data-theme]");
    if (themeBtn) {
      applyTheme(themeBtn.dataset.theme);
      render();
      return;
    }

    const followBtn = e.target.closest("[data-follow]");
    if (followBtn) {
      await toggleFollow(followBtn.dataset.follow);
      return;
    }

    if (e.target.closest("#themeCycleBtn")) {
      cycleTheme();
      return;
    }

    if (e.target.closest("#saveProfileBtn")) {
      await saveProfileSettings();
      return;
    }

    if (e.target.closest("#logoutBtn")) {
      await logout();
      return;
    }

    if (e.target.closest("#resetPasswordBtn")) {
      await resetPassword();
      return;
    }

    if (e.target.closest("#publishPostBtn")) {
      await publishPost();
      return;
    }

    if (e.target.closest("#sendMessageBtn")) {
      await sendMessage();
      return;
    }

    if (e.target.closest("#depositBtn")) {
      await recordWalletTransaction("deposit");
      return;
    }

    if (e.target.closest("#withdrawBtn")) {
      await recordWalletTransaction("withdrawal");
      return;
    }
  };

  const search = document.getElementById("discoverSearch");
  if (search) {
    search.oninput = e => {
      state.discoverQuery = e.target.value || "";
      render();
    };
  }
}

// ================================
// VIEWS
// ================================
function renderHome() {
  const p = state.profile || {};
  const posts = enrichPosts();

  return `
    <main class="page">

      <div class="home-top">
        <div>
          <div class="home-greeting">Good ${timeOfDay()}</div>
          <div class="home-name">
            ${escapeHtml(p.display_name || p.username || state.user.email)}
          </div>
        </div>

        <button class="avatar-btn" data-go="profile" type="button">
          ${escapeHtml(getInitials(p.display_name || p.username || state.user.email))}
        </button>
      </div>

      <div class="section-label">Stories</div>
      ${renderStories()}

      <div class="section-label">Create</div>
      <div class="panel" style="padding:18px;margin-bottom:18px;">
        <div class="field">
          <label>Share something</label>
          <textarea id="postBody" placeholder="Post an update, idea, win, content drop or creator note..."></textarea>
        </div>

        <button class="btn-primary" id="publishPostBtn" type="button">
          Publish post
        </button>
      </div>


      <div class="section-label">Following feed</div>
      <div class="feed">
        ${
          posts.length
            ? posts.map(renderFeedCard).join("")
            : emptyState(
                "No posts yet",
                "Follow creators in Discover or publish your first post to start building your feed."
              )
        }
      </div>

    </main>
  `;
}

function renderDiscover() {
  const creators = filteredCreators()
    .map(c => ({ ...c, metrics: creatorMetrics(c) }))
    .sort((a, b) => b.metrics.score - a.metrics.score);

  return `
    <main class="page">
      <div class="page-header">
        <div>
          <div class="page-title">Discover</div>
          <div class="page-subtitle">Creator ranking based on real profile stats.</div>
        </div>
      </div>

      <div class="field">
        <input id="discoverSearch" type="search" value="${escapeHtml(state.discoverQuery)}" placeholder="Search creators" />
      </div>

      <div class="section-label">Ranking</div>
      <div class="card">
        ${creators.length ? creators.map(renderMarketRow).join("") : emptyState("No creators yet", "Profiles table is connected, but no creator records are available.")}
      </div>

      <div class="section-label">Creators</div>
      <div class="creator-grid">
        ${creators.map(renderCreatorCard).join("")}
      </div>
    </main>
  `;
}
function renderMiniTrend(c) {
  const m = creatorMetrics(c);

  const base = Math.max(8, Math.min(92, m.score / 10));
  const points = [
    8,
    100 - Math.max(12, base + 18),
    34,
    100 - Math.max(14, base + 6),
    58,
    100 - Math.max(10, base + 20),
    84,
    100 - Math.max(8, base + 10),
    108,
    100 - Math.max(6, base + 26)
  ].join(" ");

  const isUp = m.score >= 100;

  return `
    <div class="trend-mini-card">
      <div class="trend-mini-info">
        <div class="trend-mini-name">
          ${escapeHtml(c.display_name || c.username || "Creator")}
        </div>
        <div class="trend-mini-symbol">
          @${escapeHtml(c.username || "creator")}
        </div>
      </div>

      <svg class="trend-sparkline" viewBox="0 0 116 100" preserveAspectRatio="none">
        <polyline points="${points}" />
      </svg>

      <div class="trend-mini-score ${isUp ? "market-up" : ""}">
        ${isUp ? "▲" : "•"} ${m.score.toFixed(0)}
      </div>
    </div>
  `;
}
function renderMessages() {
  const rows = enrichMessages();

  return `
    <main class="page">
      <div class="page-header">
        <div>
          <div class="page-title">Messages</div>
          <div class="page-subtitle">Direct messaging connected to Supabase.</div>
        </div>
      </div>

      <div class="card">
        <div class="field">
          <label>Receiver user ID</label>
          <input id="messageReceiverId" placeholder="Receiver UUID" />
        </div>

        <div class="field">
          <label>Message</label>
          <input id="messageBody" placeholder="Say hello" />
        </div>

        <button class="btn-primary" id="sendMessageBtn" type="button">Send message</button>
      </div>

      <div class="section-label">Inbox</div>
      ${rows.length ? rows.map(renderMessageRow).join("") : emptyState("No messages yet", "Messages will appear here once your messages table has rows.")}
    </main>
  `;
}

function renderWallet() {
  const balance = safeNum(state.profile?.earnings_total);

  return `
    <main class="page">
      <div class="page-header">
        <div>
          <div class="page-title">Wallet</div>
          <div class="page-subtitle">Real wallet layer connected to Supabase.</div>
        </div>
      </div>

      <div class="card">
        <div class="page-subtitle">Available balance</div>
        <div style="font-size:3rem;font-weight:900;">$${balance.toFixed(2)}</div>
        <p class="muted">Uses earnings_total from your real profile.</p>

        <div class="auth-actions">
          <button class="btn-primary" id="depositBtn" type="button">Record deposit</button>
          <button class="btn-secondary" id="withdrawBtn" type="button">Record withdrawal</button>
        </div>
      </div>

      <div class="section-label">Transactions</div>
      ${state.walletTx.length ? state.walletTx.map(renderWalletRow).join("") : emptyState("No transactions yet", "wallet_transactions will appear here.")}
    </main>
  `;
}

function renderProfile() {
  const p = state.profile || {};

  return `
    <main class="page">
      <div class="profile-shell">
        <div class="profile-avatar">${escapeHtml(getInitials(p.display_name || p.username || state.user.email))}</div>
        <div class="profile-name">${escapeHtml(p.display_name || p.username || state.user.email)}</div>
        <div class="profile-handle">@${escapeHtml(p.username || "creator")}</div>
        <p class="profile-bio">${escapeHtml(p.bio || "No bio yet.")}</p>

        <div class="profile-stats">
          ${profileStat(safeNum(p.followers_count), "Followers")}
          ${profileStat(safeNum(p.posts_count), "Posts")}
          ${profileStat("$" + safeNum(p.earnings_total).toFixed(0), "Earned")}
          ${profileStat(safeNum(p.engagement_score), "Engagement")}
        </div>

        <br>
        <button class="btn-secondary" data-go="settings" type="button">Edit profile</button>
      </div>
    </main>
  `;
}

function renderSettings() {
  const p = state.profile || {};

  return `
    <main class="page">
      <div class="page-title">Settings</div>

      <div class="section-label">Theme</div>
      <div class="card">
        <div class="auth-actions">
          ${themeBtn("dark", "Dark")}
          ${themeBtn("light", "Light")}
          ${themeBtn("pink", "Pink")}
        </div>
      </div>

      <div class="section-label">Profile</div>
      <div class="card">
        ${settingsField("Display name", "setDisplayName", p.display_name || "")}
        ${settingsField("Username", "setUsername", p.username || "")}
        ${settingsField("Bio", "setBio", p.bio || "")}
        ${settingsField("Category", "setCategory", p.category || "")}
        ${settingsField("Country", "setCountry", p.country || "")}

        <button class="btn-primary" id="saveProfileBtn" type="button">Save profile</button>
      </div>

      <div class="section-label">Account</div>
      <div class="card">
        <p class="muted">${escapeHtml(state.user?.email || "")}</p>
        <div class="auth-actions">
          <button class="btn-secondary" id="resetPasswordBtn" type="button">Reset password</button>
          <button class="btn-danger" id="logoutBtn" type="button">Logout</button>
        </div>
      </div>
    </main>
  `;
}

// ================================
// ACTIONS
// ================================
async function saveProfileSettings() {
  const display_name = document.getElementById("setDisplayName")?.value.trim() || "";
  const username = sanitizeUsername(document.getElementById("setUsername")?.value || "");
  const bio = document.getElementById("setBio")?.value.trim() || "";
  const category = document.getElementById("setCategory")?.value.trim() || "";
  const country = document.getElementById("setCountry")?.value.trim() || "";

  if (!display_name || !username) {
    alert("Display name and username are required.");
    return;
  }

  const result = await supabase
    .from("profiles")
    .update({ display_name, username, bio, category, country })
    .eq("id", state.user.id);

  if (result.error) {
    alert(result.error.message);
    return;
  }

  await Promise.all([loadProfile(), loadCreators()]);
  state.appView = "profile";
  render();
  alert("Profile updated.");
}

async function resetPassword() {
  const email = state.user?.email;
  if (!email) return;

  const result = await supabase.auth.resetPasswordForEmail(email);
  if (result.error) alert(result.error.message);
  else alert("Reset email sent.");
}

async function logout() {
  const result = await supabase.auth.signOut();
  if (result.error) {
    alert(result.error.message);
    return;
  }

  resetState();
  render();
}

async function publishPost() {
  const body = document.getElementById("postBody")?.value.trim() || "";

  if (!body) {
    alert("Write something first.");
    return;
  }

  const result = await supabase.from("posts").insert({
    user_id: state.user.id,
    body,
    created_at: new Date().toISOString()
  });

  if (result.error) {
    alert(result.error.message);
    return;
  }

  await loadPosts();
  render();
}

async function sendMessage() {
  const receiver_id = document.getElementById("messageReceiverId")?.value.trim() || "";
  const body = document.getElementById("messageBody")?.value.trim() || "";

  if (!receiver_id || !body) {
    alert("Fill receiver and message.");
    return;
  }

  const result = await supabase.from("messages").insert({
    sender_id: state.user.id,
    receiver_id,
    body,
    created_at: new Date().toISOString()
  });

  if (result.error) {
    alert(result.error.message);
    return;
  }

  await loadMessages();
  render();
}

async function recordWalletTransaction(type) {
  const input = prompt(type === "deposit" ? "Deposit amount" : "Withdrawal amount");
  const amount = Number(input);

  if (!Number.isFinite(amount) || amount <= 0) return;

  const signedAmount = type === "withdrawal" ? -amount : amount;

  const tx = await supabase.from("wallet_transactions").insert({
    user_id: state.user.id,
    type,
    amount: signedAmount,
    created_at: new Date().toISOString()
  });

  if (tx.error) {
    alert(tx.error.message);
    return;
  }

  const current = safeNum(state.profile?.earnings_total);

  const profileUpdate = await supabase
    .from("profiles")
    .update({ earnings_total: current + signedAmount })
    .eq("id", state.user.id);

  if (profileUpdate.error) {
    alert(profileUpdate.error.message);
    return;
  }
await Promise.all([loadProfile(), loadWallet()]);
render();
}

async function toggleFollow(userId) {
  if (!state.user || !userId || userId === state.user.id) return;

  const isFollowing = state.followingIds.includes(userId);

  if (isFollowing) {
    const result = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", state.user.id)
      .eq("following_id", userId);

    if (result.error) {
      alert(result.error.message);
      return;
    }
  } else {
    const result = await supabase
      .from("follows")
      .insert({
        follower_id: state.user.id,
        following_id: userId
      });

    if (result.error) {
      alert(result.error.message);
      return;
    }
  }

  await loadFollowing();
  render();
}

// ================================
// COMPONENTS
// ================================

// ================================
// COMPONENTS
// ================================
function filteredCreators() {
  const me = state.user?.id;
  const q = state.discoverQuery.toLowerCase().trim();

  return state.creators
    .filter(c => c.id !== me)
    .filter(c => {
      if (!q) return true;
      return [
        c.username,
        c.display_name,
        c.bio,
        c.category
      ].some(v => String(v || "").toLowerCase().includes(q));
    });
}

function creatorMetrics(c) {
  const followers = safeNum(c.followers_count);
  const posts = safeNum(c.posts_count);
  const earnings = safeNum(c.earnings_total);
  const engagement = safeNum(c.engagement_score);
  const score = followers * 8 + posts * 12 + earnings * 0.02 + engagement * 5 + (c.verified ? 40 : 0);

  return { followers, posts, earnings, engagement, score };
}

function enrichPosts() {
  return state.posts.map(post => {
    const profile =
      state.creators.find(c => c.id === post.user_id) ||
      (post.user_id === state.user?.id ? state.profile : null);

    return { ...post, profile };
  });
}

function enrichMessages() {
  return state.messages.map(msg => {
    const otherId = msg.sender_id === state.user?.id ? msg.receiver_id : msg.sender_id;
    const profile = state.creators.find(c => c.id === otherId) || null;
    return { ...msg, profile };
  });
}

function statCard(value, label) {
  return `
    <div class="stat-card">
      <div class="stat-value">${escapeHtml(value)}</div>
      <div class="stat-label">${escapeHtml(label)}</div>
    </div>
  `;
}

function profileStat(value, label) {
  return `
    <div class="stat-card">
      <div class="stat-value">${escapeHtml(value)}</div>
      <div class="stat-label">${escapeHtml(label)}</div>
    </div>
  `;
}

function themeBtn(theme, label) {
  return `
    <button class="theme-btn ${state.theme === theme ? "active" : ""}" data-theme="${theme}" type="button">
      ${label}
    </button>
  `;
}

function settingsField(label, id, value) {
  return `
    <div class="field">
      <label>${escapeHtml(label)}</label>
      <input id="${id}" type="text" value="${escapeHtml(value)}" />
    </div>
  `;
}

function emptyState(title, desc) {
  return `
    <div class="empty-state">
      <div class="empty-title">${escapeHtml(title)}</div>
      <div class="empty-desc">${escapeHtml(desc)}</div>
    </div>
  `;
}

function renderFeedCard(post) {
  const p = post.profile || {};
  const name = p.display_name || p.username || "Creator";
  const initials = getInitials(name);

  return `
    <div class="creator-card">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
        <div class="avatar-btn">${initials}</div>
        <div>
          <div style="font-weight:900;">${escapeHtml(name)}</div>
          <div class="muted" style="font-size:.8rem;">${formatDate(post.created_at)}</div>
        </div>
      </div>

      <div style="font-size:1.05rem;line-height:1.6;">
        ${escapeHtml(post.body || "")}
      </div>
    </div>
  `;
}
function renderStories() {
  const creators = state.creators
    .filter(c => c.id !== state.user?.id)
    .slice(0, 10);

  if (!creators.length) {
    return `
      <div class="stories-strip">
        <div class="story-item">
          <div class="story-ring seen">
            <div class="story-avatar">X</div>
          </div>
          <span class="story-name">EarnX</span>
        </div>
      </div>
    `;
  }

  return `
    <div class="stories-strip">
      ${creators.map(c => {
        const name = c.display_name || c.username || "Creator";
        const initials = getInitials(name);

        return `
          <div class="story-item" data-go="discover">
            <div class="story-ring ${state.followingIds.includes(c.id) ? "" : "seen"}">
              <div class="story-avatar">
                ${
                  c.avatar_url
                    ? `<img src="${escapeHtml(c.avatar_url)}" alt="${escapeHtml(name)}" />`
                    : escapeHtml(initials)
                }
              </div>
            </div>
            <span class="story-name">
              ${escapeHtml(c.username || name)}
            </span>
          </div>
        `;
      }).join("")}
    </div>
  `;
}
function renderCreatorCard(c) {
  const initials = getInitials(c.display_name || c.username || "U");
  const m = creatorMetrics(c);
  const isFollowing = state.followingIds.includes(c.id);

  return `
    <div class="creator-card">
      <div class="creator-avatar-lg">${escapeHtml(initials)}</div>

      <div class="creator-name">
        ${escapeHtml(c.display_name || c.username || "Creator")}
      </div>

      <div class="creator-handle">
        @${escapeHtml(c.username || "creator")}
      </div>

      <div class="creator-bio">
        ${escapeHtml(c.bio || "No bio yet.")}
      </div>

      <div class="chip">
        Score ${m.score.toFixed(0)}
      </div>

      <button 
        class="${isFollowing ? "btn-secondary" : "btn-primary"}" 
        data-follow="${c.id}" 
        type="button"
        style="margin-top:14px;width:100%;"
      >
        ${isFollowing ? "Following" : "Follow"}
      </button>
    </div>
  `;
}

function renderMarketRow(c) {
  const m = c.metrics || creatorMetrics(c);
  const up = m.score > 100;

  return `
    <div class="market-row">
      <div>
        <div class="market-name">${escapeHtml(c.display_name || c.username)}</div>
        <div class="market-symbol">@${escapeHtml(c.username)}</div>
      </div>

      <div class="market-num">${m.followers}</div>
      <div class="market-num">${m.posts}</div>

      <div class="market-num ${up ? "market-up" : ""}">
        ${up ? "▲" : "▼"} ${m.score.toFixed(0)}
      </div>
    </div>
  `;
}

function renderMessageRow(msg) {
  return `
    <div class="feed-card card">
      <div class="feed-name">Message</div>
      <div class="feed-meta">${formatDate(msg.created_at)}</div>
      <div class="feed-body">${escapeHtml(msg.body || "")}</div>
    </div>
  `;
}

function renderWalletRow(tx) {
  const amount = safeNum(tx.amount);
  return `
    <div class="feed-card card">
      <div class="feed-name">${escapeHtml(tx.type || "transaction")}</div>
      <div class="feed-meta">${formatDate(tx.created_at)}</div>
      <div class="feed-body">${amount >= 0 ? "+" : ""}${amount.toFixed(2)}</div>
    </div>
  `;
}

function renderAvatarButton(profile) {
  const initials = getInitials(profile?.display_name || profile?.username || state.user?.email || "U");
  return `<button class="avatar-btn" data-go="profile" type="button">${escapeHtml(initials)}</button>`;
}
async function toggleFollow(targetUserId) {
  if (!state.user || !targetUserId || targetUserId === state.user.id) return;

  const isFollowing = state.followingIds.includes(targetUserId);

  if (isFollowing) {
    const result = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", state.user.id)
      .eq("following_id", targetUserId);

    if (result.error) {
      alert(result.error.message);
      return;
    }
  } else {
    const result = await supabase
      .from("follows")
      .insert({
        follower_id: state.user.id,
        following_id: targetUserId
      });

    if (result.error) {
      alert(result.error.message);
      return;
    }
  }

  await Promise.all([
    loadFollowing(),
    loadCreators()
  ]);

  render();
}
