// ============================================================
// EARNX — MASTER SCRIPT
// Real auth + real profiles + shell + themes + ranking
// ============================================================

const SUPABASE_URL = "https://duyltyirtffzomrnielr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1eWx0eWlydGZmem9tcm5pZWxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3Mjc3NzIsImV4cCI6MjA5MjMwMzc3Mn0.sy4lobYoxzFWcni2Umc1k-IHUGRojTgmP416tDltgD8";

let supabase = null;

const state = {
  session: null,
  profile: null,
  creators: [],
  appView: "home",
  authView: "login",
  theme: localStorage.getItem("earnx-theme") || "dark",
  discoverQuery: ""
};

document.addEventListener("DOMContentLoaded", boot);

async function boot() {
  applyTheme(state.theme);
  renderLoading();

  try {
    const mod = await Promise.race([
      import("https://esm.sh/@supabase/supabase-js@2"),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout loading Supabase")), 5000)
      )
    ]);

    if (!mod || !mod.createClient) {
      throw new Error("Could not load Supabase client.");
    }

    supabase = mod.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const sessionResult = await supabase.auth.getSession();
    if (sessionResult.error) {
      throw sessionResult.error;
    }

    state.session = sessionResult.data.session || null;

    if (state.session?.user) {
      await hydrateSession(state.session.user);
    }

    supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        state.session = session || null;

        if (session?.user) {
          await hydrateSession(session.user);
        } else {
          state.profile = null;
          state.creators = [];
          state.appView = "home";
          state.authView = "login";
        }

        render();
      } catch (err) {
        showError("Auth state error: " + getErrorMessage(err));
      }
    });

    render();
  } catch (err) {
    showError("Boot error: " + getErrorMessage(err));
  }
}

function setHTML(html) {
  const app = document.getElementById("app");
  if (app) app.innerHTML = html;
}

function getErrorMessage(err) {
  if (!err) return "Unknown error";
  if (typeof err === "string") return err;
  return err.message || String(err);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function applyTheme(theme) {
  document.body.classList.remove("dark-theme", "light-theme", "pink-theme");
  document.body.classList.add(theme + "-theme");
  state.theme = theme;
  localStorage.setItem("earnx-theme", theme);
}

function renderLoading() {
  setHTML(
    '<div class="loading-screen">' +
      '<div class="loading-brand">Earn<span>X</span></div>' +
      '<div class="spinner"></div>' +
    "</div>"
  );
}

function showError(msg) {
  setHTML(
    '<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;">' +
      '<div class="panel" style="max-width:760px;width:100%;padding:24px;">' +
        '<h2 style="margin:0 0 12px;">Error</h2>' +
        '<pre style="white-space:pre-wrap;word-break:break-word;color:var(--muted);margin:0;">' + escapeHtml(msg) + "</pre>" +
      "</div>" +
    "</div>"
  );
}

function sanitizeUsername(name) {
  return (name || "")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 20);
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

function timeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

async function hydrateSession(user) {
  await ensureProfile(user);
  await loadProfile(user.id);
  await loadCreators();
}

async function ensureProfile(user) {
  try {
    // tomar datos desde metadata o fallback
    const email = user.email || "";
    const rawUsername =
      user.user_metadata?.username ||
      (email ? email.split("@")[0] : "creator");

    const username = sanitizeUsername(rawUsername);
    const displayName =
      user.user_metadata?.displayName || username;

    // verificar si ya existe perfil
    const { data: existing, error: fetchError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (existing) return; // ya existe

    // crear perfil
    const { error } = await supabase.from("profiles").insert({
      id: user.id,
      username,
      display_name: displayName,
      created_at: new Date().toISOString()
    });

    if (error) throw error;

  } catch (err) {
    console.error("Profile error:", err);
  }
}async function ensureProfile(user) {
  try {
    // tomar datos desde metadata o fallback
    const email = user.email || "";
    const rawUsername =
      user.user_metadata?.username ||
      (email ? email.split("@")[0] : "creator");

    const username = sanitizeUsername(rawUsername);
    const displayName =
      user.user_metadata?.displayName || username;

    // verificar si ya existe perfil
    const { data: existing, error: fetchError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (existing) return; // ya existe

    // crear perfil
    const { error } = await supabase.from("profiles").insert({
      id: user.id,
      username,
      display_name: displayName,
      created_at: new Date().toISOString()
    });

    if (error) throw error;

  } catch (err) {
    console.error("Profile error:", err);
  }
}

async function loadProfile(userId) {
  const result = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (result.error) {
    console.warn("loadProfile:", result.error.message);
  }

  state.profile = result.data || null;
}

async function loadCreators() {
  const result = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(30);

  if (result.error) {
    console.warn("loadCreators:", result.error.message);
    state.creators = [];
    return;
  }

  state.creators = Array.isArray(result.data) ? result.data : [];
}

function filteredCreators() {
  const me = state.session?.user?.id || null;
  let list = state.creators.filter(item => item.id !== me);

  const q = state.discoverQuery.trim().toLowerCase();
  if (!q) return list;

  return list.filter(item =>
    String(item.username || "").toLowerCase().includes(q) ||
    String(item.display_name || "").toLowerCase().includes(q) ||
    String(item.category || "").toLowerCase().includes(q) ||
    String(item.bio || "").toLowerCase().includes(q)
  );
}

function creatorMetrics(item) {
  const followers = Number(item.followers_count || 0);
  const posts = Number(item.posts_count || 0);
  const earnings = Number(item.earnings_total || 0);
  const engagement = Number(item.engagement_score || 0);
  const score = followers * 8 + posts * 12 + earnings * 0.02 + engagement * 5 + (item.verified ? 40 : 0);

  return { followers, posts, earnings, engagement, score };
}

function topCreators() {
  return [...filteredCreators()]
    .map(item => ({ ...item, metrics: creatorMetrics(item) }))
    .sort((a, b) => b.metrics.score - a.metrics.score)
    .slice(0, 6);
}

function go(view) {
  state.appView = view;
  render();
}

function goAuth(view) {
  state.authView = view;
  render();
}

function render() {
  if (!state.session) {
    setHTML(renderAuthShell());
    bindAuth();
    return;
  }

  setHTML(renderAppShell());
  bindApp();
}

function renderAuthShell() {
  return (
    '<div class="auth-wrap">' +
      '<div class="auth-card">' +
        '<div class="auth-brand"></div>' +
        '<div class="auth-tagline">A premium social platform built around creator ambition, audience reach, and public ranking momentum.</div>' +
        '<div class="auth-copy">Designed for creators who want stronger positioning, cleaner monetization, and a product that feels elevated from the first touch.</div>' +
        '<div class="auth-tabs">' +
          '<button class="auth-tab ' + (state.authView === "login" ? "active" : "") + '" data-auth="login">Sign in</button>' +
          '<button class="auth-tab ' + (state.authView === "signup" ? "active" : "") + '" data-auth="signup">Create</button>' +
        '</div>' +
        (state.authView === "login" ? renderLoginCard() : renderSignupCard()) +
      '</div>' +
    '</div>'
  );
}

function renderLoginCard() {
  return (
    '<div id="auth-form">' +
      '<div class="auth-form-title">Login</div>' +
      '<div class="auth-form-subtitle">Enter your creator account.</div>' +
      '<div class="field">' +
        '<label for="a-email">Email</label>' +
        '<input id="a-email" type="email" placeholder="you@example.com" autocomplete="email" />' +
      '</div>' +
      '<div class="field">' +
        '<label for="a-pass">Password</label>' +
        '<input id="a-pass" type="password" placeholder="••••••••" autocomplete="current-password" />' +
      '</div>' +
      '<button class="btn-primary" id="auth-submit">Login</button>' +
    '</div>'
  );
}

function renderSignupCard() {
  return (
    '<div id="auth-form">' +
      '<div class="auth-form-title">Create account</div>' +
      '<div class="auth-form-subtitle">Build your identity on EarnX.</div>' +

      '<div class="field">' +
        '<label for="a-user">Username</label>' +
        '<input id="a-user" type="text" placeholder="yourhandle" autocomplete="username" />' +
      '</div>' +

      '<div class="field">' +
        '<label for="a-name">Display name</label>' +
        '<input id="a-name" type="text" placeholder="Your name" autocomplete="name" />' +
      '</div>' +

      '<div class="field">' +
        '<label for="a-email">Email</label>' +
        '<input id="a-email" type="email" placeholder="you@example.com" autocomplete="email" />' +
      '</div>' +

      '<div class="field">' +
        '<label for="a-pass">Password</label>' +
        '<input id="a-pass" type="password" placeholder="At least 8 characters" autocomplete="new-password" />' +
      '</div>' +

      '<button class="btn-primary" id="auth-submit">Create account</button>' +
    '</div>'
  );
}
function bindAuth() {
  document.querySelectorAll(".auth-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      goAuth(tab.dataset.auth);
    });
  });

  const submit = document.getElementById("auth-submit");
  if (!submit) return;

  submit.addEventListener("click", async () => {
    const email = ((document.getElementById("a-email") || {}).value || "").trim();
    const pass = ((document.getElementById("a-pass") || {}).value || "").trim();

    if (!email || !pass) {
      alert("Fill all fields.");
      return;
    }

    submit.disabled = true;
    renderLoading();

    try {
      if (state.authView === "login") {
        await handleLogin(email, pass);
                  } else {
        const username = document.getElementById("username").value;
const displayName = document.getElementById("displayName").value;
        const emailEl = document.getElementById("a-email");
        const passEl = document.getElementById("a-pass");

        const username = usernameEl ? usernameEl.value.trim() : "";
        const displayName = displayNameEl ? displayNameEl.value.trim() : "";
        const debugEmail = emailEl ? emailEl.value.trim() : "";
        const debugPass = passEl ? passEl.value : "";

        if (!username || !displayName || !debugEmail || !debugPass) {
          alert(
            "username: [" + username + "]\n" +
            "displayName: [" + displayName + "]\n" +
            "email: [" + debugEmail + "]\n" +
            "pass length: " + debugPass.length
          );
          render();
          return;
        }

        await handleSignup(debugEmail, debugPass, username, displayName);
      }
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      submit.disabled = false;
    }
  });
}

async function handleLogin(email, pass) {
  const result = await supabase.auth.signInWithPassword({
    email,
    password: pass
  });

  if (result.error) {
    render();
    alert(result.error.message);
  }
}

async function handleSignup(email, pass, username, displayName) {
  const cleanUsername = sanitizeUsername(username);

  if (!cleanUsername) {
    render();
    alert("Choose a valid username.");
    return;
  }

  const result = await supabase.auth.signUp({
    email,
    password: pass,
    options: {
      data: {
        username: cleanUsername,
        display_name: displayName.trim()
      }
    }
  });

  if (result.error) {
    render();
    alert(result.error.message);
    return;
  }

  if (result.data?.user) {
    await ensureProfile(result.data.user);
  }

  state.authView = "login";
  render();
  alert("Account created. Log in now.");
}

function renderAppShell() {
  return renderCurrentView() + renderBottomNav();
}

function renderCurrentView() {
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

function renderBottomNav() {
  const items = [
    { route: "home", label: "Home", icon: icoHome() },
    { route: "discover", label: "Discover", icon: icoDiscover() },
    { route: "messages", label: "Messages", icon: icoMessages() },
    { route: "wallet", label: "Wallet", icon: icoWallet() },
    { route: "profile", label: "Profile", icon: icoProfile() }
  ];

  return (
    '<nav class="bottom-nav">' +
      items.map(item =>
        '<button class="nav-item ' + (state.appView === item.route ? "active" : "") + '" data-route="' + item.route + '">' +
          item.icon +
          '<span class="nav-label">' + item.label + '</span>' +
        '</button>'
      ).join("") +
    '</nav>'
  );
}

function renderStories() {
  const list = filteredCreators().slice(0, 8);

  if (list.length === 0) {
    return (
      '<div class="stories-strip">' +
        '<div class="story-item">' +
          '<div class="story-ring seen"><div class="story-avatar">?</div></div>' +
          '<span class="story-name">No one yet</span>' +
        '</div>' +
      '</div>'
    );
  }

  return (
    '<div class="stories-strip">' +
      list.map(item => {
        const initials = getInitials(item.display_name || item.username || "U");
        const avatar = item.avatar_url
          ? '<img src="' + escapeHtml(item.avatar_url) + '" alt="' + initials + '" />'
          : initials;

        return (
          '<div class="story-item">' +
            '<div class="story-ring"><div class="story-avatar">' + avatar + '</div></div>' +
            '<span class="story-name">' + escapeHtml(item.username || "creator") + '</span>' +
          '</div>'
        );
      }).join("") +
    '</div>'
  );
}

function renderHome() {
  const profile = state.profile;
  const name = profile?.display_name || profile?.username || "Creator";
  const top = topCreators();

  return (
    '<div class="page">' +
      '<div class="home-top">' +
        '<div>' +
          '<div class="home-greeting">Good ' + timeOfDay() + '</div>' +
          '<div class="home-name">' + escapeHtml(name) + '<span>.</span></div>' +
        '</div>' +
        renderAvatarButton(profile) +
      '</div>' +

      '<div class="stats-row">' +
        '<div class="stat-card"><div class="stat-value accent">$' + escapeHtml(Number(profile?.earnings_total || 0).toFixed(0)) + '</div><div class="stat-label">Earnings</div></div>' +
        '<div class="stat-card"><div class="stat-value">' + escapeHtml(profile?.followers_count || 0) + '</div><div class="stat-label">Followers</div></div>' +
        '<div class="stat-card"><div class="stat-value">' + escapeHtml(profile?.posts_count || 0) + '</div><div class="stat-label">Posts</div></div>' +
      '</div>' +

      '<div class="section-label">Stories</div>' +
      renderStories() +

      '<div class="section-label">Top creators</div>' +
      '<div class="market-grid">' +
        (
          top.length === 0
            ? '<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">↗</div><div class="empty-title">No ranking yet</div><div class="empty-desc">Add stats columns like followers_count, posts_count, earnings_total, engagement_score to see a real leaderboard.</div></div>'
            : top.map(item => {
                const m = item.metrics;
                return (
                  '<div class="top-card">' +
                    '<div class="market-row" style="padding:0;border:none;background:transparent;">' +
                      '<div>' +
                        '<div class="market-name">' + escapeHtml(item.display_name || item.username || "Creator") + '</div>' +
                        '<div class="market-symbol">$' + escapeHtml((item.username || "earnx").slice(0, 6).toUpperCase()) + '</div>' +
                      '</div>' +
                      '<div class="market-num">' + escapeHtml(m.followers) + '</div>' +
                      '<div class="market-num">' + escapeHtml(m.posts) + '</div>' +
                      '<div class="market-num market-up">' + escapeHtml(m.score.toFixed(0)) + '</div>' +
                    '</div>' +
                    '<div class="top-meta" style="margin-top:8px;">Followers / Posts / Score</div>' +
                  '</div>'
                );
              }).join("")
        ) +
      '</div>' +

      '<div class="section-label">Feed</div>' +
      '<div class="feed">' +
        '<div class="empty-state">' +
          '<div class="empty-icon">&#10022;</div>' +
          '<div class="empty-title">Feed coming next</div>' +
          '<div class="empty-desc">This shell is real. When you add posts and follows tables, the home feed drops in here.</div>' +
        '</div>' +
      '</div>' +
    '</div>'
  );
}

function renderDiscover() {
  const creators = filteredCreators();

  return (
    '<div class="page">' +
      '<div class="page-header">' +
        '<div>' +
          '<div class="page-title">Discover</div>' +
          '<div class="page-subtitle">Find creators to follow</div>' +
        '</div>' +
      '</div>' +
      '<div class="search-bar">' +
        icoSearch() +
        '<input type="search" id="discover-search" placeholder="Search creators..." value="' + escapeHtml(state.discoverQuery) + '" />' +
      '</div>' +
      '<div class="creator-grid">' +
        (
          creators.length === 0
            ? '<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">&#128269;</div><div class="empty-title">No creators found</div><div class="empty-desc">Try another search or create more profiles.</div></div>'
            : creators.map(item => {
                const name = item.display_name || item.username || "Creator";
                const initials = getInitials(name);
                const avatar = item.avatar_url
                  ? '<img src="' + escapeHtml(item.avatar_url) + '" alt="' + initials + '" />'
                  : initials;

                return (
                  '<div class="creator-card">' +
                    '<div class="creator-avatar-lg">' + avatar + '</div>' +
                    (item.verified ? '<div class="verified-badge">' + icoCheck() + ' Verified</div>' : '') +
                    '<div class="creator-name">' + escapeHtml(name) + '</div>' +
                    '<div class="creator-handle">@' + escapeHtml(item.username || "creator") + '</div>' +
                    (item.bio ? '<div class="creator-bio">' + escapeHtml(item.bio) + '</div>' : '') +
                    '<button class="btn-follow" type="button">Follow soon</button>' +
                  '</div>'
                );
              }).join("")
        ) +
      '</div>' +
    '</div>'
  );
}

function renderMessages() {
  return (
    '<div class="page">' +
      '<div class="page-header">' +
        '<div>' +
          '<div class="page-title">Messages</div>' +
          '<div class="page-subtitle">Your conversations</div>' +
        '</div>' +
      '</div>' +
      '<div class="message-list">' +
        '<div class="empty-state">' +
          '<div class="empty-icon">&#128172;</div>' +
          '<div class="empty-title">Messaging shell ready</div>' +
          '<div class="empty-desc">When you add a messages table, inbox and threads plug into this view without changing the app shell.</div>' +
        '</div>' +
      '</div>' +
    '</div>'
  );
}

function renderProfile() {
  const user = state.profile;
  const name = user?.display_name || user?.username || "You";
  const handle = user?.username ? "@" + user.username : user?.email || "";
  const bio = user?.bio || "No bio yet.";
  const coverInner = user?.cover_url
    ? '<img src="' + escapeHtml(user.cover_url) + '" alt="cover" />'
    : '<div class="profile-cover-glow"></div>';

  return (
    '<div class="page" style="padding-top:0">' +
      '<div class="profile-cover">' + coverInner + '</div>' +
      '<div class="profile-info">' +
        '<div class="profile-avatar-row">' +
          renderProfileAvatar(user) +
          '<button class="settings-action-btn" data-go="settings">Edit profile</button>' +
        '</div>' +
        '<div class="profile-name">' + escapeHtml(name) + '</div>' +
        '<div class="profile-handle">' + escapeHtml(handle) + '</div>' +
        (user?.verified ? '<div class="chip" style="margin-top:8px;">' + icoCheck() + ' Verified</div>' : '') +
        '<div class="profile-meta">' +
          (user?.country ? '<div class="profile-meta-item">' + icoGlobe() + escapeHtml(user.country) + '</div>' : '') +
          (user?.category ? '<div class="profile-meta-item">' + icoTag() + escapeHtml(user.category) + '</div>' : '') +
        '</div>' +
        '<div class="profile-bio">' + escapeHtml(bio) + '</div>' +
        '<div class="profile-stats">' +
          '<div class="profile-stat"><div class="profile-stat-val">' + escapeHtml(user?.posts_count || 0) + '</div><div class="profile-stat-label">Posts</div></div>' +
          '<div class="profile-stat"><div class="profile-stat-val">' + escapeHtml(user?.followers_count || 0) + '</div><div class="profile-stat-label">Followers</div></div>' +
          '<div class="profile-stat"><div class="profile-stat-val">$' + escapeHtml(Number(user?.earnings_total || 0).toFixed(0)) + '</div><div class="profile-stat-label">Earned</div></div>' +
        '</div>' +
        '<div class="profile-divider"></div>' +
        '<div class="empty-state">' +
          '<div class="empty-icon">&#10022;</div>' +
          '<div class="empty-title">Profile ready</div>' +
          '<div class="empty-desc">Your content layer connects here next.</div>' +
        '</div>' +
      '</div>' +
    '</div>'
  );
}

function renderWallet() {
  const earnings = Number(state.profile?.earnings_total || 0);

  return (
    '<div class="page">' +
      '<div class="page-header">' +
        '<div>' +
          '<div class="page-title">Wallet</div>' +
          '<div class="page-subtitle">Balance and transactions</div>' +
        '</div>' +
      '</div>' +
      '<div class="wallet-card">' +
        '<div class="wallet-label">Available Balance</div>' +
        '<div class="wallet-amount"><span>$</span>' + escapeHtml(earnings.toFixed(2)) + '</div>' +
        '<div class="wallet-sub">Uses earnings_total if that column exists in profiles.</div>' +
      '</div>' +
      '<div class="wallet-actions">' +
        '<button class="btn-wallet primary">Add Funds</button>' +
        '<button class="btn-wallet">Withdraw</button>' +
      '</div>' +
      '<div class="section-label">Transactions</div>' +
      '<div class="tx-list">' +
        '<div class="empty-state">' +
          '<div class="empty-icon">&#128179;</div>' +
          '<div class="empty-title">Wallet shell ready</div>' +
          '<div class="empty-desc">When you add a transactions table, real movements will appear here.</div>' +
        '</div>' +
      '</div>' +
    '</div>'
  );
}

function renderSettings() {
  const user = state.profile || {};
  return (
    '<div class="page">' +
      '<div class="page-header"><div class="page-title">Settings</div></div>' +
      '<div class="settings-list">' +

        '<div class="settings-section-label">Appearance</div>' +
        '<div class="settings-row">' +
          '<div class="settings-icon">' + icoSun() + '</div>' +
          '<div class="settings-text">' +
            '<div class="settings-label">Theme</div>' +
            '<div class="settings-desc">Dark, light or pink</div>' +
            '<div class="theme-picker">' +
              '<button class="theme-swatch ' + (state.theme === "dark" ? "active" : "") + '" data-theme="dark">Dark</button>' +
              '<button class="theme-swatch ' + (state.theme === "light" ? "active" : "") + '" data-theme="light">Light</button>' +
              '<button class="theme-swatch ' + (state.theme === "pink" ? "active" : "") + '" data-theme="pink">Pink</button>' +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div class="settings-section-label">Profile</div>' +
        renderSettingsField("Display name", "set-display-name", user.display_name || "") +
        renderSettingsField("Username", "set-username", user.username || "") +
        renderSettingsField("Bio", "set-bio", user.bio || "") +
        renderSettingsField("Country", "set-country", user.country || "") +
        renderSettingsField("Category", "set-category", user.category || "") +

        '<div class="settings-row">' +
          '<div class="settings-icon">' + icoUser() + '</div>' +
          '<div class="settings-text">' +
            '<div class="settings-label">' + escapeHtml(user.email || "") + '</div>' +
            '<div class="settings-desc">Account email</div>' +
          '</div>' +
        '</div>' +

        '<div class="settings-row">' +
          '<button class="settings-action-btn" id="btn-save-profile">Save profile</button>' +
        '</div>' +

        '<div class="settings-row">' +
          '<div class="settings-icon">' + icoLock() + '</div>' +
          '<div class="settings-text">' +
            '<div class="settings-label">Change Password</div>' +
            '<div class="settings-desc">Send a reset link to your email</div>' +
          '</div>' +
          '<button class="settings-action-btn" id="btn-reset-pw">Send</button>' +
        '</div>' +

        '<div class="settings-section-label">Account Actions</div>' +
        '<button class="btn-danger" id="btn-logout">Sign out</button>' +
      '</div>' +
    '</div>'
  );
}

function renderSettingsField(label, id, value) {
  return (
    '<div class="settings-row">' +
      '<div class="settings-text">' +
        '<div class="settings-label">' + escapeHtml(label) + '</div>' +
        '<input id="' + id + '" type="text" value="' + escapeHtml(value) + '" style="margin-top:8px;" />' +
      '</div>' +
    '</div>'
  );
}

function bindApp() {
  document.querySelectorAll(".nav-item").forEach(item => {
    item.addEventListener("click", () => go(item.dataset.route));
  });

  document.querySelectorAll("[data-go]").forEach(item => {
    item.addEventListener("click", () => go(item.dataset.go));
  });

  const search = document.getElementById("discover-search");
  if (search) {
    search.addEventListener("input", () => {
      state.discoverQuery = search.value || "";
      render();
    });
  }

  document.querySelectorAll("[data-theme]").forEach(btn => {
    btn.addEventListener("click", () => {
      applyTheme(btn.dataset.theme);
      render();
    });
  });

  const saveBtn = document.getElementById("btn-save-profile");
  if (saveBtn) saveBtn.addEventListener("click", saveProfileSettings);

  const resetBtn = document.getElementById("btn-reset-pw");
  if (resetBtn) {
    resetBtn.addEventListener("click", async () => {
      const email = state.session?.user?.email;
      if (!email) return;
      const result = await supabase.auth.resetPasswordForEmail(email);
      if (result.error) alert(result.error.message);
      else alert("Reset email sent.");
    });
  }

  const logoutBtn = document.getElementById("btn-logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      const result = await supabase.auth.signOut();
      if (result.error) alert(result.error.message);
    });
  }
}

async function saveProfileSettings() {
  try {
    if (!state.session?.user) return;

    const display_name = ((document.getElementById("set-display-name") || {}).value || "").trim();
    const username = sanitizeUsername((document.getElementById("set-username") || {}).value || "");
    const bio = ((document.getElementById("set-bio") || {}).value || "").trim();
    const country = ((document.getElementById("set-country") || {}).value || "").trim();
    const category = ((document.getElementById("set-category") || {}).value || "").trim();

    if (!display_name || !username) {
      alert("Display name and username are required.");
      return;
    }

    const result = await supabase
      .from("profiles")
      .update({ display_name, username, bio, country, category })
      .eq("id", state.session.user.id);

    if (result.error) {
      alert(result.error.message);
      return;
    }

    await loadProfile(state.session.user.id);
    await loadCreators();
    state.appView = "profile";
    render();
    alert("Profile updated.");
  } catch (err) {
    alert(getErrorMessage(err));
  }
}

function renderAvatarButton(profile) {
  const initials = getInitials(profile?.display_name || profile?.username || profile?.email || "U");
  if (profile?.avatar_url) {
    return '<button class="avatar-btn" data-go="profile"><img src="' + escapeHtml(profile.avatar_url) + '" alt="' + initials + '" /></button>';
  }
  return '<button class="avatar-btn" data-go="profile">' + escapeHtml(initials) + '</button>';
}

function renderProfileAvatar(profile) {
  const initials = getInitials(profile?.display_name || profile?.username || profile?.email || "U");
  if (profile?.avatar_url) {
    return '<div class="profile-avatar"><img src="' + escapeHtml(profile.avatar_url) + '" alt="' + initials + '" /></div>';
  }
  return '<div class="profile-avatar">' + escapeHtml(initials) + '</div>';
}

function ico(path) {
  return '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + path + '</svg>';
}

function icoHome()     { return ico('<path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>'); }
function icoDiscover() { return ico('<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>'); }
function icoMessages() { return ico('<path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>'); }
function icoWallet()   { return ico('<path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>'); }
function icoProfile()  { return ico('<path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>'); }
function icoSearch()   { return '<svg class="search-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="8"/><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35"/></svg>'; }
function icoSun()      { return ico('<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>'); }
function icoUser()     { return ico('<path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>'); }
function icoLock()     { return ico('<path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>'); }
function icoCheck()    { return ico('<path d="M5 13l4 4L19 7"/>'); }
function icoGlobe()    { return ico('<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/>'); }
function icoTag()      { return ico('<path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01"/>'); }
