// ===== Search Filter =====
document.getElementById("searchInput").addEventListener("input", function () {
  const query = this.value.toLowerCase();
  document.querySelectorAll(".post").forEach(post => {
    const text = post.textContent.toLowerCase();
    post.style.display = text.includes(query) ? "" : "none";
  });
});

// ===== Toggle Share Options =====
function toggleShare(postId) {
  const el = document.getElementById(`shareOptions${postId}`);
  if (el) el.style.display = el.style.display === "block" ? "none" : "block";
}

// ===== Cookie Helpers =====
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

// ===== Like/Unlike Post =====
function toggleLike(postId) {
  const btn = document.getElementById(`postLikeBtn${postId}`);
  const countEl = document.getElementById(`likeCount${postId}`);
  const cookieKey = `likedPost${postId}`;
  const likeKey = `postLikes${postId}`;

  let likes = parseInt(getCookie(likeKey) || 0);

  if (btn.classList.contains("liked")) {
    likes = Math.max(0, likes - 1);
    deleteCookie(cookieKey);
    btn.textContent = "👍 Like";
    btn.classList.remove("liked");
  } else {
    likes++;
    setCookie(cookieKey, "true", 365);
    btn.textContent = "Liked 👍";
    btn.classList.add("liked");
  }

  setCookie(likeKey, likes, 365);
  countEl.textContent = `${likes} Likes`;
}

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

// ===== Comment Submit =====
function submitComment(postId) {
  const name = document.getElementById(`name${postId}`).value.trim();
  const comment = document.getElementById(`comment${postId}`).value.trim();
  const container = document.getElementById(`commentDisplay${postId}`);

  if (!name || !comment) return alert("Enter your name and comment.");

  const box = document.createElement("div");
  box.classList.add("comment-box");

  const text = document.createElement("span");
  text.innerHTML = `<strong>${name}</strong>: ${comment}`;
  text.className = "comment-text";

  const actions = document.createElement("div");
  actions.className = "comment-actions";

  const likeBtn = document.createElement("button");
  likeBtn.textContent = "👍 Like";
  likeBtn.classList.add("like-btn");
  likeBtn.onclick = () => {
    likeBtn.classList.toggle("liked");
    likeBtn.textContent = likeBtn.classList.contains("liked") ? "Liked 👍" : "👍 Like";
  };

  const delBtn = document.createElement("button");
  delBtn.textContent = "Delete";
  delBtn.classList.add("delete-btn");
  delBtn.onclick = () => {
    box.remove();
    updateCommentCount(postId);
  };

  actions.appendChild(likeBtn);
  actions.appendChild(delBtn);

  box.appendChild(text);
  box.appendChild(actions);
  container.appendChild(box);

  document.getElementById(`name${postId}`).value = "";
  document.getElementById(`comment${postId}`).value = "";

  updateCommentCount(postId);
}

function updateCommentCount(postId) {
  const count = document.querySelectorAll(`#commentDisplay${postId} .comment-box`).length;
  document.getElementById(`commentCount${postId}`).textContent = `Comments: ${count}`;
}

// ===== Upload Blog =====
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
          <div class="share-options" id="shareOptions${postId}" style="display: none;">
            <a href="#">📘 Facebook</a>
            <a href="#">🐦 Twitter</a>
            <a href="#">📲 WhatsApp</a>
          </div>
        </div>

        <div class="post-likes">
          <button id="postLikeBtn${postId}" class="post-like-btn" onclick="toggleLike('${postId}')">👍 Like</button>
          <span id="likeCount${postId}">0 Likes</span>
          <button class="delete-post-btn" onclick="deleteUploadedPost('${postId}')">🗑️ Delete</button>
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

function deleteUploadedPost(postId) {
  const postElement = document.getElementById(`post${postId}`);
  if (postElement) postElement.remove();

  // Optional: Clear cookies
  deleteCookie(`postLikes${postId}`);
  deleteCookie(`likedPost${postId}`);
}

// ===== On Page Load =====
window.addEventListener("DOMContentLoaded", loadPostLikes);
