document.addEventListener('DOMContentLoaded', function() {
    // Supabaseクライアントの初期化
    const { createClient } = supabase;
    const supabaseClient = createClient(
        'https://hhdegucsmvfxaodlduih.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoZGVndWNzbXZmeGFvZGxkdWloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg3NTgzOTEsImV4cCI6MjA1NDMzNDM5MX0.05w73Ped0g38r4a1bxgFCpz_ks2ddx2E6h9BhK_7Jv0'
    );

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
            // tittle は誤字かもしれませんが、実際のテーブル設計に合わせます
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
                // プロフィール名の更新（ナビゲーションと複数箇所）
                document.querySelectorAll('.logo h2, .profile-name h3, .footer-logo h3').forEach(el => {
                    el.textContent = admin.name;
                });
                
                // プロフィール画像の更新
                const profileImg = document.querySelector('.profile-image img');
                if (profileImg && admin.image_url) {
                    profileImg.src = admin.image_url;
                    profileImg.alt = `${admin.name}のプロフィール画像`;
                }
                
                // 自己紹介文の更新（HTMLとして解釈して段落を適切に処理）
                const bioContainer = document.querySelector('.profile-bio');
                if (bioContainer && admin.bio) {
                    // 単純な改行をpタグで分割
                    bioContainer.innerHTML = admin.bio
                        .split('\n')
                        .filter(paragraph => paragraph.trim())
                        .map(paragraph => `<p>${paragraph}</p>`)
                        .join('');
                }
                
                // SNSリンクの更新
                const twitterLinks = document.querySelectorAll('a[href*="twitter"], a[href*="X"]');
                const instagramLinks = document.querySelectorAll('a[href*="instagram"]');
                
                if (admin.twitter) {
                    twitterLinks.forEach(link => {
                        link.href = admin.twitter;
                    });
                }
                
                if (admin.instagram) {
                    instagramLinks.forEach(link => {
                        link.href = admin.instagram;
                    });
                }
                
                // フッターの著作権表示も更新
                const copyright = document.querySelector('.copyright p');
                if (copyright) {
                    copyright.textContent = `© ${new Date().getFullYear()} ${admin.name}. All Rights Reserved.`;
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

            if (!clients || clients.length === 0) {
                clientContainer.innerHTML = `
                    <div class="client-logo">
                        <div class="placeholder-logo">取引実績はまだありません</div>
                    </div>
                `;
                return;
            }

            clientContainer.innerHTML = '';
            clients.forEach(client => {
                const clientLogo = document.createElement('div');
                clientLogo.className = 'client-logo';
                
                if (client.logo_url) {
                    clientLogo.innerHTML = `<img src="${client.logo_url}" alt="${client.name}">`;
                } else {
                    clientLogo.innerHTML = `<div class="placeholder-logo">${client.name}</div>`;
                }
                
                clientContainer.appendChild(clientLogo);
            });
        } catch (error) {
            console.error('Error loading clients:', error);
            clientContainer.innerHTML = `
                <div class="client-logo">
                    <div class="placeholder-logo">データの読み込みに失敗しました</div>
                </div>
            `;
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

            if (!works || works.length === 0) {
                galleryGrid.innerHTML = `
                    <div class="gallery-item">
                        <div class="gallery-image">
                            <div style="display: flex; justify-content: center; align-items: center; height: 100%; background-color: #f5f5f5;">
                                <p>作品はまだ登録されていません</p>
                            </div>
                        </div>
                    </div>
                `;
                return;
            }

            galleryGrid.innerHTML = '';
            works.forEach((work, index) => {
                // アニメーションのディレイを少しずつずらす
                const delay = index * 0.1;
                
                const workItem = document.createElement('div');
                workItem.className = 'gallery-item';
                workItem.setAttribute('data-category', work.category || 'other');
                workItem.style.animationDelay = `${delay}s`;
                
                workItem.innerHTML = `
                    <div class="gallery-image">
                        <img src="${work.image_url || 'https://placehold.co/400x500?text=No+Image'}" alt="${work.title || '無題の作品'}">
                    </div>
                    <div class="gallery-item-overlay">
                        <h3>${work.title || '無題'}</h3>
                        <p>${work.description || ''}</p>
                    </div>
                `;
                
                // クリックでモーダル表示処理を追加
                workItem.addEventListener('click', function() {
                    const modal = document.querySelector('.gallery-modal');
                    const modalImage = document.getElementById('modal-image');
                    const modalTitle = document.getElementById('modal-title');
                    const modalDescription = document.getElementById('modal-description');
                    
                    modalImage.src = work.image_url || 'https://placehold.co/800x600?text=No+Image';
                    modalTitle.textContent = work.title || '無題';
                    modalDescription.textContent = work.description || '';
                    
                    modal.style.display = 'block';
                });
                
                galleryGrid.appendChild(workItem);
            });
            
            // ギャラリーフィルター機能
            const filterButtons = document.querySelectorAll('.filter-btn');
            filterButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const filterValue = this.getAttribute('data-filter');
                    
                    // アクティブクラスの切り替え
                    filterButtons.forEach(btn => btn.classList.remove('active'));
                    this.classList.add('active');
                    
                    // 作品のフィルタリング
                    const galleryItems = document.querySelectorAll('.gallery-item');
                    galleryItems.forEach(item => {
                        if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                            item.style.display = 'block';
                        } else {
                            item.style.display = 'none';
                        }
                    });
                });
            });
            
            // モーダル閉じるボタン
            const modalClose = document.querySelector('.modal-close');
            if (modalClose) {
                modalClose.addEventListener('click', function() {
                    document.querySelector('.gallery-modal').style.display = 'none';
                });
            }
            
        } catch (error) {
            console.error('Error loading works:', error);
            galleryGrid.innerHTML = `
                <div class="gallery-item">
                    <div class="gallery-image">
                        <div style="display: flex; justify-content: center; align-items: center; height: 100%; background-color: #f5f5f5;">
                            <p>データの読み込みに失敗しました</p>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    // 受付状況の取得（オプション）
    async function loadStatus() {
        const statusIndicator = document.querySelector('.status-indicator');
        if (!statusIndicator) return;
        
        try {
            const { data: status, error } = await supabaseClient
                .from('Status')
                .select('is_accepting, message')
                .single();
                
            if (error) throw error;
            
            if (status) {
                statusIndicator.className = status.is_accepting 
                    ? 'status-indicator open' 
                    : 'status-indicator closed';
                    
                const statusText = statusIndicator.querySelector('p');
                if (statusText) {
                    statusText.textContent = status.is_accepting 
                        ? '受付中' 
                        : '受付停止中';
                }
                
                // メッセージがあれば表示
                if (status.message) {
                    const statusDetails = document.querySelector('.status-details');
                    if (statusDetails) {
                        statusDetails.innerHTML = `<p>${status.message}</p>`;
                    }
                }
            }
        } catch (error) {
            console.error('Error loading status:', error);
        }
    }

    // パララックス効果
    function initParallax() {
        const layers = document.querySelectorAll('.hero-image-layer');
        
        window.addEventListener('mousemove', function(e) {
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;
            
            layers.forEach(layer => {
                const speed = layer.getAttribute('data-speed');
                const moveX = (x - 0.5) * speed * 100;
                const moveY = (y - 0.5) * speed * 100;
                
                layer.style.transform = `translate(${moveX}px, ${moveY}px)`;
            });
        });
    }

    // データの読み込みを実行
    loadNews();
    loadProfile();
    loadClients();
    loadWorks();
    loadStatus(); // オプション：受付状況テーブルがあれば
    initParallax();

    // ナビゲーションの制御
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-item');
    
    // ハンバーガーメニューのトグル
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }
    
    // ナビゲーションアイテムクリック時の処理
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            if (hamburger) hamburger.classList.remove('active');
            if (navLinks) navLinks.classList.remove('active');
            
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
});