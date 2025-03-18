document.addEventListener('DOMContentLoaded', function() {
    // Supabaseクライアントの初期化
    const { createClient } = supabase;
    const supabaseClient = createClient(
        'https://hhdegucsmvfxaodlduih.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoZGVndWNzbXZmeGFvZGxkdWloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg3NTgzOTEsImV4cCI6MjA1NDMzNDM5MX0.05w73Ped0g38r4a1bxgFCpz_ks2ddx2E6h9BhK_7Jv0'
    );

    // デバッグ用：テーブル一覧を取得して確認
    async function listTables() {
        try {
            console.log('テーブル一覧を確認中...');
            const { data, error } = await supabaseClient.rpc('get_tables');
            if (error) {
                console.error('テーブル一覧取得エラー:', error);
            } else {
                console.log('利用可能なテーブル:', data);
            }
        } catch (err) {
            console.error('テーブル一覧取得例外:', err);
        }
    }

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
            console.log('Newsテーブルに接続を試みています...');
            
            // まずテーブルが存在するか確認
            const { data: tables, error: tableError } = await supabaseClient
                .from('information_schema.tables')
                .select('table_name')
                .eq('table_schema', 'public');
            
            if (tableError) {
                console.error('テーブル情報取得エラー:', tableError);
            } else {
                console.log('利用可能なテーブル:', tables.map(t => t.table_name));
            }
            
            // データ取得を試みる
            const { data: news, error } = await supabaseClient
                .from('News') // テーブル名は小文字で試す
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5);

            if (error) {
                console.error('Newsテーブルエラー:', error);
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

            // データを表示（カラム名の代替を考慮）
            newsContainer.innerHTML = '';
            news.forEach(item => {
                const date = new Date(item.created_at);
                const formattedDate = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
                
                // コンテンツは tittle または title または content を優先的に使用
                const content = item.tittle || item.title || item.content || '情報なし';
                
                const newsItem = document.createElement('div');
                newsItem.className = 'news-item';
                newsItem.innerHTML = `
                    <div class="news-date">${formattedDate}</div>
                    <div class="news-content">${content}</div>
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
            console.log('Adminsテーブルに接続を試みています...');
            
            const { data: admin, error } = await supabaseClient
                .from('Admins') 
                .select('*')
                .limit(1)
                .single();

            if (error) {
                console.error('Adminsテーブルエラー:', error);
                throw error;
            }

            console.log('取得したプロフィール:', admin);

            if (admin) {
                // プロフィール名の更新（ナビゲーションと複数箇所）
                const nameElements = document.querySelectorAll('.logo h2, .profile-name h3, .footer-logo h3');
                nameElements.forEach(el => {
                    if (el) el.textContent = admin.name || 'Illustrator Name';
                });
                
                // プロフィール画像の更新
                const profileImg = document.querySelector('.profile-image img');
                if (profileImg && admin.image_url) {
                    profileImg.src = admin.image_url;
                    profileImg.alt = `${admin.name || 'イラストレーター'}のプロフィール画像`;
                }
                
                // 自己紹介文の更新
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
                        if (link) link.href = admin.twitter;
                    });
                }
                
                if (admin.instagram) {
                    instagramLinks.forEach(link => {
                        if (link) link.href = admin.instagram;
                    });
                }
                
                // フッターの著作権表示も更新
                const copyright = document.querySelector('.copyright p');
                if (copyright) {
                    copyright.textContent = `© ${new Date().getFullYear()} ${admin.name || 'Illustrator Name'}. All Rights Reserved.`;
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
            console.log('Clientsテーブルに接続を試みています...');
            
            const { data: clients, error } = await supabaseClient
                .from('Clients') // テーブル名は小文字で試す
                .select('*');

            if (error) {
                console.error('Clientsテーブルエラー:', error);
                throw error;
            }

            console.log('取得したクライアント:', clients);

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
                
                // name プロパティの存在を確認
                const clientName = client.name || client.client_name || 'Client';
                
                // logo_url プロパティの存在を確認
                const logoUrl = client.logo_url || client.logo || null;
                
                if (logoUrl) {
                    clientLogo.innerHTML = `<img src="${logoUrl}" alt="${clientName}">`;
                } else {
                    clientLogo.innerHTML = `<div class="placeholder-logo">${clientName}</div>`;
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
            console.log('Worksテーブルに接続を試みています...');
            
            // 最初にいくつかの異なるテーブル名を試す
            let works = null;
            let error = null;
            
            // 1. 'works' テーブルを試す
            const result1 = await supabaseClient
                .from('Works')
                .select('*');
                
            if (!result1.error) {
                works = result1.data;
                console.log("'Works'テーブルから取得成功:", works);
            } else {
                console.log("'Works'テーブル取得エラー:", result1.error);
                
                // 2. 'Works' テーブルを試す (大文字始まり)
                const result2 = await supabaseClient
                    .from('Works')
                    .select('*');
                    
                if (!result2.error) {
                    works = result2.data;
                    console.log("'Works'テーブルから取得成功:", works);
                } else {
                    console.log("'Works'テーブル取得エラー:", result2.error);
                    
                    // 3. 'gallery' テーブルを試す (別名の可能性)
                    const result3 = await supabaseClient
                        .from('gallery')
                        .select('*');
                        
                    if (!result3.error) {
                        works = result3.data;
                        console.log("'gallery'テーブルから取得成功:", works);
                    } else {
                        error = result2.error; // 最後に試したエラーを保持
                        console.log("'gallery'テーブル取得エラー:", result3.error);
                    }
                }
            }

            // データがない場合や取得に失敗した場合
            if (error) {
                console.error('Worksテーブルエラー:', error);
                throw error;
            }

            if (!works || works.length === 0) {
                // ダミーデータを使用して表示（デモ用）
                console.log('作品データが取得できないため、ダミーデータを使用します');
                works = [
                    {
                        title: 'サンプル作品1',
                        description: 'オリジナル作品のサンプルです',
                        image_url: 'https://via.placeholder.com/400x500',
                        category: 'original'
                    },
                    {
                        title: 'サンプル作品2',
                        description: 'ファンアートのサンプルです',
                        image_url: 'https://via.placeholder.com/400x400',
                        category: 'fanart'
                    },
                    {
                        title: 'サンプル作品3',
                        description: '商業イラストのサンプルです',
                        image_url: 'https://via.placeholder.com/400x600',
                        category: 'commercial'
                    }
                ];
            }

            galleryGrid.innerHTML = '';
            works.forEach((work, index) => {
                // アニメーションのディレイを少しずつずらす
                const delay = index * 0.1;
                
                const workItem = document.createElement('div');
                workItem.className = 'gallery-item';
                
                // カラム名の代替を考慮
                const category = work.category || work.work_category || 'other';
                const title = work.title || work.work_title || '無題';
                const description = work.description || work.work_description || '';
                const imageUrl = work.image_url || work.work_image || work.image || 'https://via.placeholder.com/400x500?text=No+Image';
                
                workItem.setAttribute('data-category', category);
                workItem.style.animationDelay = `${delay}s`;
                
                workItem.innerHTML = `
                    <div class="gallery-image">
                        <img src="${imageUrl}" alt="${title}">
                    </div>
                    <div class="gallery-item-overlay">
                        <h3>${title}</h3>
                        <p>${description}</p>
                    </div>
                `;
                
                // クリックでモーダル表示処理を追加
                workItem.addEventListener('click', function() {
                    const modal = document.querySelector('.gallery-modal');
                    const modalImage = document.getElementById('modal-image');
                    const modalTitle = document.getElementById('modal-title');
                    const modalDescription = document.getElementById('modal-description');
                    
                    if (modal && modalImage && modalTitle && modalDescription) {
                        modalImage.src = imageUrl;
                        modalTitle.textContent = title;
                        modalDescription.textContent = description;
                        
                        modal.style.display = 'block';
                    }
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
                    const modal = document.querySelector('.gallery-modal');
                    if (modal) modal.style.display = 'none';
                });
            }
            
        } catch (error) {
            console.error('Error loading works:', error);
            galleryGrid.innerHTML = `
                <div class="gallery-item">
                    <div class="gallery-image">
                        <div style="display: flex; justify-content: center; align-items: center; height: 100%; background-color: #f5f5f5;">
                            <p>データの読み込みに失敗しました。ダミーデータを使用します。</p>
                        </div>
                    </div>
                </div>
            `;
            
            // エラー時にもダミーデータを表示
            setTimeout(() => {
                const dummyWorks = [
                    {
                        title: 'エラー回避用サンプル1',
                        description: 'オリジナル作品のサンプルです',
                        image_url: 'https://via.placeholder.com/400x500',
                        category: 'original'
                    },
                    {
                        title: 'エラー回避用サンプル2',
                        description: 'ファンアートのサンプルです',
                        image_url: 'https://via.placeholder.com/400x400',
                        category: 'fanart'
                    },
                    {
                        title: 'エラー回避用サンプル3',
                        description: '商業イラストのサンプルです',
                        image_url: 'https://via.placeholder.com/400x600',
                        category: 'commercial'
                    }
                ];
                
                galleryGrid.innerHTML = '';
                dummyWorks.forEach((work, index) => {
                    const delay = index * 0.1;
                    
                    const workItem = document.createElement('div');
                    workItem.className = 'gallery-item';
                    workItem.setAttribute('data-category', work.category);
                    workItem.style.animationDelay = `${delay}s`;
                    
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
            }, 1000);
        }
    }

    // 受付状況の取得（オプション）
    async function loadStatus() {
        const statusIndicator = document.querySelector('.status-indicator');
        if (!statusIndicator) return;
        
        try {
            console.log('Statusテーブルに接続を試みています...');
            
            const { data: status, error } = await supabaseClient
                .from('status') // テーブル名は小文字で試す
                .select('*')
                .limit(1)
                .single();
                
            if (error) {
                console.error('Statusテーブルエラー:', error);
                // エラー時はデフォルト値を設定
                statusIndicator.className = 'status-indicator open';
                const statusText = statusIndicator.querySelector('p');
                if (statusText) statusText.textContent = '受付中';
                return;
            }
            
            console.log('取得した受付状況:', status);
            
            if (status) {
                // is_accepting または accepting プロパティの存在を確認
                const isAccepting = status.is_accepting !== undefined ? status.is_accepting : 
                                  (status.accepting !== undefined ? status.accepting : true);
                                  
                statusIndicator.className = isAccepting 
                    ? 'status-indicator open' 
                    : 'status-indicator closed';
                    
                const statusText = statusIndicator.querySelector('p');
                if (statusText) {
                    statusText.textContent = isAccepting 
                        ? '受付中' 
                        : '受付停止中';
                }
                
                // メッセージがあれば表示
                const message = status.message || status.status_message || null;
                if (message) {
                    const statusDetails = document.querySelector('.status-details');
                    if (statusDetails) {
                        statusDetails.innerHTML = `<p>${message}</p>`;
                    }
                }
            }
        } catch (error) {
            console.error('Error loading status:', error);
            // エラー時はデフォルト値を設定
            statusIndicator.className = 'status-indicator open';
            const statusText = statusIndicator.querySelector('p');
            if (statusText) statusText.textContent = '受付中';
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

    // データベース情報を確認するための関数
    async function checkDatabaseSchema() {
        try {
            console.log('データベーススキーマを確認中...');
            
            // テーブル一覧を取得
            const { data: tables, error: tablesError } = await supabaseClient
                .from('information_schema.tables')
                .select('table_name')
                .eq('table_schema', 'public');
                
            if (tablesError) {
                console.error('テーブル一覧取得エラー:', tablesError);
            } else {
                console.log('利用可能なテーブル:', tables.map(t => t.table_name));
                
                // 各テーブルのカラム情報を取得
                for (const table of tables) {
                    const { data: columns, error: columnsError } = await supabaseClient
                        .from('information_schema.columns')
                        .select('column_name, data_type')
                        .eq('table_schema', 'public')
                        .eq('table_name', table.table_name);
                        
                    if (columnsError) {
                        console.error(`${table.table_name}のカラム情報取得エラー:`, columnsError);
                    } else {
                        console.log(`${table.table_name}のカラム:`, columns.map(c => `${c.column_name} (${c.data_type})`));
                    }
                }
            }
        } catch (err) {
            console.error('データベーススキーマ確認エラー:', err);
        }
    }

    // まず、データベーススキーマ情報を確認
    checkDatabaseSchema();
    
    // その後、データの読み込みを実行
    listTables();
    loadNews();
    loadProfile();
    loadClients();
    loadWorks();
    loadStatus();
    initParallax();

    // ナビゲーションの制御
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-item');
    
    // ハンバーガーメニューのトグル
    if (hamburger && navLinks) {
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
        if (!header) return;
        
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