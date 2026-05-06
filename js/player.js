// player.js — Logika video player (Plyr + HLS.js) + network alert

let plyrInstance = null;
let hlsInstance = null;
let currentVideoUrl = null;

// Konfigurasi Plyr
const plyrConfig = (extraSettings = {}) => ({
    iconUrl: 'https://cdn.plyr.io/3.7.8/plyr.svg',
    blankVideo: 'https://cdn.plyr.io/static/blank.mp4',
    controls: ['play-large', 'play', 'progress', 'current-time', 'duration', 'mute', 'volume', 'settings', 'pip', 'fullscreen'],
    settings: ['speed'],
    speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
    ...extraSettings
});

// ── Network Alert ──────────────────────────────────────────
function showNetworkAlert() {
    // Hapus alert lama jika ada
    const existing = document.getElementById('networkAlert');
    if (existing) existing.remove();

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

    // Animasi masuk
    setTimeout(() => alert.classList.add('show'), 10);

    // Tombol ganti ke Auto
    document.getElementById('switchAutoBtn').onclick = () => {
        if (hlsInstance) {
            hlsInstance.currentLevel = -1; // -1 = Auto ABR
            if (plyrInstance) {
                // Update tampilan quality di Plyr
                plyrInstance.quality = -1;
            }
        }
        dismissNetworkAlert();
    };

    // Tombol tutup
    document.getElementById('closeAlertBtn').onclick = () => dismissNetworkAlert();

    // Auto dismiss setelah 10 detik
    setTimeout(() => dismissNetworkAlert(), 10000);
}

function dismissNetworkAlert() {
    const alert = document.getElementById('networkAlert');
    if (alert) {
        alert.classList.remove('show');
        setTimeout(() => alert.remove(), 400);
    }
}

// Monitor kualitas HLS — deteksi bila sering buffering di kualitas tinggi
function monitorNetworkQuality() {
    if (!hlsInstance) return;

    let bufferStallCount = 0;

    hlsInstance.on(Hls.Events.ERROR, (event, data) => {
        if (data.details === Hls.ErrorDetails.BUFFER_STALLED_ERROR ||
            data.details === Hls.ErrorDetails.BUFFER_SEEK_OVER_HOLE) {
            bufferStallCount++;
            // Tampilkan alert bila stall terjadi 2x dan bukan di mode auto
            if (bufferStallCount >= 2 && hlsInstance.currentLevel !== -1) {
                showNetworkAlert();
                bufferStallCount = 0;
            }
        }
    });

    // Juga monitor bila HLS.js otomatis turun kualitas karena bandwidth
    hlsInstance.on(Hls.Events.LEVEL_SWITCHING, (event, data) => {
        const currentLevel = hlsInstance.currentLevel;
        if (currentLevel !== -1 && data.level < currentLevel) {
            // HLS menurunkan kualitas sendiri — tampilkan saran ke Auto
            showNetworkAlert();
        }
    });
}

// ── Modal Player ───────────────────────────────────────────
function openModal(url) {
    currentVideoUrl = url;
    const modal = document.getElementById('videoModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Sembunyikan autoplay panel kalau masih tampil
    hideAutoplayPanel();

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

            // Monitor network setelah player siap
            monitorNetworkQuality();

            // Trigger autoplay panel saat video selesai
            plyrInstance.on('ended', () => {
                showAutoplayPanel(currentVideoUrl);
            });

            plyrInstance.play();
        });

    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        plyrInstance = new Plyr(video, plyrConfig());
        plyrInstance.on('ended', () => showAutoplayPanel(currentVideoUrl));
        plyrInstance.play();
    } else {
        video.src = url;
        plyrInstance = new Plyr(video, plyrConfig());
        plyrInstance.on('ended', () => showAutoplayPanel(currentVideoUrl));
        plyrInstance.play();
    }
}

function closeModal() {
    const modal = document.getElementById('videoModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    dismissNetworkAlert();
    hideAutoplayPanel();
    if (plyrInstance) { plyrInstance.pause(); }
    if (hlsInstance) { hlsInstance.destroy(); hlsInstance = null; }
}

// Tutup modal klik di luar
document.getElementById('videoModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('videoModal')) closeModal();
});