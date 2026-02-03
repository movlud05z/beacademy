document.addEventListener("DOMContentLoaded", () => {
    // 1. İstifadəçi adını göstər
    const user = localStorage.getItem("currentUser");
    if (document.getElementById("userNameDisplay") && user) {
        document.getElementById("userNameDisplay").innerText = user;
    }

    // 2. Modalı açmaq funksiyası
    window.openPortalSection = function (section) {
        const modal = document.getElementById("materialModal");
        const mTitle = document.getElementById("modalTitle");
        const mContent = document.getElementById("modalContent");

        if (!modal) return;

        modal.style.display = "block";
        mTitle.innerText = section;
        mContent.innerHTML = "<p style='text-align:center;'>Yüklənir...</p>";

        const allMats = JSON.parse(localStorage.getItem("courseMaterials") || "[]");
        // Trainer-dən gələn materialları bölməyə görə filtrləyirik
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

    // 3. Modalı bağlamaq
    window.closePortalModal = function () {
        document.getElementById("materialModal").style.display = "none";
    };

    // 4. Faylı açmaq (ayrıca funksiya kimi)
    window.viewFilePortal = function (id) {
        const mats = JSON.parse(localStorage.getItem("courseMaterials") || "[]");
        const m = mats.find(x => x.id == id);
        if (m) {
            const win = window.open();
            win.document.write(`<iframe src="${m.content}" style="width:100%; height:100vh;" frameborder="0"></iframe>`);
        }
    };
});
