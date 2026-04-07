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

// 异步获取景点数据
async function fetchSpots() {
    try {
        const response = await fetch('../spots.json?v=' + Date.now());
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

// 异步获取路线数据
async function fetchItineraries() {
    try {
        const response = await fetch('../itineraries.json?v=' + Date.now());
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

// 异步获取新闻数据
async function fetchNews() {
    try {
        const response = await fetch('../news.json?v=' + Date.now());
        const data = await response.json();
        allNews = data.news;
        newsLoaded = true;
        // 渲染新闻
        renderNews();
    } catch (error) {
        console.error('Error fetching news:', error);
    }
}

// 提取所有标签并去重
function extractTags() {
    const tagsSet = new Set();
    allSpots.forEach(spot => {
        spot.tags.forEach(tag => {
            tagsSet.add(tag);
        });
    });
    allTags = Array.from(tagsSet);
}

// 渲染标签
function renderTags() {
    const container = document.getElementById('tags-container');
    container.innerHTML = '';
    
    allTags.forEach(tag => {
        const tagButton = document.createElement('button');
        tagButton.className = 'tag-button';
        tagButton.textContent = tag;
        tagButton.addEventListener('click', () => toggleTag(tag, tagButton));
        container.appendChild(tagButton);
    });
}

// 切换标签选中状态
function toggleTag(tag, button) {
    const index = selectedTags.indexOf(tag);
    if (index === -1) {
        // 选中标签
        selectedTags.push(tag);
        button.classList.add('active');
    } else {
        // 取消选中标签
        selectedTags.splice(index, 1);
        button.classList.remove('active');
    }
    // 重新过滤和渲染景点
    filterAndRenderSpots();
}

// 初始化搜索功能
function initSearch() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
}

// 处理搜索
function handleSearch(e) {
    filterAndRenderSpots();
}

// 过滤并渲染景点
function filterAndRenderSpots() {
    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const filteredSpots = filterSpots(searchTerm, selectedTags);
    const sortedSpots = sortSpots(filteredSpots);
    renderSpots(sortedSpots);
}

// 过滤景点
function filterSpots(searchTerm, tags) {
    return allSpots.filter(spot => {
        // 搜索关键词过滤
        const name = spot.name.toLowerCase();
        const city = spot.city.toLowerCase();
        const matchesSearch = !searchTerm || name.includes(searchTerm) || city.includes(searchTerm);
        
        // 标签过滤
        const matchesTags = tags.length === 0 || tags.every(tag => spot.tags.includes(tag));
        
        return matchesSearch && matchesTags;
    });
}

// 初始化重置按钮
function initResetButton() {
    const resetButton = document.getElementById('reset-button');
    if (resetButton) {
        resetButton.addEventListener('click', resetFilters);
    }
}

// 重置所有筛选条件
function resetFilters() {
    // 清空搜索输入
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.value = '';
    }
    
    // 清空选中的标签
    selectedTags = [];
    
    // 重置排序
    currentSort = 'default';
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.value = 'default';
    }
    
    // 重新渲染标签
    renderTags();
    
    // 恢复全量列表
    filterAndRenderSpots();
}

// 从localStorage加载收藏状态和最近看过的景点
function loadFavorites() {
    const savedFavorites = localStorage.getItem('favoriteSpots');
    if (savedFavorites) {
        favoriteSpots = JSON.parse(savedFavorites);
    }
    
    // 加载最近看过的景点
    const savedRecentlyViewed = localStorage.getItem('recentlyViewed');
    if (savedRecentlyViewed) {
        recentlyViewed = JSON.parse(savedRecentlyViewed);
    }
}

// 保存收藏状态到localStorage
function saveFavorites() {
    localStorage.setItem('favoriteSpots', JSON.stringify(favoriteSpots));
    // 更新收藏数量显示
    updateFavoriteCount();
}

// 更新收藏数量显示
function updateFavoriteCount() {
    const favoritesElement = document.getElementById('my-favorites');
    if (favoritesElement) {
        favoritesElement.textContent = `我的收藏 (${favoriteSpots.length})`;
    }
}

// 保存最近看过的景点到localStorage
function saveRecentlyViewed() {
    localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
    // 更新最近看过的显示
    renderRecentlyViewed();
}

// 渲染最近看过的景点
function renderRecentlyViewed() {
    const container = document.getElementById('recently-viewed');
    if (!container) return;
    
    // 清空容器
    container.innerHTML = '';
    
    if (recentlyViewed.length === 0) {
        // 显示无近期浏览记录
        const noRecentElement = document.createElement('div');
        noRecentElement.className = 'no-recent';
        noRecentElement.textContent = '暂无近期浏览记录';
        container.appendChild(noRecentElement);
        return;
    }
    
    // 遍历最近看过的景点ID
    recentlyViewed.forEach(spotId => {
        // 找到对应的景点数据
        const spot = allSpots.find(s => s.id === spotId);
        if (!spot) return;
        
        // 创建最近看过的景点元素
        const itemElement = document.createElement('div');
        itemElement.className = 'recently-viewed-item';
        itemElement.dataset.spotId = spotId;
        
        // 添加图片
        const imageElement = document.createElement('img');
        imageElement.src = '../' + spot.image;
        imageElement.alt = spot.name;
        
        // 添加信息
        const infoElement = document.createElement('div');
        infoElement.className = 'recently-viewed-info';
        
        const nameElement = document.createElement('h4');
        nameElement.textContent = spot.name;
        
        const ratingElement = document.createElement('p');
        ratingElement.textContent = `评分: ${spot.rating.toFixed(1)}`;
        
        // 组装元素
        infoElement.appendChild(nameElement);
        infoElement.appendChild(ratingElement);
        itemElement.appendChild(imageElement);
        itemElement.appendChild(infoElement);
        
        // 添加点击事件
        itemElement.addEventListener('click', () => {
            openModal(spot);
            // 关闭下拉菜单
            document.getElementById('user-dropdown').classList.remove('show');
        });
        
        // 添加到容器
        container.appendChild(itemElement);
    });
}

// 添加景点到最近看过的列表
function addToRecentlyViewed(spotId) {
    // 检查景点是否已经在列表中
    const index = recentlyViewed.indexOf(spotId);
    if (index !== -1) {
        // 如果在列表中，先移除它
        recentlyViewed.splice(index, 1);
    }
    
    // 将景点添加到列表开头
    recentlyViewed.unshift(spotId);
    
    // 限制列表长度为5个
    if (recentlyViewed.length > 5) {
        recentlyViewed.pop();
    }
    
    // 保存到localStorage
    saveRecentlyViewed();
}

// 切换景点的收藏状态
function toggleFavorite(spotId, button) {
    const index = favoriteSpots.indexOf(spotId);
    if (index === -1) {
        // 添加到收藏
        favoriteSpots.push(spotId);
        button.classList.add('favorite');
        button.textContent = '❤️';
    } else {
        // 从收藏中移除
        favoriteSpots.splice(index, 1);
        button.classList.remove('favorite');
        button.textContent = '🤍';
    }
    // 保存到localStorage
    saveFavorites();
    // 更新收藏夹显示
    renderFavorites();
}

// 初始化Modal
function initModal() {
    const modal = document.getElementById('spot-modal');
    const closeButton = document.querySelector('.close-button');
    
    // 点击关闭按钮关闭Modal
    if (closeButton) {
        closeButton.addEventListener('click', closeModal);
    }
    
    // 点击Modal外部关闭Modal
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
}

// 打开 Modal 并填充数据
function openModal(spot) {
    // 添加到最近看过的列表
    addToRecentlyViewed(spot.id);
    
    const modal = document.getElementById('spot-modal');
    if (!modal) return;
    
    // 填充 Modal 数据
    document.getElementById('modal-image').src = '../' + spot.image;
    document.getElementById('modal-image').alt = spot.name;
    document.getElementById('modal-name').textContent = spot.name;
    
    // 处理价格显示
    const modalPrice = document.querySelector('.modal-price');
    if (spot.price === 0) {
        modalPrice.textContent = '免费';
        modalPrice.className = 'modal-price price-free';
    } else {
        modalPrice.textContent = `¥${spot.price}`;
        modalPrice.className = 'modal-price';
    }
    
    // 处理评分显示
    document.querySelector('.modal-rating').textContent = spot.rating.toFixed(1);
    document.getElementById('modal-description').textContent = spot.description;
    document.getElementById('modal-duration').textContent = `${spot.visit_minutes}分钟`;
    document.getElementById('modal-open-time').textContent = spot.open_time;
    
    // 设置收藏按钮状态
    const modalFavoriteButton = document.getElementById('modal-favorite-button');
    if (modalFavoriteButton) {
        const isFavorite = favoriteSpots.includes(spot.id);
        if (isFavorite) {
            modalFavoriteButton.textContent = '❤️';
            modalFavoriteButton.classList.add('favorite');
        } else {
            modalFavoriteButton.textContent = '🤍';
            modalFavoriteButton.classList.remove('favorite');
        }
        
        // 移除旧的事件监听器（如果有）
        const newButton = modalFavoriteButton.cloneNode(true);
        modalFavoriteButton.parentNode.replaceChild(newButton, modalFavoriteButton);
        
        // 添加点击事件
        newButton.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(spot.id, newButton);
        });
    }
    
    // 显示 Modal
    modal.style.display = 'block';
    // 添加 show 类触发动画
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

// 关闭Modal
function closeModal() {
    const modal = document.getElementById('spot-modal');
    if (modal) {
        // 移除show类
        modal.classList.remove('show');
        // 等待动画完成后隐藏
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}

// 初始化排序功能
function initSort() {
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            filterAndRenderSpots();
        });
    }
}

// 对景点进行排序
function sortSpots(spots) {
    const sortedSpots = [...spots];
    
    switch (currentSort) {
        case 'rating-desc':
            // 按评分从高到低排序
            sortedSpots.sort((a, b) => b.rating - a.rating);
            break;
        case 'rating-asc':
            // 按评分从低到高排序
            sortedSpots.sort((a, b) => a.rating - b.rating);
            break;
        case 'price-asc':
            // 按价格从低到高排序
            sortedSpots.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            // 按价格从高到低排序
            sortedSpots.sort((a, b) => b.price - a.price);
            break;
        case 'default':
        default:
            // 默认排序（保持原顺序）
            break;
    }
    
    return sortedSpots;
}

// 渲染景点列表
function renderSpots(spots) {
    const container = document.getElementById('spots-container');
    container.innerHTML = '';

    if (spots.length === 0) {
        // 显示无结果提示
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

// 创建景点卡片
function createSpotCard(spot) {
    const card = document.createElement('div');
    card.className = 'spot-card';

    // 处理价格显示
    let priceDisplay;
    if (spot.price === 0) {
        priceDisplay = '<span class="price-free">免费</span>';
    } else {
        priceDisplay = `<span class="price">¥${spot.price}</span>`;
    }

    // 处理评分显示，保留1位小数
    const ratingDisplay = spot.rating.toFixed(1);

    // 生成标签HTML
    const tagsHtml = spot.tags.map(tag => `<span class="spot-tag">${tag}</span>`).join(' ');

    // 检查是否收藏
    const isFavorite = favoriteSpots.includes(spot.id);
    const favoriteIcon = isFavorite ? '❤️' : '🤍';
    const favoriteClass = isFavorite ? 'favorite' : '';

    // 检查是否有相关新闻
    const hasNews = allNews.some(news => news.related_spot_id === spot.id);

    card.setAttribute('data-spot-id', spot.id);
    card.innerHTML = `
        ${hasNews ? '<span class="hot-tag">🔥 近期热点</span>' : ''}
        <button class="favorite-button ${favoriteClass}" data-spot-id="${spot.id}">${favoriteIcon}</button>
        <div class="spot-image">
            <img src="../${spot.image}" alt="${spot.name}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1548266652-99cf277df5ca?w=800&h=450&fit=crop';">
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

    // 添加收藏按钮点击事件
    const favoriteButton = card.querySelector('.favorite-button');
    favoriteButton.addEventListener('click', (e) => {
        e.stopPropagation(); // 阻止事件冒泡
        toggleFavorite(spot.id, favoriteButton);
    });

    // 添加卡片点击事件，打开Modal
    card.addEventListener('click', () => {
        openModal(spot);
    });

    return card;
}

// 获取收藏的景点
function getFavoriteSpots() {
    return allSpots.filter(spot => favoriteSpots.includes(spot.id));
}

// 渲染收藏夹
function renderFavorites() {
    // 收藏夹功能在 showFavoritesView 函数中已经实现
    // 此函数保留以确保兼容性
}

// 初始化导航选项卡
function initNavTabs() {
    const allSpotsTab = document.getElementById('all-spots-tab');
    const itinerariesTab = document.getElementById('itineraries-tab');
    const favoritesTab = document.getElementById('favorites-tab');
    const headerTitle = document.querySelector('.header h1');

    if (allSpotsTab) {
        allSpotsTab.addEventListener('click', showAllSpotsView);
    }

    if (itinerariesTab) {
        itinerariesTab.addEventListener('click', showItinerariesView);
    }

    if (favoritesTab) {
        favoritesTab.addEventListener('click', showFavoritesView);
    }

    if (headerTitle) {
        headerTitle.addEventListener('click', showAllSpotsView);
    }

    // 初始化魔都动态导航
    const newsTab = document.getElementById('news-tab');
    if (newsTab) {
        newsTab.addEventListener('click', showNewsView);
    }
}

// 显示全部景点视图
function showAllSpotsView() {
    // 更新导航选项卡状态
    document.getElementById('all-spots-tab').classList.add('active');
    document.getElementById('itineraries-tab').classList.remove('active');
    document.getElementById('favorites-tab').classList.remove('active');
    document.getElementById('news-tab').classList.remove('active');

    // 更新导航容器类名
    const navTabs = document.querySelector('.nav-tabs');
    navTabs.classList.remove('tabs-favorites');
    navTabs.classList.remove('tabs-itineraries');
    navTabs.classList.remove('tabs-news');

    // 显示搜索筛选区域和首页资讯
    document.querySelector('.search-filter').style.display = 'block';
    document.getElementById('home-news-ticker').style.display = 'block';

    // 显示景点容器，隐藏其他容器
    document.getElementById('spots-container').style.display = 'grid';
    document.getElementById('itineraries-container').style.display = 'none';
    document.getElementById('news-view').style.display = 'none';

    // 渲染全部景点
    filterAndRenderSpots();
}

// 显示推荐路线视图
function showItinerariesView() {
    // 检查数据是否已加载
    if (!itinerariesLoaded) {
        alert('正在加载路线，请稍后再试...');
        return;
    }

    // 更新导航选项卡状态
    document.getElementById('all-spots-tab').classList.remove('active');
    document.getElementById('itineraries-tab').classList.add('active');
    document.getElementById('favorites-tab').classList.remove('active');
    document.getElementById('news-tab').classList.remove('active');

    // 更新导航容器类名
    const navTabs = document.querySelector('.nav-tabs');
    navTabs.classList.remove('tabs-favorites');
    navTabs.classList.remove('tabs-news');
    navTabs.classList.add('tabs-itineraries');

    // 隐藏搜索筛选区域和首页资讯
    document.querySelector('.search-filter').style.display = 'none';
    document.getElementById('home-news-ticker').style.display = 'none';

    // 显示路线容器，隐藏其他容器
    document.getElementById('spots-container').style.display = 'none';
    document.getElementById('itineraries-container').style.display = 'grid';
    document.getElementById('news-view').style.display = 'none';

    // 渲染路线
    renderItineraries();
}

// 显示收藏视图
function showFavoritesView() {
    // 更新导航选项卡状态
    document.getElementById('all-spots-tab').classList.remove('active');
    document.getElementById('itineraries-tab').classList.remove('active');
    document.getElementById('favorites-tab').classList.add('active');
    document.getElementById('news-tab').classList.remove('active');

    // 更新导航容器类名
    const navTabs = document.querySelector('.nav-tabs');
    navTabs.classList.add('tabs-favorites');
    navTabs.classList.remove('tabs-itineraries');
    navTabs.classList.remove('tabs-news');

    // 隐藏搜索筛选区域和首页资讯
    document.querySelector('.search-filter').style.display = 'none';
    document.getElementById('home-news-ticker').style.display = 'none';

    // 显示景点容器，隐藏其他容器
    document.getElementById('spots-container').style.display = 'grid';
    document.getElementById('itineraries-container').style.display = 'none';
    document.getElementById('news-view').style.display = 'none';

    // 渲染收藏的景点
    const favoriteSpotsList = getFavoriteSpots();
    const container = document.getElementById('spots-container');
    container.innerHTML = '';

    if (favoriteSpotsList.length === 0) {
        // 显示空收藏状态
        const noFavorites = document.createElement('div');
        noFavorites.className = 'no-favorites';
        noFavorites.innerHTML = `
            <div class="no-favorites-icon">🤍</div>
            <h3>收藏夹空空如也</h3>
            <p>快去主页看看吧！</p>
        `;
        container.appendChild(noFavorites);
    } else {
        // 渲染收藏的景点
        favoriteSpotsList.forEach(spot => {
            const spotCard = createSpotCard(spot);
            container.appendChild(spotCard);
        });
    }
}

// 渲染路线列表
function renderItineraries() {
    const container = document.getElementById('itineraries-container');
    if (!container) return;
    
    container.innerHTML = '';

    if (!allItineraries || allItineraries.length === 0) {
        // 显示无结果提示
        const noResult = document.createElement('div');
        noResult.className = 'no-result';
        noResult.innerHTML = `
            <div class="no-result-icon">🗺️</div>
            <h3>暂无推荐路线</h3>
            <p>请稍后再试</p>
        `;
        container.appendChild(noResult);
        return;
    }

    allItineraries.forEach(itinerary => {
        const itineraryCard = createItineraryCard(itinerary);
        container.appendChild(itineraryCard);
    });
}

// 创建路线卡片
function createItineraryCard(itinerary) {
    const card = document.createElement('div');
    card.className = 'spot-card';

    // 获取路线中的景点
    const spotNames = itinerary.spots.map(spotId => {
        const spot = allSpots.find(s => s.id === spotId);
        return spot ? spot.name : '';
    }).filter(name => name);

    card.innerHTML = `
        <div class="spot-image">
            <img src="${allSpots.find(s => s.id === itinerary.spots[0]) ? '../' + allSpots.find(s => s.id === itinerary.spots[0]).image : 'https://images.unsplash.com/photo-1548266652-99cf277df5ca?w=800'}" alt="${itinerary.name}">
        </div>
        <div class="spot-info">
            <div class="spot-header">
                <h3 class="spot-name">${itinerary.name}</h3>
                <span class="spot-city">${itinerary.duration}</span>
            </div>
            <p class="spot-description" style="margin: 10px 0; color: #666; font-size: 14px;">${itinerary.description}</p>
            <div class="spot-details">
                <div class="spot-rating-info">
                    <span class="spot-rating-label">景点数：</span>
                    <span class="spot-rating">${itinerary.spots.length}个</span>
                </div>
            </div>
            <div class="spot-open-time">
                <span class="spot-open-time-label">包含：</span>
                <span>${spotNames.join('、')}</span>
            </div>
        </div>
    `;

    // 添加卡片点击事件，打开抽屉
    card.addEventListener('click', () => {
        openRouteDrawer(itinerary);
    });

    return card;
}

// 初始化路线抽屉
function initRouteDrawer() {
    const drawer = document.getElementById('route-drawer');
    const closeButton = document.querySelector('.drawer-close-button');
    const overlay = document.querySelector('.drawer-overlay');
    
    // 点击关闭按钮关闭抽屉
    if (closeButton) {
        closeButton.addEventListener('click', closeRouteDrawer);
    }
    
    // 点击遮罩层关闭抽屉
    if (overlay) {
        overlay.addEventListener('click', closeRouteDrawer);
    }
}

// 打开路线抽屉并填充数据
function openRouteDrawer(itinerary) {
    const drawer = document.getElementById('route-drawer');
    if (!drawer) return;
    
    // 设置当前路线
    currentItinerary = itinerary;
    
    // 填充抽屉数据
    document.getElementById('drawer-title').textContent = itinerary.title;
    
    // 渲染时间轴
    const timelineContainer = document.getElementById('timeline-container');
    timelineContainer.innerHTML = '';
    
    itinerary.time_slots.forEach(slot => {
        const timelineItem = document.createElement('div');
        timelineItem.className = 'timeline-item';
        timelineItem.innerHTML = `
            <div class="timeline-label">${slot.label}</div>
            <div class="timeline-content">${slot.content}</div>
        `;
        timelineContainer.appendChild(timelineItem);
    });
    
    // 填充底部卡片
    document.getElementById('food-recommend').textContent = itinerary.food_recommend;
    document.getElementById('stay-recommend').textContent = itinerary.stay_recommend;
    document.getElementById('transport-info').textContent = itinerary.transport;
    
    // 显示抽屉
    drawer.style.display = 'block';
    // 禁止背景滚动
    document.body.style.overflow = 'hidden';
    // 添加show类触发动画
    setTimeout(() => {
        drawer.classList.add('show');
    }, 10);
}

// 关闭路线抽屉
function closeRouteDrawer() {
    const drawer = document.getElementById('route-drawer');
    if (!drawer) return;
    
    // 移除show类
    drawer.classList.remove('show');
    // 恢复背景滚动
    document.body.style.overflow = '';
    // 等待动画完成后隐藏
    setTimeout(() => {
        drawer.style.display = 'none';
    }, 300);
}

// 渲染新闻卡片
function renderNews() {
    const container = document.getElementById('news-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (allNews.length === 0) {
        const noNews = document.createElement('div');
        noNews.className = 'no-news';
        noNews.innerHTML = `
            <p>暂无近期资讯</p>
        `;
        container.appendChild(noNews);
        return;
    }
    
    allNews.forEach(news => {
        const newsCard = document.createElement('div');
        newsCard.className = 'news-card';
        
        // 使用 news.json 中的 image 字段
        const imageUrl = news.image ? '../' + news.image : 'https://via.placeholder.com/300x150?text=News';
        
        newsCard.innerHTML = `
            <div class="news-image">
                <img src="${imageUrl}" alt="${news.title}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1496449903678-68ddcb189a24?w=300&h=150&fit=crop';">
            </div>
            <div class="news-content">
                <div class="news-tag">${news.tag}</div>
                <h3>${news.title}</h3>
                <div class="news-date">${news.date}</div>
                <p class="news-summary">${news.summary}</p>
            </div>
        `;
        
        // 添加点击事件，直接打开景点详情
        newsCard.addEventListener('click', () => {
            const relatedSpot = allSpots.find(spot => spot.id === news.related_spot_id);
            if (relatedSpot) {
                // 直接打开景点详情 Modal
                openModal(relatedSpot);
            }
        });
        
        container.appendChild(newsCard);
    });
}

// 初始化预订弹窗
function initBookingModal() {
    const bookingModal = document.getElementById('booking-modal');
    const successModal = document.getElementById('success-modal');
    const bookButton = document.getElementById('book-button');
    const closeBookingModal = bookingModal?.querySelector('.close-button');
    const cancelButton = bookingModal?.querySelector('.cancel-button');
    const confirmButton = document.getElementById('confirm-button');
    const okButton = document.getElementById('ok-button');
    const bookingDate = document.getElementById('booking-date');
    const bookingPeople = document.getElementById('booking-people');
    const totalPrice = document.getElementById('total-price');
    
    if (!bookingModal || !successModal || !bookButton || !closeBookingModal || !cancelButton || !confirmButton || !okButton || !bookingDate || !bookingPeople || !totalPrice) {
        return;
    }
    
    // 设置默认日期为今天
    const today = new Date().toISOString().split('T')[0];
    bookingDate.value = today;
    
    // 打开预订弹窗
    bookButton.addEventListener('click', () => {
        if (currentItinerary) {
            // 计算总价
            updateTotalPrice();
            // 显示预订弹窗
            bookingModal.style.display = 'flex';
            // 禁止背景滚动
            document.body.style.overflow = 'hidden';
        }
    });
    
    // 关闭预订弹窗
    function closeBookingModalFunc() {
        bookingModal.style.display = 'none';
        // 恢复背景滚动
        document.body.style.overflow = '';
    }
    
    // 关闭按钮
    closeBookingModal.addEventListener('click', closeBookingModalFunc);
    
    // 取消按钮
    cancelButton.addEventListener('click', closeBookingModalFunc);
    
    // 点击弹窗外部关闭
    bookingModal.addEventListener('click', (e) => {
        if (e.target === bookingModal) {
            closeBookingModalFunc();
        }
    });
    
    // 人数变化时更新总价
    bookingPeople.addEventListener('input', updateTotalPrice);
    
    // 确认支付
    confirmButton.addEventListener('click', () => {
        // 显示加载动画
        confirmButton.innerHTML = '<span class="loading">处理中...</span>';
        confirmButton.disabled = true;
        
        // 模拟支付过程
        setTimeout(() => {
            // 关闭预订弹窗
            closeBookingModalFunc();
            // 显示成功提示
            successModal.style.display = 'flex';
            // 恢复按钮状态
            confirmButton.innerHTML = '确认支付';
            confirmButton.disabled = false;
        }, 1500);
    });
    
    // 关闭成功提示
    function closeSuccessModal() {
        successModal.style.display = 'none';
        // 恢复背景滚动
        document.body.style.overflow = '';
    }
    
    // 确定按钮
    okButton.addEventListener('click', closeSuccessModal);
    
    // 点击弹窗外部关闭
    successModal.addEventListener('click', (e) => {
        if (e.target === successModal) {
            closeSuccessModal();
        }
    });
    
    // 更新总价
    function updateTotalPrice() {
        if (currentItinerary) {
            const people = parseInt(bookingPeople.value) || 1;
            const price = currentItinerary.total_cost * people;
            totalPrice.textContent = `¥${price}`;
        }
    }
}

// 显示魔都动态视图
function showNewsView() {
    // 检查数据是否已加载
    if (!newsLoaded) {
        alert('正在加载资讯，请稍后再试...');
        return;
    }

    // 更新导航选项卡状态
    document.getElementById('all-spots-tab').classList.remove('active');
    document.getElementById('itineraries-tab').classList.remove('active');
    document.getElementById('favorites-tab').classList.remove('active');
    document.getElementById('news-tab').classList.add('active');

    // 更新导航容器类名
    const navTabs = document.querySelector('.nav-tabs');
    navTabs.classList.remove('tabs-favorites');
    navTabs.classList.remove('tabs-itineraries');
    navTabs.classList.add('tabs-news');

    // 隐藏搜索筛选区域、首页资讯和其他容器
    document.querySelector('.search-filter').style.display = 'none';
    document.getElementById('home-news-ticker').style.display = 'none';
    document.getElementById('spots-container').style.display = 'none';
    document.getElementById('itineraries-container').style.display = 'none';

    // 显示魔都动态视图
    const newsView = document.getElementById('news-view');
    newsView.style.display = 'block';
    newsView.classList.add('fade-in');

    // 渲染资讯列表
    renderNewsList();
}

// 渲染魔都动态资讯列表
function renderNewsList() {
    const container = document.getElementById('news-list');
    if (!container) return;

    container.innerHTML = '';

    if (allNews.length === 0) {
        container.innerHTML = '<div class="no-news">暂无资讯</div>';
        return;
    }

    allNews.forEach(news => {
        const newsItem = document.createElement('div');
        newsItem.className = 'news-list-item';
        
        // 使用 news.json 中的 image 字段
        const imageUrl = news.image ? '../' + news.image : 'https://via.placeholder.com/400x250?text=News';
        
        newsItem.innerHTML = `
            <div class="news-item-image">
                <img src="${imageUrl}" alt="${news.title}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1496449903678-68ddcb189a24?w=400&h=250&fit=crop';">
            </div>
            <div class="news-item-content">
                <div class="news-item-header">
                    <span class="news-item-tag">
                        <span class="breathing-dot"></span>
                        ${news.tag}
                    </span>
                    <span class="news-item-date">${news.date}</span>
                </div>
                <h3 class="news-item-title">${news.title}</h3>
                <p class="news-item-summary">${news.summary}</p>
            </div>
        `;

        // 添加点击事件，打开活动详情抽屉
        newsItem.addEventListener('click', () => {
            openEventDrawer(news);
        });

        container.appendChild(newsItem);
    });
}

// 打开活动详情抽屉
function openEventDrawer(news) {
    const drawer = document.getElementById('event-drawer');
    if (!drawer) return;

    // 设置活动海报图片
    const posterEl = document.getElementById('event-drawer-poster');
    if (posterEl) {
        const imageUrl = news.image ? '../' + news.image : 'https://images.unsplash.com/photo-1496449903678-68ddcb189a24?w=800&h=600&fit=crop';
        posterEl.src = imageUrl;
        posterEl.alt = news.title;
        posterEl.onerror = function() {
            this.onerror = null;
            this.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop';
        };
    }

    // 填充活动详情
    document.getElementById('event-drawer-tag').textContent = news.tag;
    document.getElementById('event-drawer-title').textContent = news.title;
    document.getElementById('event-drawer-date').textContent = news.date;
    document.getElementById('event-drawer-content').textContent = news.content;

    // 填充关联景点信息
    const relatedSpot = allSpots.find(spot => spot.id === news.related_spot_id);
    if (relatedSpot) {
        const relatedCard = document.getElementById('related-spot-card');
        const relatedImg = relatedCard.querySelector('img');
        const relatedTitle = relatedCard.querySelector('h4');
        const relatedDesc = relatedCard.querySelector('p');

        relatedImg.src = '../' + relatedSpot.image;
        relatedImg.alt = relatedSpot.name;
        relatedImg.onerror = function() {
            this.onerror = null;
            this.src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&h=200&fit=crop';
        };
        relatedTitle.textContent = relatedSpot.name;
        relatedDesc.textContent = `¥${relatedSpot.price} · ${relatedSpot.rating}分`;

        // 点击关联景点跳转到景点详情
        relatedCard.onclick = () => {
            closeEventDrawer();
            openModal(relatedSpot);
        };
    } else {
        // 隐藏关联景点区域
        const relatedSpotSection = document.querySelector('.event-related-spot');
        if (relatedSpotSection) {
            relatedSpotSection.style.display = 'none';
        }
    }

    // 显示抽屉
    drawer.style.display = 'block';
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
        drawer.classList.add('show');
    }, 10);
}

// 关闭活动详情抽屉
function closeEventDrawer() {
    const drawer = document.getElementById('event-drawer');
    if (!drawer) return;

    drawer.classList.remove('show');
    document.body.style.overflow = '';
    setTimeout(() => {
        drawer.style.display = 'none';
    }, 300);
}

// 初始化活动详情抽屉
function initEventDrawer() {
    const drawer = document.getElementById('event-drawer');
    const closeButton = drawer?.querySelector('.drawer-close-button');
    const overlay = drawer?.querySelector('.drawer-overlay');

    if (closeButton) {
        closeButton.addEventListener('click', closeEventDrawer);
    }

    if (overlay) {
        overlay.addEventListener('click', closeEventDrawer);
    }
}

// 页面加载时获取数据
window.addEventListener('DOMContentLoaded', () => {
    fetchSpots();
    fetchItineraries();
    fetchNews();
    initNavTabs();
    initRouteDrawer();
    initBookingModal();
    initEventDrawer();
    initUserAuth();
    initUserProfile();
    // 加载收藏和最近看过的数据
    loadFavorites();
    // 渲染最近看过的景点
    renderRecentlyViewed();
});

// ==================== 用户认证功能 ====================
const API_URL = 'http://localhost:3000/api';
let currentUser = null;

function initUserAuth() {
    // 检查登录状态
    checkLoginStatus();
    
    // 绑定按钮事件
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const userMenu = document.getElementById('user-menu');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', showLoginModal);
    }
    
    if (registerBtn) {
        registerBtn.addEventListener('click', showRegisterModal);
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Modal 关闭按钮
    const loginModal = document.getElementById('user-login-modal');
    const registerModal = document.getElementById('user-register-modal');
    
    if (loginModal) {
        const closeBtn = loginModal.querySelector('.close-button');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                loginModal.classList.remove('show');
            });
        }
        loginModal.addEventListener('click', (e) => {
            if (e.target === loginModal) {
                loginModal.classList.remove('show');
            }
        });
    }
    
    if (registerModal) {
        const closeBtn = registerModal.querySelector('.close-button');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                registerModal.classList.remove('show');
            });
        }
        registerModal.addEventListener('click', (e) => {
            if (e.target === registerModal) {
                registerModal.classList.remove('show');
            }
        });
    }
    
    // 登录表单提交
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // 注册表单提交
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // 切换登录/注册
    const showRegister = document.getElementById('show-register');
    const showLogin = document.getElementById('show-login');
    
    if (showRegister) {
        showRegister.addEventListener('click', (e) => {
            e.preventDefault();
            if (loginModal) loginModal.classList.remove('show');
            if (registerModal) registerModal.classList.add('show');
        });
    }
    
    if (showLogin) {
        showLogin.addEventListener('click', (e) => {
            e.preventDefault();
            if (registerModal) registerModal.classList.remove('show');
            if (loginModal) loginModal.classList.add('show');
        });
    }
}

function showLoginModal() {
    const modal = document.getElementById('user-login-modal');
    if (modal) {
        modal.classList.add('show');
    }
}

function showRegisterModal() {
    const modal = document.getElementById('user-register-modal');
    if (modal) {
        modal.classList.add('show');
    }
}

async function checkLoginStatus() {
    const token = localStorage.getItem('user_token');
    const username = localStorage.getItem('user_username');
    
    if (!token || !username) {
        updateUIForLoggedOut();
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const result = await response.json();
        if (result.success) {
            currentUser = result.user;
            updateUIForLoggedIn(username);
        } else {
            updateUIForLoggedOut();
        }
    } catch (error) {
        console.error('Check login error:', error);
        updateUIForLoggedOut();
    }
}

function updateUIForLoggedIn(username) {
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const userMenu = document.getElementById('user-menu');
    const userProfile = document.getElementById('user-profile');
    const userAvatar = document.getElementById('user-avatar');
    const userName = document.getElementById('user-name');
    
    if (loginBtn) loginBtn.style.display = 'none';
    if (registerBtn) registerBtn.style.display = 'none';
    if (userMenu) {
        userMenu.style.display = 'none';
    }
    if (userProfile) {
        userProfile.style.display = 'flex';
        // 更新头像显示
        const profileAvatar = userProfile.querySelector('.user-avatar');
        if (profileAvatar) {
            profileAvatar.textContent = username.charAt(0).toUpperCase();
        }
    }
}

function updateUIForLoggedOut() {
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const userMenu = document.getElementById('user-menu');
    const userProfile = document.getElementById('user-profile');
    
    if (loginBtn) loginBtn.style.display = 'block';
    if (registerBtn) registerBtn.style.display = 'block';
    if (userMenu) userMenu.style.display = 'none';
    if (userProfile) userProfile.style.display = 'none';
}

async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const loginBtn = document.querySelector('#login-form .auth-btn');
    
    const originalText = loginBtn.textContent;
    loginBtn.textContent = '登录中...';
    loginBtn.disabled = true;
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const result = await response.json();
        
        if (result.success) {
            localStorage.setItem('user_token', result.token);
            localStorage.setItem('user_username', result.user.username);
            currentUser = result.user;
            
            alert('登录成功！');
            document.getElementById('user-login-modal').classList.remove('show');
            document.getElementById('login-form').reset();
            updateUIForLoggedIn(result.user.username);
        } else {
            alert('登录失败：' + result.message);
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('网络错误，请确保后端服务器已启动');
    } finally {
        loginBtn.textContent = originalText;
        loginBtn.disabled = false;
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm').value;
    const registerBtn = document.querySelector('#register-form .auth-btn');
    
    if (password !== confirmPassword) {
        alert('两次输入的密码不一致');
        return;
    }
    
    const originalText = registerBtn.textContent;
    registerBtn.textContent = '注册中...';
    registerBtn.disabled = true;
    
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password, role: 'viewer' })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('注册成功！请登录');
            document.getElementById('user-register-modal').classList.remove('show');
            document.getElementById('register-form').reset();
            showLoginModal();
        } else {
            alert('注册失败：' + result.message);
        }
    } catch (error) {
        console.error('Register error:', error);
        alert('网络错误，请确保后端服务器已启动');
    } finally {
        registerBtn.textContent = originalText;
        registerBtn.disabled = false;
    }
}

function handleLogout() {
    if (confirm('确定要退出登录吗？')) {
        localStorage.removeItem('user_token');
        localStorage.removeItem('user_username');
        currentUser = null;
        updateUIForLoggedOut();
        alert('已退出登录');
    }
}

// 初始化个人中心
function initUserProfile() {
    const userProfile = document.getElementById('user-profile');
    const userDropdown = document.getElementById('user-dropdown');
    const dropdownLogout = document.getElementById('dropdown-logout');
    
    if (userProfile) {
        // 点击头像显示/隐藏下拉菜单
        userProfile.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('show');
        });
    }
    
    if (dropdownLogout) {
        // 点击退出登录按钮
        dropdownLogout.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
            // 关闭下拉菜单
            userDropdown.classList.remove('show');
        });
    }
    
    // 点击页面其他地方关闭下拉菜单
    document.addEventListener('click', (e) => {
        if (!userProfile || !userProfile.contains(e.target)) {
            if (userDropdown) {
                userDropdown.classList.remove('show');
            }
        }
    });
}
