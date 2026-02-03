const DB_URL = "https://beacademy-c8316-default-rtdb.firebaseio.com/users";
const currentLogin = localStorage.getItem("currentUser");

document.addEventListener("DOMContentLoaded", () => {
    // 1. İstifadəçi adını göstər
    if (document.getElementById("userNameDisplay") && currentLogin) {
        document.getElementById("userNameDisplay").innerText = currentLogin;
    }

    // --- YENİ ƏLAVƏ OLUNAN FUNKSİYALAR ---

    // 2. Cihazdan şəkil seçmək (Base64 formatında Firebase-ə)
    window.triggerPhotoUpload = async function() {
        const profileUser = document.getElementById("profUser").innerText.replace("@", "");
        if (currentLogin !== profileUser) return;

        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Şəklin ölçüsünü yoxlayırıq (Firebase limiti üçün)
            if (file.size > 1000000) { // 1MB-dan çoxdursa
                alert("Şəkil çox böyükdür! Maksimum 1MB.");
                return;
            }

            const reader = new FileReader();
            reader.onload = async (event) => {
                const base64Image = event.target.result;
                
                await fetch(`${DB_URL}/${currentLogin}.patch`, {
                    method: 'PATCH',
                    body: JSON.stringify({ img: base64Image })
                });
                
                // Profili yeniləmək üçün mövcud funksiyanı çağırırıq
                if (typeof openProfile === "function") openProfile(currentLogin);
            };
            reader.readAsDataURL(file);
        };
        input.click();
    };

    // 3. Şəkli silmək
    window.deleteProfilePhoto = async function() {
        if (confirm("Şəkli silmək istəyirsiniz?")) {
            await fetch(`${DB_URL}/${currentLogin}.patch`, {
                method: 'PATCH',
                body: JSON.stringify({ img: "" })
            });
            if (typeof openProfile === "function") openProfile(currentLogin);
        }
    };

    // 4. Parolu dəyişmək
    window.changeUserPassword = async function() {
        const newPass = prompt("Yeni parolu daxil edin (min. 4 simvol):");
        
        if (newPass && newPass.length >= 4) {
            try {
                const response = await fetch(`${DB_URL}/${currentLogin}.patch`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password: newPass })
                });

                if (response.ok) {
                    alert("Parol uğurla yeniləndi!");
                } else {
                    alert("Xəta baş verdi!");
                }
            } catch (error) {
                console.error("Firebase Error:", error);
            }
        } else if (newPass) {
            alert("Parol çox qısadır!");
        }
    };

    // --- MOVCUD PORTAL LOGIC KODLARIN (TOXUNULMADI) ---

    window.openPortalSection = function (section) {
        const modal = document.getElementById("materialModal");
        const mTitle = document.getElementById("modalTitle");
        const mContent = document.getElementById("modalContent");

        if (!modal) return;

        modal.style.display = "block";
        mTitle.innerText = section;
        mContent.innerHTML = "<p style='text-align:center;'>Yüklənir...</p>";

        const allMats = JSON.parse(localStorage.getItem("courseMaterials") || "[]");
        const filtered = allMats.filter(m => m.course === section);

        if (filtered.length === 0) {
            mContent.innerHTML = "<p style='text-align:center; padding:20px; color:#888;'>Bu bölmədə hələ ki material yoxdur.</p>";
            return;
        }

        mContent.innerHTML = "";
        filtered.reverse().forEach(file => {
            const btnHTML = file.isFile
                ? `<button onclick="viewFilePortal('${file.id}')" style="background:#e60000; color:#fff; border:none; padding:8px 15px; cursor:pointer; font-weight:700; border-radius:4px;">BAX</button>`
                : `<a href="${file.content}" target="_blank" style="background:#000; color:#fff; text-decoration:none; padding:8px 15px; font-weight:700; font-size:12px; border-radius:4px;">KEÇİD</a>`;

            mContent.innerHTML += `
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #eee; padding:15px 0;">
                    <span style="color:#333; font-weight:600;">${file.title}</span>
                    <div>${btnHTML}</div>
                </div>`;
        });
    };

    window.closePortalModal = function () {
        document.getElementById("materialModal").style.display = "none";
    };

    window.viewFilePortal = function (id) {
        const mats = JSON.parse(localStorage.getItem("courseMaterials") || "[]");
        const m = mats.find(x => x.id == id);
        if (m) {
            const win = window.open();
            win.document.write(`<iframe src="${m.content}" style="width:100%; height:100vh;" frameborder="0"></iframe>`);
        }
    };
});
