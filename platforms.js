const messages = {
    loading: "جاري الفحص...",
    found: "تم العثور على المستخدم",
    notFound: "المستخدم غير موجود",
    error: "حدث خطأ أثناء الفحص",
    Error: "فشل الاتصال بالمنصة",
};


// دالة التحقق من TikTok
async function checkYouTube(platform, input_username) {
    try {
        const response = await fetch(platform.ChackUrl(input_username));

        // إذا كان الرد غير ناجح (مثل 403 Forbidden أو 404 Not Found)
        if (!response.ok) {
            let errorMessage = `HTTP Error: ${response.status} - ${response.statusText}`;

            // محاولة تحليل رسالة الخطأ من الرد (إذا كانت JSON)
            try {
                const errorData = await response.json();
                if (errorData.error && errorData.error.message) {
                    errorMessage = `API Error: ${errorData.error.message}`;
                }
            } catch (jsonError) {
                console.warn("Failed to parse error response as JSON:", jsonError);
            }

            console.error("Error response from YouTube API:", {
                status: response.status,
                statusText: response.statusText,
                url: response.url,
                errorMessage: errorMessage,
            });

            throw new Error(errorMessage);
        }

        // تحليل البيانات إذا كان الرد ناجحًا
        const data = await response.json();
        return data.items && data.items.length > 0;
    } catch (error) {
        console.error("Error checking YouTube:", {
            message: error.message,
            stack: error.stack, // طباعة مسار الخطأ (stack trace) لفهم مصدر الخطأ
            inputUsername: input_username, // اسم المستخدم الذي تم التحقق منه
            platform: platform.name, // اسم المنصة (YouTube)
        });

        throw new Error(`${messages.Error}: ${error.message}`);
    }
}


async function checkTikTok(platform, input_username, retries = 3, timeout = 5000) {
    const profileUrl = platform.profileUrl(input_username);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const response = await fetch(profileUrl, {
                    method: 'GET',
                    headers: {
                        'Accept': 'text/html',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36', // إضافة User-Agent لتجنب الحظر
                    },
                    signal: controller.signal, // إضافة إمكانية إلغاء الطلب
                });

                clearTimeout(timeoutId); // إلغاء الوقت المحدد إذا نجح الطلب

                // إذا كانت الصفحة غير موجودة (404)
                if (response.status === 404) {
                    console.warn(`User not found on TikTok: ${input_username}`);
                    return false;
                }

                // إذا كانت الصفحة موجودة (200)
                if (response.ok) {
                    const html = await response.text();

                    // تحليل HTML للتحقق من وجود رسائل محددة
                    if (html.includes("User not found") || html.includes("الصفحة غير موجودة")) {
                        console.warn(`User not found on TikTok: ${input_username}`);
                        return false;
                    }

                    console.log(`User found on TikTok: ${input_username}`);
                    return true;
                }

                // إذا كانت هناك حالة أخرى (مثل 403 أو 500)
                throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
            } catch (error) {
                if (attempt === retries) throw error; // إذا كانت المحاولة الأخيرة، أعد رمي الخطأ
                console.warn(`Retrying... (${attempt}/${retries})`);
                await new Promise(resolve => setTimeout(resolve, 1000)); // انتظر قبل إعادة المحاولة
            }
        }
    } catch (error) {
        // طباعة تفاصيل الخطأ بشكل أكثر تنظيماً
        console.error("Error checking TikTok:", {
            timestamp: new Date().toISOString(),
            platform: platform.name,
            inputUsername: input_username,
            profileUrl: profileUrl,
            errorType: error.name,
            errorMessage: error.message,
            errorStack: error.stack,
        });

        // إعادة رمي الخطأ مع معلومات إضافية
        throw new Error(`${messages.Error}: Failed to check TikTok user. Details: ${error.message}`);
    } finally {
        clearTimeout(timeoutId); // تأكد من إلغاء الوقت المحدد في جميع الحالات
    }
}



const YOUTUBE_API_KEY = "AIzaSyCR-AWxFYPA1mLNlGkhin8jy5aPUTY6nJg";
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
    {
        name: "TikTok",
        icon: "fab fa-tiktok",
        color: "#000000",
        checkFunction: checkTikTok,
        Url: 'https://www.tiktok.com',
        Prefix: "@",
        maxLength: 24,
        username: function (input_username) {
            return `${this.Prefix}${input_username}`;
        },
        profileUrl: function (input_username) {
            return `https://www.tiktok.com/${this.Prefix}${input_username}`;
        },
        ChackUrl: (input_username) =>
            `https://www.tiktok.com/${this.Prefix}${input_username}`,
    },


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
