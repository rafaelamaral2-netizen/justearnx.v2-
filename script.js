// EARNX — RESCATE SEGURO
// Objetivo: sacar la app del negro sin depender de Supabase

document.addEventListener("DOMContentLoaded", function () {
  try {
    const app = document.getElementById("app");
    if (!app) return;

    document.body.classList.remove("light-theme", "pink-theme");
    document.body.classList.add("dark-theme");

    app.innerHTML = `
      <div class="auth-wrap">
        <div class="auth-card">
          <div class="auth-brand"></div>
          <div class="auth-tagline">
            A premium social platform built around creator ambition, audience reach, and public ranking momentum.
          </div>
          <div class="auth-copy">
            Designed for creators who want stronger positioning, cleaner monetization, and a product that feels elevated from the first touch.
          </div>

          <div class="auth-tabs">
            <button class="auth-tab active" id="tab-login" type="button">Sign in</button>
            <button class="auth-tab" id="tab-signup" type="button">Create</button>
          </div>

          <div id="auth-form"></div>
        </div>
      </div>
    `;

    function renderLogin() {
      const form = document.getElementById("auth-form");
      if (!form) return;

      form.innerHTML = `
        <div class="auth-form-title">Login</div>
        <div class="auth-form-subtitle">Enter your creator account.</div>

        <div class="field">
          <label for="email">Email</label>
          <input id="email" type="email" placeholder="you@example.com" autocomplete="email" />
        </div>

        <div class="field">
          <label for="password">Password</label>
          <input id="password" type="password" placeholder="••••••••" autocomplete="current-password" />
        </div>

        <button class="btn-primary" id="login-btn" type="button">Login</button>
      `;

      const btn = document.getElementById("login-btn");
      if (btn) {
        btn.addEventListener("click", function () {
          const email = document.getElementById("email")?.value.trim() || "";
          const password = document.getElementById("password")?.value || "";

          if (!email || !password) {
            alert("Fill all fields.");
            return;
          }

          alert("UI recuperada. El próximo paso es reconectar Supabase sobre esta base estable.");
        });
      }
    }

    function renderSignup() {
      const form = document.getElementById("auth-form");
      if (!form) return;

      form.innerHTML = `
        <div class="auth-form-title">Create account</div>
        <div class="auth-form-subtitle">Build your identity on EarnX.</div>

        <div class="field">
          <label for="username">Username</label>
          <input id="username" type="text" placeholder="yourhandle" autocomplete="username" />
        </div>

        <div class="field">
          <label for="displayName">Display name</label>
          <input id="displayName" type="text" placeholder="Your name" autocomplete="name" />
        </div>

        <div class="field">
          <label for="email">Email</label>
          <input id="email" type="email" placeholder="you@example.com" autocomplete="email" />
        </div>

        <div class="field">
          <label for="password">Password</label>
          <input id="password" type="password" placeholder="At least 8 characters" autocomplete="new-password" />
        </div>

        <button class="btn-primary" id="signup-btn" type="button">Create account</button>
      `;

      const btn = document.getElementById("signup-btn");
      if (btn) {
        btn.addEventListener("click", function () {
          const username = document.getElementById("username")?.value.trim() || "";
          const displayName = document.getElementById("displayName")?.value.trim() || "";
          const email = document.getElementById("email")?.value.trim() || "";
          const password = document.getElementById("password")?.value || "";

          if (!username || !displayName || !email || !password) {
            alert("Fill all fields.");
            return;
          }

          alert("UI recuperada. El próximo paso es reconectar Supabase sobre esta base estable.");
        });
      }
    }

    const tabLogin = document.getElementById("tab-login");
    const tabSignup = document.getElementById("tab-signup");

    if (tabLogin && tabSignup) {
      tabLogin.addEventListener("click", function () {
        tabLogin.classList.add("active");
        tabSignup.classList.remove("active");
        renderLogin();
      });

      tabSignup.addEventListener("click", function () {
        tabSignup.classList.add("active");
        tabLogin.classList.remove("active");
        renderSignup();
      });
    }

    renderLogin();
  } catch (err) {
    const app = document.getElementById("app");
    if (app) {
      app.innerHTML = `
        <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;color:white;">
          <div style="max-width:720px;width:100%;background:#111722;border:1px solid rgba(255,255,255,.08);border-radius:24px;padding:24px;">
            <h2 style="margin:0 0 12px;">JS error</h2>
            <pre style="white-space:pre-wrap;word-break:break-word;margin:0;color:#93a0b5;">${String(err.message || err)}</pre>
          </div>
        </div>
      `;
    }
  }
});
