// ======================== API Service ========================
const API_BASE = "https://ali8537291-server-bot.hf.space";

class ApiService {
    static async fetchData(endpoint) {
        try {
            const res = await fetch(`${API_BASE}${endpoint}`);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return await res.json();
        } catch (error) {
            console.error("API Fetch Error:", error);
            // يمكن إظهار رسالة خطأ للمستخدم هنا
            return null;
        }
    }

    static getHome() { return this.fetchData("/home"); }
    static getDetails(id) { return this.fetchData(`/details/${id}`); }
    static search(query) { return this.fetchData(`/search?q=${encodeURIComponent(query)}`); }
    static extract(url) { return this.fetchData(`/extract?url=${encodeURIComponent(url)}`); }
}

// ======================== UI Manager ========================
class UIManager {
    static loader = document.getElementById('appLoader');

    static showLoader() { this.loader?.classList.add('active'); }
    static hideLoader() { this.loader?.classList.remove('active'); }

    // إنشاء بطاقة فلم
    static createCard(item) {
        const card = document.createElement('div');
        card.className = 'movie-card';
        card.onclick = () => window.location.href = `details.html?id=${item.id}`;
        card.innerHTML = `
            <img src="${item.poster_path}" alt="${item.title}" loading="lazy">
            <div class="card-title">${item.title || item.name}</div>
        `;
        return card;
    }

    // عرض الصفوف في الرئيسية
    static renderRows(container, data) {
        const fragment = document.createDocumentFragment();
        
        // أحدث الإضافات
        if (data.latest) {
            const section = document.createElement('section');
            section.innerHTML = '<h2 class="section-title">🔥 الأكثر مشاهدة</h2>';
            const row = document.createElement('div');
            row.className = 'movies-row';
            data.latest.forEach(item => row.appendChild(this.createCard(item)));
            section.appendChild(row);
            fragment.appendChild(section);
        }

        // مختارات
        if (data.choosed) {
            const section = document.createElement('section');
            section.innerHTML = '<h2 class="section-title">✨ مختارات FaselHD</h2>';
            const row = document.createElement('div');
            row.className = 'movies-row';
            data.choosed.forEach(item => row.appendChild(this.createCard(item)));
            section.appendChild(row);
            fragment.appendChild(section);
        }

        // موصى به
        if (data.recommended) {
            const section = document.createElement('section');
            section.innerHTML = '<h2 class="section-title">🎯 موصى به لك</h2>';
            const row = document.createElement('div');
            row.className = 'movies-row';
            data.recommended.forEach(item => row.appendChild(this.createCard(item)));
            section.appendChild(row);
            fragment.appendChild(section);
        }

        container.appendChild(fragment);
    }

    // تحديث الهيرو
    static updateHero(item) {
        if (!item) return;
        document.querySelector('.hero-backdrop').style.backgroundImage = `url(${item.backdrop_path})`;
        document.getElementById('heroTitle').innerText = item.title || item.name;
        document.getElementById('heroDesc').innerText = item.overview?.slice(0, 150) + '...';
        document.getElementById('heroWatchBtn').onclick = () => window.location.href = `details.html?id=${item.id}`;
    }
}

// ======================== App Controller ========================
class App {
    constructor() {
        this.initHomePage();
        this.initMenu();
        this.initSearch();
    }

    async initHomePage() {
        if (!document.getElementById('homeSections')) return;
        
        UIManager.showLoader();
        const data = await ApiService.getHome();
        
        if (data) {
            // عرض أول عنصر في الهيرو
            const heroItem = data.latest?.[0] || data.choosed?.[0];
            UIManager.updateHero(heroItem);
            
            // عرض الصفوف
            UIManager.renderRows(document.getElementById('homeSections'), data);
        }
        UIManager.hideLoader();
    }

    initMenu() {
        const menu = document.getElementById('sideMenu');
        const toggleBtn = document.getElementById('menuToggle');
        const closeBtn = document.getElementById('closeMenuBtn');
        const backdrop = document.querySelector('.menu-backdrop');

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                menu.classList.add('open');
            });
        }
        
        const closeMenu = () => menu.classList.remove('open');
        closeBtn?.addEventListener('click', closeMenu);
        backdrop?.addEventListener('click', closeMenu);
        
        // فلترة (مثال بسيط)
        document.getElementById('moviesFilterBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            alert('جاري تطبيق فلتر الأفلام');
            closeMenu();
        });
    }

    initSearch() {
        const searchToggle = document.getElementById('searchToggle');
        const overlay = document.getElementById('searchOverlay');
        const closeBtn = document.getElementById('closeSearchBtn');
        const input = document.getElementById('searchInput');
        const resultsDiv = document.getElementById('searchResults');

        if (!searchToggle) return;

        searchToggle.addEventListener('click', () => {
            overlay.classList.add('active');
            input.focus();
        });

        closeBtn.addEventListener('click', () => {
            overlay.classList.remove('active');
            input.value = '';
            resultsDiv.innerHTML = '';
        });

        let debounceTimer;
        input.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            const query = e.target.value.trim();
            
            if (query.length < 2) {
                resultsDiv.innerHTML = '';
                return;
            }

            debounceTimer = setTimeout(async () => {
                UIManager.showLoader();
                const data = await ApiService.search(query);
                resultsDiv.innerHTML = '';
                
                const items = data?.search || data || [];
                items.forEach(item => {
                    if (item.poster_path) {
                        resultsDiv.appendChild(UIManager.createCard(item));
                    }
                });
                UIManager.hideLoader();
            }, 500);
        });
        
        // إغلاق البحث عند النقر خارج النتائج (اختياري)
    }
}

// ======================== Details Page Logic ========================
if (window.location.pathname.includes('details')) {
    (async () => {
        UIManager.showLoader();
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        
        if (!id) return;
        
        const data = await ApiService.getDetails(id);
        if (!data) return;

        // ملء البيانات
        document.getElementById('detailBackdrop').src = data.backdrop_path;
        document.getElementById('detailPoster').src = data.poster_path;
        document.getElementById('detailTitle').innerText = data.title || data.name;
        document.getElementById('detailOverview').innerText = data.overview;
        document.getElementById('detailYear').innerText = data.release_date?.split('-')[0] || '';
        document.getElementById('detailRating').innerHTML = `⭐ ${data.vote_average?.toFixed(1) || '0.0'}`;
        
        // السيرفرات
        const serversDiv = document.getElementById('serversList');
        data.videos?.forEach(video => {
            const btn = document.createElement('button');
            btn.className = 'server-btn';
            btn.innerText = `🎬 ${video.server}`;
            
            btn.onclick = async () => {
                if (video.link.includes('fasel')) {
                    UIManager.showLoader();
                    const links = await ApiService.extract(video.link);
                    UIManager.hideLoader();
                    
                    if (links && links.length) {
                        const modal = document.getElementById('qualityContainer');
                        modal.innerHTML = '';
                        links.forEach(link => {
                            let quality = 'Auto';
                            if (link.includes('1080')) quality = '1080p';
                            else if (link.includes('720')) quality = '720p';
                            else if (link.includes('480')) quality = '480p';
                            
                            const qBtn = document.createElement('button');
                            qBtn.className = 'quality-btn';
                            qBtn.innerText = quality;
                            qBtn.onclick = () => window.location.href = `player.html?url=${encodeURIComponent(link)}`;
                            modal.appendChild(qBtn);
                        });
                        modal.classList.add('active');
                    }
                } else {
                    window.location.href = `player.html?url=${encodeURIComponent(video.link)}`;
                }
            };
            
            serversDiv.appendChild(btn);
        });

        UIManager.hideLoader();
    })();
}

// تشغيل التطبيق
if (document.getElementById('mainContent')) {
    new App();
}