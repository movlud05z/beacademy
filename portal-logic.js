const DB_URL = "https://beacademy-c8316-default-rtdb.firebaseio.com/users";
const POSTS_URL = "https://beacademy-c8316-default-rtdb.firebaseio.com/posts";
const currentLogin = localStorage.getItem("currentUser");
const blueTickSVG = `<svg class="verified-badge" viewBox="0 0 24 24" fill="#0095F6" style="width:18px; height:18px; vertical-align:middle; margin-left:5px;"><path d="M10.5213 2.62368C11.3147 1.75255 12.6853 1.75255 13.4787 2.62368L14.4989 3.74391C14.8143 4.09038 15.2573 4.30055 15.7288 4.32717L17.2521 4.41312C18.4383 4.48003 19.38 5.42172 19.4469 6.60786L19.5328 8.13117C19.5595 8.6027 19.7696 9.04567 20.1161 9.36109L21.2363 10.3813C22.1075 11.1747 22.1075 12.5453 21.2363 13.3387L20.1161 14.3589C19.7696 14.6743 19.5595 15.1173 19.5328 15.5888L19.4469 17.1121C19.38 18.2983 18.4383 19.24 17.2521 19.3069L15.7288 19.3928C15.2573 19.4195 14.8143 19.6296 14.4989 19.9751L13.4787 21.0953C12.6853 21.9665 11.3147 21.9665 10.5213 21.0953L9.50106 19.9751C9.18564 19.6296 8.74267 19.4195 8.27117 19.3928L6.74786 19.3069C5.56172 19.24 4.62003 18.2983 4.55312 17.1121L4.46717 15.5888C4.44055 15.1173 4.23038 14.6743 3.88391 14.3589L2.76368 13.3387C1.89255 12.5453 1.89255 11.1747 2.76368 10.3813L3.88391 9.36109C4.23038 9.04567 4.44055 8.6027 4.46717 8.13117L4.55312 6.60786C4.62003 5.42172 5.56172 4.48003 6.74786 4.41312L8.27117 4.32717C8.74267 4.30055 9.18564 4.09038 9.50106 3.74391L10.5213 2.62368Z"/><path d="M9 12L11 14L15 10" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

// 1. Profil açma və data yükləmə
window.openProfile = async function(username) {
    if(!username) return;
    const res = await fetch(`${DB_URL}/${username}.json`);
    const u = await res.json();
    if (!u) return;

    const avatarImg = document.getElementById("profAvatarImg");
    const initialDiv = document.getElementById("profInitial");
    if (u.img) { 
        avatarImg.src = u.img; 
        avatarImg.style.display = "block"; 
        initialDiv.style.display = "none"; 
    } else { 
        avatarImg.style.display = "none"; 
        initialDiv.innerText = u.fullname ? u.fullname[0] : "?"; 
        initialDiv.style.display = "block"; 
    }

    document.getElementById("profName").innerHTML = u.fullname + (u.isVerified ? blueTickSVG : "");
    document.getElementById("profUser").innerText = "@" + u.username;
    
    const isOwn = (username === currentLogin);
    document.getElementById("ownProfileActions").style.display = isOwn ? "flex" : "none";
    document.getElementById("postCreator").style.display = isOwn ? "block" : "none";
    
    const followBtn = document.getElementById("profFollowBtn");
    followBtn.style.display = isOwn ? "none" : "block";

    // Takib yoxlanışı
    if (!isOwn) {
        const followRes = await fetch(`${DB_URL}/${currentLogin}/following/${username}.json`);
        const isFollowing = await followRes.json();
        followBtn.innerText = isFollowing ? "İZLƏYİRSƏN" : "İZLƏ";
        followBtn.style.background = isFollowing ? "#333" : "#e60000";
        // Düyməyə funksiyanı təkrar bağlayaq (qaranti olsun)
        followBtn.onclick = () => window.toggleFollow();
    }

    // Statistika
    const followers = u.followers ? Object.keys(u.followers).length : 0;
    const following = u.following ? Object.keys(u.following).length : 0;
    document.getElementById("followerCount").innerText = followers;
    document.getElementById("followingCount").innerText = following;

    window.loadPosts(username);
    document.getElementById("profileModal").style.display = "block";
};

// 2. Takib etmə funksiyası
window.toggleFollow = async function() {
    const targetUser = document.getElementById("profUser").innerText.replace("@", "").trim();
    if (!targetUser || targetUser === currentLogin) return;

    const followBtn = document.getElementById("profFollowBtn");
    const checkRes = await fetch(`${DB_URL}/${currentLogin}/following/${targetUser}.json`);
    const isFollowing = await checkRes.json();

    if (isFollowing) {
        await Promise.all([
            fetch(`${DB_URL}/${currentLogin}/following/${targetUser}.json`, { method: 'DELETE' }),
            fetch(`${DB_URL}/${targetUser}/followers/${currentLogin}.json`, { method: 'DELETE' })
        ]);
    } else {
        await Promise.all([
            fetch(`${DB_URL}/${currentLogin}/following/${targetUser}.json`, { method: 'PUT', body: JSON.stringify(true) }),
            fetch(`${DB_URL}/${targetUser}/followers/${currentLogin}.json`, { method: 'PUT', body: JSON.stringify(true) })
        ]);
    }
    window.openProfile(targetUser); 
};

// 3. Digər bütün funksiyaları window-a bağlayırıq (Kəsilmədən)
window.triggerPhotoUpload = async function() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (event) => {
            await fetch(`${DB_URL}/${currentLogin}.patch`, { method: 'PATCH', body: JSON.stringify({ img: event.target.result }) });
            window.openProfile(currentLogin);
        };
        reader.readAsDataURL(file);
    };
    input.click();
};

window.loadPosts = async function(username) {
    const res = await fetch(`${POSTS_URL}.json`);
    const all = await res.json() || {};
    const userPosts = Object.values(all).filter(p => p.author === username).reverse();
    document.getElementById("postCount").innerText = userPosts.length;
    document.getElementById("postsList").innerHTML = userPosts.map(p => `
        <div style="padding:15px; border-bottom:1px solid #eee;">
            <b style="color:#e60000; font-size:12px;">@${p.author}</b>
            <p style="margin:5px 0; font-size:13px;">${p.text}</p>
            <small style="color:#999; font-size:10px;">${p.date}</small>
        </div>`).join("");
};

window.changeUserPassword = async function() {
    const newPass = prompt("Yeni parol (min. 4 simvol):");
    if (newPass && newPass.length >= 4) {
        await fetch(`${DB_URL}/${currentLogin}.patch`, { method: 'PATCH', body: JSON.stringify({ password: newPass }) });
        alert("Parol yeniləndi!");
    }
};

window.deleteProfilePhoto = async function() {
    if (confirm("Şəkli silmək istəyirsiniz?")) {
        await fetch(`${DB_URL}/${currentLogin}.patch`, { method: 'PATCH', body: JSON.stringify({ img: "" }) });
        window.openProfile(currentLogin);
    }
};
