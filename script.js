// ========================================
// EARNX MASTER SCRIPT (REAL FOUNDATION)
// ========================================

// 🔐 CONFIG
const SUPABASE_URL = "https://duyltyirtffzomrnielr.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1eWx0eWlydGZmem9tcm5pZWxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3Mjc3NzIsImV4cCI6MjA5MjMwMzc3Mn0.sy4lobYoxzFWcni2Umc1k-IHUGRojTgmP416tDltgD8";

let supabase = null;

// ========================================
// GLOBAL STATE (BASE PARA TODO EL APP)
// ========================================
const state = {
  user: null,
  session: null,
  view: "auth", // auth | home
  authMode: "login", // login | signup
  loading: false
};

// ========================================
// UI CORE
// ========================================
function setHTML(html) {
  const app = document.getElementById("app");
  if (app) app.innerHTML = html;
}

function renderLoading() {
  setHTML(`
    <div class="loading-screen">
      <div class="loading-brand">Earn<span>X</span></div>
      <div class="spinner"></div>
    </div>
  `);
}

// ========================================
// AUTH UI
// ========================================
function renderAuth() {
  setHTML(`
    <div class="auth-wrap">
      <div class="auth-card">

        <div class="auth-brand"></div>

        <div class="auth-tagline">
          A premium social platform built around creator ambition, audience reach, and public ranking momentum.
        </div>

        <div class="auth-tabs">
          <div class="auth-tab ${state.authMode === "login" ? "active" : ""}" id="tab-login">Sign in</div>
          <div class="auth-tab ${state.authMode === "signup" ? "active" : ""}" id="tab-signup">Create</div>
        </div>

        <div id="auth-form">

          ${state.authMode === "signup" ? `
            <div class="field">
              <label>Username</label>
              <input id="username" placeholder="rafax" />
            </div>

            <div class="field">
              <label>Display name</label>
              <input id="displayName" placeholder="Rafael" />
            </div>
          ` : ""}

          <div class="field">
            <label>Email</label>
            <input id="email" type="email" placeholder="you@example.com" />
          </div>

          <div class="field">
            <label>Password</label>
            <input id="password" type="password" placeholder="••••••••" />
          </div>

          <button class="btn-primary" id="submitBtn">
            ${state.authMode === "login" ? "Login" : "Create account"}
          </button>

        </div>
      </div>
    </div>
  `);

  bindAuth();
}

// ========================================
// AUTH EVENTS (AQUÍ ESTABA TU BUG)
// ========================================
function bindAuth() {

  document.getElementById("tab-login").onclick = () => {
    state.authMode = "login";
    renderAuth();
  };

  document.getElementById("tab-signup").onclick = () => {
    state.authMode = "signup";
    renderAuth();
  };

  document.getElementById("submitBtn").onclick = async () => {

    const email = document.getElementById("email")?.value.trim();
    const password = document.getElementById("password")?.value.trim();

    if (!email || !password) {
      alert("Fill all fields");
      return;
    }

    renderLoading();

    try {

      if (state.authMode === "login") {
        await login(email, password);
      } else {

        const username = document.getElementById("username")?.value.trim();
        const displayName = document.getElementById("displayName")?.value.trim();

        if (!username || !displayName) {
          alert("Fill all fields");
          renderAuth();
          return;
        }

        await signup(email, password, username, displayName);
      }

    } catch (err) {
      console.error(err);
      alert("Error");
      renderAuth();
    }
  };
}

// ========================================
// AUTH LOGIC
// ========================================
async function login(email, password) {

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    alert(error.message);
    renderAuth();
    return;
  }

  state.user = data.user;
  renderHome();
}

async function signup(email, password, username, displayName) {

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        display_name: displayName
      }
    }
  });

  if (error) {
    alert(error.message);
    renderAuth();
    return;
  }

  alert("Cuenta creada. Revisa tu email.");
  renderAuth();
}

async function logout() {
  await supabase.auth.signOut();
  state.user = null;
  renderAuth();
}

// ========================================
// HOME (BASE PARA FUTURAS FEATURES)
// ========================================
function renderHome() {
  setHTML(`
    <div class="page">
      <h1>🔥 Welcome ${state.user.email}</h1>

      <div style="margin-top:20px;">
        <button id="logoutBtn" class="btn-primary">Logout</button>
      </div>

      <div style="margin-top:40px;color:#93a0b5;">
        🚧 Feed / Discover / Wallet / Messages (fase siguiente)
      </div>
    </div>
  `);

  document.getElementById("logoutBtn").onclick = logout;
}

// ========================================
// INIT SUPABASE
// ========================================
async function initSupabase() {
  const mod = await import("https://esm.sh/@supabase/supabase-js@2");
  supabase = mod.createClient(SUPABASE_URL, SUPABASE_KEY);
}

// ========================================
// BOOT
// ========================================
async function boot() {
  try {

    renderLoading();

    await initSupabase();

    const { data } = await supabase.auth.getSession();

    if (data.session) {
      state.user = data.session.user;
      renderHome();
    } else {
      renderAuth();
    }

  } catch (err) {
    console.error(err);
    alert("Error iniciando app");
  }
}

document.addEventListener("DOMContentLoaded", boot);
