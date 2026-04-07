
const fs = require('fs');
const path = require('path');

const defaultImage = 'https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?w=800&h=450&fit=crop';

function fixJsonFile(filePath) {
    try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        if (data.spots) {
            data.spots.forEach(spot => {
            spot.image = defaultImage;
        });
        }
        if (data.news) {
            data.news.forEach(n => {
            n.image = defaultImage;
        });
        }
        if (data.itineraries) {
            data.itineraries.forEach(it => {
            if (it.image) it.image = defaultImage;
        });
        }
        
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log('Fixed:', filePath);
    } catch (e) {
        console.error('Error:', e);
    }
}

const files = [
    'd:\\APP_for_me\\lab2\\spots.json',
    'd:\\APP_for_me\\lab2\\news.json',
    'd:\\APP_for_me\\lab2\\itineraries.json',
    'd:\\APP_for_me\\lab2\\frontend\\spots.json',
    'd:\\APP_for_me\\lab2\\frontend\\news.json',
    'd:\\APP_for_me\\lab2\\frontend\\itineraries.json',
    'd:\\APP_for_me\\lab2\\backend\\server\\spots.json',
    'd:\\APP_for_me\\lab2\\backend\\server\\news.json',
    'd:\\APP_for_me\\lab2\\backend\\server\\itineraries.json'
];

files.forEach(fixJsonFile);
console.log('Done!');
