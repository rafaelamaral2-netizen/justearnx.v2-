import { createClient } from "https://esm.sh/@supabase/supabase-js";

/* =========================
   SUPABASE
========================= */
const supabaseUrl = "https://duyltyirtffzomrnielr.supabase.co";
const supabaseKey = "TU_PUBLISHABLE_KEY_REAL";
const supabase = createClient(supabaseUrl, supabaseKey);

/* =========================
   STATE
========================= */
const STORAGE_KEY = "earnx_master_v3";

const initialState = {
  sessionUser: null,
  theme: "dark",
  authView: "login",
  appView: "home",
  settingsTab: "preferences",
  users: []
};

let state = loadState();

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", async () => {
  applyTheme();

  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (session?.user) {
    await syncUser(session.user);
  }

  supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session?.user) {
      await syncUser(session.user);
    } else {
      state.sessionUser = null;
    }

    saveState();
    render();
  });

  render();
});

/* =========================
   STORAGE
========================= */
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...initialState };
    return { ...initialState, ...JSON.parse(raw) };
  } catch {
    return { ...initialState };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/* =========================
   THEME
========================= */
function applyTheme() {
  document.body.classList.remove("dark-theme", "light-theme", "pink-theme");
  document.body.classList.add(`${state.theme}-theme`);
}

function toggleTheme() {
  const themes = ["dark", "light", "pink"];
  const i = themes.indexOf(state.theme);
  state.theme = themes[(i + 1) % themes.length];
  saveState();
  applyTheme();
  render();
}

/* =========================
   AUTH SYNC
========================= */
async function syncUser(user) {
  let profile = null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  profile = data;

  let local = state.users.find(u => u.id === user.id);

  if (!local) {
    local = {
      id: user.id,
      displayName:
        profile?.display_name ||
        user.user_metadata?.display_name ||
        user.email.split("@")[0],
      username:
        profile?.username ||
        user.user_metadata?.username ||
        user.email.split("@")[0],
      email: user.email,
      bio: profile?.bio || "New creator on EARNX.",
      avatarUrl: profile?.avatar_url || "",
      verified: !!profile?.verified
    };

    state.users.push(local);
  }

  state.sessionUser = local.id;
}

/* =========================
   AUTH ACTIONS
========================= */
async function login(email, password) {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    alert(error.message);
  }
}

async function signup({ displayName, username, email, password }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
        username
      }
    }
  });

  if (error) {
    alert(error.message);
    return;
  }

  if (data.user) {
    await supabase.from("profiles").upsert({
      id: data.user.id,
      display_name: displayName,
      username,
      email,
      bio: "New creator on EARNX."
    });
  }

  alert("Account created");
  state.authView = "login";
  render();
}

async function logout() {
  await supabase.auth.signOut();
}

/* =========================
   HELPERS
========================= */
function currentUser() {
  return state.users.find(u => u.id === state.sessionUser);
}

/* =========================
   RENDER
========================= */
function render() {
  const app = document.getElementById("app");
  if (!app) return;

  if (!state.sessionUser) {
    app.innerHTML = renderAuth();
  } else {
    app.innerHTML = renderApp();
  }

  bind();
}

/* =========================
   AUTH UI
========================= */
function renderAuth() {
  return `
  <main class="page">
    <section class="shell">
      <h1>EarnX</h1>

      ${
        state.authView === "login"
          ? `
        <form id="loginForm">
          <input id="email" placeholder="Email"/>
          <input id="password" type="password" placeholder="Password"/>
          <button>Login</button>
        </form>
        <a id="goSignup">Create account</a>
      `
          : `
        <form id="signupForm">
          <input id="name" placeholder="Name"/>
          <input id="user" placeholder="Username"/>
          <input id="email" placeholder="Email"/>
          <input id="password" type="password"/>
          <button>Create</button>
        </form>
        <a id="goLogin">Back</a>
      `
      }
    </section>
  </main>
  `;
}

/* =========================
   APP UI
========================= */
function renderApp() {
  const me = currentUser();

  return `
  <div class="app-shell">
    <main class="page-content">
      <h2>Welcome ${me.displayName}</h2>
      <p>@${me.username}</p>

      <button id="logout">Logout</button>
      <button id="theme">Theme</button>
    </main>
  </div>
  `;
}

/* =========================
   EVENTS
========================= */
function bind() {
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.onsubmit = e => {
      e.preventDefault();
      login(
        document.getElementById("email").value,
        document.getElementById("password").value
      );
    };
  }

  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    signupForm.onsubmit = e => {
      e.preventDefault();
      signup({
        displayName: document.getElementById("name").value,
        username: document.getElementById("user").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value
      });
    };
  }

  document.getElementById("goSignup")?.addEventListener("click", e => {
    e.preventDefault();
    state.authView = "signup";
    render();
  });

  document.getElementById("goLogin")?.addEventListener("click", e => {
    e.preventDefault();
    state.authView = "login";
    render();
  });

  document.getElementById("logout")?.addEventListener("click", logout);
  document.getElementById("theme")?.addEventListener("click", toggleTheme);
}
