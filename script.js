document.addEventListener("DOMContentLoaded", () => {
    // 1. SİSTEM AYARLARI
    const BOSS_LOGIN = "BOSS";
    if (!localStorage.getItem("boss_custom_pass")) {
        localStorage.setItem("boss_custom_pass", "BEBOSS99!@?!");
    }

    const DEFAULT_TRAINER_PASS = "BETRAINER2026!";

    if (!localStorage.getItem("trainer_custom_pass")) {
        localStorage.setItem("trainer_custom_pass", DEFAULT_TRAINER_PASS);
    }

    // 2. GİRİŞ SİSTEMİ (index.html üçün)
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const uInput = document.getElementById("username").value.trim();
            const uUpper = uInput.toUpperCase();
            const pInput = document.getElementById("password").value.trim();
            const msg = document.getElementById("msg");

            const currentBossPass = localStorage.getItem("boss_custom_pass");
            if (uUpper === BOSS_LOGIN && pInput === currentBossPass) {
                localStorage.setItem("currentUser", "BOSS");
                window.location.href = "main.html";
                return;
            }

            if (uUpper === "TRAINER") {
                const currentTrainerPass = localStorage.getItem("trainer_custom_pass");
                if (pInput === currentTrainerPass) {
                    localStorage.setItem("currentUser", "TRAINER");
                    window.location.href = "trainer.html";
                    return;
                }
            }

            const students = JSON.parse(localStorage.getItem("students") || "[]");
            const student = students.find(s => s.username === uInput && s.password === pInput);
            if (student) {
                localStorage.setItem("currentUser", uInput);
                window.location.href = "portal.html";
            } else {
                if (msg) msg.innerText = "Giriş məlumatları yanlışdır!";
            }
        });
    }

    // --- PORTALDA İSTİFADƏÇİNİN ÖZ PAROLUNU DƏYİŞMƏSİ ---
    window.userChangeOwnPassword = function () {
        const currentUserName = localStorage.getItem("currentUser");
        if (!currentUserName || currentUserName === "BOSS" || currentUserName === "TRAINER") return;

        const oldPass = prompt("Mövcud parolunuzu daxil edin:");
        let students = JSON.parse(localStorage.getItem("students") || "[]");
        const userIndex = students.findIndex(s => s.username === currentUserName);

        if (userIndex !== -1) {
            if (oldPass === students[userIndex].password) {
                const newPass = prompt("YENİ parolunuzu daxil edin (min. 4 simvol):");
                if (newPass && newPass.trim().length >= 4) {
                    students[userIndex].password = newPass.trim();
                    localStorage.setItem("students", JSON.stringify(students));
                    alert("Parolunuz uğurla dəyişdirildi!");
                } else if (newPass !== null) {
                    alert("Parol çox qısadır!");
                }
            } else if (oldPass !== null) {
                alert("Mövcud parolunuz yanlışdır!");
            }
        }
    };

    // 3. BOSS PANELİ FUNKSİYALARI
    window.changeBossPassword = function () {
        const currentPass = localStorage.getItem("boss_custom_pass");
        const oldPass = prompt("Hazırkı BOSS parolunu daxil edin:");
        if (oldPass === currentPass) {
            const newPass = prompt("YENİ BOSS parolu təyin edin:");
            if (newPass && newPass.trim().length >= 4) {
                localStorage.setItem("boss_custom_pass", newPass.trim());
                alert("BOSS parolu uğurla dəyişdirildi!");
            } else {
                alert("Parol ən az 4 simvol olmalıdır!");
            }
        } else if (oldPass !== null) {
            alert("Köhnə parol yanlışdır!");
        }
    };

    window.changeTrainerPassword = function () {
        const newP = prompt("TRAINER üçün yeni parol təyin edin:");
        if (newP && newP.trim().length >= 4) {
            localStorage.setItem("trainer_custom_pass", newP.trim());
            alert("UĞURLU! Yeni Trainer Parolu: " + newP.trim());
        } else if (newP !== null) {
            alert("Parol ən az 4 simvol olmalıdır!");
        }
    };

    window.updateStaffTable = function (filter = "") {
        const tableBody = document.getElementById("staffTableBody");
        const totalStaffCounter = document.getElementById("totalStaff");
        if (!tableBody) return;

        const students = JSON.parse(localStorage.getItem("students") || "[]");
        if (totalStaffCounter) totalStaffCounter.innerText = students.length;

        tableBody.innerHTML = "";
        const filtered = students.filter(s =>
            s.username.toLowerCase().includes(filter.toLowerCase()) ||
            s.fullName.toLowerCase().includes(filter.toLowerCase())
        );

        filtered.forEach(s => {
            tableBody.innerHTML += `
                <tr>
                    <td><b>${s.fullName} ${s.isVerified ? '<span style="color:#0095f6;">🔵</span>' : ''}</b></td>
                    <td style="color:#e60000; font-weight:700;">${s.username}</td>
                    <td>${s.email}</td>
                    <td style="text-align: center;">
                        <button class="action-btn" onclick="toggleVerify('${s.username}')" style="background:#0095f6; color:white;">TIK</button>
                        <button class="action-btn" onclick="changeUserPass('${s.username}')" style="background:#f39c12; color:white;">PAROL</button>
                        <button class="action-btn delete-btn" onclick="deleteUser('${s.username}')">SİL</button>
                    </td>
                </tr>`;
        });
    };

    window.toggleVerify = function (un) {
        let students = JSON.parse(localStorage.getItem("students") || "[]");
        const i = students.findIndex(s => s.username === un);
        if (i !== -1) {
            students[i].isVerified = !students[i].isVerified;
            localStorage.setItem("students", JSON.stringify(students));
            updateStaffTable();
        }
    };

    window.changeUserPass = function (un) {
        const p = prompt(un + " üçün yeni parol:");
        if (p) {
            let students = JSON.parse(localStorage.getItem("students") || "[]");
            const i = students.findIndex(s => s.username === un);
            if (i !== -1) {
                students[i].password = p;
                localStorage.setItem("students", JSON.stringify(students));
                alert("Dəyişdirildi!");
                updateStaffTable();
            }
        }
    };

    window.deleteUser = function (un) {
        if (confirm("Silinsin?")) {
            let students = JSON.parse(localStorage.getItem("students") || "[]");
            localStorage.setItem("students", JSON.stringify(students.filter(s => s.username !== un)));
            updateStaffTable();
        }
    };

    const addForm = document.getElementById("addStudentForm");
    if (addForm) {
        addForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const fullName = document.getElementById("newFullName").value;
            const username = document.getElementById("newUsername").value;
            const email = document.getElementById("newEmail").value;
            const password = document.getElementById("newPass").value;
            let students = JSON.parse(localStorage.getItem("students") || "[]");
            if (students.some(s => s.username === username)) { alert("Bu login mövcuddur!"); return; }
            students.push({ fullName, username, email, password, isVerified: false });
            localStorage.setItem("students", JSON.stringify(students));
            addForm.reset();
            updateStaffTable();
            alert("Əlavə edildi!");
        });
    }

    // 4. TRAINER PANELİ (Materiallar)
    const trainerNameDisp = document.getElementById("userNameDisplay");
    if (trainerNameDisp) trainerNameDisp.innerText = "TRAINER";

    const uploadForm = document.getElementById("uploadForm");
    if (uploadForm) {
        uploadForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const course = document.getElementById("courseSelect").value;
            const title = document.getElementById("materialTitle").value;
            const fileInput = document.getElementById("fileInput");
            const link = document.getElementById("materialLink").value;

            if (fileInput.files[0]) {
                const reader = new FileReader();
                reader.onload = () => saveMat(course, title, reader.result, true);
                reader.readAsDataURL(fileInput.files[0]);
            } else if (link) {
                saveMat(course, title, link, false);
            }
        });
    }

    function saveMat(c, t, d, f) {
        const mats = JSON.parse(localStorage.getItem("courseMaterials") || "[]");
        mats.push({ id: Date.now(), course: c, title: t, content: d, isFile: f });
        localStorage.setItem("courseMaterials", JSON.stringify(mats));
        alert("Material yükləndi!");
        uploadForm.reset();
        updateTrainerMaterials();
    }

    window.updateTrainerMaterials = function () {
        const display = document.getElementById("trainerMaterialDisplay");
        if (!display) return;
        const filter = document.getElementById("filterCourse").value;
        const mats = JSON.parse(localStorage.getItem("courseMaterials") || "[]");
        display.innerHTML = "";
        mats.filter(m => filter === "ALL" || m.course === filter).reverse().forEach(m => {
            display.innerHTML += `
                <div class="material-item">
                    <div class="item-info">
                        <span class="badge">${m.course}</span>
                        <b>${m.title}</b>
                    </div>
                    <div>
                        <button onclick="openFile('${m.id}')" class="view-btn">BAX</button>
                        <span onclick="delMat(${m.id})" style="color:red; cursor:pointer; margin-left:15px;">🗑️</span>
                    </div>
                </div>`;
        });
    };

    window.openFile = function (id) {
        const mats = JSON.parse(localStorage.getItem("courseMaterials") || "[]");
        const m = mats.find(x => x.id == id);
        if (m) {
            const win = window.open();
            win.document.write(m.isFile ? `<iframe src="${m.content}" style="width:100%; height:100vh;" frameborder="0"></iframe>` : `<script>window.location.href="${m.content}";<\/script>`);
        }
    };

    window.delMat = function (id) {
        if (confirm("Silinsin?")) {
            let mats = JSON.parse(localStorage.getItem("courseMaterials") || "[]");
            localStorage.setItem("courseMaterials", JSON.stringify(mats.filter(x => x.id != id)));
            updateTrainerMaterials();
        }
    };

    if (document.getElementById("staffTableBody")) updateStaffTable();
    if (document.getElementById("trainerMaterialDisplay")) updateTrainerMaterials();

    const sInput = document.getElementById("staffSearch");
    if (sInput) sInput.addEventListener("input", (e) => updateStaffTable(e.target.value));
});
