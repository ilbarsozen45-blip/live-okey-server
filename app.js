/* =========================
   JS 1 (DEV)
   LOBİ YÖNETİMİ + MASA OLUŞTURMA + SANAL CANLI MASA SİSTEMİ (LOCAL)
========================= */

/*
NOT:
Gerçek "canlı" (internet üzerinden çok oyunculu) için ileride
Firebase / Socket.io backend bağlayacağız.
Bu blok şimdilik canlı masa mantığının iskeletini kurar.
*/

const state = {
    coins: 500,
    tables: [],
    playerName: "Misafir"
};

/* =========================
   BAŞLANGIÇ
========================= */

window.addEventListener("DOMContentLoaded", () => {

    updateCoinUI();

    document.getElementById("createTableButton")
        .addEventListener("click", openCreateModal);

    document.getElementById("createTableCancel")
        .addEventListener("click", closeCreateModal);

    document.getElementById("createTableConfirm")
        .addEventListener("click", createTable);

});

/* =========================
   SANAL PARA
========================= */

function updateCoinUI() {
    document.getElementById("coinAmount").textContent = state.coins;
}

/* =========================
   MODAL
========================= */

function openCreateModal() {
    document.getElementById("createTableModal").classList.remove("hidden");
}

function closeCreateModal() {
    document.getElementById("createTableModal").classList.add("hidden");
}

/* =========================
   MASA OLUŞTURMA
========================= */

function createTable() {

    const name = document.getElementById("newTableName").value;
    const rounds = document.getElementById("newTableRound").value;

    if (!name || !rounds) {
        alert("Bilgileri doldur.");
        return;
    }

    const table = {
        id: Date.now(),
        name: name,
        rounds: rounds,
        players: 1
    };

    state.tables.push(table);

    renderTables();

    closeCreateModal();
}

/* =========================
   MASALARI GÖSTER
========================= */

function renderTables() {

    const container = document.getElementById("liveTables");
    container.innerHTML = "";

    state.tables.forEach(table => {

        const div = document.createElement("div");
        div.className = "tableCard liveTable";

        div.innerHTML = `
            <div class="tableHeader">
                <span class="tableName">${table.name}</span>
                <span class="tableRounds">${table.rounds} El</span>
            </div>

            <div class="tablePlayers">
                Oyuncular: <span class="playerCount">${table.players} / 4</span>
            </div>

            <div class="tableStatus waiting">
                Oyuncular bekleniyor
            </div>

            <button class="joinTableBtn">Masaya Katıl</button>
        `;

        div.querySelector(".joinTableBtn")
            .addEventListener("click", () => joinTable(table.id));

        container.appendChild(div);
    });
}

/* =========================
   MASAYA KATIL
========================= */

function joinTable(tableId) {

    const table = state.tables.find(t => t.id === tableId);

    if (table.players < 4) {
        table.players++;
        renderTables();
    }

}
/* =========================
   JS 2 (DEV)
   MASA KAYDIRMA + GELİŞMİŞ MASA AYARLARI + BASİT LOBİ ETKİLEŞİMİ
========================= */

/* =========================
   MASA KAYDIRMA (CAROUSEL)
========================= */

let scrollPosition = 0;

const tableListEl = document.getElementById("tableList");
const scrollLeftBtn = document.getElementById("scrollLeft");
const scrollRightBtn = document.getElementById("scrollRight");

if (scrollLeftBtn && scrollRightBtn && tableListEl) {

    scrollLeftBtn.addEventListener("click", () => {
        scrollPosition += 300;
        if (scrollPosition > 0) scrollPosition = 0;
        tableListEl.style.transform = `translateX(${scrollPosition}px)`;
    });

    scrollRightBtn.addEventListener("click", () => {
        scrollPosition -= 300;
        tableListEl.style.transform = `translateX(${scrollPosition}px)`;
    });

}

/* =========================
   GELİŞMİŞ MASA AYARLARI GÖSTER/GİZLE
========================= */

const advancedPanel = document.getElementById("advancedCreateTable");
const createBtn = document.getElementById("createTableButton");

if (createBtn && advancedPanel) {

    createBtn.addEventListener("dblclick", () => {
        advancedPanel.classList.toggle("hidden");
    });

}

/* =========================
   OTURUM AÇ / KAYIT SİMÜLASYON
========================= */

const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");

if (loginBtn) {
    loginBtn.addEventListener("click", () => {

        const name = prompt("Kullanıcı adını gir:");

        if (name && name.length > 1) {
            state.playerName = name;
            alert("Giriş yapıldı: " + name);
        }

    });
}

if (registerBtn) {
    registerBtn.addEventListener("click", () => {

        const name = prompt("Yeni kullanıcı adı:");

        if (name && name.length > 1) {
            state.playerName = name;
            alert("Kayıt tamamlandı: " + name);
        }

    });
}

/* =========================
   MASA DURUM GÜNCELLEME
========================= */

function updateTableStatuses() {

    const tables = document.querySelectorAll(".liveTable");

    tables.forEach((tableCard) => {

        const countEl = tableCard.querySelector(".playerCount");
        const statusEl = tableCard.querySelector(".tableStatus");

        if (!countEl || !statusEl) return;

        const countText = countEl.textContent.split("/")[0].trim();
        const count = parseInt(countText);

        if (count >= 3) {
            statusEl.textContent = "Başlamaya Hazır";
            statusEl.classList.remove("waiting");
            statusEl.classList.add("ready");
        } else {
            statusEl.textContent = "Oyuncular bekleniyor";
            statusEl.classList.remove("ready");
            statusEl.classList.add("waiting");
        }

    });

}

/* Render sonrası çağırılabilsin diye global dinleyici */
document.addEventListener("tablesRendered", updateTableStatuses);

/* =========================
   JS 3 (DEV)
   OYUN MASASINA GEÇİŞ + BASİT TAŞ ETKİLEŞİMİ + SOHBET + AI MASA İSKELETİ
========================= */

/* =========================
   LOBİDEN OYUNA GEÇİŞ
========================= */

function enterGameFromTable(tableId) {

    const table = state.tables.find(t => t.id === tableId);
    if (!table) return;

    document.getElementById("lobbyScreen").classList.add("hidden");
    document.getElementById("gameScreen").classList.remove("hidden");

    document.getElementById("gameTableName").textContent = "Masa Adı: " + table.name;
    document.getElementById("gameRoundInfo").textContent = "El: 1 / " + table.rounds;
}

/* joinTable fonksiyonunu genişlet */
const oldJoinTable = joinTable;
joinTable = function(tableId) {
    oldJoinTable(tableId);

    const table = state.tables.find(t => t.id === tableId);
    if (table.players >= 3) {
        setTimeout(() => {
            enterGameFromTable(tableId);
        }, 400);
    }
};

/* =========================
   MASADAN KALK
========================= */

const leaveBtn = document.getElementById("leaveTableBtn");

if (leaveBtn) {
    leaveBtn.addEventListener("click", () => {

        document.getElementById("gameScreen").classList.add("hidden");
        document.getElementById("lobbyScreen").classList.remove("hidden");

    });
}

/* =========================
   TAŞ ETKİLEŞİMİ (SEÇ / BIRAK)
========================= */

document.addEventListener("click", (e) => {

    if (e.target.classList.contains("tile")) {

        const selected = document.querySelector(".tile.selected");

        if (selected) selected.classList.remove("selected");

        e.target.classList.add("selected");
    }

});

const discardArea = document.getElementById("openDiscard");

if (discardArea) {

    discardArea.addEventListener("click", () => {

        const selected = document.querySelector(".tile.selected");
        if (!selected) return;

        discardArea.textContent = selected.textContent;
        selected.remove();

    });

}

/* =========================
   YERDEN TAŞ ÇEK (SAHTE)
========================= */

const drawBtn = document.getElementById("drawTileBtn");

if (drawBtn) {

    drawBtn.addEventListener("click", () => {

        const rack = document.getElementById("myTilesRack");
        if (!rack) return;

        const tile = document.createElement("div");
        tile.className = "tile";
        tile.textContent = Math.floor(Math.random() * 13) + 1;

        rack.appendChild(tile);
    });

}

/* =========================
   SOHBET
========================= */

const sendBtn = document.getElementById("sendChatBtn");

if (sendBtn) {

    sendBtn.addEventListener("click", () => {

        const input = document.getElementById("chatInput");
        const area = document.getElementById("chatMessages");

        if (!input.value.trim()) return;

        const msg = document.createElement("div");
        msg.className = "chatMsg";
        msg.textContent = state.playerName + ": " + input.value;

        area.appendChild(msg);
        area.scrollTop = area.scrollHeight;

        input.value = "";
    });

}

/* =========================
   AI MASASI (4 BOT İSKELETİ)
========================= */

const aiBtn = document.querySelector(".joinAiBtn");

if (aiBtn) {

    aiBtn.addEventListener("click", () => {

        document.getElementById("lobbyScreen").classList.add("hidden");
        document.getElementById("gameScreen").classList.remove("hidden");

        document.getElementById("gameTableName").textContent = "Yapay Zeka Masası";
        document.getElementById("gameStatus").textContent = "AI Oyuncular Hazır";

        spawnAIBots();
    });

}

function spawnAIBots() {

    const names = ["AI-1","AI-2","AI-3","AI-4"];
    const slots = document.querySelectorAll(".playerName");

    slots.forEach((el, i) => {
        if (names[i]) el.textContent = names[i];
    });

}

/* =========================
   MASA RENDER EDİLDİ EVENT
========================= */

const originalRenderTables = renderTables;
renderTables = function() {
    originalRenderTables();
    document.dispatchEvent(new Event("tablesRendered"));
};
/* =========================
   JS 4 (DEV)
   GERÇEK ZAMANLI (ALTYAPI HAZIRLIK) + MASA SENKRON + AI BASİT HAMLE MOTORU
   NOT: Bu bölüm, ileride Firebase / Socket.io bağlamak için “network katmanı” iskeletidir.
========================= */

/* =========================
   SAHTE NETWORK KATMANI (ŞİMDİLİK LOCAL STORAGE SYNC)
========================= */

const Net = {
    channel: "okey_live_tables_v1",

    saveTables(tables) {
        localStorage.setItem(this.channel, JSON.stringify(tables));
    },

    loadTables() {
        const raw = localStorage.getItem(this.channel);
        return raw ? JSON.parse(raw) : [];
    },

    broadcast() {
        window.dispatchEvent(new Event("tablesSync"));
    }
};

/* Başlangıçta daha önceki tabloları yükle */
window.addEventListener("DOMContentLoaded", () => {
    const stored = Net.loadTables();
    if (stored && stored.length) {
        state.tables = stored;
        renderTables();
    }
});

/* Başka sekmeler arası senkron (gerçek zamanlıya yakın davranış) */
window.addEventListener("storage", (e) => {
    if (e.key === Net.channel) {
        const updated = Net.loadTables();
        state.tables = updated;
        renderTables();
    }
});

/* renderTables sonrası kaydet ve yayınla */
const __renderTables_v2 = renderTables;
renderTables = function () {
    __renderTables_v2();
    Net.saveTables(state.tables);
    Net.broadcast();
};

/* =========================
   MASA İÇİ OYUNCU SAYISI KURALI (EN AZ 3)
========================= */

function canStartGame(table) {
    return table.players >= 3;
}

/* joinTable akışını güçlendir */
const __joinTable_v2 = joinTable;
joinTable = function (tableId) {
    __joinTable_v2(tableId);

    const table = state.tables.find(t => t.id === tableId);
    if (!table) return;

    const statusEls = document.querySelectorAll(".tableCard.liveTable");
    statusEls.forEach(card => {
        const nameEl = card.querySelector(".tableName");
        const statusEl = card.querySelector(".tableStatus");
        if (nameEl && statusEl && nameEl.textContent === table.name) {
            if (canStartGame(table)) {
                statusEl.textContent = "Oyun Başlayabilir (≥3)";
                statusEl.classList.remove("waiting");
                statusEl.classList.add("ready");
            }
        }
    });
};

/* =========================
   AI BASİT HAMLE MOTORU (TUR SİMÜLASYONU)
========================= */

let aiTurnInterval = null;

function startAITurnLoop() {
    stopAITurnLoop();

    aiTurnInterval = setInterval(() => {
        aiMakeMove();
    }, 2500);
}

function stopAITurnLoop() {
    if (aiTurnInterval) {
        clearInterval(aiTurnInterval);
        aiTurnInterval = null;
    }
}

function aiMakeMove() {
    const discard = document.getElementById("openDiscard");
    if (!discard) return;

    // AI “rastgele” bir taş atıyor gibi davranır
    const fakeTile = Math.floor(Math.random() * 13) + 1;
    discard.textContent = "AI attı: " + fakeTile;

    appendSystemChat("AI hamle yaptı ve " + fakeTile + " attı.");
}

/* AI masasına girildiğinde döngüyü başlat */
const __spawnAIBots_v2 = spawnAIBots;
spawnAIBots = function () {
    __spawnAIBots_v2();
    startAITurnLoop();
};

/* Masadan kalkınca AI döngüsünü durdur */
const __leaveBtn = document.getElementById("leaveTableBtn");
if (__leaveBtn) {
    __leaveBtn.addEventListener("click", () => {
        stopAITurnLoop();
    });
}

/* =========================
   SİSTEM MESAJ YARDIMCISI
========================= */

function appendSystemChat(text) {
    const area = document.getElementById("chatMessages");
    if (!area) return;

    const msg = document.createElement("div");
    msg.className = "chatMsg system";
    msg.textContent = text;

    area.appendChild(msg);
    area.scrollTop = area.scrollHeight;
}

/* =========================
   TUR SONU / EL BİTİR BUTONU İSKELETİ
========================= */

const endTurnBtn = document.getElementById("endTurnBtn");
if (endTurnBtn) {
    endTurnBtn.addEventListener("click", () => {
        appendSystemChat("Tur bitti. Sıradaki oyuncuya geçiliyor.");
    });
}
/* =========================
   JS 5 (DEV)
   GERÇEK ÇOK OYUNCULUYA GEÇİŞ İÇİN SOCKET.IO İSTEMCİ İSKELETİ
   (Bu kod, ileride bir Node.js + Socket.io sunucusuna bağlanacak şekilde hazırdır)
========================= */

/* Socket.io CDN yüklü varsayılır:
<script src="https://cdn.socket.io/4.7.5/socket.io.min.js"></script>
*/

let socket = null;
let onlineMode = false;

/* =========================
   SUNUCUYA BAĞLAN
========================= */

function connectOnline(serverURL = "http://localhost:3000") {
    try {
        socket = io(serverURL, { transports: ["websocket"] });

        socket.on("connect", () => {
            onlineMode = true;
            appendSystemChat("Sunucuya bağlanıldı: " + socket.id);
            requestTablesFromServer();
        });

        socket.on("disconnect", () => {
            onlineMode = false;
            appendSystemChat("Sunucu bağlantısı kesildi.");
        });

        /* Sunucudan masa listesi */
        socket.on("tables:list", (tables) => {
            state.tables = tables || [];
            renderTables();
        });

        /* Yeni masa eklendi */
        socket.on("tables:created", (table) => {
            const exists = state.tables.find(t => t.id === table.id);
            if (!exists) {
                state.tables.push(table);
                renderTables();
            }
        });

        /* Masa güncellendi (oyuncu sayısı vb.) */
        socket.on("tables:updated", (table) => {
            const idx = state.tables.findIndex(t => t.id === table.id);
            if (idx !== -1) {
                state.tables[idx] = table;
                renderTables();
            }
        });

        /* Oyun içi sohbet */
        socket.on("chat:message", (payload) => {
            appendChatMessage(payload.name, payload.text);
        });

        /* Oyun hamlesi (atılan taş vb.) */
        socket.on("game:discard", (payload) => {
            const discard = document.getElementById("openDiscard");
            if (discard) discard.textContent = payload.tile;
            appendSystemChat(payload.name + " taş attı: " + payload.tile);
        });

    } catch (err) {
        console.error(err);
        appendSystemChat("Sunucuya bağlanılamadı.");
    }
}

/* =========================
   SUNUCUDAN MASA LİSTESİ İSTE
========================= */

function requestTablesFromServer() {
    if (!socket || !onlineMode) return;
    socket.emit("tables:list");
}

/* =========================
   MASA OLUŞTUR (ONLINE VARSA SUNUCUYA)
========================= */

const __createTable_v2 = createTable;
createTable = function () {

    const name = document.getElementById("newTableName").value;
    const rounds = document.getElementById("newTableRound").value;

    if (!name || !rounds) {
        alert("Bilgileri doldur.");
        return;
    }

    if (onlineMode && socket) {
        socket.emit("tables:create", {
            name,
            rounds,
            owner: state.playerName
        });
        closeCreateModal();
    } else {
        __createTable_v2();
    }
};

/* =========================
   MASAYA KATIL (ONLINE VARSA SUNUCUYA)
========================= */

const __joinTable_v3 = joinTable;
joinTable = function (tableId) {

    if (onlineMode && socket) {
        socket.emit("tables:join", {
            tableId,
            player: state.playerName
        });
    } else {
        __joinTable_v3(tableId);
    }
};

/* =========================
   SOHBET GÖNDER (ONLINE)
========================= */

const __sendChatBtn = document.getElementById("sendChatBtn");
if (__sendChatBtn) {

    __sendChatBtn.addEventListener("click", () => {

        const input = document.getElementById("chatInput");
        if (!input.value.trim()) return;

        if (onlineMode && socket) {
            socket.emit("chat:message", {
                name: state.playerName,
                text: input.value
            });
            input.value = "";
        }
    });
}

function appendChatMessage(name, text) {
    const area = document.getElementById("chatMessages");
    if (!area) return;

    const msg = document.createElement("div");
    msg.className = "chatMsg";
    msg.textContent = name + ": " + text;

    area.appendChild(msg);
    area.scrollTop = area.scrollHeight;
}

/* =========================
   OYUN HAMLESİ GÖNDER (ÖRNEK: TAŞ AT)
========================= */

const discardAreaOnline = document.getElementById("openDiscard");
if (discardAreaOnline) {

    discardAreaOnline.addEventListener("dblclick", () => {

        const selected = document.querySelector(".tile.selected");
        if (!selected) return;

        const tileVal = selected.textContent;

        if (onlineMode && socket) {
            socket.emit("game:discard", {
                name: state.playerName,
                tile: tileVal
            });
            selected.remove();
        }
    });
}

/* =========================
   İSTEĞE BAĞLI: OTOMATİK BAĞLANMA DÜĞMESİ EKLE
========================= */

const topBar = document.getElementById("topBar");
if (topBar) {
    const btn = document.createElement("button");
    btn.textContent = "Canlıya Bağlan";
    btn.style.marginLeft = "10px";
    btn.onclick = () => connectOnline();
    document.getElementById("accountButtons").appendChild(btn);
}
