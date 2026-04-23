// player.js
const params = new URLSearchParams(location.search);
const url = params.get('url');
const videoElement = document.getElementById('mainVideo');
const container = document.getElementById('videoContainer');

if (!url) {
    container.innerHTML = '<div class="video-error">❌ رابط المشاهدة غير صحيح</div>';
} else {
    // التعامل مع الروابط المضمنة
    if (url.includes('embed') || url.includes('youtube') || url.includes('vimeo')) {
        const iframe = document.createElement('iframe');
        iframe.src = url;
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;
        container.innerHTML = '';
        container.appendChild(iframe);
    } 
    // التعامل مع HLS
    else if (url.includes('.m3u8')) {
        if (Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(url);
            hls.attachMedia(videoElement);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                videoElement.play().catch(e => console.log('Autoplay prevented'));
            });
            hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                    switch(data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            console.error('Network error, trying to recover...');
                            hls.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            console.error('Media error, trying to recover...');
                            hls.recoverMediaError();
                            break;
                        default:
                            console.error('Fatal error, cannot recover');
                            container.innerHTML = '<div class="video-error">⚠️ خطأ في تشغيل البث</div>';
                            break;
                    }
                }
            });
        } else {
            videoElement.src = url;
        }
    } 
    // روابط عادية MP4
    else {
        videoElement.src = url;
        videoElement.play().catch(() => {});
    }
}

// إخفاء عناصر التحكم بعد فترة
let timeout;
document.body.addEventListener('mousemove', () => {
    clearTimeout(timeout);
    document.body.style.cursor = 'default';
    timeout = setTimeout(() => {
        document.body.style.cursor = 'none';
    }, 3000);
});