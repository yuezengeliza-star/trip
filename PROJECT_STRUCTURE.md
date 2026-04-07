
# 项目结构说明

## 目录结构

```
lab2/
├── backend/                 # 后端代码
│   ├── middleware/          # 中间件
│   └── server/              # 服务器主目录
│       ├── img/             # 图片（后端服务用）
│       ├── app.js
│       ├── server.js
│       ├── spots.json
│       ├── news.json
│       └── itineraries.json
│
├── frontend/                # 前端代码
│   ├── img/                 # 图片（前端展示用）
│   ├── pages/               # 页面文件
│   │   ├── index.html       # 主页面
│   │   └── admin-*.html     # 管理后台页面
│   ├── styles/              # 样式文件
│   ├── app.js               # 前端 JS
│   ├── spots.json
│   ├── news.json
│   └── itineraries.json
│
├── img/                     # 原始图片源文件
├── spots.json               # 景点数据（主源文件）
├── news.json                # 新闻数据（主源文件）
├── itineraries.json         # 路线数据（主源文件）
├── package.json
├── package-lock.json
└── .gitignore
```

## 版本控制建议

### 应该加入版本控制的文件：
- ✅ 所有源代码文件（.js, .html, .css）
- ✅ package.json 和 package-lock.json
- ✅ .gitignore
- ✅ README 和文档文件

### 根据需要选择是否加入版本控制：
- ⚠️ JSON 数据文件（spots.json, news.json, itineraries.json）
  - 如果是静态数据，建议加入版本控制
  - 如果是动态生成的数据，可以忽略

- ⚠️ 图片文件（img/ 目录）
  - 如果图片不多且不会频繁变动，可以加入版本控制
  - 如果图片很大或经常变化，建议用外部存储

### 已在 .gitignore 中忽略的文件：
- ❌ node_modules/（依赖包）
- ❌ 临时脚本（fix_data.js, fix_data_simple.js, test.js）
- ❌ 临时文档（TEST_AND_REVIEW.md, additional_function.md 等）
- ❌ IDE 配置文件
- ❌ 日志和临时文件

## 注意事项

1. **图片同步**：目前 img/ 在三个位置都有（根目录、frontend/img/、backend/server/img/），建议保持同步
2. **数据文件**：建议以根目录的 JSON 文件为主，修改后同步到 frontend/ 和 backend/server/
3. **服务器启动**：使用 `npm start` 启动服务器，访问 http://localhost:3000
