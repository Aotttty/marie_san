document.addEventListener('DOMContentLoaded', function() {
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
    
    // ヒーローセクションのパララックス効果
    const heroSection = document.querySelector('.hero-section');
    const layers = document.querySelectorAll('.hero-image-layer');
    
    heroSection.addEventListener('mousemove', function(e) {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        
        layers.forEach(layer => {
            const speed = layer.getAttribute('data-speed');
            const x = (window.innerWidth - mouseX * 100 * speed);
            const y = (window.innerHeight - mouseY * 100 * speed);
            
            layer.style.transform = `translate(${mouseX * 50 * speed}px, ${mouseY * 50 * speed}px)`;
        });
    });
    
    // スクロールアニメーションの制御
    const animatedElements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right');
    
    function checkElements() {
        const triggerBottom = window.innerHeight * 0.8;
        
        animatedElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            
            if (elementTop < triggerBottom) {
                element.classList.add('active');
            }
        });
    }
    
    // 初期チェック
    checkElements();
    
    // スクロール時に要素をチェック
    window.addEventListener('scroll', checkElements);
    
    // ギャラリーフィルターの制御
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // アクティブなボタンを更新
            filterButtons.forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
            
            const filterValue = this.getAttribute('data-filter');
            
            galleryItems.forEach(item => {
                if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                    item.style.display = 'block';
                    
                    // アニメーションをリセットして再実行
                    item.classList.remove('fade-in');
                    void item.offsetWidth; // リフロー
                    item.classList.add('fade-in');
                    item.style.animationDelay = '0.1s';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
    
    // ギャラリーモーダルの制御
    const galleryModal = document.querySelector('.gallery-modal');
    const modalImage = document.getElementById('modal-image');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    const modalClose = document.querySelector('.modal-close');
    
    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            const itemImage = this.querySelector('img').src;
            const itemTitle = this.querySelector('h3').textContent;
            const itemDescription = this.querySelector('p').textContent;
            
            modalImage.src = itemImage;
            modalTitle.textContent = itemTitle;
            modalDescription.textContent = itemDescription;
            
            galleryModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    });
    
    modalClose.addEventListener('click', function() {
        galleryModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
    
    window.addEventListener('click', function(e) {
        if (e.target === galleryModal) {
            galleryModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    // Supabase連携の準備（後から接続するための初期化用関数）
    function initSupabase() {
        // Supabase初期化（後から追加）
        // const supabaseUrl = 'YOUR_SUPABASE_URL';
        // const supabaseKey = 'YOUR_SUPABASE_KEY';
        // const supabase = supabaseClient.createClient(supabaseUrl, supabaseKey);
        
        console.log('Supabase連携の準備ができています。APIキーを設定してください。');
    }
    
    // Xウィジェット埋め込み用の関数（後からAPI接続するための準備）
    function loadTwitterWidget() {
        // X (Twitter) APIが利用可能な場合に読み込む
        // if (typeof twttr !== 'undefined') {
        //     twttr.widgets.load();
        // } else {
        //     console.log('Twitter APIが読み込まれていません');
        // }
        console.log('Twitter埋め込みウィジェットは後から接続してください。');
    }
    
    // コンテンツの動的ロード用関数（後からSupabaseで実装）
    async function loadContent() {
        // Supabase連携後に実装
        // 1. ギャラリー作品のロード
        // 2. プロフィール情報のロード
        // 3. 最新情報のロード
        
        console.log('Supabase連携後にコンテンツを動的にロードします。');
    }
    
    // 将来的な機能のための初期化
    initSupabase();
    loadTwitterWidget();
});

// Supabaseとの連携用関数（後から実装）
const initSupabaseClient = () => {
    // Supabase初期化と認証
    // const { createClient } = supabase;
    // const supabaseUrl = 'https://hhdegucsmvfxaodlduih.supabase.co';
    // const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoZGVndWNzbXZmeGFvZGxkdWloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg3NTgzOTEsImV4cCI6MjA1NDMzNDM5MX0.05w73Ped0g38r4a1bxgFCpz_ks2ddx2E6h9BhK_7Jv0';
    // const supabase = createClient(supabaseUrl, supabaseKey);
    
    return {
        // ギャラリー作品の取得
        getGalleryItems: async () => {
            // return await supabase
            //     .from('Works')
            //     .select('*')
            //     .order('created_at', { ascending: false });
            
            console.log('ギャラリー作品取得関数が呼び出されました');
            return [];
        },
        
        // 最新情報の取得
        getLatestNews: async () => {
            // return await supabase
            //     .from('News')
            //     .select('*')
            //     .order('date', { ascending: false })
            //     .limit(5);
            
            console.log('最新情報取得関数が呼び出されました');
            return [];
        },
        
        // プロフィール情報の取得
        getProfileInfo: async () => {
            // return await supabase
            //     .from('Admins')
            //     .select('*')
            //     .single();
            
            console.log('プロフィール情報取得関数が呼び出されました');
            return {};
        }
    };
};

// 後から実装するコンテンツ描画関数
function renderGalleryItems(items) {
    const galleryGrid = document.querySelector('.gallery-grid');
    
    // galleryGrid.innerHTML = '';
    
    // items.forEach(item => {
    //     const galleryItem = document.createElement('div');
    //     galleryItem.className = 'gallery-item';
    //     galleryItem.setAttribute('data-category', item.category);
    //     
    //     // アイテム内容を設定
    //     galleryItem.innerHTML = `
    //         <div class="gallery-image">
    //             <img src="${item.image_url}" alt="${item.title}">
    //         </div>
    //         <div class="gallery-item-overlay">
    //             <h3>${item.title}</h3>
    //             <p>${item.description}</p>
    //         </div>
    //     `;
    //     
    //     galleryGrid.appendChild(galleryItem);
    // });
    
    console.log('ギャラリーアイテム描画関数が呼び出されました');
}

function renderLatestNews(news) {
    const newsContainer = document.querySelector('.news-items');
    
    // newsContainer.innerHTML = '';
    
    // news.forEach(item => {
    //     const newsItem = document.createElement('div');
    //     newsItem.className = 'news-item';
    //     
    //     // 日付のフォーマット
    //     const date = new Date(item.date);
    //     const formattedDate = `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}`;
    //     
    //     newsItem.innerHTML = `
    //         <div class="news-date">${formattedDate}</div>
    //         <div class="news-content">${item.content}</div>
    //     `;
    //     
    //     newsContainer.appendChild(newsItem);
    // });
    
    console.log('最新情報描画関数が呼び出されました');
}

function updateProfileInfo(profile) {
    // if (profile) {
    //     document.querySelector('.profile-name h3').textContent = profile.name;
    //     document.querySelector('.profile-bio').innerHTML = profile.bio;
    //     
    //     // SNSリンクの更新
    //     const twitterLink = document.querySelector('.profile-social a:first-child');
    //     const instagramLink = document.querySelector('.profile-social a:last-child');
    //     
    //     if (profile.twitter) {
    //         twitterLink.href = profile.twitter;
    //     }
    //     
    //     if (profile.instagram) {
    //         instagramLink.href = profile.instagram;
    //     }
    //     
    //     // プロフィール画像の更新
    //     if (profile.image_url) {
    //         document.querySelector('.profile-image img').src = profile.image_url;
    //     }
    // }
    
    console.log('プロフィール情報更新関数が呼び出されました');
}