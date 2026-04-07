// 管理端认证系统

// 用户数据存储
const USERS_KEY = 'admin_users';
const TOKEN_KEY = 'admin_token';
const USERNAME_KEY = 'admin_username';
const ROLES_KEY = 'admin_roles';

// 初始化默认角色
function initDefaultRoles() {
    const existingRoles = localStorage.getItem(ROLES_KEY);
    if (!existingRoles) {
        const defaultRoles = [
            {
                id: 1,
                name: '超级管理员',
                key: 'admin',
                type: 'system', // system, custom
                description: '拥有所有权限',
                permissions: {
                    users: { view: true, add: true, edit: true, delete: true },
                    roles: { view: true, add: true, edit: true, delete: true },
                    spots: { view: true, add: true, edit: true, delete: true },
                    news: { view: true, add: true, edit: true, delete: true },
                    statistics: { 
                        view: true, 
                        export: true, 
                        allData: true,
                        users: true,
                        spots: true,
                        news: true,
                        favorites: true,
                        visits: true,
                        orders: true
                    },
                    logs: { view: true, export: true }
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 2,
                name: '内容编辑',
                key: 'editor',
                type: 'system',
                description: '负责内容管理',
                permissions: {
                    users: { view: false, add: false, edit: false, delete: false },
                    roles: { view: false, add: false, edit: false, delete: false },
                    spots: { view: true, add: true, edit: true, delete: true },
                    news: { view: true, add: true, edit: true, delete: true },
                    statistics: { 
                        view: true, 
                        export: false, 
                        allData: false,
                        users: false,
                        spots: true,
                        news: true,
                        favorites: true,
                        visits: false,
                        orders: false
                    },
                    logs: { view: false, export: false }
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 3,
                name: '数据分析员',
                key: 'analyst',
                type: 'system',
                description: '负责数据分析',
                permissions: {
                    users: { view: false, add: false, edit: false, delete: false },
                    roles: { view: false, add: false, edit: false, delete: false },
                    spots: { view: true, add: false, edit: false, delete: false },
                    news: { view: true, add: false, edit: false, delete: false },
                    statistics: { 
                        view: true, 
                        export: true, 
                        allData: true,
                        users: true,
                        spots: true,
                        news: true,
                        favorites: true,
                        visits: true,
                        orders: true
                    },
                    logs: { view: true, export: false }
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 4,
                name: '查看者',
                key: 'viewer',
                type: 'system',
                description: '只能查看数据',
                permissions: {
                    users: { view: false, add: false, edit: false, delete: false },
                    roles: { view: false, add: false, edit: false, delete: false },
                    spots: { view: true, add: false, edit: false, delete: false },
                    news: { view: true, add: false, edit: false, delete: false },
                    statistics: { 
                        view: false, 
                        export: false, 
                        allData: false,
                        users: false,
                        spots: false,
                        news: false,
                        favorites: false,
                        visits: false,
                        orders: false
                    },
                    logs: { view: false, export: false }
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];
        localStorage.setItem(ROLES_KEY, JSON.stringify(defaultRoles));
    }
}

// 初始化默认用户
function initDefaultUsers() {
    const existingUsers = localStorage.getItem(USERS_KEY);
    if (!existingUsers) {
        const defaultUsers = [
            {
                id: 1,
                username: 'admin',
                password: 'admin123', // 实际应用中应该使用加密密码
                email: 'admin@example.com',
                role: 'admin',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                username: 'editor',
                password: 'editor123',
                email: 'editor@example.com',
                role: 'editor',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: 3,
                username: 'analyst',
                password: 'analyst123',
                email: 'analyst@example.com',
                role: 'analyst',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: 4,
                username: 'viewer',
                password: 'viewer123',
                email: 'viewer@example.com',
                role: 'viewer',
                status: 'inactive',
                createdAt: new Date().toISOString()
            }
        ];
        localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
    }
}

// 初始化系统
function initSystem() {
    initDefaultRoles();
    initDefaultUsers();
}

// 获取所有用户
function getAllUsers() {
    const usersJson = localStorage.getItem(USERS_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
}

// 根据用户名查找用户
function findUserByUsername(username) {
    const users = getAllUsers();
    return users.find(user => user.username === username);
}

// 验证用户凭据
function validateUser(username, password) {
    const user = findUserByUsername(username);
    if (!user) {
        return { success: false, message: '用户不存在' };
    }
    
    if (user.status !== 'active') {
        return { success: false, message: '用户账号已禁用' };
    }
    
    // 实际应用中应该使用密码哈希验证
    if (user.password !== password) {
        return { success: false, message: '密码错误' };
    }
    
    return { success: true, user };
}

// 生成 JWT token（模拟）
function generateToken(user) {
    // 实际应用中应该使用真正的 JWT 库
    const token = btoa(JSON.stringify({
        userId: user.id,
        username: user.username,
        role: user.role,
        exp: Date.now() + 24 * 60 * 60 * 1000 // 24小时过期
    }));
    return token;
}

// 验证 token
function validateToken(token) {
    try {
        const decoded = JSON.parse(atob(token));
        if (decoded.exp < Date.now()) {
            return { success: false, message: 'Token 已过期' };
        }
        return { success: true, user: decoded };
    } catch (error) {
        return { success: false, message: '无效的 Token' };
    }
}

// 登录函数
function login(username, password) {
    const validation = validateUser(username, password);
    if (!validation.success) {
        return validation;
    }
    
    const token = generateToken(validation.user);
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USERNAME_KEY, username);
    
    return { 
        success: true, 
        token, 
        user: validation.user 
    };
}

// 注册函数
function register(username, password, email, role = 'viewer') {
    const existingUser = findUserByUsername(username);
    if (existingUser) {
        return { success: false, message: '用户名已存在' };
    }
    
    const users = getAllUsers();
    const newUser = {
        id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
        username,
        password, // 实际应用中应该加密
        email,
        role,
        status: 'active',
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    return { success: true, user: newUser };
}

// 登出函数
function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
}

// 检查登录状态
function checkLoginStatus() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
        return { success: false, message: '未登录' };
    }
    
    const validation = validateToken(token);
    if (!validation.success) {
        logout();
        return validation;
    }
    
    return { success: true, user: validation.user };
}

// 获取当前登录用户
function getCurrentUser() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
        return null;
    }
    
    const validation = validateToken(token);
    if (!validation.success) {
        logout();
        return null;
    }
    
    return validation.user;
}

// 更新用户信息
function updateUser(userId, updates) {
    const users = getAllUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
        return { success: false, message: '用户不存在' };
    }
    
    users[userIndex] = { ...users[userIndex], ...updates };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    return { success: true, user: users[userIndex] };
}

// 删除用户
function deleteUser(userId) {
    const users = getAllUsers();
    const filteredUsers = users.filter(u => u.id !== userId);
    
    if (filteredUsers.length === users.length) {
        return { success: false, message: '用户不存在' };
    }
    
    localStorage.setItem(USERS_KEY, JSON.stringify(filteredUsers));
    return { success: true };
}

// 角色管理功能

// 获取所有角色
function getAllRoles() {
    return JSON.parse(localStorage.getItem(ROLES_KEY) || '[]');
}

// 根据key获取角色
function getRoleByKey(roleKey) {
    const roles = getAllRoles();
    return roles.find(role => role.key === roleKey);
}

// 添加角色
function addRole(roleData) {
    const roles = getAllRoles();
    const newRole = {
        id: Date.now(),
        ...roleData,
        type: roleData.type || 'custom',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    roles.push(newRole);
    localStorage.setItem(ROLES_KEY, JSON.stringify(roles));
    return newRole;
}

// 更新角色
function updateRole(roleId, roleData) {
    const roles = getAllRoles();
    const index = roles.findIndex(role => role.id === roleId);
    if (index !== -1) {
        roles[index] = {
            ...roles[index],
            ...roleData,
            updatedAt: new Date().toISOString()
        };
        localStorage.setItem(ROLES_KEY, JSON.stringify(roles));
        return roles[index];
    }
    return null;
}

// 删除角色
function deleteRole(roleId) {
    const roles = getAllRoles();
    const filteredRoles = roles.filter(role => role.id !== roleId && role.type !== 'system');
    if (filteredRoles.length < roles.length) {
        localStorage.setItem(ROLES_KEY, JSON.stringify(filteredRoles));
        return true;
    }
    return false;
}

// 权限检查
function checkPermission(permissionPath) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        return false;
    }
    
    const role = getRoleByKey(currentUser.role);
    if (!role) {
        return false;
    }
    
    // 解析权限路径，如 'users.view'
    const parts = permissionPath.split('.');
    let current = role.permissions;
    
    for (const part of parts) {
        if (!current || typeof current !== 'object') {
            return false;
        }
        current = current[part];
    }
    
    return current === true;
}

// 统计数据 API 模拟
const statisticsAPI = {
    // 获取用户统计数据
    getUserStatistics: function() {
        if (!checkPermission('statistics.view') || !checkPermission('statistics.users')) {
            throw new Error('没有权限访问用户统计数据');
        }
        return {
            totalUsers: 128,
            activeUsers: 96,
            newUsers: 15,
            userGrowthRate: '12.5%'
        };
    },
    
    // 获取景点统计数据
    getSpotStatistics: function() {
        if (!checkPermission('statistics.view') || !checkPermission('statistics.spots')) {
            throw new Error('没有权限访问景点统计数据');
        }
        return {
            totalSpots: 28,
            popularSpots: 15,
            spotGrowthRate: '5.2%',
            topSpots: [
                { name: '外滩', visits: 2850 },
                { name: '东方明珠', visits: 2150 },
                { name: '豫园', visits: 1890 }
            ]
        };
    },
    
    // 获取资讯统计数据
    getNewsStatistics: function() {
        if (!checkPermission('statistics.view') || !checkPermission('statistics.news')) {
            throw new Error('没有权限访问资讯统计数据');
        }
        return {
            totalNews: 18,
            publishedNews: 15,
            newsGrowthRate: '25.0%'
        };
    },
    
    // 获取收藏统计数据
    getFavoritesStatistics: function() {
        if (!checkPermission('statistics.view') || !checkPermission('statistics.favorites')) {
            throw new Error('没有权限访问收藏统计数据');
        }
        return {
            totalFavorites: 356,
            favoritesGrowthRate: '8.3%'
        };
    },
    
    // 获取访问量统计数据
    getVisitsStatistics: function() {
        if (!checkPermission('statistics.view') || !checkPermission('statistics.visits')) {
            throw new Error('没有权限访问访问量统计数据');
        }
        return {
            totalVisits: 12580,
            visitsGrowthRate: '18.7%',
            monthlyVisits: [1200, 1800, 2100, 1900, 2300, 3280]
        };
    },
    
    // 获取预订统计数据
    getOrdersStatistics: function() {
        if (!checkPermission('statistics.view') || !checkPermission('statistics.orders')) {
            throw new Error('没有权限访问预订统计数据');
        }
        return {
            totalOrders: 234,
            ordersGrowthRate: '15.2%'
        };
    },
    
    // 获取所有统计数据
    getAllStatistics: function() {
        if (!checkPermission('statistics.view') || !checkPermission('statistics.allData')) {
            throw new Error('没有权限访问所有统计数据');
        }
        return {
            users: this.getUserStatistics(),
            spots: this.getSpotStatistics(),
            news: this.getNewsStatistics(),
            favorites: this.getFavoritesStatistics(),
            visits: this.getVisitsStatistics(),
            orders: this.getOrdersStatistics()
        };
    },
    
    // 导出统计数据
    exportStatistics: function() {
        if (!checkPermission('statistics.export')) {
            throw new Error('没有权限导出统计数据');
        }
        return {
            success: true,
            message: '统计数据导出成功',
            timestamp: new Date().toISOString()
        };
    }
};

// 初始化系统
initSystem();

// 导出函数（如果需要）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        login,
        register,
        logout,
        checkLoginStatus,
        getCurrentUser,
        getAllUsers,
        updateUser,
        deleteUser,
        getAllRoles,
        getRoleByKey,
        addRole,
        updateRole,
        deleteRole,
        checkPermission,
        statisticsAPI
    };
}