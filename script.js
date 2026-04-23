const SUPABASE_URL = "https://duyltyirtffzomrnielr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1eWx0eWlydGZmem9tcm5pZWxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3Mjc3NzIsImV4cCI6MjA5MjMwMzc3Mn0.sy4lobYoxzFWcni2Umc1k-IHUGRojTgmP416tDltgD8";

let supabase = null;

function setHTML(html) {
  const app = document.getElementById("app");
  if (app) app.innerHTML = html;
}

function showError(msg) {
  setHTML(`
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:#05080d;color:white;font-family:Inter,sans-serif;">
      <div style="max-width:700px;width:100%;background:#111722;border:1px solid rgba(255,255,255,.08);border-radius:24px;padding:24px;">
        <h2 style="margin:0 0 12px 0;">JS error</h2>
        <pre style="white-space:pre-wrap;word-break:break-word;color:#93a0b5;margin:0;">${msg}</pre>
      </div>
    </div>
  `);
}

function renderLoading() {
  setHTML(`
    <div class="loading-screen">
      <div class="loading-brand">Earn<span>X</span></div>
      <div class="spinner"></div>
    </div>
  `);
}

function renderAuth() {
  setHTML(`
    <div class="auth-wrap">
      <div class="auth-card">
        <div class="auth-brand"></div>

        <div class="auth-tagline">
          A premium social platform built around creator ambition, audience reach, and public ranking momentum.
        </div>

        <div class="auth-tabs">
          <div class="auth-tab active">Sign in</div>
          <div class="auth-tab">Create</div>
        </div>

        <div id="auth-form">
          <div class="field">
            <label for="email">Email</label>
            <input id="email" type="email" placeholder="you@example.com" autocomplete="email" />
          </div>

          <div class="field">
            <label for="password">Password</label>
            <input id="password" type="password" placeholder="••••••••" autocomplete="current-password" />
          </div>

          <button class="btn-primary" id="loginBtn">Login</button>
        </div>
      </div>
    </div>
  `);

  const btn = document.getElementById("loginBtn");
  if (btn) btn.addEventListener("click", login);
}

function renderLoggedIn(email) {
  setHTML(`
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:#05080d;color:white;font-family:Inter,sans-serif;">
      <div style="max-width:700px;width:100%;background:#111722;border:1px solid rgba(255,255,255,.08);border-radius:24px;padding:24px;">
        <h2 style="margin:0 0 12px 0;">Logged in</h2>
        <p style="margin:0 0 18px 0;color:#93a0b5;">${email || "Session active"}</p>
        <button id="logoutBtn" class="btn-primary">Logout</button>
      </div>
    </div>
  `);

  const btn = document.getElementById("logoutBtn");
  if (btn) {
    btn.addEventListener("click", async function () {
      try {
        await supabase.auth.signOut();
        renderAuth();
      } catch (err) {
        showError("Logout error: " + (err.message || String(err)));
      }
    });
  }
}

async function login() {
  try {
    const emailEl = document.getElementById("email");
    const passEl = document.getElementById("password");

    const email = emailEl ? emailEl.value.trim() : "";
    const password = passEl ? passEl.value : "";

    if (!email || !password) {
      alert("Fill all fields");
      return;
    }

    renderLoading();

    const result = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (result.error) {
      renderAuth();
      alert(result.error.message);
      return;
    }

    renderLoggedIn(result.data.user?.email || email);
  } catch (err) {
    showError("Login error: " + (err.message || String(err)));
  }
}

async function boot() {
  try {
    renderLoading();

    const mod = await import("https://esm.sh/@supabase/supabase-js@2");
    const createClient = mod.createClient;

    if (!createClient) {
      throw new Error("createClient not found");
    }

    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const sessionResult = await supabase.auth.getSession();

    if (sessionResult.error) {
      throw sessionResult.error;
    }

    const session = sessionResult.data.session;

    if (session && session.user) {
      renderLoggedIn(session.user.email || "Session active");
    } else {
      renderAuth();
    }
  } catch (err) {
    showError("Boot error: " + (err.message || String(err)));
  }
}

document.addEventListener("DOMContentLoaded", boot);
 
