document.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("app");

  if (!app) return;

  app.innerHTML = `
    <main style="padding:40px; color:white; font-family:Inter, sans-serif;">
      <h1 style="margin:0 0 12px;">EarnX test</h1>
      <p style="margin:0;">JS está cargando correctamente.</p>
      <button id="themeBtn" style="margin-top:20px; padding:12px 16px; border-radius:12px; border:none; cursor:pointer;">
        Toggle Theme
      </button>
    </main>
  `;

  const btn = document.getElementById("themeBtn");
  btn?.addEventListener("click", () => {
    if (document.body.classList.contains("dark-theme")) {
      document.body.classList.remove("dark-theme");
      document.body.classList.add("light-theme");
    } else {
      document.body.classList.remove("light-theme");
      document.body.classList.add("dark-theme");
    }
  });
});
