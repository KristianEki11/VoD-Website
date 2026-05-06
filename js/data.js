// data.js — Data video RedlineTV
// orientation: 'vertical' = portrait/reels, 'horizontal' = landscape
const BASE = "https://cdn.redlinevis.site";

const videos = [
    {
        id: 1,
        title: "ADV Adin",
        genre: "Dokumenter",
        duration: "0j 15m",
        thumbnail: "assets/poster_last_frontier.png",
        videoUrl: `${BASE}/adv-adin/master.m3u8`,
        orientation: "vertical"
    },
    {
        id: 2,
        title: "Lambo WH",
        genre: "Aksi",
        duration: "0j 05m",
        thumbnail: "assets/poster_neon_city.png",
        videoUrl: `${BASE}/lambo-wh/master.m3u8`,
        orientation: "vertical"
    },
    {
        id: 3,
        title: "Main Accord",
        genre: "Dokumenter",
        duration: "0j 05m",
        thumbnail: "assets/poster_deep_ocean.png",
        videoUrl: `${BASE}/main-accord/master.m3u8`,
        orientation: "horizontal"
    },
    {
        id: 4,
        title: "Motion Kiko",
        genre: "Drama",
        duration: "0j 03m",
        thumbnail: "assets/poster_whispers_rain.png",
        videoUrl: `${BASE}/motion-kiko/master.m3u8`,
        orientation: "horizontal"
    },
    {
        id: 5,
        title: "Rolling Night",
        genre: "Aksi",
        duration: "0j 08m",
        thumbnail: "assets/poster_shadow_strike.png",
        videoUrl: `${BASE}/rolling-night/master.m3u8`,
        orientation: "horizontal"
    },
    {
        id: 6,
        title: "Speedramp XMAX",
        genre: "Aksi",
        duration: "0j 08m",
        thumbnail: "assets/poster_frozen_earth.png",
        videoUrl: `${BASE}/xmax/master.m3u8`,
        orientation: "vertical"
    }
];