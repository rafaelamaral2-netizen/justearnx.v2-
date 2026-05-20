const app = document.getElementById("app");

console.log("EarnX Mock 2.0 Loaded");

const posts = [
  {
    author: "Rafael",
    username: "rafa",
    body: "First mock post for EarnX v3 experience.",
    time: "2h ago"
  },
  {
    author: "Creator X",
    username: "creatorx",
    body: "Building momentum publicly on EarnX.",
    time: "5h ago"
  }
];

function render() {
  app.innerHTML = `
    <main class="main">
      <div class="card">
        <div class="title">EarnX Mock Home</div>
        <div class="muted">Visual lab for the new experience</div>
      </div>

      ${posts.map(p => `
        <div class="card">
          <div class="title">${p.author}</div>
          <div class="muted">@${p.username} · ${p.time}</div>
          <p style="margin-top:10px">${p.body}</p>
        </div>
      `).join("")}
    </main>
  `;
}

render();
