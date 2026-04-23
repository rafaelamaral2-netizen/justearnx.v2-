// ============================================================
// EARNX — CLEAN MASTER SCRIPT (STABLE)
// ============================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// 🔥 CONFIG — PEGA TU KEY REAL
const SUPABASE_URL = "https://duyltyirtffzomrnielr.supabase.co";
const SUPABASE_ANON_KEY = "PEGA_AQUI_TU_KEY_REAL"; // <-- IMPORTANTE

let supabase = null;

try {
  if (SUPABASE_ANON_KEY && SUPABASE_ANON_KEY.startsWith("eyJ")) {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("Supabase conectado");
  } else {
    console.warn("Supabase key inválida");
  }
} catch (e) {
  console.error("Error inicializando Supabase:", e);
}

// ── STATE ─────────────────────────────
const state = {
  session: null,
  view: "auth",
};

// ── INIT ─────────────────────────────
document.addEventListener("DOMContentLoaded", boot);

async function boot() {
  renderLoading();

  if (!supabase) {
    renderError("Missing Supabase key");
    return;
  }

  try {
    const { data } = await supabase.auth.getSession();
    state.session = data.session;
  } catch (e) {
    console.error(e);
  }

  render();
}

// ── RENDER ───────────────────────────
function render() {
  const app = document.getElementById("app");

  if (!state.session) {
    app.innerHTML = renderAuth();
    bindAuth();
  } else {
    app.innerHTML = renderApp();
  }
}

// ── LOADING ──────────────────────────
function renderLoading() {
  document.getElementById("app").innerHTML = `
    <div class="loading-screen">
      <div class="loading-brand">Earn<span>X</span></div>
      <div class="spinner"></div>
    </div>
  `;
}

// ── ERROR ────────────────────────────
function renderError(msg) {
  document.getElementById("app").innerHTML = `
    <div class="loading-screen">
      <div style="color:red">${msg}</div>
    </div>
  `;
}

// ── AUTH UI ──────────────────────────
function renderAuth() {
  return `
  <div class="auth-wrap">
    <div class="auth-card">

      <div class="auth-brand"></div>

      <div class="auth-tagline">
        A premium social platform built around creator ambition, audience reach, and public ranking momentum.
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

        <button id="loginBtn" class="btn-primary">Login</button>
      </div>

    </div>
  </div>
  `;
}

// ── AUTH LOGIC ───────────────────────
function bindAuth() {
  const btn = document.getElementById("loginBtn");

  btn.addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) {
      alert("Fill all fields");
      return;
    }

    renderLoading();

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        alert(error.message);
        render();
        return;
      }

      location.reload();
    } catch (e) {
      console.error(e);
      alert("Login failed");
      render();
    }
  });
}

// ── APP UI ───────────────────────────
function renderApp() {
  return `
    <div class="page">
      <h1>Welcome to EarnX 🚀</h1>
      <button id="logoutBtn">Logout</button>
    </div>
  `;
}

// ── LOGOUT ───────────────────────────
document.addEventListener("click", async (e) => {
  if (e.target.id === "logoutBtn") {
    await supabase.auth.signOut();
    location.reload();
  }
});
