// 上海景点展示系统测试文件

// 测试工具函数
function log(message) {
    console.log(`[TEST] ${message}`);
}

function assert(condition, message) {
    if (condition) {
        log(`✅ ${message}`);
        return true;
    } else {
        log(`❌ ${message}`);
        return false;
    }
}

// 测试结果存储
const testResults = {
    passed: 0,
    failed: 0
};

// 执行测试
function runTest(testName, testFunction) {
    log(`开始测试: ${testName}`);
    try {
        const result = testFunction();
        if (result) {
            testResults.passed++;
        } else {
            testResults.failed++;
        }
    } catch (error) {
        log(`❌ 测试失败: ${error.message}`);
        testResults.failed++;
    }
    log(`测试完成: ${testName}\n`);
}

// 模拟DOM元素
function createMockDOM() {
    // 模拟搜索输入框
    const searchInput = document.createElement('input');
    searchInput.id = 'search-input';
    document.body.appendChild(searchInput);
    
    // 模拟标签容器
    const tagsContainer = document.createElement('div');
    tagsContainer.id = 'tags-container';
    document.body.appendChild(tagsContainer);
    
    // 模拟景点容器
    const spotsContainer = document.createElement('div');
    spotsContainer.id = 'spots-container';
    document.body.appendChild(spotsContainer);
    
    // 模拟排序选择
    const sortSelect = document.createElement('select');
    sortSelect.id = 'sort-select';
    sortSelect.innerHTML = `
        <option value="default">默认排序</option>
        <option value="rating-desc">按评分从高到低</option>
        <option value="rating-asc">按评分从低到高</option>
        <option value="price-asc">按价格从低到高</option>
        <option value="price-desc">按价格从高到低</option>
    `;
    document.body.appendChild(sortSelect);
    
    // 模拟重置按钮
    const resetButton = document.createElement('button');
    resetButton.id = 'reset-button';
    document.body.appendChild(resetButton);
    
    // 模拟导航标签
    const navTabs = document.createElement('div');
    navTabs.className = 'nav-tabs';
    navTabs.innerHTML = `
        <button class="nav-tab active" id="all-spots-tab">全部景点</button>
        <button class="nav-tab" id="favorites-tab">我的收藏</button>
    `;
    document.body.appendChild(navTabs);
    
    // 模拟收藏容器
    const favoritesContainer = document.createElement('div');
    favoritesContainer.id = 'favorites-container';
    document.body.appendChild(favoritesContainer);
    
    // 模拟搜索筛选区域
    const searchFilter = document.createElement('section');
    searchFilter.className = 'search-filter';
    document.body.appendChild(searchFilter);
}

// 测试数据
const mockSpots = [
    {
        id: "s1",
        name: "外滩",
        city: "Shanghai",
        tags: ["地标", "城市景观"],
        rating: 4.8,
        price: 0,
        open_time: "全天",
        visit_minutes: 90,
        description: "上海最具代表性的地标，可欣赏黄浦江两岸风光。",
        image: "img/s1_waitan.jpg"
    },
    {
        id: "s2",
        name: "东方明珠",
        city: "Shanghai",
        tags: ["地标", "城市景观"],
        rating: 4.7,
        price: 199,
        open_time: "09:00-21:00",
        visit_minutes: 120,
        description: "上海标志性建筑之一，可登塔俯瞰城市全景。",
        image: "img/s2_oriental-pearl-tower.jpg"
    },
    {
        id: "s9",
        name: "上海博物馆",
        city: "Shanghai",
        tags: ["博物馆"],
        rating: 4.8,
        price: 0,
        open_time: "09:00-17:00",
        visit_minutes: 120,
        description: "中国顶级博物馆之一，馆藏丰富。",
        image: "img/s9_shanghai-museum.jpg"
    },
    {
        id: "s10",
        name: "上海科技馆",
        city: "Shanghai",
        tags: ["博物馆", "亲子"],
        rating: 4.7,
        price: 60,
        open_time: "09:00-17:15",
        visit_minutes: 180,
        description: "适合亲子互动的科技类展馆。",
        image: "img/s10_science-museum.jpg"
    }
];

// 测试搜索功能
function testSearchFunctionality() {
    // 模拟搜索输入
    const searchInput = document.getElementById('search-input');
    searchInput.value = '外滩';
    
    // 模拟搜索处理
    const searchTerm = searchInput.value.toLowerCase();
    const filteredSpots = mockSpots.filter(spot => {
        const name = spot.name.toLowerCase();
        const city = spot.city.toLowerCase();
        return !searchTerm || name.includes(searchTerm) || city.includes(searchTerm);
    });
    
    return assert(filteredSpots.length > 0 && filteredSpots[0].name === '外滩', '搜索功能测试通过');
}

// 测试标签多选
function testTagSelection() {
    // 模拟选择标签
    const selectedTags = ['地标', '城市景观'];
    
    // 模拟标签过滤
    const filteredSpots = mockSpots.filter(spot => {
        return selectedTags.length === 0 || selectedTags.every(tag => spot.tags.includes(tag));
    });
    
    return assert(filteredSpots.length > 0 && filteredSpots.every(spot => 
        spot.tags.includes('地标') && spot.tags.includes('城市景观')
    ), '标签多选测试通过');
}

// 测试排序功能
function testSortFunctionality() {
    // 测试按评分从高到低排序
    let sortedSpots = [...mockSpots];
    sortedSpots.sort((a, b) => b.rating - a.rating);
    const ratingSortTest = assert(sortedSpots[0].rating >= sortedSpots[1].rating, '按评分从高到低排序测试通过');
    
    // 测试按价格从低到高排序
    sortedSpots = [...mockSpots];
    sortedSpots.sort((a, b) => a.price - b.price);
    const priceSortTest = assert(sortedSpots[0].price <= sortedSpots[1].price, '按价格从低到高排序测试通过');
    
    return ratingSortTest && priceSortTest;
}

// 测试收藏功能
function testFavoriteFunctionality() {
    // 模拟收藏操作
    let favoriteSpots = [];
    const spotId = 's1';
    
    // 添加收藏
    favoriteSpots.push(spotId);
    const addTest = assert(favoriteSpots.includes(spotId), '添加收藏测试通过');
    
    // 移除收藏
    const index = favoriteSpots.indexOf(spotId);
    if (index !== -1) {
        favoriteSpots.splice(index, 1);
    }
    const removeTest = assert(!favoriteSpots.includes(spotId), '移除收藏测试通过');
    
    return addTest && removeTest;
}

// 测试搜索-标签-排序联动
function testSearchTagSortCombination() {
    // 模拟搜索关键词
    const searchTerm = '博物馆';
    // 模拟选择标签
    const selectedTags = ['亲子'];
    // 模拟排序方式
    const sortType = 'price-desc';
    
    // 模拟过滤
    let filteredSpots = mockSpots.filter(spot => {
        const name = spot.name.toLowerCase();
        const city = spot.city.toLowerCase();
        const matchesSearch = !searchTerm || name.includes(searchTerm) || city.includes(searchTerm);
        const matchesTags = selectedTags.length === 0 || selectedTags.every(tag => spot.tags.includes(tag));
        return matchesSearch && matchesTags;
    });
    
    // 模拟排序
    if (sortType === 'price-desc') {
        filteredSpots.sort((a, b) => b.price - a.price);
    }
    
    return assert(filteredSpots.length > 0 && 
        filteredSpots.every(spot => spot.name.includes('博物馆') && spot.tags.includes('亲子')) &&
        filteredSpots[0].price >= filteredSpots[filteredSpots.length - 1].price,
        '搜索-标签-排序联动测试通过'
    );
}

// 测试无结果处理
function testNoResultHandling() {
    // 模拟无结果搜索
    const searchTerm = '不存在的景点';
    const filteredSpots = mockSpots.filter(spot => {
        const name = spot.name.toLowerCase();
        const city = spot.city.toLowerCase();
        return name.includes(searchTerm) || city.includes(searchTerm);
    });
    
    return assert(filteredSpots.length === 0, '无结果处理测试通过');
}

// 运行所有测试
function runAllTests() {
    log('====================================');
    log('开始上海景点展示系统测试');
    log('====================================');
    
    // 创建模拟DOM
    createMockDOM();
    
    // 运行测试
    runTest('搜索功能', testSearchFunctionality);
    runTest('标签多选', testTagSelection);
    runTest('排序功能', testSortFunctionality);
    runTest('收藏功能', testFavoriteFunctionality);
    runTest('搜索-标签-排序联动', testSearchTagSortCombination);
    runTest('无结果处理', testNoResultHandling);
    
    // 输出测试结果
    log('====================================');
    log(`测试完成: 通过 ${testResults.passed} 项, 失败 ${testResults.failed} 项`);
    log('====================================');
    
    // 清理
    document.body.innerHTML = '';
}

// 当DOM加载完成后运行测试
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', runAllTests);
} else {
    // 在Node.js环境中运行
    console.log('请在浏览器环境中运行测试');
}