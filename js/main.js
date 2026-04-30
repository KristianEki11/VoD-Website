// 1. Data Video — URL dari GitHub Releases (branch: feature/releases-storage)
// Base URL GitHub Releases
const BASE = "https://cdn.redlinevis.site";

const videos = [
    {
        id: 1,
        title: "ADV Adin",
        genre: "Dokumenter",
        duration: "0j 15m",
        thumbnail: "assets/poster_last_frontier.png",
        videoUrl: `${BASE}/adv-adin/master.m3u8`
    },
    {
        id: 2,
        title: "Lambo WH",
        genre: "Aksi",
        duration: "0j 05m",
        thumbnail: "assets/poster_neon_city.png",
        videoUrl: `${BASE}/lambo-wh/master.m3u8`
    },
    {
        id: 3,
        title: "Main Accord",
        genre: "Dokumenter",
        duration: "0j 05m",
        thumbnail: "assets/poster_deep_ocean.png",
        videoUrl: `${BASE}/main-accord/master.m3u8`
    },
    {
        id: 4,
        title: "Motion Kiko",
        genre: "Drama",
        duration: "0j 03m",
        thumbnail: "assets/poster_whispers_rain.png",
        videoUrl: `${BASE}/motion-kiko/master.m3u8`
    },
    {
        id: 5,
        title: "Rolling Night",
        genre: "Aksi",
        duration: "0j 08m",
        thumbnail: "assets/poster_shadow_strike.png",
        videoUrl: `${BASE}/rolling-night/master.m3u8`
    },
    {
        id: 6,
        title: "Speedramp XMAX",
        genre: "Aksi",
        duration: "0j 08m",
        thumbnail: "assets/poster_frozen_earth.png",
        videoUrl: `${BASE}/speedramp-xmax/master.m3u8`
    }
];

// Referensi Elemen DOM
const videoGrid = document.getElementById('videoGrid');
const searchInput = document.getElementById('searchInput');
const filterLinks = document.querySelectorAll('#genre-filters a');
const noResults = document.getElementById('noResults');
const modal = document.getElementById('videoModal');
const playerContainer = document.getElementById('playerContainer');
const navbar = document.getElementById('navbar');

// Status Filter Aktif
let currentGenre = "Semua";
let searchQuery = "";

// 2. Fungsi Render Kartu Video
function renderVideos() {
    // Filter data berdasarkan genre dan pencarian
    const filteredVideos = videos.filter(video => {
        const matchGenre = currentGenre === "Semua" || video.genre === currentGenre;
        const matchSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchGenre && matchSearch;
    });

    // Kosongkan grid
    videoGrid.innerHTML = '';

    // Tampilkan pesan jika kosong
    if (filteredVideos.length === 0) {
        noResults.style.display = 'block';
    } else {
        noResults.style.display = 'none';

        // Buat elemen HTML untuk setiap video
        filteredVideos.forEach(video => {
            const card = document.createElement('div');
            card.className = 'video-card';
            card.onclick = () => openModal(video.videoUrl); // Event klik membuka modal

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

// 3. Event Listener untuk Pencarian (Real-time)
searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderVideos();
});

// 4. Event Listener untuk Filter Genre
filterLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        // Update styling active
        filterLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        // Update genre dan render ulang
        currentGenre = link.getAttribute('data-genre');
        document.getElementById('section-title').textContent = currentGenre === "Semua" ? "Film Pilihan" : `Genre: ${currentGenre}`;
        renderVideos();
    });
});

// 5. Logika Modal Player — Plyr + HLS.js (support quality selector)
let plyrInstance = null;
let hlsInstance = null;

// Konfigurasi Plyr dengan iconUrl eksplisit agar sprite tidak gagal load
const plyrConfig = (extraSettings = {}) => ({
    iconUrl: 'https://cdn.plyr.io/3.7.8/plyr.svg',
    blankVideo: 'https://cdn.plyr.io/static/blank.mp4',
    controls: ['play-large', 'play', 'progress', 'current-time', 'duration', 'mute', 'volume', 'settings', 'pip', 'fullscreen'],
    settings: ['speed'],
    speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
    ...extraSettings
});

function openModal(url) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Destroy instance sebelumnya
    if (hlsInstance) { hlsInstance.destroy(); hlsInstance = null; }
    if (plyrInstance) { plyrInstance.destroy(); plyrInstance = null; }

    const video = document.getElementById('videoPlayer');

    if (url.includes('.m3u8') && Hls.isSupported()) {
        hlsInstance = new Hls();
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);

        hlsInstance.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
            const levels = data.levels;
            const qualityOptions = [-1, ...levels.map((_, i) => i)];
            const qualityLabels = { '-1': 'Auto' };
            levels.forEach((level, i) => {
                qualityLabels[i] = level.height ? `${level.height}p` : `Level ${i + 1}`;
            });

            plyrInstance = new Plyr(video, plyrConfig({
                settings: ['quality', 'speed'],
                quality: {
                    default: -1,
                    options: qualityOptions,
                    forced: true,
                    onChange: (q) => { if (hlsInstance) hlsInstance.currentLevel = q; }
                },
                i18n: { qualityLabel: qualityLabels }
            }));

            plyrInstance.play();
        });

    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        plyrInstance = new Plyr(video, plyrConfig());
        plyrInstance.play();
    } else {
        video.src = url;
        plyrInstance = new Plyr(video, plyrConfig());
        plyrInstance.play();
    }
}

function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    if (plyrInstance) { plyrInstance.pause(); }
    if (hlsInstance) { hlsInstance.destroy(); hlsInstance = null; }
}

// Menutup modal jika klik di luar konten
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// 6. Efek Scroll Navbar
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Inisialisasi awal render video
renderVideos();