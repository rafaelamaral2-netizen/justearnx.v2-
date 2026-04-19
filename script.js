const STORAGE_KEY = "earnx_phase1";

const initialState = {
  ui: {
    authView: "login", // login | signup
    theme: "dark"
  }
};

let state = loadState();

/* -------------------------
   STORAGE
------------------------- */
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...initialState, ui: { ...initialState.ui } };
    const parsed = JSON.parse(raw);
    return {
      ...initialState,
      ...parsed,
      ui: {
        ...initialState.ui,
        ...(parsed.ui || {})
      }
    };
  } catch {
    return { ...initialState, ui: { ...initialState.ui } };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/* -------------------------
   THEME
------------------------- */
function applyTheme() {
  document.body.classList.toggle("light-theme", state.ui.theme === "light");
  document.body.classList.toggle("dark-theme", state.ui.theme !== "light");
}

function toggleTheme() {
  state.ui.theme = state.ui.theme === "dark" ? "light" : "dark";
  saveState();
  applyTheme();
  render();
}

/* -------------------------
   NAV BETWEEN LOGIN/SIGNUP
------------------------- */
function goAuthView(view) {
  state.ui.authView = view;
  saveState();
  render();
}

/* -------------------------
   RENDER
------------------------- */
function render() {
  const app = document.getElementById("app");
  if (!app) return;

  app.innerHTML = `
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
          <h2>A premium social platform built around creator ambition, audience reach, and momentum.</h2>
          <p>Clean, modern, and creator-first. This is the starting point of EARNX.</p>
        </div>

        ${state.ui.authView === "login" ? renderLoginCard() : renderSignupCard()}
      </section>
    </main>
  `;

  bindEvents();
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
        <a href="#" id="themeToggleLink">Toggle theme</a>
      </div>

      <div class="note">Phase 1: visual auth shell only.</div>
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
        <a href="#" id="themeToggleLink">Toggle theme</a>
      </div>

      <div class="note">Phase 1: visual auth shell only.</div>
    </div>
  `;
}

/* -------------------------
   EVENTS
------------------------- */
function bindEvents() {
  const goSignup = document.getElementById("goSignup");
  if (goSignup) {
    goSignup.onclick = (e) => {
      e.preventDefault();
      goAuthView("signup");
    };
  }

  const goLogin = document.getElementById("goLogin");
  if (goLogin) {
    goLogin.onclick = (e) => {
      e.preventDefault();
      goAuthView("login");
    };
  }

  const themeToggleLink = document.getElementById("themeToggleLink");
  if (themeToggleLink) {
    themeToggleLink.onclick = (e) => {
      e.preventDefault();
      toggleTheme();
    };
  }

  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.onsubmit = (e) => {
      e.preventDefault();
      alert("Phase 1 only: login logic comes next.");
    };
  }

  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    signupForm.onsubmit = (e) => {
      e.preventDefault();
      alert("Phase 1 only: signup logic comes next.");
    };
  }
}

/* -------------------------
   BOOT
------------------------- */
applyTheme();
render();
