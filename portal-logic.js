// Konfiqurasiya
const DB_URL = "https://beacademy-c8316-default-rtdb.firebaseio.com/users";
const POSTS_URL = "https://beacademy-c8316-default-rtdb.firebaseio.com/posts";
const CONTENT_URL = "https://beacademy-c8316-default-rtdb.firebaseio.com/portal_content";

// 1. Axtarış Funksiyası
window.searchStaff = async function() {
    const val = document.getElementById("staffSearchInput").value.trim().toLowerCase();
    const resDiv = document.getElementById("staffSearchResults");
    if (!val) { resDiv.innerHTML = ""; return; }
    
    try {
        const res = await fetch(`${DB_URL}.json`);
        const users = await res.json();
        
        resDiv.innerHTML = Object.values(users || {})
            .filter(u => u.fullname && (u.fullname.toLowerCase().includes(val) || u.username.toLowerCase().includes(val)))
            .map(u => `
                <div class="staff-card" onclick="openProfile('${u.username}')">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <div style="width:35px; height:35px; background:#f0f0f0; border-radius:50%; display:flex; align-items:center; justify-content:center; overflow:hidden;">
                            ${u.img ? `<img src="${u.img}" style="width:100%; height:100%; object-fit:cover;">` : `<span style="font-weight:800; color:#e60000;">${u.fullname ? u.fullname[0] : '?'}</span>`}
                        </div>
                        <div>
                            <b>${u.fullname}</b>
                            <div style="font-size:10px; color:#888;">@${u.username}</div>
                        </div>
                    </div>
                    <span>→</span>
                </div>`).join("");
    } catch (e) { console.error("Axtarış xətası:", e); }
};

// 2. Profil Açma Funksiyası
window.openProfile = async function(username) {
    if(!username) {
        username = localStorage.getItem("currentUser");
    }
    
    try {
        const res = await fetch(`${DB_URL}/${username}.json`);
        const u = await res.json();
        if (!u) return;

        document.getElementById("profileModal").style.display = "block";

        const avatarImg = document.getElementById("profAvatarImg");
        const initialDiv = document.getElementById("profInitial");
        
        if (u.img) { 
            avatarImg.src = u.img; avatarImg.style.display = "block"; initialDiv.style.display = "none"; 
        } else { 
            avatarImg.style.display = "none"; initialDiv.innerText = u.fullname ? u.fullname[0] : "?"; initialDiv.style.display = "block"; 
        }

        document.getElementById("profName").innerText = u.fullname;
        document.getElementById("profUser").innerText = "@" + u.username;
        
        const currentLogin = localStorage.getItem("currentUser");
        const isOwn = (username === currentLogin);
        
        document.getElementById("ownProfileActions").style.display = isOwn ? "flex" : "none";
        document.getElementById("postCreator").style.display = isOwn ? "block" : "none";
        document.getElementById("profFollowBtn").style.display = isOwn ? "none" : "block";

        window.loadPosts(username);
    } catch (e) { console.error("Profil açılmadı:", e); }
};

// 3. Şəkil Yükləmə
window.triggerPhotoUpload = function() {
    const currentLogin = localStorage.getItem("currentUser");
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (ev) => {
            const base64 = ev.target.result;
            await fetch(`${DB_URL}/${currentLogin}.json`, { 
                method: 'PATCH', 
                body: JSON.stringify({ img: base64 }) 
            });
            window.openProfile(currentLogin);
        };
        reader.readAsDataURL(file);
    };
    input.click();
};

// 4. Postları Yüklə
window.loadPosts = async function(username) {
    const res = await fetch(`${POSTS_URL}.json`);
    const all = await res.json() || {};
    const userPosts = Object.values(all).filter(p => p.author === username).reverse();
    document.getElementById("postCount").innerText = userPosts.length;
    document.getElementById("postsList").innerHTML = userPosts.map(p => `
        <div style="padding:15px; border-bottom:1px solid #eee; color:#333;">
            <b style="color:#e60000; font-size:12px;">@${p.author}</b>
            <p style="margin:5px 0; font-size:13px;">${p.text}</p>
        </div>`).join("");
};

// 5. MATERIAL SİSTEMİ VƏ YÜKLƏMƏ (YENİ)
window.fetchCourseMaterials = async function(courseId) {
    const displayArea = document.getElementById("courseContentArea");
    if(!displayArea) return;
    
    displayArea.innerHTML = "<p style='text-align:center;'>Yüklənir...</p>";
    
    try {
        const res = await fetch(`${CONTENT_URL}/${courseId}.json`);
        const data = await res.json();
        
        if (!data) {
            displayArea.innerHTML = "<p style='text-align:center; padding:20px;'>Bu bölmə üzrə material yoxdur.</p>";
            return;
        }

        // PDF Linkini və Başlığı tapmaq üçün analiz
        const pdfMatch = data.match(/href="(data:application\/pdf;base64,.*?)"/);
        const titleMatch = data.match(/<h2>(.*?)<\/h2>/);
        const fileName = titleMatch ? titleMatch[1] : "material";

        let downloadBtn = "";
        if (pdfMatch) {
            downloadBtn = `
                <div style="margin-top:15px; padding:10px; background:#f0fff4; border:1px solid #c6f6d5; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:13px; color:#276749; font-weight:600;">📄 PDF versiyası hazırdır</span>
                    <a href="${pdfMatch[1]}" download="${fileName}.pdf" 
                       style="background:#28a745; color:white; padding:7px 15px; text-decoration:none; border-radius:5px; font-size:11px; font-weight:800; text-transform:uppercase;">
                       💾 YÜKLƏ
                    </a>
                </div>`;
        }

        displayArea.innerHTML = `
            <div class="material-body" style="animation: slideUp 0.4s ease;">
                ${data}
                ${downloadBtn}
            </div>
        `;

    } catch (e) {
        displayArea.innerHTML = "Xəta baş verdi.";
    }
};

// Digər köməkçi funksiyalar
window.closeModal = function(id) { document.getElementById(id).style.display = "none"; };
