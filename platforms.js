const YOUTUBE_API_KEY = "AIzaSyCnpKuYFCpKCFioaYnjMhhsYN_QH_HJBp8"; // استبدل هذا بمفتاح API الخاص بك

const platforms = [
    {
        name: "YouTube",
        icon: "fab fa-youtube",
        profileUrl: (username) => `https://www.youtube.com/@${username}`,
        apiUrl: (username) =>
            `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${username}&type=channel&key=${YOUTUBE_API_KEY}`,
        hasAPI: true,
    },
    {
        name: "TikTok",
        icon: "fab fa-tiktok",
        profileUrl: (username) => `https://www.tiktok.com/@${username}`,
        apiUrl: (username) => `https://www.tiktok.com/@${username}`,
        hasAPI: false,
    },
];