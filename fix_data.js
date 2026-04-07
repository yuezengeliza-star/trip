
const fs = require('fs');
const path = require('path');

const onlineImages = {
    's1_waitan.jpg': 'https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?w=800&amp;h=450&amp;fit=crop',
    's2_oriental-pearl-tower.jpg': 'https://images.unsplash.com/photo-1548266652-99cf277df5ca?w=800&amp;h=450&amp;fit=crop',
    's3_shanghai-tower.jpg': 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&amp;h=450&amp;fit=crop',
    's4_jinmao-tower.jpg': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&amp;h=450&amp;fit=crop',
    's5_yuyuan.jpg': 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&amp;h=450&amp;fit=crop',
    's6_chenghuang-miao.jpg': 'https://images.unsplash.com/photo-1496449903678-68ddcb189a24?w=800&amp;h=450&amp;fit=crop',
    's7_longhua-temple.jpg': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&amp;h=450&amp;fit=crop',
    's8_jingan-temple.jpg': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&amp;h=450&amp;fit=crop',
    's9_shanghai-museum.jpg': 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=800&amp;h=450&amp;fit=crop',
    's10_science-museum.jpg': 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&amp;h=450&amp;fit=crop',
    's11_maritime-museum.jpg': 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&amp;h=450&amp;fit=crop',
    's12_natural-history-museum.jpg': 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&amp;h=450&amp;fit=crop',
    's13_nanjing-road.jpg': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&amp;h=450&amp;fit=crop',
    's14_huaihai-road.jpg': 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&amp;h=450&amp;fit=crop',
    's15_xintiandi.jpg': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&amp;h=450&amp;fit=crop',
    's16_global-harbor.jpg': 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&amp;h=450&amp;fit=crop',
    's17_disneyland.jpg': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&amp;h=450&amp;fit=crop',
    's18_haichang-ocean-park.jpg': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&amp;h=450&amp;fit=crop',
    's19_happy-valley.jpg': 'https://images.unsplash.com/photo-1517840901100-8179e982acb7?w=800&amp;h=450&amp;fit=crop',
    's20_jinjiang-park.jpg': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&amp;h=450&amp;fit=crop',
    's21_century-park.jpg': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&amp;h=450&amp;fit=crop',
    's22_gucun-park.jpg': 'https://images.unsplash.com/photo-1478145046317-39f10e56b5e9?w=800&amp;h=450&amp;fit=crop',
    's23_gongqing-forest-park.jpg': 'https://images.unsplash.com/photo-1440342359743-84fcb8c21f21?w=800&amp;h=450&amp;fit=crop',
    's24_binjiang-avenue.jpg': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&amp;h=450&amp;fit=crop',
    's25_tianzifang.jpg': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&amp;h=450&amp;fit=crop',
    's26_wukang-road.jpg': 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&amp;h=450&amp;fit=crop',
    's27_1933-laochangfang.jpg': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&amp;h=450&amp;fit=crop'
};

function fixImagePath(imagePath) {
    if (!imagePath) return 'https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?w=800&amp;h=450&amp;fit=crop';
    for (const [localPath, onlinePath] of Object.entries(onlineImages)) {
        if (imagePath.includes(localPath)) {
            return onlinePath;
        }
    }
    return 'https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?w=800&amp;h=450&amp;fit=crop';
}

function processSpotsJson(filePath) {
    try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        if (data.spots &amp;&amp; Array.isArray(data.spots)) {
            data.spots.forEach(spot =&gt; {
                spot.image = fixImagePath(spot.image);
            });
        }
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log(`✅ 已修复: ${filePath}`);
    } catch (error) {
        console.error(`❌ 修复失败: ${filePath}`, error);
    }
}

function processNewsJson(filePath) {
    try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        if (data.news &amp;&amp; Array.isArray(data.news)) {
            data.news.forEach(news =&gt; {
                news.image = fixImagePath(news.image);
            });
        }
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log(`✅ 已修复: ${filePath}`);
    } catch (error) {
        console.error(`❌ 修复失败: ${filePath}`, error);
    }
}

function processItinerariesJson(filePath) {
    try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        if (data.itineraries &amp;&amp; Array.isArray(data.itineraries)) {
            data.itineraries.forEach(itinerary =&gt; {
                if (itinerary.image) {
                    itinerary.image = fixImagePath(itinerary.image);
                }
            });
        }
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log(`✅ 已修复: ${filePath}`);
    } catch (error) {
        console.error(`❌ 修复失败: ${filePath}`, error);
    }
}

function copyFiles(srcDir, destDir) {
    const files = ['spots.json', 'news.json', 'itineraries.json'];
    files.forEach(file =&gt; {
        const srcPath = path.join(srcDir, file);
        const destPath = path.join(destDir, file);
        if (fs.existsSync(srcPath)) {
            fs.copyFileSync(srcPath, destPath);
            console.log(`✅ 已复制: ${file}`);
        }
    });
}

const rootDir = __dirname;
const frontendDir = path.join(rootDir, 'frontend');
const backendServerDir = path.join(rootDir, 'backend', 'server');

console.log('开始修复数据文件...\n');

// 1. 修复根目录的文件
processSpotsJson(path.join(rootDir, 'spots.json'));
processNewsJson(path.join(rootDir, 'news.json'));
processItinerariesJson(path.join(rootDir, 'itineraries.json'));

// 2. 复制到 frontend 目录
console.log('\n复制文件到 frontend 目录...');
copyFiles(rootDir, frontendDir);

// 3. 复制到 backend/server 目录
console.log('\n复制文件到 backend/server 目录...');
copyFiles(rootDir, backendServerDir);

console.log('\n🎉 所有数据文件修复完成！');
