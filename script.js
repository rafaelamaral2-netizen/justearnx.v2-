import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// 🔑 PON TUS DATOS REALES
const SUPABASE_URL = "https://TU_URL.supabase.co";
const SUPABASE_ANON_KEY = "TU_ANON_KEY";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── STATE ─────────────────────────
const state = {
  session: null,
  profile: null,
  appView: "home",
  authView: "login",
  theme: localStorage.getItem("earnx-theme") || "dark",
};

// ── INIT ─────────────────────────
boot();

async function boot() {
  applyTheme(state.theme);
  renderLoading();

  const { data } = await supabase.auth.getSession();
  state.session = data.session;

  if (state.session) {
    await loadProfile(state.session.user.id);
  }

  supabase.auth.onAuthStateChange(async (_event, session) => {
    state.session = session;
    if (session) {
      await loadProfile(session.user.id);
    } else {
      state.profile = null;
    }
    render();
  });

  render();
}

// ── THEME ─────────────────────────
function applyTheme(t) {
  document.body.className = t + "-theme";
  state.theme = t;
  localStorage.setItem("earnx-theme", t);
}

// ── PROFILE ───────────────────────
async function loadProfile(id) {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  state.profile = data || null;
}

// ── ROUTER ────────────────────────
function go(view) {
  state.appView = view;
  render();
}

function goAuth(view) {
  state.authView = view;
  render();
}

// ── RENDER ────────────────────────
function render() {
  const app = document.getElementById("app");

  if (!state.session) {
    app.innerHTML = renderAuth();
    bindAuth();
    return;
  }

  app.innerHTML = renderApp();
  bindApp();
}

// ── LOADING ───────────────────────
function renderLoading() {
  document.getElementById("app").innerHTML = `
    <div class="loading-screen">
      <div class="loading-brand">Earn<span>X</span></div>
      <div class="spinner"></div>
    </div>
  `;
}

// ── AUTH UI ───────────────────────
function renderAuthShell() {
  return `
    <div class="auth-wrap">
      <div class="auth-glow"></div>

      <div class="auth-card">
        <div class="auth-brand"></div>

        <div class="auth-tagline">
          A premium social platform built around creator ambition, audience reach, and public ranking momentum.
        </div>

        <div class="auth-tabs">
          <div class="auth-tab ${state.authView === "login" ? "active" : ""}" data-auth="login">
            Sign in
          </div>
          <div class="auth-tab ${state.authView === "signup" ? "active" : ""}" data-auth="signup">
            Create
          </div>
        </div>

        ${
          state.authView === "login"
            ? renderLoginCard()
            : renderSignupCard()
        }
      </div>
    </div>
  `;
}

function renderLoginCard() {
  return `
    <div id="auth-form">
      <div class="field">
        <label for="a-email">Email</label>
        <input
          id="a-email"
          type="email"
          placeholder="you@example.com"
          autocomplete="email"
        />
      </div>

      <div class="field">
        <label for="a-pass">Password</label>
        <input
          id="a-pass"
          type="password"
          placeholder="••••••••"
          autocomplete="current-password"
        />
      </div>

      <button class="btn-primary" id="auth-submit">Login</button>
    </div>
  `;
}

function renderSignupCard() {
  return `
    <div id="auth-form">
      <div class="field">
        <label for="a-user">Username</label>
        <input
          id="a-user"
          type="text"
          placeholder="yourhandle"
          autocomplete="username"
        />
      </div>

      <div class="field">
        <label for="a-email">Email</label>
        <input
          id="a-email"
          type="email"
          placeholder="you@example.com"
          autocomplete="email"
        />
      </div>

      <div class="field">
        <label for="a-pass">Password</label>
        <input
          id="a-pass"
          type="password"
          placeholder="At least 8 characters"
          autocomplete="new-password"
        />
      </div>

      <button class="btn-primary" id="auth-submit">Create account</button>
    </div>
  `;
}

function bindAuth() {
  document.querySelectorAll(".auth-tab").forEach(t=>{
    t.onclick = () => goAuth(t.dataset.auth);
  });

  const btn = document.getElementById("btn");
  if (!btn) return;

  btn.onclick = async () => {
    const email = document.getElementById("email").value;
    const pass  = document.getElementById("pass").value;

    if (!email || !pass) return alert("Fill fields");

    if (state.authView === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) alert(error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password: pass });
      if (error) alert(error.message);
    }
  };
}

// ── APP UI ────────────────────────
function renderApp() {
  return `
  <div class="page">
    <h1>EarnX</h1>

    <button onclick="window.go('home')">Home</button>
    <button onclick="window.go('profile')">Profile</button>
    <button onclick="window.go('settings')">Settings</button>

    ${
      state.appView==="home" ? "<p>Home view</p>" :
      state.appView==="profile" ? `<p>${state.profile?.email || "Profile"}</p>` :
      renderSettings()
    }

    <button id="logout">Logout</button>
  </div>
  `;
}

function bindApp() {
  document.getElementById("logout").onclick = async ()=>{
    await supabase.auth.signOut();
  };
}

// ── SETTINGS ──────────────────────
function renderSettings() {
  return `
    <div>
      <h3>Theme</h3>
      <button onclick="setTheme('dark')">Dark</button>
      <button onclick="setTheme('light')">Light</button>
      <button onclick="setTheme('pink')">Pink</button>
    </div>
  `;
}

// ── GLOBAL HOOKS ──────────────────
window.go = go;
window.setTheme = applyTheme;
