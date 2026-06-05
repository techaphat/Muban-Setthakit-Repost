/************************************************
 * หมู่บ้านเศรษฐกิจ REPOST
 * script.js
 * ดึงข้อมูลจาก Google Sheets ผ่าน Apps Script
 ************************************************/

const API_URL = "https://script.google.com/macros/s/AKfycbw62ufg0WAO8_c1QCbxGX3u2xrLvWOZGhaTmNffvgNkk44ZiHShcP5iv5JrEzq8OXUu/exec";

const feedEl = document.getElementById("postFeed");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");

let allPosts = [];

/* เริ่มทำงานเมื่อหน้าเว็บโหลดเสร็จ */
document.addEventListener("DOMContentLoaded", () => {
  loadPosts();

  if (searchInput) {
    searchInput.addEventListener("input", renderFilteredPosts);
  }

  if (categoryFilter) {
    categoryFilter.addEventListener("change", renderFilteredPosts);
  }
});

/* โหลดโพสต์จาก Apps Script */
async function loadPosts() {
  try {
    showLoading();

    const response = await fetch(API_URL, {
      method: "GET",
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("ไม่สามารถเชื่อมต่อฐานข้อมูลได้");
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "โหลดข้อมูลไม่สำเร็จ");
    }

    allPosts = Array.isArray(data.posts) ? data.posts : [];

    setupCategoryFilter(allPosts);
    renderPosts(allPosts);

  } catch (error) {
    console.error(error);
    showError(error.message);
  }
}

/* แสดงสถานะกำลังโหลด */
function showLoading() {
  if (!feedEl) return;

  feedEl.innerHTML = `
    <div class="loading">
      กำลังโหลดเรื่องเล่า...
    </div>
  `;
}

/* แสดงข้อความ error */
function showError(message) {
  if (!feedEl) return;

  feedEl.innerHTML = `
    <div class="error">
      <strong>โหลดข้อมูลไม่สำเร็จ</strong><br>
      ${escapeHtml(message)}
    </div>
  `;
}

/* สร้างตัวเลือกหมวดหมู่จากข้อมูลจริง */
function setupCategoryFilter(posts) {
  if (!categoryFilter) return;

  const categories = [
    ...new Set(
      posts
        .map(post => post.category)
        .filter(category => category && String(category).trim() !== "")
    )
  ];

  categoryFilter.innerHTML = `<option value="all">ทุกหมวดหมู่</option>`;

  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
}

/* กรองโพสต์จากช่องค้นหาและหมวดหมู่ */
function renderFilteredPosts() {
  const keyword = searchInput
    ? searchInput.value.trim().toLowerCase()
    : "";

  const selectedCategory = categoryFilter
    ? categoryFilter.value
    : "all";

  const filteredPosts = allPosts.filter(post => {
    const searchableText = `
      ${post.title || ""}
      ${post.story || ""}
      ${post.author || ""}
      ${post.year || ""}
      ${post.category || ""}
      ${post.locationText || ""}
      ${post.postId || ""}
    `.toLowerCase();

    const matchKeyword =
      !keyword || searchableText.includes(keyword);

    const matchCategory =
      selectedCategory === "all" || post.category === selectedCategory;

    return matchKeyword && matchCategory;
  });

  renderPosts(filteredPosts);
}

/* แสดงโพสต์ทั้งหมด */
function renderPosts(posts) {
  if (!feedEl) return;

  if (!posts || posts.length === 0) {
    feedEl.innerHTML = `
      <div class="empty">
        ยังไม่มีโพสต์ที่แสดงในตอนนี้
      </div>
    `;
    return;
  }

  feedEl.innerHTML = posts
    .map(post => createPostCard(post))
    .join("");
}

/* สร้างการ์ดโพสต์ 1 ใบ */
function createPostCard(post) {
  const title = post.title || "ไม่มีชื่อโพสต์";
  const story = post.story || "";
  const author = post.author || "ไม่ระบุชื่อ";
  const year = post.year || "";
  const category = post.category || "";
  const locationText = post.locationText || "";
  const postId = post.postId || "";
  const imageUrl = post.imageUrl || "";

  const imageHtml = imageUrl
    ? `
      <img 
        class="post-image" 
        src="${escapeAttr(imageUrl)}" 
        alt="${escapeAttr(title)}" 
        loading="lazy"
        onerror="this.onerror=null; this.src=''; this.closest('.post-image-wrap').innerHTML='<div class=&quot;no-image&quot;>ไม่สามารถแสดงภาพได้</div>';"
      >
    `
    : `
      <div class="no-image">
        ไม่มีภาพ
      </div>
    `;

  const categoryBadge = category
    ? `<span class="badge">${escapeHtml(category)}</span>`
    : "";

  const yearBadge = year
    ? `<span class="badge">${escapeHtml(year)}</span>`
    : "";

  const mapButton = locationText
    ? `
      <a 
        class="action-btn secondary" 
        href="https://www.google.com/maps/search/${encodeURIComponent(locationText)}" 
        target="_blank" 
        rel="noopener"
      >
        ดูตำแหน่ง
      </a>
    `
    : "";

  return `
    <article class="post-card" data-post-id="${escapeAttr(postId)}">

      <div class="post-image-wrap">
        ${imageHtml}
      </div>

      <div class="post-content">

        <div class="post-meta">
          ${categoryBadge}
          ${yearBadge}
        </div>

        <h2 class="post-title">
          ${escapeHtml(title)}
        </h2>

        <p class="post-story">
          ${escapeHtml(story)}
        </p>

        <div class="post-info">
          <div>ผู้เล่า: ${escapeHtml(author)}</div>
          ${locationText ? `<div>สถานที่: ${escapeHtml(locationText)}</div>` : ""}
          ${postId ? `<div>รหัสโพสต์: ${escapeHtml(postId)}</div>` : ""}
        </div>

        <div class="post-actions">
          <button class="action-btn" onclick="openMemoryBox('${escapeAttr(postId)}')">
            เล่าเพิ่มเติม
          </button>

          ${mapButton}
        </div>

      </div>
    </article>
  `;
}

/* ปุ่มเล่าเพิ่มเติม ยังเป็นตัวอย่างก่อน */
function openMemoryBox(postId) {
  if (!postId) {
    alert("โพสต์นี้ยังไม่มีรหัสโพสต์");
    return;
  }

  alert(`ขั้นต่อไปจะทำระบบคอมเมนต์/เล่าเพิ่มเติมสำหรับโพสต์ ${postId}`);
}

/* ป้องกันปัญหา HTML แปลก ๆ จากข้อความผู้ใช้ */
function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}
