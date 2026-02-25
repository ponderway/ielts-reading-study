# IELTS Reading Study App

## 项目概述

这是一款专为雅思英语阅读考试设计的学习应用，提供单词学习和阅读练习功能，帮助用户有效备考雅思阅读考试。

## 技术栈

- **前端框架**：React 18
- **开发语言**：TypeScript
- **构建工具**：Vite
- **状态管理**：React useState/useEffect
- **路由**：React Router
- **样式**：CSS3
- **数据存储**：LocalStorage
- **部署平台**：Vercel

## 功能特性

### 1. 单词学习模块
- 提供分级单词库（简单、中等、困难）
- 单词释义和例句展示
- 学习进度跟踪
- 本地存储学习数据

### 2. 阅读学习模块
- 提供不同难度的阅读文章
- 阅读理解题目练习
- 自动评分和结果统计
- 本地存储测试结果

### 3. 用户体验
- 现代化深色主题设计
- 流畅的动画效果
- 响应式布局，适配不同设备
- 直观的用户界面

### 4. 数据管理
- 本地存储用户学习进度和测试结果
- 数据导入导出功能
- 自动保存功能

## 项目结构

```
├── public/              # 静态资源
├── src/                # 源代码
│   ├── components/     # 组件
│   │   ├── WordStudy.tsx      # 单词学习组件
│   │   ├── WordStudy.css      # 单词学习样式
│   │   ├── ReadingStudy.tsx   # 阅读学习组件
│   │   └── ReadingStudy.css   # 阅读学习样式
│   ├── utils/          # 工具函数
│   │   └── storage.ts         # 本地存储管理
│   ├── App.tsx         # 应用主组件
│   ├── App.css         # 应用样式
│   ├── main.tsx        # 应用入口
│   └── index.css       # 全局样式
├── index.html          # HTML入口
├── package.json        # 项目配置
├── tsconfig.json       # TypeScript配置
└── vite.config.ts      # Vite配置
```

## 开发过程

### 1. 项目初始化
- 使用Vite创建React + TypeScript项目
- 配置必要的依赖和工具

### 2. 核心功能实现
- **单词学习模块**：实现单词库、学习进度跟踪、难度分级和本地存储功能
- **阅读学习模块**：实现文章库、题目练习、测试结果统计和本地存储功能
- **数据存储**：创建统一的存储管理工具，实现数据的持久化存储

### 3. 界面设计
- 采用现代化的深色主题设计
- 使用渐变色彩和阴影效果增强视觉体验
- 实现响应式布局，适配不同设备尺寸
- 添加平滑的动画效果和交互反馈

### 4. 测试和优化
- 成功构建项目，确保代码能够正常编译和运行
- 测试应用的各项功能，确保用户体验流畅

## 部署步骤

### 1. 构建生产版本
```bash
npm run build
```

### 2. 推送到GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/ponderway/ielts-reading-study.git
git push -u origin master
```

### 3. 部署到Vercel
1. 登录Vercel官网
2. 点击 "New Project"
3. 选择GitHub仓库 `ponderway/ielts-reading-study`
4. 配置部署设置：
   - Framework Preset: Vite
   - Build Command: npm run build
   - Output Directory: dist
5. 点击 "Deploy"

### 4. 关联自定义域名（可选）
1. 在Vercel项目设置中选择 "Domains"
2. 输入自定义域名
3. 在域名注册商处添加DNS记录
4. 验证域名并启用HTTPS

## 使用指南

### 本地开发
```bash
npm install
npm run dev
```
访问 http://localhost:5173 查看应用

### 功能使用
1. **单词学习**：点击 "Start Word Study" 进入，浏览单词，查看释义和例句
2. **阅读练习**：点击 "Start Reading Study" 进入，选择文章进行阅读和测试
3. **数据管理**：应用会自动保存学习进度和测试结果

## 未来规划

- 添加更多单词和阅读材料
- 实现用户账户系统
- 添加学习计划和目标设置
- 增加听力和写作练习模块
- 提供更详细的学习数据分析

## 贡献

欢迎提交Issue和Pull Request来改进这个项目！

## 许可证

MIT License
