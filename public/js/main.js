document.addEventListener('DOMContentLoaded', function() {
    // Supabaseクライアントの初期化
    const { createClient } = supabase;
    const supabaseClient = createClient(
        'https://hhdegucsmvfxaodlduih.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoZGVndWNzbXZmeGFvZGxkdWloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTAzOTg5MjAsImV4cCI6MjAyNTk3NDkyMH0.05w73Ped0g38r4a1bxgFCpz_ks2ddx2E6h9BhK_7Jv0'
    );

    // 最新情報の取得と表示
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
                .from('news')
                .select('content, created_at')
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
                    <div class="news-content">${item.content}</div>
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

    // 最新情報を読み込む
    loadNews();

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