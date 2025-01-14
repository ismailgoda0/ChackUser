
async function checkPlatform(platform, input_username) {
    const statusElement = document.getElementById(`${platform.name.toLowerCase()}-status`);
    statusElement.innerHTML = '<i class="fas status fa-spinner Lode"></i>';
    const msgElement = document.getElementById(`${platform.name.toLowerCase()}-msg`);
    const listItem = document.querySelector(`[data-platform="${platform.name}"]`);
    const ViewUsername = document.querySelector(`[data-platform="${platform.name}"] .platform-info .platform-Username`);
    const Length = document.querySelector(`[data-platform="${platform.name}"] .platform-info .Length`);


    // التحقق من طول اسم المستخدم
    if (input_username.length > platform.maxLength) {
        ViewUsername.textContent = `@${input_username.substring(0, platform.maxUsernameLength)}...`;
        ViewUsername.classList.add('Error');
        Length.classList.add('Error');
    }
    else {
        ViewUsername.classList.remove('Error');
        Length.classList.remove('Error');

    }

    // إذا كان الطول صالحًا
    ViewUsername.textContent = platform.username(input_username); // تعيين اسم المستخدم مع @
    listItem.setAttribute('data-username', platform.username(input_username));
    listItem.classList.remove('Error');

    msgElement.textContent = messages.loading;

    try {
        const userExists = await platform.checkFunction(platform, input_username);
        if (userExists) {
            statusElement.innerHTML = '<i class="fas status fa-check True"></i>';
            msgElement.textContent = messages.found;
            listItem.setAttribute('data-url', platform.profileUrl(input_username));
        } else {
            statusElement.innerHTML = '<i class="fas status fa-times False"></i>';
            msgElement.textContent = messages.notFound;
            listItem.setAttribute('data-url', platform.Url);
        }
    } catch (error) {
        statusElement.innerHTML = '<i class="fas status fa-exclamation-circle Error"></i>';
        msgElement.textContent = messages.error;
        listItem.setAttribute('data-url', platform.Url);
        listItem.classList.add('Error');
    }
}

async function checkUsername() {
    const input_username = document.getElementById("input_username").value.trim();
    if (!input_username) {
        document.getElementById("input_username").style.borderColor = '#ff0000';
        return;
    }

    const platformChecks = platforms.map(platform => checkPlatform(platform, input_username));
    await Promise.all(platformChecks);
}

async function retryCheck(platformName) {
    const itemElement = document.querySelector(`[data-platform="${platformName}"]`);
    if (!itemElement) return;

    const platformUsername = itemElement.dataset.username;
    if (!platformUsername) {
        console.error("اسم المستخدم غير معرّف.");
        return;
    }

    const platform = platforms.find(p => p.name === platformName);
    if (!platform) {
        console.error("المنصة غير معرّفة.");
        return;
    }

    if (itemElement.classList.contains("Error")) {
        await checkPlatform(platform, platformUsername);
    } else {
        const url = itemElement.dataset.url;
        const fullUrl = platform.profileUrl(platformUsername);
        window.open(fullUrl, "_blank");
    }
}
