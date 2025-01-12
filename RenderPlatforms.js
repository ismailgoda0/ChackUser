// عرض المنصات في الواجهة
function renderPlatforms() {
    const platformsList = document.getElementById("platforms-list");
    platformsList.innerHTML = platforms
        .map(
            (platform) => `
        <li data-platform="${platform.name.toLowerCase()}">
            <div class="icon">
                <i class="${platform.icon}"></i>
            </div>
            <span>${platform.name}</span>
            <div class="status" id="${platform.name.toLowerCase()}-status">
                <i class="fas fa-times"></i>
            </div>
        </li>
    `
        )
        .join("");
}

// تنفيذ الدالة عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", renderPlatforms);