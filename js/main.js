// 1. Data Dummy Video (Minimal 8 video)
const videos = [
    {
        id: 1,
        title: "Shadow Strike",
        genre: "Aksi",
        duration: "2j 15m",
        thumbnail: "/VoD-Website/assets/poster_shadow_strike.png",
        videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" // Menggunakan YouTube embed dummy
    },
    {
        id: 2,
        title: "Whispers of Rain",
        genre: "Drama",
        duration: "1j 50m",
        thumbnail: "/VoD-Website/assets/poster_whispers_rain.png",
        videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
    },
    {
        id: 3,
        title: "Deep Ocean Secrets",
        genre: "Dokumenter",
        duration: "1j 30m",
        thumbnail: "/VoD-Website/assets/poster_deep_ocean.png",
        videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
    },
    {
        id: 4,
        title: "Neon City Breakout",
        genre: "Aksi",
        duration: "2j 05m",
        thumbnail: "/VoD-Website/assets/poster_neon_city.png",
        videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
    },
    {
        id: 5,
        title: "Last Frontier",
        genre: "Aksi",
        duration: "2j 30m",
        thumbnail: "/VoD-Website/assets/poster_last_frontier.png",
        videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
    },
    {
        id: 6,
        title: "Eternal Flame",
        genre: "Aksi",
        duration: "2j 10m",
        thumbnail: "/VoD-Website/assets/poster_eternal_flame.png",
        videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
    },
    {
        id: 7,
        title: "Broken Strings",
        genre: "Drama",
        duration: "1j 55m",
        thumbnail: "/VoD-Website/assets/poster_broken_strings.png",
        videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
    },
    {
        id: 8,
        title: "Frozen Earth",
        genre: "Dokumenter",
        duration: "1j 40m",
        thumbnail: "/VoD-Website/assets/poster_frozen_earth.png",
        videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
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

// 5. Logika Modal Player
let player = null;
function openModal(url) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (!player) {
        player = videojs('videoPlayer', {
            responsive: true,
            playbackRates: [0.5, 1, 1.25, 1.5, 2],
            controlBar: {
                children: ['playToggle', 'volumePanel', 'currentTimeDisplay', 'timeDivider', 'durationDisplay', 'progressControl', 'playbackRateMenuButton', 'qualitySelector', 'fullscreenToggle']
            }
        });
        player.hlsQualitySelector({ displayCurrentQuality: true });
    }
    const isHls = url.includes('.m3u8');
    player.src({ src: url, type: isHls ? 'application/x-mpegURL' : 'video/mp4' });
    player.play();
}

function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    if (player) { player.pause(); player.src(''); }
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