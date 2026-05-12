// --- 1. VARIABLE DOM INITIALIZATIONS ---
const canvas = document.getElementById('paintCanvas');
const ctx = canvas.getContext('2d');
const aquarium = document.getElementById('aquarium');
const clearBtn = document.getElementById('clearBtn');
const submitBtn = document.getElementById('submitBtn');
const stickerBtns = document.querySelectorAll('.sticker-btn');

let isDrawing = false;
let currentSticker = null;

ctx.lineCap = 'round';
ctx.lineJoin = 'round';
ctx.lineWidth = 6;
ctx.strokeStyle = '#ff758c'; 

// --- 2. SECTION ROUTING CONTROLLER ---
const navButtons = document.querySelectorAll('.nav-btn');
const pageSections = document.querySelectorAll('.page-section');

navButtons.forEach(button => {
    button.addEventListener('click', () => {
        navButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        pageSections.forEach(section => section.classList.remove('active'));
        
        const targetPageId = button.dataset.target;
        const targetPage = document.getElementById(targetPageId);
        if (targetPage) {
            targetPage.classList.add('active');
        }
    });
});

// --- 3. FREEHAND CANVAS DRAWING INTERACTION ---
canvas.addEventListener('mousedown', (e) => {
    if (currentSticker) {
        stampSticker(e.offsetX, e.offsetY);
    } else {
        isDrawing = true;
        ctx.beginPath();
        ctx.moveTo(e.offsetX, e.offsetY);
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing || currentSticker) return;
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
});

window.addEventListener('mouseup', () => isDrawing = false);

// --- 4. STICKER DRAWER SELECTION INTERACTION ---
stickerBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        if (btn.classList.contains('active')) {
            btn.classList.remove('active');
            currentSticker = null;
        } else {
            stickerBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSticker = btn.dataset.emoji;
        }
    });
});

function stampSticker(x, y) {
    ctx.font = '36px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(currentSticker, x, y);
}

// --- 5. CANVAS RESET CONTROLS ---
clearBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// --- 6. ANIMATION EXPORTER ENGINE (RELEASE TO AQUARIUM) ---
submitBtn.addEventListener('click', () => {
    const drawingDataUrl = canvas.toDataURL();
    const blank = document.createElement('canvas');
    blank.width = canvas.width;
    blank.height = canvas.height;
    
    if (canvas.toDataURL() === blank.toDataURL()) {
        alert("Draw or stamp something pretty first! 🌸");
        return;
    }

    createSwimmingFish(drawingDataUrl);
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
});

// --- 7. GALLERY UPLOAD CONNECTION ---
const galleryInput = document.getElementById('galleryInput');

if (galleryInput) {
    galleryInput.addEventListener('change', function(e) {
        const file = e.target.files;
        if (!file || file.length === 0) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                stickerBtns.forEach(b => b.classList.remove('active'));
                currentSticker = null;
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                let scale = Math.min(canvas.width / img.width, canvas.height / img.height);
                let x = (canvas.width / 2) - (img.width / 2) * scale;
                let y = (canvas.height / 2) - (img.height / 2) * scale;
                
                ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
                makeCanvasBackgroundTransparent();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file[0]);
    });
}

// --- 8. SMART BACKGROUND TRANSPARENCY SCANNER ---
function makeCanvasBackgroundTransparent() {
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    const targetR = data[0];
    const targetG = data[1];
    const targetB = data[2];
    const threshold = 110; 

    for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        let distanceToBg = Math.sqrt(
            Math.pow(r - targetR, 2) + Math.pow(g - targetG, 2) + Math.pow(b - targetB, 2)
        );
        let distanceToWhite = Math.sqrt(
            Math.pow(r - 255, 2) + Math.pow(g - 255, 2) + Math.pow(b - 255, 2)
        );

        if (distanceToBg < threshold || distanceToWhite < 90) {
            data[i + 3] = 0; 
        }
    }
    ctx.putImageData(imgData, 0, 0);
}

// --- 9. 3D HALL PERSPECTIVE MOUSE TRACKING ENGINE ---
const container = document.getElementById('aquarium-container');
const hallBackground = document.getElementById('aquarium');

if (container && hallBackground) {
    container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        hallBackground.style.transform = `translateX(${x * -25}px) translateY(${y * -25}px) rotateY(${x * 5}deg) rotateX(${y * -5}deg)`;
    });

    container.addEventListener('mouseleave', () => {
        hallBackground.style.transform = 'translateX(0px) translateY(0px) rotateY(0deg) rotateX(0deg)';
    });
}

// --- 10. EXHIBITION HOUSING ALLOCATION ---
const displayZones = ['.column-tank', '.wall-bubble-1', '.wall-bubble-2'];
let zoneCounter = 0;

function createSwimmingFish(src) {
    const mainTank = document.querySelector('.main-glass-tank');
    if (mainTank) {
        const swimFish = document.createElement('img');
        swimFish.src = src;
        swimFish.className = 'swimming-art';
        
        let posY = Math.floor(Math.random() * (mainTank.clientHeight - 60));
        swimFish.style.top = posY + 'px';
        
        let posX = -60;
        mainTank.appendChild(swimFish);
        
        let speed = 0.6 + Math.random() * 0.8;
        function swimHallTank() {
            if (!swimFish.parentNode) return;
            posX += speed;
            swimFish.style.left = posX + 'px';
            if (posX > mainTank.clientWidth) {
                posX = -60;
                posY = Math.floor(Math.random() * (mainTank.clientHeight - 60));
                swimFish.style.top = posY + 'px';
            }
            requestAnimationFrame(swimHallTank);
        }
        swimHallTank();
    }

    const currentZoneClass = displayZones[zoneCounter % displayZones.length];
    const targetZone = document.querySelector(currentZoneClass);
    if (targetZone) {
        targetZone.innerHTML = ''; 
        const artPiece = document.createElement('img');
        artPiece.src = src;
        artPiece.className = 'exhibit-art';
        targetZone.appendChild(artPiece);
    }
    zoneCounter++;
}
