

async function checkUsername() {
    const username = document.getElementById("username").value.trim();
    if (!username) {
        alert("يرجى إدخال اسم المستخدم");
        return;
    }

    console.log(`اسم المستخدم المدخل: ${username}`);

    for (const platform of platforms) {
        const statusElement = document.getElementById(
            `${platform.name.toLowerCase()}-status`
        );
        const platformElement = document.querySelector(
            `li[data-platform="${platform.name.toLowerCase()}"]`
        );

        statusElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

        try {
            let userExists;

            if (platform.hasAPI) {
                // إذا كانت المنصة لديها API
                const response = await fetch(platform.apiUrl(username));
                const data = await response.json();
                userExists = data.items && data.items.length > 0; // للتأكد من وجود بيانات (خاصة بـ YouTube)
            } else {
                // إذا كانت المنصة لا تحتوي على API
                const response = await fetch(platform.profileUrl(username));
                userExists = response.status === 200; // التحقق من وجود الصفحة
            }

            if (userExists) {
                statusElement.innerHTML =
                    '<i class="fas fa-check" style="color: #00C851;"></i>';
                console.log(`اسم المستخدم "${username}" موجود على ${platform.name}.`);

                // جعل العنصر بأكمله قابلاً للنقر
                platformElement.style.cursor = "pointer";
                platformElement.addEventListener("click", () => {
                    window.open(platform.profileUrl(username), "_blank");
                });
            } else {
                statusElement.innerHTML =
                    '<i class="fas fa-times" style="color: #ff4444;"></i>';
                console.log(`اسم المستخدم "${username}" غير موجود على ${platform.name}.`);
            }
        } catch (error) {
            console.error("Error:", error);
            statusElement.innerHTML =
                '<i class="fas fa-times" style="color: #ff4444;"></i>';
            console.log(`تعذر التحقق من وجود اسم المستخدم "${username}" على ${platform.name}.`);
        }
    }
}