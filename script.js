// ========== Search Filter ==========
document.getElementById("searchInput").addEventListener("input", function () {
  const query = this.value.toLowerCase();
  document.querySelectorAll(".post").forEach(post => {
    const text = post.textContent.toLowerCase();
    post.style.display = text.includes(query) ? "" : "none";
  });
});

// ========== Toggle Share Options ==========
function toggleShare(postId) {
  const el = document.getElementById(`shareOptions${postId}`);
  if (el) el.style.display = el.style.display === "block" ? "none" : "block";
}

// ========== Cookie Helpers ==========
function setCookie(name, value, days) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/`;
}
function getCookie(name) {
  return document.cookie.split("; ").find(row => row.startsWith(name + "="))?.split("=")[1];
}
function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
}

// ========== Toggle Like/Unlike ==========

function toggleLike(postId) {
  const btn = document.getElementById(`postLikeBtn${postId}`);
  const countEl = document.getElementById(`likeCount${postId}`);
  const cookieKey = `likedPost${postId}`;
  const likeKey = `postLikes${postId}`;

  let likes = parseInt(getCookie(likeKey) || 0);

  if (btn.classList.contains("liked")) {
    // UNLIKE
    likes = Math.max(0, likes - 1);
    deleteCookie(cookieKey);
    btn.textContent = "👍 Like";
    btn.classList.remove("liked");
  } else {
    // LIKE
    likes++;
    setCookie(cookieKey, "true", 365);
    btn.textContent = "Liked 👍";
    btn.classList.add("liked");
  }

  setCookie(likeKey, likes, 365);
  if (countEl) countEl.textContent = `${likes} Likes`;
}

// ========== Load Likes On Load ==========
function loadPostLikes() {
  document.querySelectorAll(".post").forEach(post => {
    const id = post.id.replace("post", "");
    const btn = document.getElementById(`postLikeBtn${id}`);
    const count = getCookie(`postLikes${id}`) || 0;
    const liked = getCookie(`likedPost${id}`);
    const display = document.getElementById(`likeCount${id}`);
    if (btn && display) {
      display.textContent = `${count} Likes`;
      if (liked) {
        btn.textContent = "Liked 👍";
        btn.classList.add("liked");
      }
    }
  });
}

// ========== Comment Submit ==========
function submitComment(postId) {
  const name = document.getElementById(`name${postId}`).value.trim();
  const comment = document.getElementById(`comment${postId}`).value.trim();
  const container = document.getElementById(`commentDisplay${postId}`);
  const countDisplay = document.getElementById(`commentCount${postId}`);

  if (!name || !comment) return alert("Enter your name and comment.");

  const box = document.createElement("div");
  box.classList.add("comment-box");

  const text = document.createElement("span");
  text.innerHTML = `<strong>${name}</strong>: ${comment}`;
  text.className = "comment-text";

  const buttons = document.createElement("div");
  buttons.className = "comment-actions";

  const likeBtn = document.createElement("button");
  likeBtn.textContent = "👍 Like";
  likeBtn.classList.add("like-btn");
  likeBtn.onclick = () => {
    likeBtn.classList.toggle("liked");
    likeBtn.textContent = likeBtn.classList.contains("liked") ? "Liked 👍" : "👍 Like";
  };

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.classList.add("delete-btn");
  deleteBtn.onclick = () => {
    box.remove();
    updateCommentCount(postId);
  };

  buttons.appendChild(likeBtn);
  buttons.appendChild(deleteBtn);
  box.appendChild(text);
  box.appendChild(buttons);
  container.appendChild(box);

  document.getElementById(`name${postId}`).value = "";
  document.getElementById(`comment${postId}`).value = "";
  updateCommentCount(postId);
}

// ========== Comment Count ==========
function updateCommentCount(postId) {
  const count = document.querySelectorAll(`#commentDisplay${postId} .comment-box`).length;
  const display = document.getElementById(`commentCount${postId}`);
  if (display) display.textContent = `Comments: ${count}`;
}

// ========== Upload Blog ==========
document.getElementById("showUploadBtn").addEventListener("click", () => {
  const form = document.getElementById("uploadSection");
  form.style.display = form.style.display === "none" ? "block" : "none";
});

document.getElementById("uploadForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const title = document.getElementById("newTitle").value.trim();
  const desc = document.getElementById("newDescription").value.trim();
  const tags = document.getElementById("newTags").value.trim();
  const file = document.getElementById("newImage").files[0];
  const container = document.getElementById("postsContainer");

  if (!title || !desc || !tags || !file) return alert("Please fill all fields!");

  const reader = new FileReader();
  reader.onload = function () {
    const imgSrc = reader.result;
    const postId = Date.now();

    const html = `
      <section class="post" id="post${postId}">
        <h2>${title}</h2>
        <p class="date">Published on: ${new Date().toLocaleDateString()}</p>
        <img src="${imgSrc}" alt="${title}" />
        <p>${desc}</p>
        <p class="tags">${tags.split(",").map(t => `<span>#${t.trim()}</span>`).join(" ")}</p>

        <div class="share-wrapper">
          <button class="share-toggle" onclick="toggleShare('${postId}')">🔗 Share</button>
          <div class="share-options" id="shareOptions${postId}">
            <a href="#">📘 Facebook</a>
            <a href="#">🐦 Twitter</a>
            <a href="#">📲 WhatsApp</a>
          </div>
        </div>

        <div class="post-likes">
          <button id="postLikeBtn${postId}" class="post-like-btn" onclick="toggleLike('${postId}')">👍 Like</button>
          <span id="likeCount${postId}">0 Likes</span>
        </div>

        <div class="comments">
          <h3>Leave a Comment:</h3>
          <input type="text" id="name${postId}" placeholder="Your Name" />
          <textarea id="comment${postId}" placeholder="Your Comment"></textarea>
          <button onclick="submitComment('${postId}')">Submit</button>
          <p id="commentCount${postId}">Comments: 0</p>
          <div id="commentDisplay${postId}"></div>
        </div>
      </section>
    `;

    container.insertAdjacentHTML("beforeend", html);
    document.getElementById("uploadForm").reset();
    document.getElementById("uploadSection").style.display = "none";
  };

  reader.readAsDataURL(file);
});

// ================== Delete Uploaded Post ==================
function deleteUploadedPost(postId) {
  const postEl = document.getElementById(`post${postId}`);
  if (postEl) postEl.remove();

  const posts = JSON.parse(localStorage.getItem("uploadedPosts") || "[]");
  const updated = posts.filter(p => p.id !== postId);
  localStorage.setItem("uploadedPosts", JSON.stringify(updated));

  deleteCookie(`postLikes${postId}`);
  deleteCookie(`likedPost${postId}`);
}

// // ========== On Load ==========
// window.addEventListener("DOMContentLoaded", loadPostLikes);

// ================== Load Stored Posts ==================
// Helper to render a post from localStorage
function renderUploadedPost(post) {
  const container = document.getElementById("postsContainer");
  if (!container) return;
  const tagsString = typeof post.tags === "string" ? post.tags : Array.isArray(post.tags) ? post.tags.join(",") : "";
  const html = `
    <section class="post" id="post${post.id}">
      <h2>${post.title}</h2>
      <p class="date">Published on: ${post.date || new Date().toLocaleDateString()}</p>
      <img src="${post.imgSrc}" alt="${post.title}" />
      <p>${post.desc}</p>
      <p class="tags">${tagsString.split(",").map(t => `<span>#${t.trim()}</span>`).join(" ")}</p>

      <div class="share-wrapper">
        <button class="share-toggle" onclick="toggleShare('${post.id}')">🔗 Share</button>
        <div class="share-options" id="shareOptions${post.id}">
          <a href="#">📘 Facebook</a>
          <a href="#">🐦 Twitter</a>
          <a href="#">📲 WhatsApp</a>
        </div>
      </div>

      <div class="post-likes">
        <button id="postLikeBtn${post.id}" class="post-like-btn" onclick="toggleLike('${post.id}')">👍 Like</button>
        <span id="likeCount${post.id}">0 Likes</span>
      </div>

      <div class="comments">
        <h3>Leave a Comment:</h3>
        <input type="text" id="name${post.id}" placeholder="Your Name" />
        <textarea id="comment${post.id}" placeholder="Your Comment"></textarea>
        <button onclick="submitComment('${post.id}')">Submit</button>
        <p id="commentCount${post.id}">Comments: 0</p>
        <div id="commentDisplay${post.id}"></div>
      </div>
    </section>
  `;
  container.insertAdjacentHTML("beforeend", html);
}

window.addEventListener("DOMContentLoaded", function () {
  const posts = JSON.parse(localStorage.getItem("uploadedPosts") || "[]");
  posts.forEach(renderUploadedPost);
  loadPostLikes();
});