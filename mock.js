// ===============================
// EARNX MOCK EXPERIENCE
// ===============================

console.log("EarnX IG/OF Mock Loaded");

// ACTIVE NAVIGATION

const navItems = document.querySelectorAll(".nav-item");

navItems.forEach(item => {
  item.addEventListener("click", () => {

    navItems.forEach(n => {
      n.classList.remove("active");
    });

    item.classList.add("active");

  });
});

// STORY INTERACTION

const stories = document.querySelectorAll(".story");

stories.forEach(story => {

  story.addEventListener("click", () => {

    story.style.transform = "scale(1.1)";

    setTimeout(() => {
      story.style.transform = "";
    }, 200);

  });

});

// POST ACTIONS

const actions = document.querySelectorAll(".action");

actions.forEach(action => {

  action.addEventListener("click", () => {

    action.classList.toggle("active");

  });

});

// CREATE BUTTON

const createBtn = document.querySelector(".create-btn");

if (createBtn) {

  createBtn.addEventListener("click", () => {

    alert("Create flow coming soon 🚀");

  });

}

// TREND CARDS

const trendCards = document.querySelectorAll(".trend-card");

trendCards.forEach(card => {

  card.addEventListener("mouseenter", () => {

    card.style.transform = "translateX(6px)";
    card.style.transition = ".25s";

  });

  card.addEventListener("mouseleave", () => {

    card.style.transform = "";

  });

});

// POST HOVER EFFECT

const posts = document.querySelectorAll(".post-card");

posts.forEach(post => {

  post.addEventListener("mouseenter", () => {

    post.style.transform = "translateY(-4px)";
    post.style.transition = ".25s";

  });

  post.addEventListener("mouseleave", () => {

    post.style.transform = "";

  });

});

