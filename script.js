const STORAGE_KEY = "earnx_recovery";

const initialUI = {
  authView: "login",
  appView: "home",
  theme: "dark"
};

let state = {
  sessionUserId: null,
  ui: { ...initialUI }
};

document.addEventListener("DOMContentLoaded", () => {
  loadState();
  applyTheme();
  render();
});

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    state = {
      ...state,
      ...parsed,
      ui: {
        ...initialUI,
        ...(parsed.ui || {})
      }
    };
  } catch (err) {
    console.warn("Load error:", err);
  }
}

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

function login() {
  state.sessionUserId = "u1";
  state.ui.appView = "home";
  saveState();
  render();
}

function logout() {
  state.sessionUserId = null;
  state.ui.authView = "login";
  saveState();
  render();
}

function setView(view) {
  state.ui.appView = view;
  saveState();
  render();
}

function render() {
  const app = document.getElementById("app");
  if (!app) return;

  if (!state.sessionUserId) {
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
            <h2>Build. Create. Own.</h2>
            <p>Recovery mode. This confirms the app is loading again.</p>
          </div>

          <div class="card">
            <h3>Login</h3>
            <p class="card-sub">Temporary recovery screen.</p>
            <button class="button" id="loginBtn" type="button">Enter app</button>

            <div class="links">
              <a href="#" id="themeToggleLink">Theme: ${state.ui.theme}</a>
            </div>
          </div>
        </section>
      </main>
    `;
  } else {
    app.innerHTML = `
      <div class="app-shell app-shell-mobile">
        <main class="page-content page-content-mobile">
          ${renderPage()}
        </main>

        <nav class="bottom-nav">
          <button class="bottom-nav-btn ${state.ui.appView === "home" ? "active" : ""}" data-nav="home">
            <span class="bottom-nav-icon">⌂</span>
            <span class="bottom-nav-label">Home</span>
          </button>
          <button class="bottom-nav-btn ${state.ui.appView === "discover" ? "active" : ""}" data-nav="discover">
            <span class="bottom-nav-icon">⌕</span>
            <span class="bottom-nav-label">Discover</span>
          </button>
          <button class="bottom-nav-btn ${state.ui.appView === "profile" ? "active" : ""}" data-nav="profile">
            <span class="bottom-nav-icon">◉</span>
            <span class="bottom-nav-label">Profile</span>
          </button>
          <button class="bottom-nav-btn ${state.ui.appView === "settings" ? "active" : ""}" data-nav="settings">
            <span class="bottom-nav-icon">⚙</span>
            <span class="bottom-nav-label">Settings</span>
          </button>
        </nav>
      </div>
    `;
  }

  bindEvents();
}

function renderPage() {
  switch (state.ui.appView) {
    case "discover":
      return `
        <section class="section">
          <div class="topbar">
            <span class="page-kicker">Discover</span>
            <h1 class="page-title">Discover</h1>
            <p class="page-subtitle">Recovery view loaded correctly.</p>
          </div>
        </section>
      `;
    case "profile":
      return `
        <section class="section">
          <div class="topbar">
            <span class="page-kicker">Profile</span>
            <h1 class="page-title">Rafael Amaral</h1>
            <p class="page-subtitle">Profile recovery view.</p>
          </div>
        </section>
      `;
    case "settings":
      return `
        <div class="settings-shell">
          <section class="settings-main">
            <div class="settings-section">
              <div class="settings-section-head">
                <h3>Preferences</h3>
                <p>Theme now lives here.</p>
              </div>

              <div class="settings-row">
                <div>
                  <div class="settings-row-title">Theme</div>
                  <div class="settings-row-sub">Dark, light, pink.</div>
                </div>
                <div>
                  <button class="btn btn-secondary" id="themeToggleInlineBtn">Theme: ${state.ui.theme}</button>
                </div>
              </div>

              <div class="settings-row">
                <div>
                  <div class="settings-row-title">Session</div>
                  <div class="settings-row-sub">Exit recovery app.</div>
                </div>
                <div>
                  <button class="btn btn-secondary" id="logoutBtn">Logout</button>
                </div>
              </div>
            </div>
          </section>
        </div>
      `;
    case "home":
    default:
      return `
        <section class="hero-home">
          <div class="hero-home-copy">
            <div class="page-kicker">EarnX</div>
            <h2>Build. Create. Own.</h2>
            <p>The app is loading again. From here we rebuild safely.</p>
          </div>
        </section>

        <section class="section">
          <div class="section-head">
            <h3>Home</h3>
            <span class="section-meta">Recovery mode active</span>
          </div>

          <div class="post-card">
            <div class="post-content">
              EarnX recovered successfully. Next step is rebuilding features on top of this stable base.
            </div>
          </div>
        </section>
      `;
  }
}

function bindEvents() {
  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) {
    loginBtn.onclick = login;
  }

  const themeToggleLink = document.getElementById("themeToggleLink");
  if (themeToggleLink) {
    themeToggleLink.onclick = (e) => {
      e.preventDefault();
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

  document.querySelectorAll("[data-nav]").forEach((btn) => {
    btn.onclick = () => setView(btn.dataset.nav);
  });
}
