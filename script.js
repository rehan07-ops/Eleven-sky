// ELEVEN SKY - Core JavaScript
console.log('%cELEVEN SKY initialized', 'color: #a855f7; font-size: 16px;');

let currentUser = null;

// Mock Firebase Config - Replace with real
const firebaseConfig = {
    // Your Firebase config here
};

// WebRTC Setup
let localStream;
let peerConnection;

async function startVideoCall() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user' },
            audio: true
        });
        const videoElement = document.getElementById('localVideo');
        if (videoElement) videoElement.srcObject = localStream;
        console.log('Camera and mic accessed');
    } catch (err) {
        console.error('Error accessing media:', err);
    }
}

// Camera flip
let isFrontCamera = true;
async function flipCamera() {
    if (!localStream) return;
    isFrontCamera = !isFrontCamera;
    localStream.getTracks().forEach(track => track.stop());
    localStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: isFrontCamera ? 'user' : 'environment' },
        audio: true
    });
    // Update video
}

// AI Filter Mock
function applyFilter(filterType) {
    console.log(`Applying ${filterType} filter`);
    // In real, use canvas or WebGL for real-time filters
    document.getElementById('videoContainer').style.filter = filterType === 'beauty' ? 'brightness(1.1) saturate(1.2)' : 'none';
}

// Bottom Dock Interactions
document.addEventListener('DOMContentLoaded', () => {
    // Add event listeners for buttons
    const buttons = document.querySelectorAll('.dock-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.add('active');
            setTimeout(() => btn.classList.remove('active'), 300);
        });
    });

    // Gesture simulation - double tap for hearts
    const videoArea = document.getElementById('video-area');
    if (videoArea) {
        let tapCount = 0;
        videoArea.addEventListener('click', () => {
            tapCount++;
            if (tapCount === 2) {
                createFloatingHearts();
                tapCount = 0;
            }
            setTimeout(() => tapCount = 0, 400);
        });
    }
});

function createFloatingHearts() {
    for (let i = 0; i < 8; i++) {
        const heart = document.createElement('div');
        heart.textContent = '❤️';
        heart.style.position = 'absolute';
        heart.style.left = Math.random() * 100 + '%';
        heart.style.bottom = '20%';
        heart.style.fontSize = '2rem';
        heart.style.opacity = '0.9';
        heart.style.transition = 'all 2s ease-out';
        document.body.appendChild(heart);
        
        setTimeout(() => {
            heart.style.transform = `translateY(-${300 + Math.random() * 200}px)`;
            heart.style.opacity = '0';
        }, 50);
        
        setTimeout(() => heart.remove(), 2500);
    }
}

// Full implementation
let localStream = null;
let isMicOn = true;
let isCamOn = true;
let isRecording = false;
let mediaRecorder;
let recordedChunks = [];
let timerInterval;
let seconds = 0;

function startVideoCall() {
    navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: true
    }).then(stream => {
        localStream = stream;
        const localVideo = document.getElementById('localVideo');
        if (localVideo) localVideo.srcObject = stream;
        
        // Mock remote (for demo)
        const remoteVideo = document.getElementById('remoteVideo');
        if (remoteVideo) remoteVideo.src = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
    }).catch(err => {
        console.error("Media access error:", err);
        alert("Please allow camera and microphone access");
    });
}

function toggleMic() {
    if (!localStream) return;
    isMicOn = !isMicOn;
    localStream.getAudioTracks()[0].enabled = isMicOn;
    const btn = document.getElementById('mic-btn');
    if (btn) btn.style.opacity = isMicOn ? '1' : '0.4';
}

function toggleCamera() {
    if (!localStream) return;
    isCamOn = !isCamOn;
    localStream.getVideoTracks()[0].enabled = isCamOn;
    const btn = document.getElementById('cam-btn');
    if (btn) btn.style.opacity = isCamOn ? '1' : '0.4';
}

let facingMode = 'user';
async function flipCamera() {
    if (!localStream) return;
    facingMode = facingMode === 'user' ? 'environment' : 'user';
    localStream.getTracks().forEach(track => track.stop());
    
    try {
        localStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: facingMode },
            audio: true
        });
        const localVideo = document.getElementById('localVideo');
        if (localVideo) localVideo.srcObject = localStream;
    } catch (e) {
        console.error(e);
    }
}

function toggleFilters() {
    const drawer = document.getElementById('filters-drawer');
    if (drawer) drawer.classList.toggle('hidden');
}

function toggleChat() {
    const chat = document.getElementById('chat-overlay');
    if (chat) chat.classList.toggle('hidden');
}

function sendMessage() {
    const input = document.getElementById('chat-input');
    const messages = document.getElementById('chat-messages');
    if (!input || !messages || !input.value.trim()) return;
    
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message self';
    msgDiv.textContent = input.value;
    messages.appendChild(msgDiv);
    messages.scrollTop = messages.scrollHeight;
    input.value = '';
}

function startRecording() {
    if (!localStream || isRecording) return;
    isRecording = true;
    recordedChunks = [];
    mediaRecorder = new MediaRecorder(localStream);
    
    mediaRecorder.ondataavailable = e => recordedChunks.push(e.data);
    mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'eleven-sky-recording.webm';
        a.click();
    };
    
    mediaRecorder.start();
    document.getElementById('record-btn').classList.add('recording');
    
    // Timer
    seconds = 0;
    timerInterval = setInterval(() => {
        seconds++;
        const display = `${Math.floor(seconds/60).toString().padStart(2,'0')}:${(seconds%60).toString().padStart(2,'0')}`;
        const timerEl = document.getElementById('timer');
        if (timerEl) timerEl.textContent = display;
    }, 1000);
}

function endCall() {
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }
    if (timerInterval) clearInterval(timerInterval);
    window.location.href = 'index.html';
}

function applyFilter(btn) {
    const filter = btn.dataset.filter;
    const mainVideo = document.querySelector('.main-video');
    if (!mainVideo) return;
    
    let cssFilter = '';
    switch(filter) {
        case 'glow': cssFilter = 'brightness(1.15) saturate(1.3)'; break;
        case 'smooth': cssFilter = 'contrast(1.1) brightness(1.05)'; break;
        case 'cartoon': cssFilter = 'contrast(1.4) saturate(1.6)'; break;
        default: cssFilter = 'none';
    }
    mainVideo.style.filter = cssFilter;
    console.log(`Applied filter: ${filter}`);
}

// Double tap hearts
document.addEventListener('DOMContentLoaded', () => {
    startVideoCall();
    
    const videoArea = document.querySelector('.video-wrapper');
    if (videoArea) {
        let lastTap = 0;
        videoArea.addEventListener('click', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            if (tapLength < 500 && tapLength > 0) {
                createFloatingHearts(e.clientX, e.clientY);
            }
            lastTap = currentTime;
        });
    }
});

function createFloatingHearts(x, y) {
    for (let i = 0; i < 12; i++) {
        const heart = document.createElement('div');
        heart.innerHTML = '❤️';
        heart.style.position = 'fixed';
        heart.style.left = `${x + (Math.random() * 80 - 40)}px`;
        heart.style.top = `${y}px`;
        heart.style.fontSize = `${1.2 + Math.random() * 1.8}rem`;
        heart.style.zIndex = '1000';
        heart.style.pointerEvents = 'none';
        heart.style.transition = 'all 2.2s cubic-bezier(0.4, 0, 1, 1)';
        document.body.appendChild(heart);
        
        setTimeout(() => {
            heart.style.transform = `translateY(-${280 + Math.random()*180}px) translateX(${Math.random()*60 - 30}px)`;
            heart.style.opacity = '0';
        }, 30);
        
        setTimeout(() => heart.remove(), 2800);
    }
}

// PWA & other enhancements
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}
function toggleChat() {
    const chatPanel = document.getElementById('chat-panel');
    if (chatPanel) chatPanel.classList.toggle('active');
}

// PWA Service Worker registration
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(() => {
        console.log('Service Worker Registered');
    });
}
