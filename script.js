import { createClient } from "https://esm.sh/@supabase/supabase-js";

const supabaseUrl = "https://duyltyirtffzomrnielr.supabase.co";
const supabaseKey = "TU_PUBLISHABLE_KEY_REAL";
const supabase = createClient(supabaseUrl, supabaseKey);
const STORAGE_KEY = "earnx_master_0_2";

const initialUI = {
  authView: "login",
  appView: "home",
  discoverCategory: "all",
  searchQuery: "",
  theme: "dark",
  messagesView: "inbox",
  activeConvoUserId: null,
  feedFilter: "following",
  profileUserId: null,
  settingsTab: "preferences"
};

const initialSettings = {
  notifications: {
    app: true,
    messages: true,
    marketing: false
  },
  privacy: {
    privateProfile: false,
    hideActivity: false
  },
  preferences: {
    compactFeed: false,
    autoplayMedia: true
  },
  account: {
    creatorMode: true
  }
};

function createInitialState() {
  return {
    sessionUserId: null,
    session: null,
    profile: null,
    ui: { ...initialUI },
    settings: structuredClone(initialSettings),
    posts: [],
    creators: [],
    messages: [],
    wallet: {
      available: 0,
      pending: 0,
      reserved: 0,
      paidOut: 0,
      recentTransactions: []
    }
  };
}

let state = createInitialState();

document.addEventListener("DOMContentLoaded", async () => {
  loadState();
  applyTheme();

  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (session?.user) {
    await syncSessionIntoState(session.user);
  }

  document.addEventListener("DOMContentLoaded", async () => {
  loadState();
  applyTheme();

  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (session?.user) {
    await syncSessionIntoState(session.user);
  }

  supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session?.user) {
      await syncSessionIntoState(session.user);
    } else {
      state.sessionUserId = null;
      state.ui.authView = "login";
      state.ui.appView = "home";
      state.ui.messagesView = "inbox";
      state.ui.activeConvoUserId = null;
      state.ui.profileUserId = null;
    }

    saveState();
    render();
  });

  render();
});
/* -------------------------
   STORAGE
------------------------- */
function saveState() {
  const persistable = {
    ui: state.ui,
    settings: state.settings,
    wallet: state.wallet
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable));
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    const parsed = JSON.parse(raw);

    state = {
      ...createInitialState(),
      ...state,
      ui: { ...initialUI, ...(parsed.ui || {}) },
      settings: {
        ...structuredClone(initialSettings),
        ...(parsed.settings || {})
      },
      wallet: {
        ...createInitialState().wallet,
        ...(parsed.wallet || {})
      }
    };
  } catch (err) {
    console.warn("Could not load state", err);
  }
}

/* -------------------------
   SUPABASE USER / PROFILE
------------------------- */
async function hydrateSessionUser(user) {
  state.sessionUserId = user.id;

  const baseProfile = {
    id: user.id,
    username:
      user.user_metadata?.username ||
      user.email?.split("@")[0] ||
      "creator",
    email: user.email || "",
    displayName:
      user.user_metadata?.display_name ||
      user.user_metadata?.full_name ||
      user.email?.split("@")[0] ||
      "Creator",
    country: "PR",
    verified: false,
    category: "creator",
    bio: "New creator on EARNX.",
    avatarUrl: "",
    coverUrl: ""
  };

  let dbProfile = null;

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.warn("Profile fetch warning:", error.message);
    }

    dbProfile = data || null;
  } catch (err) {
    console.warn("Profile fetch failed:", err);
  }

  state.profile = {
    ...baseProfile,
    ...(dbProfile
      ? {
          username: dbProfile.username || baseProfile.username,
          displayName:
            dbProfile.display_name ||
            dbProfile.full_name ||
            baseProfile.displayName,
          bio: dbProfile.bio || baseProfile.bio,
          avatarUrl: dbProfile.avatar_url || "",
          coverUrl: dbProfile.cover_url || "",
          country: dbProfile.country || baseProfile.country,
          category: dbProfile.category || baseProfile.category,
          verified: !!dbProfile.verified
        }
      : {})
  };

  state.ui.profileUserId = user.id;
}

/* -------------------------
   HELPERS
------------------------- */
 async function syncSessionIntoState(user) {
  const email = (user.email || "").toLowerCase();

  let localUser = state.users.find(
    item => (item.email || "").toLowerCase() === email
  );

  let profileData = null;

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (!error) {
      profileData = data;
    }
  } catch (err) {
    console.warn("Profile fetch failed", err);
  }

  if (!localUser) {
    localUser = {
      id: user.id,
      username:
        profileData?.username ||
        user.user_metadata?.username ||
        email.split("@")[0],
      email,
      password: "",
      displayName:
        profileData?.display_name ||
        user.user_metadata?.display_name ||
        email.split("@")[0],
      country: profileData?.country || "PR",
      verified: !!profileData?.verified,
      category: profileData?.category || "creator",
      bio: profileData?.bio || "New creator on EARNX.",
      avatarUrl: profileData?.avatar_url || "",
      coverUrl: profileData?.cover_url || ""
    };

    state.users.push(localUser);
  }

  state.sessionUserId = localUser.id;
  state.ui.profileUserId = localUser.id;
} 
function currentUser() {
  return state.profile || null;
}

function userById(id) {
  if (!id) return null;
  if (state.profile?.id === id) return state.profile;
  return state.creators.find(user => user.id === id) || null;
}

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map(part => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatRelative(timestamp) {
  if (!timestamp) return "now";
  const diff = Date.now() - timestamp;
  const hours = Math.floor(diff / (1000 * 60 * 60));

  if (hours < 1) return "now";
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

function formatChatTime(timestamp) {
  return new Date(timestamp || Date.now()).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatMoney(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function followerCount(id) {
  if (!id) return 0;
  return 0;
}

function followingCount(id) {
  if (!id) return 0;
  return 0;
}

function userPosts(id) {
  return state.posts
    .filter(post => post.userId === id)
    .sort((a, b) => b.createdAt - a.createdAt);
}

function isFollowing(_followerId, _followingId) {
  return false;
}

function scoreUser(user) {
  if (!user) return 0;
  return (
    followerCount(user.id) * 10 +
    userPosts(user.id).length * 20 +
    (user.verified ? 50 : 0)
  );
}

function totalUnreadCount() {
  const me = state.sessionUserId;
  return state.messages.filter(
    message => message.toUserId === me && !message.read
  ).length;
}

function unreadCountForUser(userId) {
  const me = state.sessionUserId;
  return state.messages.filter(
    message =>
      message.fromUserId === userId &&
      message.toUserId === me &&
      !message.read
  ).length;
}

function getConversations() {
  const me = state.sessionUserId;
  const map = new Map();

  state.messages.forEach(message => {
    const isMine = message.fromUserId === me;
    const isToMe = message.toUserId === me;
    if (!isMine && !isToMe) return;

    const otherId = isMine ? message.toUserId : message.fromUserId;
    const existing = map.get(otherId);

    if (!existing || existing.lastMessage.createdAt < message.createdAt) {
      map.set(otherId, {
        userId: otherId,
        lastMessage: message
      });
    }
  });

  return Array.from(map.values()).sort(
    (a, b) => b.lastMessage.createdAt - a.lastMessage.createdAt
  );
}

function getThread(userId) {
  const me = state.sessionUserId;

  return state.messages
    .filter(
      message =>
        (message.fromUserId === me && message.toUserId === userId) ||
        (message.fromUserId === userId && message.toUserId === me)
    )
    .sort((a, b) => a.createdAt - b.createdAt);
}

function markConversationAsRead(userId) {
  const me = state.sessionUserId;

  state.messages = state.messages.map(message => {
    if (message.fromUserId === userId && message.toUserId === me) {
      return { ...message, read: true };
    }
    return message;
  });
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
async function login(identifier, password) {
  const email = identifier.trim().toLowerCase();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    alert(error.message);
    return;
  }

  state.ui.appView = "home";
  saveState();
  render();
}
async function signup({ displayName, username, email, password }) {
  const emailNorm = email.trim().toLowerCase();
  const usernameNorm = username.trim().toLowerCase();

  const { data, error } = await supabase.auth.signUp({
    email: emailNorm,
    password: password.trim(),
    options: {
      data: {
        display_name: displayName.trim(),
        username: usernameNorm
      }
    }
  });

  if (error) {
    alert(error.message);
    return;
  }

  if (data.user) {
    const newLocalUser = {
      id: data.user.id,
      username: usernameNorm,
      email: emailNorm,
      password: "",
      displayName: displayName.trim(),
      country: "PR",
      verified: false,
      category: "creator",
      bio: "New creator on EARNX.",
      avatarUrl: "",
      coverUrl: ""
    };

    const exists = state.users.find(
      user => (user.email || "").toLowerCase() === emailNorm
    );

    if (!exists) {
      state.users.push(newLocalUser);
    }

    try {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        username: usernameNorm,
        display_name: displayName.trim(),
        email: emailNorm,
        bio: "New creator on EARNX."
      });
    } catch (err) {
      console.warn("Profile upsert failed", err);
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
  state.ui.authView = "login";
  state.ui.appView = "home";
  state.ui.messagesView = "inbox";
  state.ui.activeConvoUserId = null;
  state.ui.profileUserId = null;
  saveState();
  render();
}
/* -------------------------
   APP ACTIONS
------------------------- */
function setAppView(view) {
  state.ui.appView = view;

  if (view !== "messages") {
    state.ui.messagesView = "inbox";
    state.ui.activeConvoUserId = null;
  }

  if (view === "profile" && !state.ui.profileUserId && state.profile?.id) {
    state.ui.profileUserId = state.profile.id;
  }

  saveState();
  render();
}

function setProfile(id) {
  state.ui.profileUserId = id;
  state.ui.appView = "profile";
  saveState();
  render();
}

function setSettingsTab(tab) {
  state.ui.settingsTab = tab;
  saveState();
  render();
}

function toggleLike(_postId) {
  alert("Likes will be enabled when posts are connected to the backend.");
}

function toggleFollow(_targetUserId) {
  alert("Follow will be enabled when creators/follows are connected.");
}

function updatePreference(path, value) {
  const [group, key] = path.split(".");
  if (!state.settings[group]) return;
  state.settings[group][key] = value;
  saveState();
  render();
}

function subscribeToCreator(_creatorId) {
  alert("Subscriptions will be enabled when billing tables are connected.");
}

function unsubscribeFromCreator(_creatorId) {
  alert("Subscriptions will be enabled when billing tables are connected.");
}

function openChat(userId) {
  state.ui.appView = "messages";
  state.ui.messagesView = "chat";
  state.ui.activeConvoUserId = userId;
  markConversationAsRead(userId);
  saveState();
  render();
}

function goInbox() {
  state.ui.messagesView = "inbox";
  state.ui.activeConvoUserId = null;
  saveState();
  render();
}

function sendMessage(_toUserId, _text) {
  alert("Messaging will be enabled when the messages table is connected.");
}

/* -------------------------
   RENDER HELPERS
------------------------- */
function renderAvatar(user, extraClass = "") {
  const url = user?.avatarUrl || "";
  const initials = getInitials(user?.displayName || user?.username || "?");

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
  const unread = totalUnreadCount();

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
                ${
                  item.key === "messages" && unread > 0
                    ? `<span class="bottom-nav-badge">${unread > 9 ? "9+" : unread}</span>`
                    : ""
                }
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
   HOME UI
------------------------- */
function renderHome() {
  const me = currentUser();

  return `
    <section class="hero-home">
      <div class="hero-home-copy">
        <div class="page-kicker">EarnX</div>
        <h2>Build. Create. Own.</h2>
        <p>${me ? `Welcome back, ${escapeHtml(me.displayName)}.` : "Premium creator infrastructure for content, discovery, messaging, subscriptions, and audience momentum."}</p>
      </div>

      <div class="hero-actions">
        <button class="btn btn-primary" data-nav="discover">Discover talent</button>
        <button class="btn btn-secondary" data-nav="profile">Open profile</button>
      </div>
    </section>

    <section class="section">
      <div class="section-head">
        <h3>Feed</h3>
        <span class="section-meta">Backend feed not connected yet</span>
      </div>

      <div class="feed-list" style="margin-top:18px;">
        <div class="profile-empty">
          <h3>No posts yet</h3>
          <p>Your real feed will appear here when posts are connected to Supabase.</p>
        </div>
      </div>
    </section>
  `;
}

/* -------------------------
   DISCOVER UI
------------------------- */
function renderDiscover() {
  return `
    <div class="topbar">
      <div class="topbar-row">
        <div>
          <span class="page-kicker">Discover</span>
          <h1 class="page-title">Discover creators</h1>
          <p class="page-subtitle">Creators will appear here when the discover backend is connected.</p>
        </div>
      </div>
    </div>

    <div>
      <input class="search-input" id="searchInput" placeholder="Search creators, categories, talent..." value="${escapeHtml(state.ui.searchQuery)}" />
    </div>

    <section class="section">
      <div class="section-head">
        <h3>Talent browser</h3>
        <span class="section-meta">0 creators connected</span>
      </div>

      <div class="list">
        <div class="profile-empty">
          <h3>No creators yet</h3>
          <p>Connect the profiles/discover tables and they will render here.</p>
        </div>
      </div>
    </section>
  `;
}

/* -------------------------
   PROFILE UI
------------------------- */
function renderProfile() {
  const me = currentUser();

  if (!me) {
    return `
      <section class="panel">
        <div class="profile-empty">
          <h3>Profile unavailable</h3>
          <p>No active user loaded yet.</p>
        </div>
      </section>
    `;
  }

  const profile = me;
  const posts = userPosts(profile.id) || [];

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
          ${renderAvatar(profile, "avatar-xl")}
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
            <span class="chip">Score ${scoreUser(profile)}</span>
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
            <strong>${posts.length}</strong>
            <span>Posts</span>
          </div>
        </div>

        <div class="profile-action-row" style="margin-top:18px;">
          <button class="btn btn-primary">Edit profile</button>
          <button class="btn btn-secondary" data-nav="wallet">Creator wallet</button>
          <button class="btn btn-secondary" data-nav="settings">Settings</button>
        </div>

        <div class="profile-tabs" style="margin-top:22px;">
          <div class="profile-tab active">Posts</div>
          <div class="profile-tab">Media</div>
          <div class="profile-tab">Premium</div>
        </div>

        <div class="feed-list" style="margin-top:18px;">
          <div class="profile-empty">
            <h3>No posts yet</h3>
            <p>Your published content will appear here once posts are connected.</p>
          </div>
        </div>
      </div>
    </section>
  `;
}

/* -------------------------
   MESSAGES UI
------------------------- */
function renderMessages() {
  if (state.ui.messagesView === "chat" && state.ui.activeConvoUserId) {
    return renderChatView();
  }
  return renderInboxView();
}

function renderInboxView() {
  const conversations = getConversations();

  return `
    <div class="topbar">
      <div>
        <span class="page-kicker">Messages</span>
        <h1 class="page-title">Inbox</h1>
        <p class="page-subtitle">Messaging backend not connected yet</p>
      </div>
    </div>

    <div class="messages-shell">
      <section class="inbox-panel">
        <div class="inbox-head">
          <div>
            <h3>Conversations</h3>
            <p class="page-subtitle">${conversations.length} active chats</p>
          </div>
        </div>

        ${
          conversations.length
            ? `<div class="inbox-list">${conversations.map(renderConversationRow).join("")}</div>`
            : `<div class="inbox-empty"><div class="inbox-empty-icon">💬</div><h3>Your inbox is quiet</h3><p>Messages will appear here once the backend is connected.</p></div>`
        }
      </section>

      <section class="chat-panel">
        <div class="inbox-empty">
          <div class="inbox-empty-icon">✉️</div>
          <h3>Select a conversation</h3>
          <p>Messaging will unlock here later.</p>
        </div>
      </section>
    </div>
  `;
}

function renderConversationRow(conversation) {
  const user = userById(conversation.userId);
  const unread = unreadCountForUser(conversation.userId);

  return `
    <div class="convo-row ${state.ui.activeConvoUserId === conversation.userId ? "active" : ""}" data-open-chat="${escapeHtml(conversation.userId)}">
      ${renderAvatar(user || currentUser(), "avatar-md")}
      <div class="convo-body">
        <div class="convo-top">
          <span class="convo-name">${escapeHtml(user?.displayName || "User")}</span>
          <span class="convo-time">${formatRelative(conversation.lastMessage.createdAt)}</span>
        </div>
        <div class="convo-preview">${escapeHtml(conversation.lastMessage.text)}</div>
        <div class="convo-meta">
          <span class="convo-badge">@${escapeHtml(user?.username || "user")}</span>
          ${unread > 0 ? `<span class="convo-unread">${unread}</span>` : ""}
        </div>
      </div>
    </div>
  `;
}

function renderChatView() {
  const user = userById(state.ui.activeConvoUserId) || currentUser();
  const thread = getThread(user.id);

  return `
    <div class="topbar">
      <div>
        <span class="page-kicker">Messages</span>
        <h1 class="page-title">Chat</h1>
        <p class="page-subtitle">Private thread with @${escapeHtml(user.username || "user")}</p>
      </div>
    </div>

    <div class="messages-shell">
      <section class="inbox-panel">
        <div class="inbox-head">
          <div>
            <h3>Conversations</h3>
            <p class="page-subtitle">${getConversations().length} active chats</p>
          </div>
        </div>

        <div class="inbox-list">
          ${getConversations().map(renderConversationRow).join("")}
        </div>
      </section>

      <section class="chat-panel">
        <div class="chat-topbar">
          <button class="icon-btn" id="backToInboxBtn">←</button>
          <div class="chat-header-id">
            ${renderAvatar(user, "avatar-sm")}
            <div>
              <div class="chat-header-name">${escapeHtml(user.displayName || "User")}</div>
              <div class="chat-header-handle">@${escapeHtml(user.username || "user")}</div>
            </div>
          </div>
        </div>

        <div class="chat-messages">
          ${
            thread.length
              ? thread.map(renderBubble).join("")
              : `<div class="chat-day-label">Messaging backend not connected</div>`
          }
        </div>

        <div class="chat-input-bar">
          <form id="chatForm">
            <div class="chat-input-row">
              <textarea class="chat-textarea" id="chatTextarea" placeholder="Write a message..."></textarea>
              <button class="chat-send-btn" type="submit">➤</button>
            </div>
          </form>
        </div>
      </section>
    </div>
  `;
}

function renderBubble(message) {
  const mine = message.fromUserId === state.sessionUserId;
  const sender = userById(message.fromUserId) || currentUser();

  return `
    <div class="bubble-row ${mine ? "bubble-row-mine" : "bubble-row-theirs"}">
      ${mine ? "" : renderAvatar(sender, "avatar-xs")}
      <div class="bubble ${mine ? "bubble-mine" : "bubble-theirs"}">
        <p>${escapeHtml(message.text)}</p>
        <span class="bubble-time">${formatChatTime(message.createdAt)}</span>
      </div>
    </div>
  `;
}

/* -------------------------
   WALLET UI
------------------------- */
function renderWallet() {
  const me = currentUser();

  if (!me) {
    return `
      <section class="panel">
        <div class="profile-empty">
          <h3>Wallet unavailable</h3>
          <p>No active user loaded yet.</p>
        </div>
      </section>
    `;
  }

  const wallet = state.wallet || {
    available: 0,
    pending: 0,
    reserved: 0,
    paidOut: 0,
    recentTransactions: []
  };

  const transactions = Array.isArray(wallet.recentTransactions)
    ? wallet.recentTransactions
    : [];

  return `
    <div class="wallet-shell">
      <section class="wallet-hero">
        <div class="wallet-hero-top">
          <div>
            <div class="wallet-kicker">Wallet</div>
            <div class="wallet-balance-label">Available balance</div>
            <h1 class="wallet-balance">${formatMoney(wallet.available || 0)}</h1>
            <div class="wallet-balance-sub">
              Premium creator earnings and payout visibility
            </div>
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
          <h3 class="wallet-card-value">${formatMoney(wallet.available || 0)}</h3>
          <div class="wallet-card-meta">Ready to use</div>
        </div>

        <div class="wallet-card">
          <div class="wallet-card-label">Pending</div>
          <h3 class="wallet-card-value">${formatMoney(wallet.pending || 0)}</h3>
          <div class="wallet-card-meta">Awaiting release</div>
        </div>

        <div class="wallet-card wallet-card-warning">
          <div class="wallet-card-label">Reserved</div>
          <h3 class="wallet-card-value">${formatMoney(wallet.reserved || 0)}</h3>
          <div class="wallet-card-meta">Protected balance</div>
        </div>

        <div class="wallet-card">
          <div class="wallet-card-label">Paid out</div>
          <h3 class="wallet-card-value">${formatMoney(wallet.paidOut || 0)}</h3>
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
            ${
              transactions.length
                ? transactions.map(renderTransaction).join("")
                : `
                  <div class="inbox-empty">
                    <div class="inbox-empty-icon">💸</div>
                    <h3>No transactions yet</h3>
                    <p>Your wallet activity will appear here.</p>
                  </div>
                `
            }
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
              <span class="revenue-pill">Creator: ${escapeHtml(me.displayName || me.username || "User")}</span>
              <span class="revenue-pill">Backend pending</span>
              <span class="revenue-pill">Live auth connected</span>
            </div>

            <div class="revenue-visual">
              Connect wallet tables later to power real balances and payouts.
            </div>
          </div>
        </div>
      </section>
    </div>
  `;
}

function renderTransaction(transaction) {
  if (!transaction) return "";

  const title = transaction.title || "Transaction";
  const subtitle = transaction.subtitle || "No details";
  const status = transaction.status || "completed";
  const amount = Number(transaction.amount || 0);
  const type = transaction.type || "credit";
  const createdAt = transaction.createdAt || Date.now();

  return `
    <div class="wallet-activity-row">
      <div class="wallet-activity-left">
        <div class="wallet-activity-icon">💸</div>
        <div>
          <div class="wallet-activity-title">${escapeHtml(title)}</div>
          <div class="wallet-activity-sub">${escapeHtml(subtitle)} · ${formatRelative(createdAt)}</div>
          <div class="wallet-activity-status">${escapeHtml(status)}</div>
        </div>
      </div>

      <div class="wallet-activity-amount ${type === "credit" ? "positive" : type === "debit" ? "negative" : ""}">
        ${type === "debit" ? "-" : type === "credit" ? "+" : ""}${formatMoney(amount)}
      </div>
    </div>
  `;
}

/* -------------------------
   SETTINGS UI
------------------------- */
function renderSettings() {
  return `
    <div class="settings-shell">
      <aside class="settings-nav">
        <button class="settings-nav-btn ${state.ui.settingsTab === "preferences" ? "active" : ""}" data-settings-tab="preferences">Preferences</button>
        <button class="settings-nav-btn ${state.ui.settingsTab === "notifications" ? "active" : ""}" data-settings-tab="notifications">Notifications</button>
        <button class="settings-nav-btn ${state.ui.settingsTab === "privacy" ? "active" : ""}" data-settings-tab="privacy">Privacy</button>
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

        ${renderToggleRow(
          "Compact feed",
          "Reduce feed density for faster scanning.",
          "preferences.compactFeed",
          state.settings.preferences.compactFeed
        )}

        ${renderToggleRow(
          "Autoplay media",
          "Automatically play eligible media previews.",
          "preferences.autoplayMedia",
          state.settings.preferences.autoplayMedia
        )}
      </div>
    `;
  }

  if (state.ui.settingsTab === "notifications") {
    return `
      <div class="settings-section">
        <div class="settings-section-head">
          <h3>Notifications</h3>
          <p>Control how EARNX keeps you informed.</p>
        </div>

        ${renderToggleRow(
          "App notifications",
          "General product notifications.",
          "notifications.app",
          state.settings.notifications.app
        )}

        ${renderToggleRow(
          "Messages",
          "Be notified when someone sends you a message.",
          "notifications.messages",
          state.settings.notifications.messages
        )}

        ${renderToggleRow(
          "Marketing updates",
          "Receive occasional product and growth updates.",
          "notifications.marketing",
          state.settings.notifications.marketing
        )}
      </div>
    `;
  }

  if (state.ui.settingsTab === "privacy") {
    return `
      <div class="settings-section">
        <div class="settings-section-head">
          <h3>Privacy</h3>
          <p>Decide how visible your activity should be.</p>
        </div>

        ${renderToggleRow(
          "Private profile",
          "Limit profile discoverability.",
          "privacy.privateProfile",
          state.settings.privacy.privateProfile
        )}

        ${renderToggleRow(
          "Hide activity",
          "Reduce public visibility of your activity.",
          "privacy.hideActivity",
          state.settings.privacy.hideActivity
        )}
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
          <label class="form-label">Creator mode</label>
          <input class="settings-field" value="${state.settings.account.creatorMode ? "Enabled" : "Disabled"}" readonly />
        </div>
      </div>

      <div class="soft-divider"></div>

      <div class="account-card">
        <div class="account-card-title">Account status</div>
        <div class="account-card-sub">Your EARNX creator profile is active and ready for scaling.</div>
      </div>

      <div class="hero-actions" style="margin-top:18px;">
        <button class="btn btn-secondary" id="logoutBtn">Logout</button>
      </div>
    </div>
  `;
}

function renderToggleRow(title, subtitle, path, enabled) {
  return `
    <div class="settings-row">
      <div>
        <div class="settings-row-title">${escapeHtml(title)}</div>
        <div class="settings-row-sub">${escapeHtml(subtitle)}</div>
      </div>
      <div>
        <button class="switch ${enabled ? "active" : ""}" data-toggle-setting="${escapeHtml(path)}"></button>
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

  document.querySelectorAll("#themeToggleLink").forEach(link => {
    link.onclick = event => {
      event.preventDefault();
      toggleTheme();
    };
  });

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

  document.querySelectorAll("[data-feed-filter]").forEach(button => {
    button.onclick = () => {
      state.ui.feedFilter = button.dataset.feedFilter;
      saveState();
      render();
    };
  });

  document.querySelectorAll("[data-like]").forEach(button => {
    button.onclick = () => toggleLike(button.dataset.like);
  });

  document.querySelectorAll("[data-profile]").forEach(button => {
    button.onclick = () => setProfile(button.dataset.profile);
  });

  document.querySelectorAll("[data-cat]").forEach(button => {
    button.onclick = () => {
      state.ui.discoverCategory = button.dataset.cat;
      saveState();
      render();
    };
  });

  document.querySelectorAll("[data-follow]").forEach(button => {
    button.onclick = () => toggleFollow(button.dataset.follow);
  });

  document.querySelectorAll("[data-message-user]").forEach(button => {
    button.onclick = () => openChat(button.dataset.messageUser);
  });

  document.querySelectorAll("[data-open-chat]").forEach(button => {
    button.onclick = () => openChat(button.dataset.openChat);
  });

  document.querySelectorAll("[data-subscribe]").forEach(button => {
    button.onclick = () => subscribeToCreator(button.dataset.subscribe);
  });

  document.querySelectorAll("[data-unsubscribe]").forEach(button => {
    button.onclick = () => unsubscribeFromCreator(button.dataset.unsubscribe);
  });

  document.querySelectorAll("[data-toggle-setting]").forEach(button => {
    button.onclick = () => {
      const path = button.dataset.toggleSetting;
      const [group, key] = path.split(".");
      const current = state.settings[group][key];
      updatePreference(path, !current);
    };
  });

  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.oninput = event => {
      state.ui.searchQuery = event.target.value;
      saveState();
      render();
    };
  }

  const backToInboxBtn = document.getElementById("backToInboxBtn");
  if (backToInboxBtn) {
    backToInboxBtn.onclick = goInbox;
  }

  const chatForm = document.getElementById("chatForm");
  if (chatForm) {
    chatForm.onsubmit = event => {
      event.preventDefault();
      const textarea = document.getElementById("chatTextarea");
      if (!textarea) return;
      sendMessage(state.ui.activeConvoUserId, textarea.value);
      textarea.value = "";
    };
  }
}
