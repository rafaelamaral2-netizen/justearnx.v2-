// ================================
// EARNX MASTER SCRIPT (STABLE REAL)
// ================================

// 🔐 CONFIG SUPABASE
const SUPABASE_URL = "https://duyltyirtffzomrnielr.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1eWx0eWlydGZmem9tcm5pZWxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3Mjc3NzIsImV4cCI6MjA5MjMwMzc3Mn0.sy4lobYoxzFWcni2Umc1k-IHUGRojTgmP416tDltgD8";

let supabase = null;

// ================================
// UI HELPERS
// ================================
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

// ================================
// AUTH UI
// ================================
function renderAuth() {
  setHTML(`
    <div class="auth-wrap">
      <div class="auth-card">

        <div class="auth-brand"></div>

        <div class="auth-tagline">
          A premium social platform built around creator ambition, audience reach, and public ranking momentum.
        </div>

        <div class="auth-tabs">
          <div class="auth-tab active" id="tab-login">Sign in</div>
          <div class="auth-tab" id="tab-signup">Create</div>
        </div>

        <div id="auth-form">
          <div class="field">
            <label>Email</label>
            <input id="email" type="email" placeholder="you@example.com" />
          </div>

          <div class="field">
            <label>Password</label>
            <input id="password" type="password" placeholder="••••••••" />
          </div>

          <button class="btn-primary" id="loginBtn">Login</button>
        </div>

      </div>
    </div>
  `);

  document.getElementById("loginBtn").addEventListener("click", handleLogin);
}

// ================================
// LOGGED UI
// ================================
function renderHome(user) {
  setHTML(`
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;">
      <div style="text-align:center">
        <h1>🔥 Bienvenido ${user.email}</h1>
        <button id="logoutBtn">Logout</button>
      </div>
    </div>
  `);

  document.getElementById("logoutBtn").addEventListener("click", logout);
}

// ================================
// AUTH LOGIC
// ================================
async function handleLogin() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Fill all fields");
    return;
  }

  renderLoading();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    alert(error.message);
    renderAuth();
    return;
  }

  renderHome(data.user);
}

async function logout() {
  await supabase.auth.signOut();
  renderAuth();
}

// ================================
// INIT APP
// ================================
async function initSupabase() {
  const mod = await import("https://esm.sh/@supabase/supabase-js@2");
  supabase = mod.createClient(SUPABASE_URL, SUPABASE_KEY);
}

async function checkSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// ================================
// BOOT
// ================================
async function boot() {
  try {
    renderLoading();

    await initSupabase();

    const session = await checkSession();

    if (session && session.user) {
      renderHome(session.user);
    } else {
      renderAuth();
    }

  } catch (err) {
    console.error(err);
    alert("Error inicializando app");
  }
}

document.addEventListener("DOMContentLoaded", boot);
