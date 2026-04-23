// ========================================
// EARNX MASTER SCRIPT (FIXED REAL)
// ========================================

const SUPABASE_URL = "https://duyltyirtffzomrnielr.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1eWx0eWlydGZmem9tcm5pZWxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3Mjc3NzIsImV4cCI6MjA5MjMwMzc3Mn0.sy4lobYoxzFWcni2Umc1k-IHUGRojTgmP416tDltgD8";

let supabase = null;

const state = {
  user: null,
  authMode: "login"
};

// ================================
// CORE UI
// ================================
function setHTML(html) {
  document.getElementById("app").innerHTML = html;
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
          A premium social platform built around creator ambition.
        </div>

        <div class="auth-tabs">
          <div class="auth-tab ${state.authMode === "login" ? "active" : ""}" id="loginTab">Sign in</div>
          <div class="auth-tab ${state.authMode === "signup" ? "active" : ""}" id="signupTab">Create</div>
        </div>

        <form id="authForm">

  ${state.authMode === "signup" ? `
    <div class="field">
      <label>Username</label>
      <input name="username" placeholder="rafax" />
    </div>

    <div class="field">
      <label>Display name</label>
      <input name="displayName" placeholder="Rafael" />
    </div>
  ` : ""}

  <div class="field">
    <label>Email</label>
    <input name="email" type="email" />
  </div>

  <div class="field">
    <label>Password</label>
    <input name="password" type="password" />
  </div>

  <button type="submit" class="btn-primary">
    ${state.authMode === "login" ? "Login" : "Create account"}
  </button>

</form>
      </div>
    </div>
  `);

  bindAuth();
}

// ================================
// AUTH EVENTS (FIX REAL)
// ================================
function bindAuth() {

  document.getElementById("loginTab").onclick = () => {
    state.authMode = "login";
    renderAuth();
  };

  document.getElementById("signupTab").onclick = () => {
    state.authMode = "signup";
    renderAuth();
  };

  const form = document.getElementById("authForm");

  form.onsubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    const email = formData.get("email")?.toString().trim();
    const password = formData.get("password")?.toString().trim();

    if (!email || !password) {
      alert("Fill all fields");
      return;
    }

    renderLoading();

    try {
      if (state.authMode === "login") {
        await login(email, password);
      } else {
        const username = formData.get("username")?.toString().trim();
        const displayName = formData.get("displayName")?.toString().trim();

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

// ================================
// AUTH LOGIC
// ================================
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

  alert("Cuenta creada");
  renderAuth();
}

// ================================
// HOME
// ================================
function renderHome() {
  setHTML(`
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;">
      <div style="text-align:center">
        <h1>🔥 ${state.user.email}</h1>
        <button id="logoutBtn">Logout</button>
      </div>
    </div>
  `);

  document.getElementById("logoutBtn").onclick = logout;
}

async function logout() {
  await supabase.auth.signOut();
  state.user = null;
  renderAuth();
}

// ================================
// INIT
// ================================
async function initSupabase() {
  const mod = await import("https://esm.sh/@supabase/supabase-js@2");
  supabase = mod.createClient(SUPABASE_URL, SUPABASE_KEY);
}

async function boot() {
  renderLoading();

  await initSupabase();

  const { data } = await supabase.auth.getSession();

  if (data.session) {
    state.user = data.session.user;
    renderHome();
  } else {
    renderAuth();
  }
}

document.addEventListener("DOMContentLoaded", boot);
