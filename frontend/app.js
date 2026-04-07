// 全局变量存储所有景点数据
let allSpots = [];
// 存储所有路线数据
let allItineraries = [];
// 存储所有标签
let allTags = [];
// 存储选中的标签
let selectedTags = [];
// 存储收藏的景点ID
let favoriteSpots = [];
// 存储最近看过的景点ID
let recentlyViewed = [];
// 存储当前排序方式
let currentSort = 'default';

// 存储所有新闻数据
let allNews = [];
// 标记新闻数据是否已加载
let newsLoaded = false;
// 标记路线数据是否已加载
let itinerariesLoaded = false;
// 存储当前路线
let currentItinerary = null;

// ==================== 核心修复：根据目录结构修正路径 ====================
// 异步获取景点数据 ✅ 路径：根目录 spots.json
async function fetchSpots() {
    try {
        const response = await fetch('./spots.json?v=' + Date.now());
        const data = await response.json();
        allSpots = data.spots;
        // 提取所有标签
        extractTags();
        // 渲染标签
        renderTags();
        // 从localStorage加载收藏状态
        loadFavorites();
        // 初始化搜索功能
        initSearch();
        // 初始化重置按钮
        initResetButton();
        // 初始化排序功能
        initSort();
        // 初始化Modal
        initModal();
        // 渲染景点
        filterAndRenderSpots();
        // 渲染收藏夹
        renderFavorites();
    } catch (error) {
        console.error('Error fetching spots:', error);
    }
}

// 异步获取路线数据 ✅ 路径：根目录 itineraries.json
async function fetchItineraries() {
    try {
        const response = await fetch('./itineraries.json?v=' + Date.now());
        const data = await response.json();
        console.log('Itineraries data received:', data);
        console.log('itineraries array:', data.itineraries);
        allItineraries = data.itineraries;
        itinerariesLoaded = true;
        // 渲染路线
        renderItineraries();
    } catch (error) {
        console.error('Error fetching itineraries:', error);
    }
}

// 异步获取新闻数据 ✅ 核心修改：加载 shanghai_news_2026.json（10条数据）
async function fetchNews() {
    try {
        // 🔥 现在加载正确的数据文件，不再用 news.json
        const response = await fetch('./shanghai_news_2026.json?v=' + Date.now());
        const data = await response.json();
        allNews = data.news; // 加载完整的10条数据
        newsLoaded = true;
        
        // 同步渲染魔都动态页面
        if (document.getElementById('news-view').style.display === 'block') {
            renderNewsList();
        }
        renderNews();
    } catch (error) {
        console.error('Error fetching news:', error);
        // 兜底：避免页面空白
        allNews = [];
        newsLoaded = true;
        renderNews();
    }
}

// ==================== 以下为功能函数（已修复所有图片路径） ====================
function extractTags() {
    const tagsSet = new Set();
    allSpots.forEach(spot => {
        spot.tags.forEach(tag => {
            tagsSet.add(tag);
        });
    });
    allTags = Array.from(tagsSet);
}

function renderTags() {
    const container = document.getElementById('tags-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    allTags.forEach(tag => {
        const tagButton = document.createElement('button');
        tagButton.className = 'tag-button';
        tagButton.textContent = tag;
        tagButton.addEventListener('click', () => toggleTag(tag, tagButton));
        container.appendChild(tagButton);
    });
}

function toggleTag(tag, button) {
    const index = selectedTags.indexOf(tag);
    if (index === -1) {
        selectedTags.push(tag);
        button.classList.add('active');
    } else {
        selectedTags.splice(index, 1);
        button.classList.remove('active');
    }
    filterAndRenderSpots();
}

function initSearch() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
}

function handleSearch(e) {
    filterAndRenderSpots();
}

function filterAndRenderSpots() {
    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const filteredSpots = filterSpots(searchTerm, selectedTags);
    const sortedSpots = sortSpots(filteredSpots);
    renderSpots(sortedSpots);
}

function filterSpots(searchTerm, tags) {
    return allSpots.filter(spot => {
        const name = spot.name.toLowerCase();
        const city = spot.city.toLowerCase();
        const matchesSearch = !searchTerm || name.includes(searchTerm) || city.includes(searchTerm);
        
        const matchesTags = tags.length === 0 || tags.every(tag => spot.tags.includes(tag));
        
        return matchesSearch && matchesTags;
    });
}

function initResetButton() {
    const resetButton = document.getElementById('reset-button');
    if (resetButton) {
        resetButton.addEventListener('click', resetFilters);
    }
}

function resetFilters() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.value = '';
    }
    
    selectedTags = [];
    
    currentSort = 'default';
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.value = 'default';
    }
    
    renderTags();
    filterAndRenderSpots();
}

function loadFavorites() {
    const savedFavorites = localStorage.getItem('favoriteSpots');
    if (savedFavorites) {
        favoriteSpots = JSON.parse(savedFavorites);
    }
    
    const savedRecentlyViewed = localStorage.getItem('recentlyViewed');
    if (savedRecentlyViewed) {
        recentlyViewed = JSON.parse(savedRecentlyViewed);
    }
}

function saveFavorites() {
    localStorage.setItem('favoriteSpots', JSON.stringify(favoriteSpots));
    updateFavoriteCount();
}

function updateFavoriteCount() {
    const favoritesElement = document.getElementById('my-favorites');
    if (favoritesElement) {
        favoritesElement.textContent = `我的收藏 (${favoriteSpots.length})`;
    }
}

function saveRecentlyViewed() {
    localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
    renderRecentlyViewed();
}

// 渲染最近看过的景点 ✅ 修复图片路径
function renderRecentlyViewed() {
    const container = document.getElementById('recently-viewed');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (recentlyViewed.length === 0) {
        const noRecentElement = document.createElement('div');
        noRecentElement.className = 'no-recent';
        noRecentElement.textContent = '暂无近期浏览记录';
        container.appendChild(noRecentElement);
        return;
    }
    
    recentlyViewed.forEach(spotId => {
        const spot = allSpots.find(s => s.id === spotId);
        if (!spot) return;
        
        const itemElement = document.createElement('div');
        itemElement.className = 'recently-viewed-item';
        itemElement.dataset.spotId = spotId;
        
        // ✅ 正确路径：./img/ + 图片名
        const imageUrl = `./img/${spot.image}`;
        
        imageElement.src = imageUrl;
        imageElement.alt = spot.name;
        
        const infoElement = document.createElement('div');
        infoElement.className = 'recently-viewed-info';
        
        const nameElement = document.createElement('h4');
        nameElement.textContent = spot.name;
        
        const ratingElement = document.createElement('p');
        ratingElement.textContent = `评分: ${spot.rating.toFixed(1)}`;
        
        infoElement.appendChild(nameElement);
        infoElement.appendChild(ratingElement);
        itemElement.appendChild(imageElement);
        itemElement.appendChild(infoElement);
        
        itemElement.addEventListener('click', () => {
            openModal(spot);
            document.getElementById('user-dropdown').classList.remove('show');
        });
        
        container.appendChild(itemElement);
    });
}

function addToRecentlyViewed(spotId) {
    const index = recentlyViewed.indexOf(spotId);
    if (index !== -1) {
        recentlyViewed.splice(index, 1);
    }
    
    recentlyViewed.unshift(spotId);
    
    if (recentlyViewed.length > 5) {
        recentlyViewed.pop();
    }
    
    saveRecentlyViewed();
}

function toggleFavorite(spotId, button) {
    const index = favoriteSpots.indexOf(spotId);
    if (index === -1) {
        favoriteSpots.push(spotId);
        button.classList.add('favorite');
        button.textContent = '❤️';
    } else {
        favoriteSpots.splice(index, 1);
        button.classList.remove('favorite');
        button.textContent = '🤍';
    }
    saveFavorites();
    renderFavorites();
}

function initModal() {
    const modal = document.getElementById('spot-modal');
    const closeButton = modal?.querySelector('.close-button');
    
    if (closeButton) {
        closeButton.addEventListener('click', closeModal);
    }
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
}

// 打开 Modal 并填充数据 ✅ 修复图片路径
function openModal(spot) {
    addToRecentlyViewed(spot.id);
    
    const modal = document.getElementById('spot-modal');
    if (!modal) return;
    
    // ✅ 正确路径：./img/ + spot.image
    document.getElementById('modal-image').src = `./img/${spot.image}`;
    document.getElementById('modal-image').alt = spot.name;
    document.getElementById('modal-name').textContent = spot.name;
    
    const modalPrice = document.querySelector('.modal-price');
    if (spot.price === 0) {
        modalPrice.textContent = '免费';
        modalPrice.className = 'modal-price price-free';
    } else {
        modalPrice.textContent = `¥${spot.price}`;
        modalPrice.className = 'modal-price';
    }
    
    document.querySelector('.modal-rating').textContent = spot.rating.toFixed(1);
    document.getElementById('modal-description').textContent = spot.description;
    document.getElementById('modal-duration').textContent = `${spot.visit_minutes}分钟`;
    document.getElementById('modal-open-time').textContent = spot.open_time;
    
    const modalFavoriteButton = document.getElementById('modal-favorite-button');
    if (modalFavoriteButton) {
        const isFavorite = favoriteSpots.includes(spot.id);
        modalFavoriteButton.textContent = isFavorite ? '❤️' : '🤍';
        modalFavoriteButton.classList.toggle('favorite', isFavorite);
        
        const newButton = modalFavoriteButton.cloneNode(true);
        modalFavoriteButton.parentNode.replaceChild(newButton, modalFavoriteButton);
        
        newButton.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(spot.id, newButton);
        });
    }
    
    modal.style.display = 'block';
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

function closeModal() {
    const modal = document.getElementById('spot-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}

function initSort() {
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            filterAndRenderSpots();
        });
    }
}

function sortSpots(spots) {
    const sortedSpots = [...spots];
    
    switch (currentSort) {
        case 'rating-desc':
            sortedSpots.sort((a, b) => b.rating - a.rating);
            break;
        case 'rating-asc':
            sortedSpots.sort((a, b) => a.rating - b.rating);
            break;
        case 'price-asc':
            sortedSpots.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            sortedSpots.sort((a, b) => b.price - a.price);
            break;
    }
    
    return sortedSpots;
}

function renderSpots(spots) {
    const container = document.getElementById('spots-container');
    if (!container) return;

    container.innerHTML = '';

    if (spots.length === 0) {
        const noResult = document.createElement('div');
        noResult.className = 'no-result';
        noResult.innerHTML = `
            <div class="no-result-icon">🔍</div>
            <h3>未找到相关景点</h3>
            <p>请尝试使用其他关键词搜索</p>
        `;
        container.appendChild(noResult);
        return;
    }

    spots.forEach(spot => {
        const spotCard = createSpotCard(spot);
        container.appendChild(spotCard);
    });
}

// 创建景点卡片 ✅ 修复图片路径
function createSpotCard(spot) {
    const card = document.createElement('div');
    card.className = 'spot-card';

    let priceDisplay;
    if (spot.price === 0) {
        priceDisplay = '<span class="price-free">免费</span>';
    } else {
        priceDisplay = `<span class="price">¥${spot.price}</span>`;
    }

    const ratingDisplay = spot.rating.toFixed(1);
    const tagsHtml = spot.tags.map(tag => `<span class="spot-tag">${tag}</span>`).join(' ');
    const isFavorite = favoriteSpots.includes(spot.id);
    const favoriteIcon = isFavorite ? '❤️' : '🤍';

    card.setAttribute('data-spot-id', spot.id);
    // ✅ 正确路径：./img/ + spot.image
    card.innerHTML = `
        ${allNews.some(news => news.related_spot_id === spot.id) ? '<span class="hot-tag">🔥 近期热点</span>' : ''}
        <button class="favorite-button ${favoriteClass}" data-spot-id="${spot.id}">${favoriteIcon}</button>
        <div class="spot-image">
            <img src="./img/${spot.image}" alt="${spot.name}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1548266652-99cf277df5ca?w=800&h=450&fit=crop';">
        </div>
        <div class="spot-info">
            <div class="spot-header">
                <h3 class="spot-name">${spot.name}</h3>
                <span class="spot-city">${spot.city}</span>
            </div>
            <div class="spot-tags">
                ${tagsHtml}
            </div>
            <div class="spot-details">
                <div class="spot-rating-info">
                    <span class="spot-rating-label">评分：</span>
                    <span class="spot-rating">${ratingDisplay}</span>
                </div>
                <div class="spot-price-info">
                    <span class="spot-price-label">价格：</span>
                    ${priceDisplay}
                </div>
            </div>
            <div class="spot-open-time">
                <span class="spot-open-time-label">开放：</span>
                <span>${spot.open_time}</span>
            </div>
        </div>
    `;

    const favoriteButton = card.querySelector('.favorite-button');
    favoriteButton.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(spot.id, favoriteButton);
    });

    card.addEventListener('click', () => {
        openModal(spot);
    });

    return card;
}

function getFavoriteSpots() {
    return allSpots.filter(spot => favoriteSpots.includes(spot.id));
}

function renderFavorites() {
    // 此函数保留以确保兼容性
}

function initNavTabs() {
    const allSpotsTab = document.getElementById('all-spots-tab');
    const itinerariesTab = document.getElementById('itineraries-tab');
    const favoritesTab = document.getElementById('favorites-tab');
    const newsTab = document.getElementById('news-tab');
    const headerTitle = document.querySelector('.header h1');
