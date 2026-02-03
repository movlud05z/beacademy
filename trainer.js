const FIREBASE_DB = "https://beacademy-c8316-default-rtdb.firebaseio.com/portal_content";
let hiddenData = ""; 
let selectedFileType = "";

window.onload = fetchMaterials;

function showSection(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    const target = document.getElementById(id);
    if(target) target.classList.add('active');
    if(event && event.currentTarget) event.currentTarget.classList.add('active');
}

function handleFileSelect(input) {
    const file = input.files[0];
    if (!file) return;
    
    selectedFileType = file.type;
    document.getElementById('fileNameDisplay').innerText = "SEÇİLDİ: " + file.name;
    
    const reader = new FileReader();
    
    reader.onload = e => {
        hiddenData = e.target.result;
    };

    // PDF üçün Base64, digərləri üçün Text oxuma
    if (file.type === "application/pdf") {
        reader.readAsDataURL(file);
    } else {
        reader.readAsText(file);
    }
}

async function fetchMaterials() {
    const listDiv = document.getElementById('materialsList');
    try {
        const response = await fetch(`${FIREBASE_DB}.json`);
        const data = await response.json();
        listDiv.innerHTML = "";
        if (data) {
            for (let course in data) {
                if (data[course]) {
                    const match = data[course].match(/<h2>(.*?)<\/h2>/);
                    const displayTitle = match ? match[1] : "Başlıqsız Material";

                    listDiv.innerHTML += `
                        <div class="manage-item">
                            <div class="info-box">
                                <span class="course-badge">${course}</span>
                                <span class="title-text">${displayTitle}</span>
                            </div>
                            <button class="btn-del" onclick="deleteMaterial('${course}')">SİL</button>
                        </div>`;
                }
            }
        } else { listDiv.innerHTML = "<p style='color:#999;'>Heç bir material tapılmadı.</p>"; }
    } catch (err) { listDiv.innerHTML = "Məlumatı çəkmək olmadı."; }
}

async function deleteMaterial(course) {
    if (!confirm(course + " bölməsindəki materialı SİLMƏK istədiyinizdən əminsiniz?")) return;
    try {
        await fetch(`${FIREBASE_DB}/${course}.json`, { method: 'DELETE' });
        fetchMaterials();
    } catch (err) { alert("Xəta!"); }
}

async function pushToDatabase() {
    const title = document.getElementById('mTitle').value.trim();
    const folder = document.getElementById('targetCourse').value;
    const btn = document.getElementById('uploadBtn');
    const status = document.getElementById('statusMsg');

    if (!hiddenData || !title) return alert("Həm başlıq daxil edilməli, həm də fayl seçilməlidir!");

    btn.innerText = "YÜKLƏNİR...";
    btn.disabled = true;

    let combinedContent = "";

    if (selectedFileType === "application/pdf") {
        combinedContent = `<h2>${title}</h2>
            <div style="background:#f4f4f4; padding:25px; border-radius:12px; text-align:center; border:2px dashed #e60000; margin-top:15px;">
                <p style="color:#333; font-weight:700; font-size:16px;">📂 PDF dərslik yüklənib</p>
                <a href="${hiddenData}" target="_blank" style="display:inline-block; background:#e60000; color:white; padding:12px 30px; text-decoration:none; border-radius:8px; font-weight:800; margin-top:10px; box-shadow:0 4px 15px rgba(230,0,0,0.3);">MATERİALINI AÇ (PDF)</a>
            </div>`;
    } else {
        combinedContent = `<h2>${title}</h2><hr>${hiddenData}`;
    }

    try {
        await fetch(`${FIREBASE_DB}/${folder}.json`, {
            method: 'PUT',
            body: JSON.stringify(combinedContent)
        });
        status.style.color = "green";
        status.innerText = "Sistem yeniləndi! ✅";
        document.getElementById('mTitle').value = "";
        hiddenData = "";
        document.getElementById('fileNameDisplay').innerText = "Fayl Seçin";
        fetchMaterials();
    } catch (err) { status.innerText = "Xəta baş verdi!"; }
    finally {
        btn.innerText = "SİSTEMƏ KÖÇÜR";
        btn.disabled = false;
        setTimeout(() => status.innerText = "", 3000);
    }
}
