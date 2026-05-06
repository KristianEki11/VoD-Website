// autoplay.js — Autoplay dengan countdown, history tracking, no repeat

// Track video yang sudah ditonton dalam sesi ini
const watchedHistory = new Set();

function getRecommendations(currentUrl, count = 3) {
    // Tambahkan video saat ini ke history
    watchedHistory.add(currentUrl);

    // Filter: tidak dalam history tonton
    let available = videos.filter(v => !watchedHistory.has(v.videoUrl));

    // Bila semua sudah ditonton, reset history (kecuali yang sedang diputar)
    if (available.length < count) {
        watchedHistory.clear();
        watchedHistory.add(currentUrl);
        available = videos.filter(v => v.videoUrl !== currentUrl);
    }

    // Acak dan ambil sejumlah count
    return available.sort(() => Math.random() - 0.5).slice(0, count);
}

let autoplayTimer = null;
let autoplayCountdown = 5;

function showAutoplayPanel(currentUrl) {
    const recommendations = getRecommendations(currentUrl, 3);
    if (recommendations.length === 0) return;

    const nextVideo = recommendations[0];

    const panel = document.createElement('div');
    panel.id = 'autoplayPanel';
    panel.innerHTML = `
        <div class="autoplay-inner">
            <div class="autoplay-header">
                <span>Selanjutnya dalam <strong id="autoplayCountdown">5</strong> detik</span>
                <button class="autoplay-cancel" id="cancelAutoplay">Batalkan</button>
            </div>
            <div class="autoplay-next">
                <div class="autoplay-next-label">BERIKUTNYA</div>
                <div class="autoplay-next-card" id="autoplayNextCard">
                    <img src="${nextVideo.thumbnail}" alt="${nextVideo.title}">
                    <div class="autoplay-next-info">
                        <div class="autoplay-next-title">${nextVideo.title}</div>
                        <div class="autoplay-next-meta">${nextVideo.duration} · ${nextVideo.genre}</div>
                    </div>
                    <div class="autoplay-progress-ring">
                        <svg viewBox="0 0 36 36">
                            <circle class="ring-bg" cx="18" cy="18" r="15"/>
                            <circle class="ring-fill" id="autoplayRing" cx="18" cy="18" r="15"
                                stroke-dasharray="94.25 94.25"
                                stroke-dashoffset="0"/>
                        </svg>
                        <span id="autoplayCountdownRing">5</span>
                    </div>
                </div>
            </div>
            ${recommendations.length > 1 ? `
            <div class="autoplay-recommendations">
                <div class="autoplay-rec-label">REKOMENDASI LAINNYA</div>
                <div class="autoplay-rec-grid">
                    ${recommendations.slice(1).map(v => `
                        <div class="autoplay-rec-card" onclick="playAndHide('${v.videoUrl}')">
                            <img src="${v.thumbnail}" alt="${v.title}">
                            <div class="autoplay-rec-info">
                                <div class="autoplay-rec-title">${v.title}</div>
                                <div class="autoplay-rec-meta">${v.duration}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>` : ''}
        </div>
    `;

    // Masukkan ke modal content — BUKAN body
    const modalContent = document.querySelector('#videoModal .modal-content');
    modalContent.appendChild(panel);
    setTimeout(() => panel.classList.add('show'), 10);

    document.getElementById('autoplayNextCard').onclick = () => playAndHide(nextVideo.videoUrl);
    document.getElementById('cancelAutoplay').onclick = () => {
        clearAutoplayTimer();
        hideAutoplayPanel();
    };

    autoplayCountdown = 5;
    updateCountdownDisplay();
    startAutoplayTimer(nextVideo.videoUrl);
}

function playAndHide(url) {
    clearAutoplayTimer();
    hideAutoplayPanel();
    openModal(url);
}

function startAutoplayTimer(nextUrl) {
    const circumference = 94.25;
    autoplayTimer = setInterval(() => {
        autoplayCountdown--;
        updateCountdownDisplay();

        const ring = document.getElementById('autoplayRing');
        if (ring) {
            const offset = circumference * (autoplayCountdown / 5);
            ring.style.strokeDashoffset = circumference - offset;
        }

        if (autoplayCountdown <= 0) {
            clearAutoplayTimer();
            hideAutoplayPanel();
            openModal(nextUrl);
        }
    }, 1000);
}

function updateCountdownDisplay() {
    const cd = document.getElementById('autoplayCountdown');
    const cdRing = document.getElementById('autoplayCountdownRing');
    if (cd) cd.textContent = autoplayCountdown;
    if (cdRing) cdRing.textContent = autoplayCountdown;
}

function clearAutoplayTimer() {
    if (autoplayTimer) { clearInterval(autoplayTimer); autoplayTimer = null; }
}

function hideAutoplayPanel() {
    clearAutoplayTimer();
    const panel = document.getElementById('autoplayPanel');
    if (panel) {
        panel.classList.remove('show');
        setTimeout(() => panel.remove(), 400);
    }
}