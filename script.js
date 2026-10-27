const video = document.getElementById('webcam');
const captureBtn = document.getElementById('capture-btn');
const hiddenCanvas = document.getElementById('hidden-canvas');
const cameraSection = document.getElementById('camera-section');
const gameSection = document.getElementById('game-section');
const puzzleBoard = document.getElementById('puzzle-board');
const restartBtn = document.getElementById('restart-btn');
const statusMsg = document.getElementById('status-msg');

let currentPieces = []; // เก็บตำแหน่งชิ้นส่วนปัจจุบัน
let originalPieces = []; // เก็บตำแหน่งที่ถูกต้อง
let selectedTile = null; // ชิ้นที่ถูกเลือกตัวแรก

// 1. เปิดใช้งานกล้อง webcam
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 300, height: 300, facingMode: "user" }
        });
        video.srcObject = stream;
    } catch (err) {
        alert("ไม่สามารถเข้าถึงกล้องได้ กรุณาอนุญาตสิทธิ์ใช้งานกล้อง");
    }
}
startCamera();

// 2. ถ่ายรูป & ตัดรูปเป็น 3x3
captureBtn.addEventListener('click', () => {
    const ctx = hiddenCanvas.getContext('2d');
    hiddenCanvas.width = 300;
    hiddenCanvas.height = 300;
    ctx.drawImage(video, 0, 0, 300, 300);

    // สลับหน้าจอ
    cameraSection.classList.add('hidden');
    gameSection.classList.remove('hidden');

    createJigsawPieces();
});

// 3. สร้างชิ้นส่วนจิ๊กซอว์ 9 ชิ้น
function createJigsawPieces() {
    puzzleBoard.innerHTML = '';
    originalPieces = [];

    const tileSize = 100; // 300px / 3

    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            const tileCanvas = document.createElement('canvas');
            tileCanvas.width = tileSize;
            tileCanvas.height = tileSize;
            const tileCtx = tileCanvas.getContext('2d');

            // ตัดภาพเฉพาะส่วนนั้นๆ จากภาพใหญ่
            tileCtx.drawImage(
                hiddenCanvas,
                col * tileSize, row * tileSize, tileSize, tileSize,
                0, 0, tileSize, tileSize
            );

            const pieceData = {
                id: row * 3 + col, // รหัสตำแหน่งที่ถูกต้อง (0-8)
                dataUrl: tileCanvas.toDataURL()
            };

            originalPieces.push(pieceData);
        }
    }

    // สุ่มตำแหน่งจิ๊กซอว์ (Shuffle)
    currentPieces = [...originalPieces].sort(() => Math.random() - 0.5);
    renderBoard();
}

// 4. แสดงผลบอร์ดเกม
function renderBoard() {
    puzzleBoard.innerHTML = '';
    currentPieces.forEach((piece, index) => {
        const div = document.createElement('div');
        div.className = 'tile';
        div.style.backgroundImage = `url(${piece.dataUrl})`;
        div.dataset.index = index;

        div.addEventListener('click', () => onTileClick(index, div));
        puzzleBoard.appendChild(div);
    });
}

// 5. ระบบคลิกเลือกเพื่อสลับตำแหน่งชิ้นส่วน
function onTileClick(index, element) {
    if (selectedTile === null) {
        selectedTile = index;
        element.classList.add('selected');
    } else if (selectedTile === index) {
        // คลิกซ้ำที่เดิม = ยกเลิกการเลือก
        element.classList.remove('selected');
        selectedTile = null;
    } else {
        // สลับ 2 ชิ้น
        const prevIndex = selectedTile;
        [currentPieces[prevIndex], currentPieces[index]] = [currentPieces[index], currentPieces[prevIndex]];
        selectedTile = null;
        renderBoard();
        checkWin();
    }
}

// 6. ตรวจสอบว่าต่อเสร็จหรือยัง
function checkWin() {
    const isCorrect = currentPieces.every((piece, idx) => piece.id === idx);
    if (isCorrect) {
        statusMsg.innerText = "🎉 ยินดีด้วย! คุณต่อจิ๊กซอว์สำเร็จแล้ว!";
        statusMsg.style.color = "#00b894";
        statusMsg.style.fontWeight = "bold";
    }
}

// 7. ปุ่มเริ่มถ่ายใหม่
restartBtn.addEventListener('click', () => {
    gameSection.classList.add('hidden');
    cameraSection.classList.remove('hidden');
    statusMsg.innerText = "คลิกเลือก 2 ชิ้นเพื่อสลับตำแหน่งกัน ให้รูปสมบูรณ์!";
    statusMsg.style.color = "#2d3436";
});