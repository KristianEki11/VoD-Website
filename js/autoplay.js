// autoplay.js — Fitur autoplay dengan countdown 5 detik + 3 rekomendasi video

let autoplayTimer = null;
let autoplayCountdown = 5;

function getRandomVideos(excludeUrl, count = 3) {
    const filtered = videos.filter(v => v.videoUrl !== excludeUrl);
    const shuffled = filtered.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

function showAutoplayPanel(currentUrl) {
    const recommendations = getRandomVideos(currentUrl, 3);
    const nextVideo = recommendations[0];

    // Buat panel
    const panel = document.createElement('div');
    panel.id = 'autoplayPanel';

    panel.innerHTML = `
        <div class="autoplay-header">
            <span>Selanjutnya dalam <strong id="autoplayCountdown">5</strong> detik</span>
            <button class="autoplay-cancel" id="cancelAutoplay">Batalkan</button>
        </div>
        <div class="autoplay-next">
            <div class="autoplay-next-label">Berikutnya</div>
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
        <div class="autoplay-recommendations">
            <div class="autoplay-rec-label">Rekomendasi lainnya</div>
            <div class="autoplay-rec-grid">
                ${recommendations.slice(1).map(v => `
                    <div class="autoplay-rec-card" onclick="openModal('${v.videoUrl}'); hideAutoplayPanel()">
                        <img src="${v.thumbnail}" alt="${v.title}">
                        <div class="autoplay-rec-info">
                            <div class="autoplay-rec-title">${v.title}</div>
                            <div class="autoplay-rec-meta">${v.duration}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    // Tambahkan ke dalam modal content
    const modalContent = document.querySelector('.modal-content');
    modalContent.appendChild(panel);

    // Animasi masuk
    setTimeout(() => panel.classList.add('show'), 10);

    // Klik next card untuk langsung putar
    document.getElementById('autoplayNextCard').onclick = () => {
        clearAutoplayTimer();
        hideAutoplayPanel();
        openModal(nextVideo.videoUrl);
    };

    // Tombol batalkan
    document.getElementById('cancelAutoplay').onclick = () => {
        clearAutoplayTimer();
        hideAutoplayPanel();
    };

    // Mulai countdown
    autoplayCountdown = 5;
    updateCountdownDisplay();
    startAutoplayTimer(nextVideo.videoUrl);
}

function startAutoplayTimer(nextUrl) {
    const circumference = 94.25;
    autoplayTimer = setInterval(() => {
        autoplayCountdown--;
        updateCountdownDisplay();

        // Update progress ring
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
    if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
    }
}

function hideAutoplayPanel() {
    clearAutoplayTimer();
    const panel = document.getElementById('autoplayPanel');
    if (panel) {
        panel.classList.remove('show');
        setTimeout(() => panel.remove(), 400);
    }
}