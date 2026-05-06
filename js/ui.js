// ui.js — Render grid video, filter genre, pencarian, efek navbar

const videoGrid = document.getElementById('videoGrid');
const searchInput = document.getElementById('searchInput');
const filterLinks = document.querySelectorAll('#genre-filters a');
const noResults = document.getElementById('noResults');
const navbar = document.getElementById('navbar');

let currentGenre = "Semua";
let searchQuery = "";

// Render kartu video
function renderVideos() {
    const filteredVideos = videos.filter(video => {
        const matchGenre = currentGenre === "Semua" || video.genre === currentGenre;
        const matchSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchGenre && matchSearch;
    });

    videoGrid.innerHTML = '';

    if (filteredVideos.length === 0) {
        noResults.style.display = 'block';
    } else {
        noResults.style.display = 'none';
        filteredVideos.forEach(video => {
            const card = document.createElement('div');
            card.className = 'video-card';
            card.onclick = () => openModal(video.videoUrl);
            card.innerHTML = `
                <div class="thumbnail-container">
                    <img src="${video.thumbnail}" alt="${video.title}" class="thumbnail" loading="lazy">
                    <div class="play-overlay">
                        <div class="play-icon"></div>
                    </div>
                </div>
                <div class="card-info">
                    <h3 class="card-title">${video.title}</h3>
                    <div class="card-meta">
                        <span>${video.duration}</span>
                        <span class="badge">${video.genre}</span>
                    </div>
                </div>
            `;
            videoGrid.appendChild(card);
        });
    }
}

// Pencarian real-time
searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderVideos();
});

// Filter genre
filterLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        filterLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        currentGenre = link.getAttribute('data-genre');
        document.getElementById('section-title').textContent =
            currentGenre === "Semua" ? "Film Pilihan" : `Genre: ${currentGenre}`;
        renderVideos();
    });
});

// Efek scroll navbar
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// Inisialisasi
renderVideos();