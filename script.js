import { createClient } from "https://esm.sh/@supabase/supabase-js";

const supabaseUrl = "https://duyltyirtffzomrnielr.supabase.co";
const supabaseKey = "TU_PUBLISHABLE_KEY_AQUI";

const supabase = createClient(supabaseUrl, supabaseKey);
const STORAGE_KEY = "earnx_master_monetization_v2";

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

function createInitialState() {
  return {
    sessionUserId: null,
    ui: { ...initialUI },
    users: getMockUsers(),
    posts: getMockPosts(),
    follows: getMockFollows(),
    messages: getMockMessages(),
    localLikes: {},
    wallet: getMockWallet(),
    settings: getMockSettings(),
    stories: getMockStories(),
    subscriptionsCatalog: getMockSubscriptionsCatalog(),
    activeSubscriptions: []
  };
}

let state = createInitialState();

document.addEventListener("DOMContentLoaded", () => {
  loadState();
  applyTheme();
  render();
});

/* -------------------------
   MOCK DATA
------------------------- */
function getMockUsers() {
  return [
    {
      id: "u1",
      username: "rafael",
      email: "rafael@test.com",
      password: "1234",
      displayName: "Rafael Amaral",
      country: "PR",
      verified: true,
      category: "tech",
      bio: "Building EARNX into a premium creator platform.",
      avatarUrl: "",
      coverUrl: ""
    },
    {
      id: "u2",
      username: "sofia",
      email: "sofia@test.com",
      password: "1234",
      displayName: "Sofia Vega",
      country: "MX",
      verified: true,
      category: "lifestyle",
      bio: "Exclusive drops, premium content, and audience energy.",
      avatarUrl: "",
      coverUrl: ""
    },
    {
      id: "u3",
      username: "alex",
      email: "alex@test.com",
      password: "1234",
      displayName: "Alex Rivera",
      country: "PR",
      verified: false,
      category: "gaming",
      bio: "Streaming, clips, and high-engagement moments.",
      avatarUrl: "",
      coverUrl: ""
    },
    {
      id: "u4",
      username: "luna",
      email: "luna@test.com",
      password: "1234",
      displayName: "Luna Cruz",
      country: "ES",
      verified: true,
      category: "art",
      bio: "Visual creator focused on premium community and aesthetic content.",
      avatarUrl: "",
      coverUrl: ""
    },
    {
      id: "u5",
      username: "kai",
      email: "kai@test.com",
      password: "1234",
      displayName: "Kai Monroe",
      country: "US",
      verified: true,
      category: "fitness",
      bio: "High-performance coaching, premium drops, and live engagement.",
      avatarUrl: "",
      coverUrl: ""
    }
  ];
}

function getMockPosts() {
  return [
    {
      id: "p1",
      userId: "u2",
      content:
        "Premium drop 🔥 New content is now live for supporters. Full creator notes, exclusive preview, and subscriber-only chat replay are included.",
      teaser:
        "Premium drop 🔥 New content is now live for supporters...",
      monetized: true,
      likesCount: 120,
      commentsCount: 12,
      createdAt: Date.now() - 1000 * 60 * 60 * 2
    },
    {
      id: "p2",
      userId: "u3",
      content:
        "Streaming tonight with the community. Big momentum session coming.",
      teaser:
        "Streaming tonight with the community. Big momentum session coming.",
      monetized: false,
      likesCount: 80,
      commentsCount: 8,
      createdAt: Date.now() - 1000 * 60 * 60 * 5
    },
    {
      id: "p3",
      userId: "u4",
      content:
        "New artwork and exclusive preview for premium supporters. Added process notes, brush breakdowns, and private color studies.",
      teaser:
        "New artwork and exclusive preview for premium supporters...",
      monetized: true,
      likesCount: 200,
      commentsCount: 15,
      createdAt: Date.now() - 1000 * 60 * 60 * 9
    },
    {
      id: "p4",
      userId: "u1",
      content:
        "EARNX is evolving into a stronger creator ecosystem with premium positioning.",
      teaser:
        "EARNX is evolving into a stronger creator ecosystem with premium positioning.",
      monetized: false,
      likesCount: 67,
      commentsCount: 4,
      createdAt: Date.now() - 1000 * 60 * 60 * 15
    },
    {
      id: "p5",
      userId: "u5",
      content:
        "Daily performance systems. Build discipline and own your output. Subscriber note includes weekly split and recovery protocol.",
      teaser:
        "Daily performance systems. Build discipline and own your output...",
      monetized: true,
      likesCount: 155,
      commentsCount: 18,
      createdAt: Date.now() - 1000 * 60 * 60 * 7
    }
  ];
}

function getMockFollows() {
  return [
    { followerId: "u1", followingId: "u2" },
    { followerId: "u1", followingId: "u3" },
    { followerId: "u1", followingId: "u5" },
    { followerId: "u2", followingId: "u4" },
    { followerId: "u3", followingId: "u2" },
    { followerId: "u4", followingId: "u2" },
    { followerId: "u5", followingId: "u2" },
    { followerId: "u5", followingId: "u4" }
  ];
}

function getMockMessages() {
  return [
    {
      id: "m1",
      fromUserId: "u2",
      toUserId: "u1",
      text: "Hey, thanks for the follow.",
      read: true,
      createdAt: Date.now() - 1000 * 60 * 60 * 10
    },
    {
      id: "m2",
      fromUserId: "u1",
      toUserId: "u2",
      text: "Of course. Your profile looks strong.",
      read: true,
      createdAt: Date.now() - 1000 * 60 * 60 * 9
    },
    {
      id: "m3",
      fromUserId: "u3",
      toUserId: "u1",
      text: "We should connect this week.",
      read: false,
      createdAt: Date.now() - 1000 * 60 * 60 * 4
    },
    {
      id: "m4",
      fromUserId: "u1",
      toUserId: "u3",
      text: "Definitely, let's line it up.",
      read: true,
      createdAt: Date.now() - 1000 * 60 * 60 * 3
    },
    {
      id: "m5",
      fromUserId: "u4",
      toUserId: "u1",
      text: "Loved the direction of EARNX.",
      read: false,
      createdAt: Date.now() - 1000 * 60 * 70
    }
  ];
}

function getMockWallet() {
  return {
    available: 4250,
    pending: 1280,
    reserved: 320,
    paidOut: 12940,
    recentTransactions: [
      {
        id: "t1",
        title: "Subscription payout",
        subtitle: "From premium subscribers",
        amount: 420,
        type: "credit",
        status: "completed",
        createdAt: Date.now() - 1000 * 60 * 60 * 6
      },
      {
        id: "t2",
        title: "Reserved funds",
        subtitle: "Pending release",
        amount: 180,
        type: "reserved",
        status: "pending",
        createdAt: Date.now() - 1000 * 60 * 60 * 18
      },
      {
        id: "t3",
        title: "Payout sent",
        subtitle: "Transferred to creator account",
        amount: 950,
        type: "debit",
        status: "completed",
        createdAt: Date.now() - 1000 * 60 * 60 * 34
      }
    ]
  };
}

function getMockSettings() {
  return {
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
}

function getMockStories() {
  return [
    { id: "s0", userId: "u1", hoursAgo: 1, own: true },
    { id: "s1", userId: "u2", hoursAgo: 2 },
    { id: "s2", userId: "u3", hoursAgo: 5 },
    { id: "s3", userId: "u4", hoursAgo: 7 },
    { id: "s4", userId: "u5", hoursAgo: 11 }
  ];
}

function getMockSubscriptionsCatalog() {
  return [
    {
      creatorId: "u2",
      priceMonthly: 9,
      tierName: "Inner Circle",
      perks: ["Premium posts", "Priority replies", "Exclusive drops"]
    },
    {
      creatorId: "u4",
      priceMonthly: 12,
      tierName: "Studio Access",
      perks: ["Behind the scenes", "Early previews", "Private community"]
    },
    {
      creatorId: "u5",
      priceMonthly: 15,
      tierName: "Performance Pro",
      perks: ["Premium sessions", "Member Q&A", "Exclusive coaching notes"]
    }
  ];
}

/* -------------------------
   STORAGE
------------------------- */
function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    const parsed = JSON.parse(raw);
    state = {
      ...createInitialState(),
      ...parsed,
      ui: {
        ...initialUI,
        ...(parsed.ui || {})
      }
    };
  } catch (err) {
    console.warn("Could not load state", err);
  }
}

/* -------------------------
   HELPERS
------------------------- */
function currentUser() {
  return state.users.find(user => user.id === state.sessionUserId) || null;
}

function userById(id) {
  return state.users.find(user => user.id === id) || null;
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
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function followerCount(id) {
  return state.follows.filter(follow => follow.followingId === id).length;
}

function followingCount(id) {
  return state.follows.filter(follow => follow.followerId === id).length;
}

function userPosts(id) {
  return state.posts
    .filter(post => post.userId === id)
    .sort((a, b) => b.createdAt - a.createdAt);
}

function isFollowing(followerId, followingId) {
  return state.follows.some(
    follow =>
      follow.followerId === followerId && follow.followingId === followingId
  );
}

function scoreUser(user) {
  return (
    followerCount(user.id) * 10 +
    userPosts(user.id).length * 20 +
    (user.verified ? 50 : 0)
  );
}

function earningsScore(user) {
  const scores = {
    u2: 18200,
    u4: 15900,
    u5: 14300,
    u1: 12940,
    u3: 7200
  };
  return scores[user.id] || 0;
}

function top5Users() {
  return [...state.users]
    .sort((a, b) => earningsScore(b) - earningsScore(a))
    .slice(0, 5);
}

function formatRelative(timestamp) {
  const diff = Date.now() - timestamp;
  const hours = Math.floor(diff / (1000 * 60 * 60));

  if (hours < 1) return "now";
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

function formatChatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatMoney(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

function getSubscriptionForCreator(creatorId) {
  return (
    state.subscriptionsCatalog.find(item => item.creatorId === creatorId) || null
  );
}

function isSubscribedTo(creatorId) {
  return state.activeSubscriptions.includes(creatorId);
}

function canViewPremiumPost(post) {
  if (!post.monetized) return true;
  if (post.userId === state.sessionUserId) return true;
  return isSubscribedTo(post.userId);
}

function getSubscribeButtonLabel(creatorId) {
  return isSubscribedTo(creatorId) ? "Subscribed" : "Subscribe";
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
function login(identifier, password) {
  const value = identifier.trim().toLowerCase();

  const user = state.users.find(
    item =>
      (((item.email || "").toLowerCase() === value) ||
        item.username.toLowerCase() === value) &&
      item.password === password
  );

  if (!user) {
    alert("Invalid credentials");
    return;
  }

  state.sessionUserId = user.id;
  state.ui.appView = "home";
  state.ui.profileUserId = user.id;
  saveState();
  render();
}

function signup({ displayName, username, email, password }) {
  const emailNorm = email.trim().toLowerCase();
  const usernameNorm = username.trim().toLowerCase();

  if (!displayName.trim() || !usernameNorm || !emailNorm || !password.trim()) {
    alert("Complete all fields");
    return;
  }

  if (state.users.some(user => (user.email || "").toLowerCase() === emailNorm)) {
    alert("That email already exists");
    return;
  }

  if (state.users.some(user => user.username.toLowerCase() === usernameNorm)) {
    alert("That username already exists");
    return;
  }

  const newUser = {
    id: "u" + (state.users.length + 1),
    username: usernameNorm,
    email: emailNorm,
    password: password.trim(),
    displayName: displayName.trim(),
    country: "PR",
    verified: false,
    category: "creator",
    bio: "New creator on EARNX.",
    avatarUrl: "",
    coverUrl: ""
  };

  state.users.push(newUser);
  state.sessionUserId = newUser.id;
  state.ui.authView = "login";
  state.ui.appView = "home";
  state.ui.profileUserId = newUser.id;
  saveState();
  render();
}

function logout() {
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

  if (view === "profile" && !state.ui.profileUserId) {
    state.ui.profileUserId = state.sessionUserId;
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

function toggleLike(postId) {
  state.localLikes[postId] = !state.localLikes[postId];
  saveState();
  render();
}

function isLiked(postId) {
  return !!state.localLikes[postId];
}

function toggleFollow(targetUserId) {
  const me = state.sessionUserId;

  const exists = state.follows.find(
    follow =>
      follow.followerId === me && follow.followingId === targetUserId
  );

  if (exists) {
    state.follows = state.follows.filter(
      follow =>
        !(
          follow.followerId === me && follow.followingId === targetUserId
        )
    );
  } else {
    state.follows.push({
      followerId: me,
      followingId: targetUserId
    });
  }

  saveState();
  render();
}

function updatePreference(path, value) {
  const [group, key] = path.split(".");
  if (!state.settings[group]) return;

  state.settings[group][key] = value;
  saveState();
  render();
}

function subscribeToCreator(creatorId) {
  const subscription = getSubscriptionForCreator(creatorId);
  if (!subscription) return;

  if (creatorId === state.sessionUserId) {
    alert("You cannot subscribe to your own profile.");
    return;
  }

  if (isSubscribedTo(creatorId)) {
    alert("You are already subscribed.");
    return;
  }

  if (state.wallet.available < subscription.priceMonthly) {
    alert("Insufficient balance.");
    return;
  }

  state.activeSubscriptions.push(creatorId);

  state.wallet.available -= subscription.priceMonthly;

  state.wallet.recentTransactions.unshift({
    id: "t" + (state.wallet.recentTransactions.length + 1),
    title: `Subscription · ${userById(creatorId)?.displayName || "Creator"}`,
    subtitle: `Monthly access · ${subscription.tierName}`,
    amount: subscription.priceMonthly,
    type: "debit",
    status: "completed",
    createdAt: Date.now()
  });

  saveState();
  render();
}

function unsubscribeFromCreator(creatorId) {
  if (!isSubscribedTo(creatorId)) return;

  state.activeSubscriptions = state.activeSubscriptions.filter(
    id => id !== creatorId
  );

  state.wallet.recentTransactions.unshift({
    id: "t" + (state.wallet.recentTransactions.length + 1),
    title: `Subscription canceled · ${userById(creatorId)?.displayName || "Creator"}`,
    subtitle: "Premium access removed",
    amount: 0,
    type: "reserved",
    status: "canceled",
    createdAt: Date.now()
  });

  saveState();
  render();
}

/* -------------------------
   FEED / DISCOVER / MESSAGES
------------------------- */
function filteredPosts() {
  let posts = [...state.posts];

  if (state.ui.feedFilter === "following") {
    const followingIds = state.follows
      .filter(follow => follow.followerId === state.sessionUserId)
      .map(follow => follow.followingId);

    posts = posts.filter(
      post =>
        followingIds.includes(post.userId) || post.userId === state.sessionUserId
    );
  }

  if (state.ui.feedFilter === "premium") {
    posts = posts.filter(post => post.monetized);
  }

  if (state.ui.feedFilter === "trending") {
    posts.sort(
      (a, b) =>
        b.likesCount + b.commentsCount - (a.likesCount + a.commentsCount)
    );
  } else {
    posts.sort((a, b) => b.createdAt - a.createdAt);
  }

  return posts;
}

function getDiscoverUsers() {
  let users = [...state.users].sort((a, b) => scoreUser(b) - scoreUser(a));

  if (state.ui.discoverCategory !== "all") {
    users = users.filter(user => user.category === state.ui.discoverCategory);
  }

  if (state.ui.searchQuery.trim()) {
    const query = state.ui.searchQuery.trim().toLowerCase();
    users = users.filter(
      user =>
        (user.displayName || "").toLowerCase().includes(query) ||
        user.username.toLowerCase().includes(query) ||
        (user.category || "").toLowerCase().includes(query) ||
        (user.bio || "").toLowerCase().includes(query)
    );
  }

  return users;
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

function unreadCountForUser(userId) {
  const me = state.sessionUserId;
  return state.messages.filter(
    message =>
      message.fromUserId === userId &&
      message.toUserId === me &&
      !message.read
  ).length;
}

function totalUnreadCount() {
  const me = state.sessionUserId;
  return state.messages.filter(
    message => message.toUserId === me && !message.read
  ).length;
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

function sendMessage(toUserId, text) {
  const value = text.trim();
  if (!value) return;

  state.messages.push({
    id: "m" + (state.messages.length + 1),
    fromUserId: state.sessionUserId,
    toUserId,
    text: value,
    read: false,
    createdAt: Date.now()
  });

  saveState();
  render();
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

function renderSubscribeAction(creatorId, variant = "primary") {
  if (creatorId === state.sessionUserId) return "";

  const subscription = getSubscriptionForCreator(creatorId);
  if (!subscription) return "";

  if (isSubscribedTo(creatorId)) {
    return `<button class="btn btn-secondary" data-unsubscribe="${escapeHtml(creatorId)}">Subscribed</button>`;
  }

  return `<button class="btn ${variant === "secondary" ? "btn-secondary" : "btn-primary"}" data-subscribe="${escapeHtml(creatorId)}">Subscribe</button>`;
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
          <label class="label" for="loginIdentifier">Email or username</label>
          <input class="input" id="loginIdentifier" type="text" placeholder="you@example.com or username" />
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

      <div class="note">Credentials: rafael@test.com / 1234</div>
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

      <div class="note">Your account is stored locally in this browser for now.</div>
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
function renderStories() {
  return `
    <section class="section">
      <div class="section-head">
        <h3>Stories · 24h</h3>
        <span class="section-meta">Ephemeral creator moments</span>
      </div>

      <div class="story-strip">
        ${state.stories
          .map(story => {
            const user = userById(story.userId);
            const isOwn = story.own;

            return `
              <div class="story-card ${isOwn ? "story-create" : ""}">
                <div class="story-ring">
                  <div class="story-ring-inner">
                    ${
                      isOwn
                        ? `<span class="story-plus">+</span>`
                        : escapeHtml(getInitials(user.displayName))
                    }
                  </div>
                </div>
                <div class="story-name">${
                  isOwn
                    ? "Your story"
                    : escapeHtml(user.displayName.split(" ")[0])
                }</div>
                <div class="story-time">${
                  isOwn ? "Add" : `${story.hoursAgo}h ago`
                }</div>
              </div>
            `;
          })
          .join("")}
      </div>
    </section>
  `;
}

function renderTop5() {
  const users = top5Users();

  return `
    <section class="section">
      <div class="section-head">
        <h3>Top 5 Global Creators</h3>
        <span class="section-meta">Ranked by earnings + algorithmic momentum</span>
      </div>

      <div class="top5-grid">
        ${users
          .map(
            (user, index) => `
              <article class="top5-card">
                <div class="top5-rank">#${index + 1}</div>

                <div class="top5-user">
                  ${renderAvatar(user, "avatar-md")}
                  <div>
                    <div class="top5-name">${escapeHtml(user.displayName)}</div>
                    <div class="top5-handle">@${escapeHtml(user.username)} · ${escapeHtml(user.category)}</div>
                  </div>
                </div>

                <div class="top5-stats">
                  <span class="chip">${formatMoney(earningsScore(user))}</span>
                  <span class="chip">Score ${scoreUser(user)}</span>
                  <span class="chip">${followerCount(user.id)} followers</span>
                </div>
              </article>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderHome() {
  return `
    <section class="hero-home">
      <div class="hero-home-copy">
        <div class="page-kicker">EarnX</div>
        <h2>Build. Create. Own.</h2>
        <p>Premium creator infrastructure for content, discovery, messaging, subscriptions, and audience momentum.</p>
      </div>

      <div class="hero-actions">
        <button class="btn btn-primary" data-nav="discover">Discover talent</button>
        <button class="btn btn-secondary" data-nav="profile">Open profile</button>
      </div>
    </section>

    ${renderStories()}
    ${renderTop5()}

    <section class="section">
      <div class="section-head">
        <h3>Feed</h3>
        <span class="section-meta">Friendly, premium, creator-first feed</span>
      </div>

      <div class="tabs">
        <button class="tab ${state.ui.feedFilter === "following" ? "active" : ""}" data-feed-filter="following">Following</button>
        <button class="tab ${state.ui.feedFilter === "trending" ? "active" : ""}" data-feed-filter="trending">Trending</button>
        <button class="tab ${state.ui.feedFilter === "premium" ? "active" : ""}" data-feed-filter="premium">Premium</button>
      </div>

      <div class="feed-list" style="margin-top:18px;">
        ${filteredPosts().map(renderPost).join("")}
      </div>
    </section>
  `;
}

function renderPost(post) {
  const user = userById(post.userId);
  const liked = isLiked(post.id);
  const likeCount = post.likesCount + (liked ? 1 : 0);
  const unlocked = canViewPremiumPost(post);
  const subscription = getSubscriptionForCreator(post.userId);

  return `
    <article class="post-card">
      <div class="post-head clickable" data-profile="${escapeHtml(user.id)}">
        ${renderAvatar(user)}
        <div class="name-block">
          <div class="name-line">
            <h4>${escapeHtml(user.displayName)}</h4>
            ${user.verified ? `<span class="badge badge-ambassador">Verified</span>` : ""}
            ${post.monetized ? `<span class="badge badge-premium">Premium</span>` : ""}
          </div>
          <div class="handle">@${escapeHtml(user.username)} · ${escapeHtml(user.country)} · ${formatRelative(post.createdAt)}</div>
        </div>
      </div>

      <div class="post-content">
        ${
          post.monetized && !unlocked
            ? `
              <strong>🔒 Locked premium post</strong>
              <p style="margin-top:8px;">${escapeHtml(post.teaser)}</p>
              <p style="margin-top:10px;" class="page-subtitle">
                Subscribe to ${escapeHtml(user.displayName)}${subscription ? ` for ${formatMoney(subscription.priceMonthly)}/month` : ""} to unlock this content.
              </p>
              <div class="hero-actions" style="margin-top:14px;">
                <button class="btn btn-primary" data-subscribe="${escapeHtml(user.id)}">Unlock now</button>
                <button class="btn btn-secondary" data-profile="${escapeHtml(user.id)}">View creator</button>
              </div>
            `
            : escapeHtml(post.content)
        }
      </div>

      <div class="post-footer">
        <div class="post-reactions">
          <button class="reaction-btn ${liked ? "reaction-liked" : ""}" data-like="${escapeHtml(post.id)}">
            ❤️ <span>${likeCount}</span>
          </button>
          <button class="reaction-btn">💬 <span>${post.commentsCount}</span></button>
        </div>

        <button class="reaction-btn" data-profile="${escapeHtml(user.id)}">View Profile</button>
      </div>
    </article>
  `;
}

/* -------------------------
   DISCOVER UI
------------------------- */
function renderDiscover() {
  const users = getDiscoverUsers();

  return `
    <div class="topbar">
      <div class="topbar-row">
        <div>
          <span class="page-kicker">Discover</span>
          <h1 class="page-title">Discover creators</h1>
          <p class="page-subtitle">Find new talent, browse categories, and track momentum.</p>
        </div>
      </div>
    </div>

    <div>
      <input class="search-input" id="searchInput" placeholder="Search creators, categories, talent..." value="${escapeHtml(state.ui.searchQuery)}" />
    </div>

    <div class="cats-strip" style="margin-top:12px;">
      ${["all", "tech", "lifestyle", "gaming", "art", "fitness", "creator"]
        .map(
          category => `
            <button class="cat-chip ${state.ui.discoverCategory === category ? "active" : ""}" data-cat="${escapeHtml(category)}">${escapeHtml(category)}</button>
          `
        )
        .join("")}
    </div>

    <section class="section">
      <div class="section-head">
        <h3>Talent browser</h3>
        <span class="section-meta">${users.length} creators found</span>
      </div>

      <div class="list">
        ${users.map(renderCreatorCard).join("")}
      </div>
    </section>
  `;
}

function renderCreatorCard(user) {
  const subscription = getSubscriptionForCreator(user.id);
  const subscribed = isSubscribedTo(user.id);

  return `
    <article class="creator-card">
      <div class="creator-head">
        ${renderAvatar(user, "avatar-md")}
        <div class="name-block">
          <div class="name-line">
            <h4>${escapeHtml(user.displayName)}</h4>
            ${user.verified ? `<span class="badge badge-ambassador">Verified</span>` : ""}
          </div>
          <div class="handle">@${escapeHtml(user.username)} · ${escapeHtml(user.category)}</div>
        </div>
      </div>

      <div class="creator-bio">${escapeHtml(user.bio)}</div>

      <div class="post-actions">
        <span class="chip">Followers ${followerCount(user.id)}</span>
        <span class="chip">Posts ${userPosts(user.id).length}</span>
        <span class="chip">Score ${scoreUser(user)}</span>
        ${
          subscription
            ? `<span class="chip">${subscribed ? "Subscribed" : formatMoney(subscription.priceMonthly) + "/mo"}</span>`
            : ""
        }
      </div>

      <div class="creator-actions" style="margin-top:14px;">
        <button class="btn btn-secondary" data-profile="${escapeHtml(user.id)}">View profile</button>
        ${renderSubscribeAction(user.id)}
      </div>
    </article>
  `;
}

/* -------------------------
   PROFILE UI
------------------------- */
function renderProfile() {
  const me = currentUser();
  const profile = userById(state.ui.profileUserId) || me;
  const ownProfile = profile.id === me.id;
  const posts = userPosts(profile.id);
  const followed = isFollowing(me.id, profile.id);
  const subscription = getSubscriptionForCreator(profile.id);
  const subscribed = isSubscribedTo(profile.id);

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
            <h2 class="profile-display-name">${escapeHtml(profile.displayName)}</h2>
            <div class="handle">@${escapeHtml(profile.username)} · ${escapeHtml(profile.country)}</div>
          </div>

          <div class="profile-rank-col">
            <span class="chip">Score ${scoreUser(profile)}</span>
          </div>
        </div>

        <p class="profile-bio-text">${escapeHtml(profile.bio || "No bio yet.")}</p>
        <div class="category-chip">${escapeHtml(profile.category)}</div>

        <div class="profile-stats-bar">
          <div class="pstat">
            <strong>${followerCount(profile.id)}</strong>
            <span>Followers</span>
          </div>
          <div class="pstat-divider"></div>
          <div class="pstat">
            <strong>${followingCount(profile.id)}</strong>
            <span>Following</span>
          </div>
          <div class="pstat-divider"></div>
          <div class="pstat">
            <strong>${posts.length}</strong>
            <span>Posts</span>
          </div>
        </div>

        <div class="profile-action-row" style="margin-top:18px;">
          ${
            ownProfile
              ? `
                <button class="btn btn-primary">Upload avatar</button>
                <button class="btn btn-secondary" data-nav="wallet">Creator wallet</button>
                <button class="btn btn-secondary" data-nav="settings">Settings</button>
              `
              : `
                <button class="btn btn-primary" data-follow="${escapeHtml(profile.id)}">
                  ${followed ? "Following" : "Follow"}
                </button>
                <button class="btn btn-secondary" data-message-user="${escapeHtml(profile.id)}">Message</button>
                ${renderSubscribeAction(profile.id)}
              `
          }
        </div>

        ${subscription ? renderSubscriptionCard(subscription, profile, subscribed) : ""}

        <div class="profile-tabs" style="margin-top:22px;">
          <div class="profile-tab active">Posts</div>
          <div class="profile-tab">Media</div>
          <div class="profile-tab">Premium</div>
        </div>

        <div class="feed-list" style="margin-top:18px;">
          ${
            posts.length
              ? posts.map(renderPost).join("")
              : `<div class="profile-empty"><h3>No posts yet</h3><p>${ownProfile ? "Start building your presence." : "This creator has not posted yet."}</p></div>`
          }
        </div>
      </div>
    </section>
  `;
}

function renderSubscriptionCard(subscription, profile, subscribed) {
  return `
    <section class="subscription-card section">
      <div class="subscription-head">
        ${renderAvatar(profile, "avatar-sm")}
        <div>
          <div class="page-kicker">Fan subscription</div>
          <h3>${escapeHtml(subscription.tierName)}</h3>
        </div>
      </div>

      <div class="subscribe-price">
        ${formatMoney(subscription.priceMonthly)}
        <span style="font-size:.9rem;font-weight:700;color:var(--muted)"> / month</span>
      </div>

      <p class="subscription-copy">
        Support this creator directly and unlock premium access, stronger community proximity, and exclusive drops.
      </p>

      <div class="subscription-benefits">
        ${subscription.perks
          .map(
            perk => `
              <div class="subscription-benefit"><span>✓</span>${escapeHtml(perk)}</div>
            `
          )
          .join("")}
      </div>

      <div class="subscription-plans">
        <button class="subscribe-plan-btn active">Monthly</button>
        <button class="subscribe-plan-btn">Yearly</button>
      </div>

      <div class="hero-actions" style="margin-top:16px;">
        ${
          subscribed
            ? `<button class="btn btn-secondary" data-unsubscribe="${escapeHtml(profile.id)}">Subscribed</button>`
            : `<button class="btn btn-primary" data-subscribe="${escapeHtml(profile.id)}">Subscribe now</button>`
        }
        <button class="btn btn-secondary">View perks</button>
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
        <p class="page-subtitle">Premium creator conversations</p>
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
            : `<div class="inbox-empty"><div class="inbox-empty-icon">💬</div><h3>Your inbox is quiet</h3><p>Start a conversation from a creator profile.</p></div>`
        }
      </section>

      <section class="chat-panel">
        <div class="inbox-empty">
          <div class="inbox-empty-icon">✉️</div>
          <h3>Select a conversation</h3>
          <p>Choose a creator or user from the inbox to open the chat thread.</p>
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
      ${renderAvatar(user, "avatar-md")}
      <div class="convo-body">
        <div class="convo-top">
          <span class="convo-name">${escapeHtml(user.displayName)}</span>
          <span class="convo-time">${formatRelative(conversation.lastMessage.createdAt)}</span>
        </div>
        <div class="convo-preview">${escapeHtml(conversation.lastMessage.text)}</div>
        <div class="convo-meta">
          <span class="convo-badge">@${escapeHtml(user.username)}</span>
          ${unread > 0 ? `<span class="convo-unread">${unread}</span>` : ""}
        </div>
      </div>
    </div>
  `;
}

function renderChatView() {
  const user = userById(state.ui.activeConvoUserId);
  const thread = getThread(user.id);

  return `
    <div class="topbar">
      <div>
        <span class="page-kicker">Messages</span>
        <h1 class="page-title">Chat</h1>
        <p class="page-subtitle">Private thread with @${escapeHtml(user.username)}</p>
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
              <div class="chat-header-name">${escapeHtml(user.displayName)}</div>
              <div class="chat-header-handle">@${escapeHtml(user.username)}</div>
            </div>
          </div>
        </div>

        <div class="chat-messages">
          ${
            thread.length
              ? thread.map(renderBubble).join("")
              : `<div class="chat-day-label">Start the conversation</div>`
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
  const sender = userById(message.fromUserId);

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
  const wallet = state.wallet;

  return `
    <div class="wallet-shell">
      <section class="wallet-hero">
        <div class="wallet-hero-top">
          <div>
            <div class="wallet-kicker">Wallet</div>
            <div class="wallet-balance-label">Available balance</div>
            <h1 class="wallet-balance">${formatMoney(wallet.available)}</h1>
            <div class="wallet-balance-sub">Premium creator earnings and payout visibility</div>
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
          <h3 class="wallet-card-value">${formatMoney(wallet.available)}</h3>
          <div class="wallet-card-meta">Ready to use</div>
        </div>

        <div class="wallet-card">
          <div class="wallet-card-label">Pending</div>
          <h3 class="wallet-card-value">${formatMoney(wallet.pending)}</h3>
          <div class="wallet-card-meta">Awaiting release</div>
        </div>

        <div class="wallet-card wallet-card-warning">
          <div class="wallet-card-label">Reserved</div>
          <h3 class="wallet-card-value">${formatMoney(wallet.reserved)}</h3>
          <div class="wallet-card-meta">Protected balance</div>
        </div>

        <div class="wallet-card">
          <div class="wallet-card-label">Paid out</div>
          <h3 class="wallet-card-value">${formatMoney(wallet.paidOut)}</h3>
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
            ${wallet.recentTransactions.map(renderTransaction).join("")}
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
              <span class="revenue-pill">Monthly growth +14%</span>
              <span class="revenue-pill">Top source subscriptions</span>
              <span class="revenue-pill">Retention stable</span>
            </div>
            <div class="revenue-visual">Creator analytics and earning visualization can live here.</div>
          </div>
        </div>
      </section>
    </div>
  `;
}

function renderTransaction(transaction) {
  return `
    <div class="wallet-activity-row">
      <div class="wallet-activity-left">
        <div class="wallet-activity-icon">💸</div>
        <div>
          <div class="wallet-activity-title">${escapeHtml(transaction.title)}</div>
          <div class="wallet-activity-sub">${escapeHtml(transaction.subtitle)} · ${formatRelative(transaction.createdAt)}</div>
          <div class="wallet-activity-status">${escapeHtml(transaction.status)}</div>
        </div>
      </div>

      <div class="wallet-activity-amount ${transaction.type === "credit" ? "positive" : transaction.type === "debit" ? "negative" : ""}">
        ${transaction.type === "debit" ? "-" : transaction.type === "credit" ? "+" : ""}${formatMoney(transaction.amount)}
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
