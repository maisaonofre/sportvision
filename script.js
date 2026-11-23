/* =========================================
   SPORTVISION — SCRIPT.JS
   Vídeos, pesquisa, categorias, favoritos,
   histórico, player e perfil.
========================================= */

// =========================================
// 1. VÍDEOS DO SITE
// =========================================

const videos = [
  {
    id: 1,
    title: "Transmissão esportiva ao vivo",
    description: "Vídeo esportivo disponível no YouTube.",
    sport: "futebol",
    category: "Futebol",
    thumbnail: "https://img.youtube.com/vi/n2KWc_xbPAA/hqdefault.jpg",
    videoId: "n2KWc_xbPAA",
    url: "https://www.youtube.com/live/n2KWc_xbPAA?is=EVz2QP3yvkbx4kyz"
  }
];

// =========================================
// 2. ELEMENTOS DO HTML
// =========================================

const videoGrid = document.getElementById("video-grid");
const searchInput = document.getElementById("search");
const videosTitle = document.getElementById("videos-title");
const videoCount = document.getElementById("video-count");
const emptyMessage = document.getElementById("empty-message");

const videoDialog = document.getElementById("video-dialog");
const dialogTitle = document.getElementById("dialog-title");
const dialogDescription = document.getElementById("dialog-description");
const playerContainer = document.getElementById("player-container");
const youtubeLink = document.getElementById("youtube-link");
const closeDialog = document.getElementById("close-dialog");

const profileDialog = document.getElementById("profile-dialog");
const profileButton = document.getElementById("profile");
const closeProfile = document.getElementById("close-profile");
const clearHistoryButton = document.getElementById("clear-history");

const mobileMenu = document.getElementById("mobile-menu");
const sidebar = document.querySelector(".sidebar");

// =========================================
// 3. DADOS E CONFIGURAÇÕES
// =========================================

let currentSport = "todos";
let currentPage = "inicio";
let currentSearch = "";

let favorites = JSON.parse(
  localStorage.getItem("sportvision-favorites") || "[]"
);

let history = JSON.parse(
  localStorage.getItem("sportvision-history") || "[]"
);

// =========================================
// 4. SALVAR DADOS
// =========================================

function saveFavorites() {
  localStorage.setItem(
    "sportvision-favorites",
    JSON.stringify(favorites)
  );
}

function saveHistory() {
  localStorage.setItem(
    "sportvision-history",
    JSON.stringify(history)
  );
}

// =========================================
// 5. ORGANIZAR OS VÍDEOS
// =========================================

function getFilteredVideos() {
  let result = [...videos];

  // Filtrar por categoria esportiva
  if (currentSport !== "todos") {
    result = result.filter(
      video => video.sport === currentSport
    );
  }

  // Filtrar por pesquisa
  if (currentSearch.trim() !== "") {
    const search = currentSearch.toLowerCase();

    result = result.filter(video =>
      video.title.toLowerCase().includes(search) ||
      video.description.toLowerCase().includes(search) ||
      video.category.toLowerCase().includes(search)
    );
  }

  // Filtrar por página
  if (currentPage === "favoritos") {
    result = result.filter(
      video => favorites.includes(video.id)
    );
  }

  if (currentPage === "historico") {
    result = result.filter(
      video => history.includes(video.id)
    );
  }

  return result;
}

// =========================================
// 6. CRIAR OS CARDS DOS VÍDEOS
// =========================================

function renderVideos() {
  if (!videoGrid) return;

  const filteredVideos = getFilteredVideos();

  videoGrid.innerHTML = "";

  if (videoCount) {
    videoCount.textContent = filteredVideos.length;
  }

  if (emptyMessage) {
    emptyMessage.style.display =
      filteredVideos.length === 0 ? "block" : "none";
  }

  filteredVideos.forEach(video => {
    const isFavorite = favorites.includes(video.id);

    const card = document.createElement("article");
    card.className = "video-card";

    card.innerHTML = `
      <div class="video-thumbnail">
        <img
          src="${video.thumbnail}"
          alt="${video.title}"
          loading="lazy"
        >

        <button
          class="favorite-btn ${isFavorite ? "active" : ""}"
          data-favorite="${video.id}"
          aria-label="Adicionar aos favoritos"
        >
          ${isFavorite ? "★" : "☆"}
        </button>

        <span class="video-category">
          ${video.category}
        </span>
      </div>

      <div class="video-info">
        <h3>${video.title}</h3>
        <p>${video.description}</p>

        <button
          class="watch-btn"
          data-watch="${video.id}"
        >
          Assistir vídeo
        </button>
      </div>
    `;

    videoGrid.appendChild(card);
  });

  // Eventos dos botões dos cards
  videoGrid.querySelectorAll("[data-watch]").forEach(button => {
    button.addEventListener("click", () => {
      openVideo(Number(button.dataset.watch));
    });
  });

  videoGrid.querySelectorAll("[data-favorite]").forEach(button => {
    button.addEventListener("click", () => {
      toggleFavorite(Number(button.dataset.favorite));
    });
  });
}

// =========================================
// 7. ABRIR E REPRODUZIR VÍDEO
// =========================================

function openVideo(videoId) {
  const video = videos.find(item => item.id === videoId);

  if (!video) return;

  if (dialogTitle) {
    dialogTitle.textContent = video.title;
  }

  if (dialogDescription) {
    dialogDescription.textContent = video.description;
  }

  if (playerContainer) {
    playerContainer.innerHTML = `
      <iframe
        src="https://www.youtube.com/embed/${video.videoId}?autoplay=1"
        title="${video.title}"
        width="100%"
        height="100%"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerpolicy="strict-origin-when-cross-origin"
        allowfullscreen>
      </iframe>
    `;
  }

  if (youtubeLink) {
    youtubeLink.href = video.url;
    youtubeLink.target = "_blank";
    youtubeLink.rel = "noopener noreferrer";
  }

  // Adicionar ao histórico
  history = [
    video.id,
    ...history.filter(id => id !== video.id)
  ];

  saveHistory();

  if (videoDialog) {
    videoDialog.showModal();
  }
}

// =========================================
// 8. FECHAR PLAYER
// =========================================

function closeVideo() {
  if (videoDialog) {
    videoDialog.close();
  }

  if (playerContainer) {
    playerContainer.innerHTML = "";
  }
}

if (closeDialog) {
  closeDialog.addEventListener("click", closeVideo);
}

if (videoDialog) {
  videoDialog.addEventListener("click", event => {
    if (event.target === videoDialog) {
      closeVideo();
    }
  });
}

// =========================================
// 9. FAVORITOS
// =========================================

function toggleFavorite(videoId) {
  if (favorites.includes(videoId)) {
    favorites = favorites.filter(id => id !== videoId);
  } else {
    favorites.push(videoId);
  }

  saveFavorites();
  renderVideos();
}

// =========================================
// 10. PESQUISA
// =========================================

if (searchInput) {
  searchInput.addEventListener("input", event => {
    currentSearch = event.target.value;
    renderVideos();
  });
}

// =========================================
// 11. FILTROS POR MODALIDADE
// =========================================

document.querySelectorAll("[data-sport]").forEach(button => {
  button.addEventListener("click", () => {
    currentSport = button.dataset.sport;

    document.querySelectorAll("[data-sport]").forEach(item => {
      item.classList.remove("active");
    });

    button.classList.add("active");

    if (videosTitle) {
      videosTitle.textContent =
        currentSport === "todos"
          ? "Todos os vídeos"
          : button.textContent.trim();
    }

    renderVideos();
  });
});

// =========================================
// 12. NAVEGAÇÃO ENTRE PÁGINAS
// =========================================

document.querySelectorAll("[data-page]").forEach(button => {
  button.addEventListener("click", () => {
    currentPage = button.dataset.page;

    document.querySelectorAll("[data-page]").forEach(item => {
      item.classList.remove("active");
    });

    button.classList.add("active");

    if (videosTitle) {
      const titles = {
        inicio: "Todos os vídeos",
        favoritos: "Meus favoritos",
        historico: "Histórico"
      };

      videosTitle.textContent =
        titles[currentPage] || button.textContent.trim();
    }

    renderVideos();

    if (sidebar) {
      sidebar.classList.remove("open");
    }
  });
});

// =========================================
// 13. BOTÃO TODOS OS VÍDEOS
// =========================================

const allCategories = document.getElementById("all-categories");

if (allCategories) {
  allCategories.addEventListener("click", () => {
    currentSport = "todos";
    currentPage = "inicio";
    currentSearch = "";

    if (searchInput) {
      searchInput.value = "";
    }

    renderVideos();
  });
}

// =========================================
// 14. VÍDEO EM DESTAQUE
// =========================================

const watchFeatured = document.getElementById("watch-featured");

if (watchFeatured) {
  watchFeatured.addEventListener("click", () => {
    openVideo(1);
  });
}

// =========================================
// 15. VER DESTAQUES
// =========================================

const seeHighlights = document.getElementById("see-highlights");

if (seeHighlights) {
  seeHighlights.addEventListener("click", () => {
    currentSport = "todos";
    currentPage = "inicio";
    renderVideos();

    if (videosTitle) {
      videosTitle.textContent = "Vídeos em destaque";
    }
  });
}

// =========================================
// 16. PERFIL DO USUÁRIO
// =========================================

if (profileButton && profileDialog) {
  profileButton.addEventListener("click", () => {
    profileDialog.showModal();
  });
}

if (closeProfile) {
  closeProfile.addEventListener("click", () => {
    profileDialog.close();
  });
}

// =========================================
// 17. LIMPAR HISTÓRICO
// =========================================

if (clearHistoryButton) {
  clearHistoryButton.addEventListener("click", () => {
    history = [];
    saveHistory();
    renderVideos();
  });
}

// =========================================
// 18. MENU PARA CELULAR
// =========================================

if (mobileMenu && sidebar) {
  mobileMenu.addEventListener("click", () => {
    sidebar.classList.toggle("open");
  });
}

// =========================================
// 19. INICIALIZAÇÃO DO SITE
// =========================================

document.addEventListener("DOMContentLoaded", () => {
  renderVideos();
});

renderVideos();
