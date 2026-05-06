// player.js — Plyr + HLS.js, network alert, orientasi video, mobile fullscreen

let plyrInstance = null;
let hlsInstance = null;
let currentVideoUrl = null;

const isMobile = () => window.innerWidth <= 768 || /Mobi|Android/i.test(navigator.userAgent);

// ── Orientasi video ────────────────────────────────────────
function getVideoOrientation(url) {
    const video = videos.find(v => v.videoUrl === url);
    return video ? video.orientation : "horizontal";
}

function applyVideoOrientation(orientation) {
    const container = document.querySelector('.video-container');
    const modalContent = document.querySelector('.modal-content');
    if (!container || !modalContent) return;

    if (orientation === "vertical") {
        container.classList.add('vertical');
        modalContent.classList.add('vertical-modal');
    } else {
        container.classList.remove('vertical');
        modalContent.classList.remove('vertical-modal');
    }
}

// ── Mobile Fullscreen ──────────────────────────────────────
function requestMobileFullscreen(videoEl) {
    if (!isMobile()) return;

    // Coba berbagai API fullscreen
    const requestFs =
        videoEl.requestFullscreen ||
        videoEl.webkitRequestFullscreen ||
        videoEl.mozRequestFullScreen ||
        videoEl.msRequestFullscreen;

    if (requestFs) {
        requestFs.call(videoEl).catch(() => {
            // Fallback: pakai Plyr fullscreen
            if (plyrInstance) plyrInstance.fullscreen.enter();
        });
    } else if (plyrInstance) {
        plyrInstance.fullscreen.enter();
    }
}

// ── Network Alert ──────────────────────────────────────────
function showNetworkAlert() {
    const existing = document.getElementById('networkAlert');
    if (existing) return; // Jangan tampilkan duplikat

    const alert = document.createElement('div');
    alert.id = 'networkAlert';
    alert.innerHTML = `
        <div class="network-alert-icon">⚠️</div>
        <div class="network-alert-text">
            <strong>Koneksi lambat terdeteksi</strong>
            <span>Kualitas video terlalu tinggi untuk koneksi saat ini</span>
        </div>
        <button class="network-alert-btn" id="switchAutoBtn">Ganti Sekarang</button>
        <button class="network-alert-close" id="closeAlertBtn">✕</button>
    `;
    document.body.appendChild(alert);
    setTimeout(() => alert.classList.add('show'), 10);

    document.getElementById('switchAutoBtn').onclick = () => {
        if (hlsInstance) hlsInstance.currentLevel = -1;
        dismissNetworkAlert();
    };
    document.getElementById('closeAlertBtn').onclick = dismissNetworkAlert;
    setTimeout(dismissNetworkAlert, 10000);
}

function dismissNetworkAlert() {
    const alert = document.getElementById('networkAlert');
    if (alert) {
        alert.classList.remove('show');
        setTimeout(() => alert.remove(), 400);
    }
}

function monitorNetworkQuality() {
    if (!hlsInstance) return;
    let stallCount = 0;
    let lastLevel = -1;

    hlsInstance.on(Hls.Events.ERROR, (event, data) => {
        if (data.details === Hls.ErrorDetails.BUFFER_STALLED_ERROR) {
            stallCount++;
            if (stallCount >= 2 && hlsInstance.currentLevel !== -1) {
                showNetworkAlert();
                stallCount = 0;
            }
        }
    });

    hlsInstance.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        if (lastLevel !== -1 && data.level < lastLevel) {
            showNetworkAlert();
        }
        lastLevel = data.level;
    });
}

// ── Modal Player ───────────────────────────────────────────
function openModal(url) {
    currentVideoUrl = url;
    const modal = document.getElementById('videoModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    hideAutoplayPanel();
    dismissNetworkAlert();

    // Terapkan orientasi
    const orientation = getVideoOrientation(url);
    applyVideoOrientation(orientation);

    // Destroy instance lama
    if (hlsInstance) { hlsInstance.destroy(); hlsInstance = null; }
    if (plyrInstance) { plyrInstance.destroy(); plyrInstance = null; }

    const video = document.getElementById('videoPlayer');

    const plyrConfig = (extra = {}) => ({
        iconUrl: 'https://cdn.plyr.io/3.7.8/plyr.svg',
        blankVideo: 'https://cdn.plyr.io/static/blank.mp4',
        controls: ['play-large','play','progress','current-time','duration','mute','volume','settings','pip','fullscreen'],
        settings: ['speed'],
        speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
        ...extra
    });

    if (url.includes('.m3u8') && Hls.isSupported()) {
        hlsInstance = new Hls();
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);

        hlsInstance.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
            const levels = data.levels;
            const qualityOptions = [-1, ...levels.map((_, i) => i)];
            const qualityLabels = { '-1': 'Auto' };
            levels.forEach((l, i) => { qualityLabels[i] = l.height ? `${l.height}p` : `Level ${i+1}`; });

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

            monitorNetworkQuality();
            plyrInstance.on('ended', () => showAutoplayPanel(currentVideoUrl));
            plyrInstance.on('ready', () => requestMobileFullscreen(video));
            plyrInstance.play();
        });

    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        plyrInstance = new Plyr(video, plyrConfig());
        plyrInstance.on('ended', () => showAutoplayPanel(currentVideoUrl));
        plyrInstance.on('ready', () => requestMobileFullscreen(video));
        plyrInstance.play();
    } else {
        video.src = url;
        plyrInstance = new Plyr(video, plyrConfig());
        plyrInstance.on('ended', () => showAutoplayPanel(currentVideoUrl));
        plyrInstance.on('ready', () => requestMobileFullscreen(video));
        plyrInstance.play();
    }
}

function closeModal() {
    const modal = document.getElementById('videoModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    dismissNetworkAlert();
    hideAutoplayPanel();
    applyVideoOrientation('horizontal'); // Reset orientasi
    if (plyrInstance) { plyrInstance.pause(); }
    if (hlsInstance) { hlsInstance.destroy(); hlsInstance = null; }
}

document.getElementById('videoModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('videoModal')) closeModal();
});