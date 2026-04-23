// ===============================
// EARNX — MASTER SCRIPT FASE 2
// Auth + Profiles + Shell real
// ===============================

const SUPABASE_URL = "https://duyltyirtffzomrnielr.supabase.co";
const SUPABASE_ANON_KEY = "TU_KEY_AQUI";

let supabase = null;

// ---------- STATE ----------
const state = {
  session: null,
  profile: null,
  creators: [],
  view: "home",
  theme: localStorage.getItem("earnx-theme") || "dark"
};

// ---------- UTILS ----------
function setHTML(html) {
  const app = document.getElementById("app");
  if (app) app.innerHTML = html;
}

function applyTheme(t) {
  document.body.className = t + "-theme";
  state.theme = t;
  localStorage.setItem("earnx-theme", t);
}

// ---------- LOADING ----------
function renderLoading() {
  setHTML(`
    <div class="loading-screen">
      <div class="loading-brand">Earn<span>X</span></div>
      <div class="spinner"></div>
    </div>
  `);
}

// ---------- AUTH ----------
function renderAuth() {
  setHTML(`
    <div class="auth-wrap">
      <div class="auth-card">
        <div class="auth-brand"></div>

        <div class="auth-tagline">
          A premium social platform built around creator ambition, audience reach, and public ranking momentum.
        </div>

        <div class="auth-tabs">
          <div class="auth-tab active" id="tabLogin">Sign in</div>
          <div class="auth-tab" id="tabSignup">Create</div>
        </div>

        <div id="auth-form"></div>
      </div>
    </div>
  `);

  showLogin();
}

// ---------- LOGIN / SIGNUP UI ----------
function showLogin() {
  document.getElementById("auth-form").innerHTML = `
    <div class="field">
      <label>Email</label>
      <input id="email" type="email" placeholder="you@example.com" />
    </div>

    <div class="field">
      <label>Password</label>
      <input id="password" type="password" placeholder="••••••••" />
    </div>

    <button class="btn-primary" id="loginBtn">Login</button>
  `;

  document.getElementById("loginBtn").onclick = login;
}

function showSignup() {
  document.getElementById("auth-form").innerHTML = `
    <div class="field">
      <label>Username</label>
      <input id="username" type="text" placeholder="yourname" />
    </div>

    <div class="field">
      <label>Email</label>
      <input id="email" type="email" placeholder="you@example.com" />
    </div>

    <div class="field">
      <label>Password</label>
      <input id="password" type="password" placeholder="••••••••" />
    </div>

    <button class="btn-primary" id="signupBtn">Create account</button>
  `;

  document.getElementById("signupBtn").onclick = signup;
}

// ---------- AUTH ACTIONS ----------
async function login() {
  renderLoading();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    alert(error.message);
    renderAuth();
    return;
  }

  state.session = data.session;
  await loadProfile();
  renderApp();
}

async function signup() {
  renderLoading();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const username = document.getElementById("username").value;

  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) {
    alert(error.message);
    renderAuth();
    return;
  }

  await supabase.from("profiles").insert({
    id: data.user.id,
    username: username,
    email: email,
    created_at: new Date().toISOString()
  });

  alert("Account created");
  renderAuth();
}

// ---------- PROFILE ----------
async function loadProfile() {
  const user = state.session.user;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  state.profile = data;
}

// ---------- DISCOVER ----------
async function loadCreators() {
  const { data } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url")
    .limit(20);

  state.creators = data || [];
}

// ---------- APP ----------
function renderApp() {
  applyTheme(state.theme);

  const views = {
    home: renderHome(),
    discover: renderDiscover(),
    profile: renderProfile(),
    settings: renderSettings()
  };

  setHTML(`
    ${views[state.view] || views.home}
    ${renderNav()}
  `);

  bindNav();
}

// ---------- VIEWS ----------
function renderHome() {
  return `
    <div class="page">
      <h2>Welcome</h2>
      <p>${state.profile?.username || ""}</p>
    </div>
  `;
}

function renderDiscover() {
  return `
    <div class="page">
      <h2>Discover</h2>
      ${state.creators.map(c => `
        <div>${c.username}</div>
      `).join("")}
    </div>
  `;
}

function renderProfile() {
  return `
    <div class="page">
      <h2>${state.profile?.username}</h2>
      <p>${state.profile?.email}</p>
    </div>
  `;
}

function renderSettings() {
  return `
    <div class="page">
      <h2>Settings</h2>
      <button id="logoutBtn">Logout</button>
    </div>
  `;
}

// ---------- NAV ----------
function renderNav() {
  return `
    <nav class="bottom-nav">
      <button data-view="home">Home</button>
      <button data-view="discover">Discover</button>
      <button data-view="profile">Profile</button>
      <button data-view="settings">Settings</button>
    </nav>
  `;
}

function bindNav() {
  document.querySelectorAll("[data-view]").forEach(btn => {
    btn.onclick = async () => {
      state.view = btn.dataset.view;

      if (state.view === "discover") {
        await loadCreators();
      }

      renderApp();
    };
  });

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.onclick = async () => {
      await supabase.auth.signOut();
      location.reload();
    };
  }
}

// ---------- BOOT ----------
async function boot() {
  renderLoading();

  const mod = await import("https://esm.sh/@supabase/supabase-js@2");
  supabase = mod.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const { data } = await supabase.auth.getSession();

  if (data.session) {
    state.session = data.session;
    await loadProfile();
    renderApp();
  } else {
    renderAuth();
  }
}

document.addEventListener("DOMContentLoaded", boot);
