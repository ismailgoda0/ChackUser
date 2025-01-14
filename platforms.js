const messages = {
    loading: "جاري الفحص...",
    found: "تم العثور على المستخدم",
    notFound: "المستخدم غير موجود",
    error: "حدث خطأ أثناء الفحص",
    Error: "فشل الاتصال بالمنصة",
};


async function checkYouTube(platform, input_username) {
    try {
        const response = await fetch(platform.ChackUrl(input_username));
        const data = await response.json();
        return data.items && data.items.length > 0;
    } catch (error) {
        console.error("Error checking YouTube:", error);
        throw new Error(messages.Error);
    }
}

// دالة التحقق من TikTok
async function checkTikTok(platform, input_username) {
    try {
        const response = await fetch(platform.ChackUrl(input_username));
        return response.ok; // إذا كان الرد ناجحًا (HTTP status 200-299)
    } catch (error) {
        console.error("Error checking TikTok:", error);
        throw new Error(messages.Error);
    }
}

const YOUTUBE_API_KEY = "AIzaSyCnpKuYFCpKCFioaYnjMhhsYN_QH_HJBp8";
const platforms = [
    {
        name: "YouTube",
        icon: "fab fa-youtube",
        color: "#FF0000",
        checkFunction: checkYouTube,
        Url: 'https://www.youtube.com',
        Prefix: "@",
        maxLength: 30,
        username: function (input_username) {
            return `${this.Prefix}${input_username}`;
        },
        profileUrl: function (input_username) {
            return `https://www.youtube.com/${this.Prefix}${input_username}`;
        },
        ChackUrl: (input_username) =>
            `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${input_username}&type=channel&key=${YOUTUBE_API_KEY}`,
    },
    // {
    //     name: "TikTok",
    //     icon: "fab fa-tiktok",
    //     color: "#000000",
    //     checkFunction: checkTikTok,
    //     Url: 'https://www.tiktok.com',
    //     Prefix: "@",
    //     maxLength: 24,
    //     username: function (input_username) {
    //         return `${this.Prefix}${input_username}`;
    //     },
    //     profileUrl: function (input_username) {
    //         return `https://www.tiktok.com/@${input_username}`;
    //     },
    //     ChackUrl: (input_username) => `https://www.tiktok.com/@${input_username}`,
    // }
];
function renderPlatforms() {
    const platformsList = document.getElementById("platforms-list");
    platformsList.innerHTML = platforms
        .map(
            (platform) => `
        <li class="item" data-platform="${platform.name}" data-url="${platform.Url}" data-username="" onclick="retryCheck('${platform.name}')">
            <div class="icon">
                <i class="${platform.icon} Social" style="color: ${platform.color};"></i>
            </div>
            <div class="platform-info">
              <div>
                              <span class="platform-maxLength">Max(
                        <span class="Length">${platform.maxLength}</span>
                        )
                    </span>
                <span class="platform-name">${platform.name}</span>

                        </div>

                <span class="platform-Username">@Username</span>
            </div>
            
            <span class="msg" id="${platform.name.toLowerCase()}-msg"></span>
            <div class="status" id="${platform.name.toLowerCase()}-status">
                <i class="fas status "></i>
            </div>
        </li>
    `
        )
        .join("");
}

document.addEventListener("DOMContentLoaded", renderPlatforms);

const input = document.getElementById('input_username');
input.addEventListener('input', function () {
    if (this.value.trim() === '') {
        this.style.borderColor = '#ff0000'; // لون أحمر إذا كان فارغًا
    } else {
        this.style.borderColor = '#007bff'; // لون الحدود الطبيعي
    }
});

// الحصول على العناصر المطلوبة
const inputUsername = document.getElementById('input_username');
const lengthSpan = document.querySelector('.platform-maxLength .Length');

// إضافة حدث input لتحديث العدد
inputUsername.addEventListener('input', function () {
    const currentLength = this.value.length; // الحصول على طول النص الحالي
    lengthSpan.textContent = currentLength; // تحديث العدد داخل <span class="Length">
});