document.addEventListener('DOMContentLoaded', function() {
    // Supabaseクライアントの初期化
    const { createClient } = supabase;
    const supabaseClient = createClient(
        'https://hhdegucsmvfxaodlduih.supabase.co',
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoZGVndWNzbXZmeGFvZGxkdWloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg3NTgzOTEsImV4cCI6MjA1NDMzNDM5MX0.05w73Ped0g38r4a1bxgFCpz_ks2ddx2E6h9BhK_7Jv0");

    // 最新情報の取得と表示（Newsテーブル）
    async function loadNews() {
        const newsContainer = document.querySelector('.news-items');
        if (!newsContainer) return;

        // ローディング表示
        newsContainer.innerHTML = `
            <div class="news-item">
                <div class="news-content">データを読み込んでいます...</div>
            </div>
        `;

        try {
            console.log('Supabaseに接続を試みています...');
            const { data: news, error } = await supabaseClient
                .from('News')
                .select('tittle, created_at')
                .order('created_at', { ascending: false })
                .limit(5);

            if (error) {
                console.error('Supabaseエラー:', error);
                throw error;
            }

            console.log('取得したニュース:', news);

            if (!news || news.length === 0) {
                newsContainer.innerHTML = `
                    <div class="news-item">
                        <div class="news-content">最新情報はありません。</div>
                    </div>
                `;
                return;
            }

            // データを表示
            newsContainer.innerHTML = '';　　
            news.forEach(item => {
                const date = new Date(item.created_at);
                const formattedDate = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
                
                const newsItem = document.createElement('div');
                newsItem.className = 'news-item';
                newsItem.innerHTML = `
                    <div class="news-date">${formattedDate}</div>
                    <div class="news-content">${item.tittle}</div>
                `;
                newsContainer.appendChild(newsItem);
            });

        } catch (error) {
            console.error('Error loading news:', error);
            newsContainer.innerHTML = `
                <div class="news-item">
                    <div class="news-content">データの読み込みに失敗しました。エラー: ${error.message}</div>
                </div>
            `;
        }
    }

    // プロフィール情報の取得と表示（Adminsテーブル）
    async function loadProfile() {
        try {
            const { data: admin, error } = await supabaseClient
                .from('Admins')
                .select('name, bio, image_url, twitter, instagram')
                .single();

            if (error) throw error;

            if (admin) {
                // プロフィール名の更新
                document.querySelector('.profile-name h3').textContent = admin.name;
                // プロフィール画像の更新
                document.querySelector('.profile-image img').src = admin.image_url;
                // 自己紹介文の更新
                document.querySelector('.profile-bio').innerHTML = admin.bio;
                // SNSリンクの更新
                if (admin.twitter) {
                    document.querySelector('.profile-social a[class*="twitter"]').href = admin.twitter;
                }
                if (admin.instagram) {
                    document.querySelector('.profile-social a[class*="instagram"]').href = admin.instagram;
                }
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    }

    // 取引実績の取得と表示（Clientsテーブル）
    async function loadClients() {
        const clientContainer = document.querySelector('.client-logos');
        if (!clientContainer) return;

        try {
            const { data: clients, error } = await supabaseClient
                .from('Clients')
                .select('name, logo_url');

            if (error) throw error;

            clientContainer.innerHTML = '';
            clients.forEach(client => {
                const clientLogo = document.createElement('div');
                clientLogo.className = 'client-logo';
                clientLogo.innerHTML = `
                    ${client.logo_url 
                        ? `<img src="${client.logo_url}" alt="${client.name}">`
                        : `<div class="placeholder-logo">${client.name}</div>`
                    }
                `;
                clientContainer.appendChild(clientLogo);
            });
        } catch (error) {
            console.error('Error loading clients:', error);
        }
    }

    // ギャラリー作品の取得と表示（Worksテーブル）
    async function loadWorks() {
        const galleryGrid = document.querySelector('.gallery-grid');
        if (!galleryGrid) return;

        try {
            const { data: works, error } = await supabaseClient
                .from('Works')
                .select('title, description, image_url, category');

            if (error) throw error;

            galleryGrid.innerHTML = '';
            works.forEach(work => {
                const workItem = document.createElement('div');
                workItem.className = 'gallery-item';
                workItem.setAttribute('data-category', work.category);
                workItem.innerHTML = `
                    <div class="gallery-image">
                        <img src="${work.image_url}" alt="${work.title}">
                    </div>
                    <div class="gallery-item-overlay">
                        <h3>${work.title}</h3>
                        <p>${work.description}</p>
                    </div>
                `;
                galleryGrid.appendChild(workItem);
            });
        } catch (error) {
            console.error('Error loading works:', error);
        }
    }

    // データの読み込みを実行
    loadNews();
    loadProfile();
    loadClients();
    loadWorks();

    // ナビゲーションの制御
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-item');
    
    // ハンバーガーメニューのトグル
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
    
    // ナビゲーションアイテムクリック時の処理
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            
            // アクティブなナビアイテムを更新
            navItems.forEach(navItem => {
                navItem.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
    
    // スクロール位置に基づいてナビゲーションの表示を制御
    window.addEventListener('scroll', function() {
        const header = document.querySelector('header');
        
        if (window.scrollY > 50) {
            header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
            header.style.boxShadow = 'none';
        }
        
        // 表示中のセクションに対応するナビアイテムをアクティブにする
        const sections = document.querySelectorAll('section');
        const scrollPosition = window.scrollY + 200;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                document.querySelectorAll('.nav-item').forEach(item => {
                    item.classList.remove('active');
                    if (item.getAttribute('href') === `#${sectionId}`) {
                        item.classList.add('active');
                    }
                });
            }
        });
    });
    
    // その他の機能は必要に応じて追加
}); 