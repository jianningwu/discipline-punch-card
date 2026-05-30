# 🎯 自律打卡 (Discipline Punch Card)

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Linux-lightgrey)
![Tech](https://img.shields.io/badge/tech-Electron%20%2B%20React%20%2B%20TypeScript-6366f1)

**专业的习惯追踪与自律打卡应用**

[功能特性](#-功能特性) · [快速开始](#-快速开始) · [用户指南](#-用户指南) · [开发指南](#-开发指南) · [项目结构](#-项目结构)

</div>

---

## 📖 项目简介

自律打卡是一款跨平台桌面应用，帮助你建立和追踪良好习惯。通过每日打卡、可视化统计和日历视图，让你清晰地看到自己的进步，坚持每一天，遇见更好的自己。

### 🎬 应用预览

- 🏠 **首页仪表盘** - 今日打卡概览、连续天数、完成进度
- ✅ **打卡页面** - 每日打卡、填写内容、记录心情
- 📅 **日历视图** - 年/月打卡热力图，直观查看打卡频率
- 📊 **数据统计** - 柱状图、饼图、趋势图全面展示打卡数据
- ⚙️ **个性化设置** - 6种主题、多种背景、时间格式切换

## ✨ 功能特性

### 核心功能
- ✅ **用户系统** - 注册、登录、注销，本地数据安全存储
- ✅ **默认打卡项** - 8个预设打卡项目（运动、阅读、睡眠、喝水、冥想、日记、饮食、编程）
- ✅ **自定义打卡项** - 自由添加/编辑/删除打卡项目，32种图标、12种颜色
- ✅ **打卡记录** - 每日打卡 + 自定义打卡内容 + 心情记录
- ✅ **日历热力图** - 年视图/月视图，GitHub风格热力图
- ✅ **数据可视化** - 柱状图、饼图、面积趋势图、项目排行
- ✅ **连续打卡统计** - 当前连续天数、最长连续天数
- ✅ **6种主题** - 浅色/深色/森林绿/海洋蓝/日落橙/梦幻紫
- ✅ **背景切换** - 默认/圆点/网格/波浪/纯色背景
- ✅ **实时时钟** - 顶部时钟显示，支持12/24小时制
- ✅ **跨平台** - Windows + Linux 桌面应用

### 技术亮点
- 🚀 **高性能** - React 18 + Vite 极速构建
- 🎨 **精美UI** - Tailwind CSS + Glass Morphism 设计
- 📊 **丰富图表** - Recharts 数据可视化
- 💾 **本地存储** - SQLite 嵌入式数据库，数据安全
- 🔒 **安全** - Electron 安全最佳实践（contextIsolation）
- 📱 **响应式** - 适配不同屏幕尺寸

## 🚀 快速开始

### 环境要求

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Python** >= 3.8（用于编译 better-sqlite3）
- **C++ 编译工具链**（Windows: Visual Studio Build Tools, Linux: build-essential）

### 安装与运行

```bash
# 1. 克隆项目
git clone https://github.com/yourusername/discipline-punch-card.git
cd discipline-punch-card

# 2. 安装依赖
npm install

# 3. 开发模式运行（浏览器）
npm run dev

# 4. 开发模式运行（Electron桌面应用）
npm run electron:dev

# 5. 构建生产版本
npm run build

# 6. 仅构建 Windows 版本
npm run build:win

# 7. 仅构建 Linux 版本
npm run build:linux
```

### 浏览器开发模式

如果你只想快速体验，可以运行 `npm run dev` 在浏览器中打开应用。此时数据存储在浏览器的 localStorage 中。

### 桌面应用构建

构建完成后，安装包位于 `release/` 目录：
- **Windows**: `.exe` NSIS 安装程序
- **Linux**: `.AppImage` 和 `.deb` 包

## 📚 用户指南

### 快速上手

1. **注册账号** - 首次使用需注册账号（数据本地存储，安全可靠）
2. **登录** - 使用你的账号登录
3. **今日打卡** - 在首页点击打卡项目即可完成打卡
4. **填写内容** - 进入打卡页面，可以填写打卡内容和记录心情
5. **添加项目** - 在"项目管理"中添加自定义打卡项
6. **查看统计** - 在"统计"页面查看打卡数据和图表

### 默认打卡项目

| 图标 | 项目 | 说明 |
|------|------|------|
| 🏃 | 运动锻炼 | 每天运动30分钟 |
| 📚 | 阅读学习 | 每天阅读至少30分钟 |
| 💤 | 早睡早起 | 晚上11点前睡觉，早上7点起床 |
| 💧 | 喝水 | 每天喝8杯水 |
| 🧘 | 冥想 | 每天冥想10分钟 |
| 📝 | 写日记 | 记录今天的心情和收获 |
| 🍎 | 健康饮食 | 三餐规律，少油少盐 |
| 💻 | 编程学习 | 每天至少写1小时代码 |

### 主题切换

在"设置"页面可以选择6种主题：
- ☀️ **浅色模式** - 明亮清爽，适合白天
- 🌙 **深色模式** - 护眼舒适，适合夜晚
- 🌿 **森林绿** - 自然清新
- 🌊 **海洋蓝** - 宁静深邃
- 🌅 **日落橙** - 温暖活力
- ✨ **梦幻紫** - 优雅神秘

## 🔧 开发指南

### 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | React 18 + TypeScript |
| 构建工具 | Vite 6 |
| 桌面壳 | Electron 33 |
| UI 样式 | Tailwind CSS 3 |
| 状态管理 | Zustand 5 |
| 图表 | Recharts 2 |
| 图标 | Lucide React |
| 数据库 | better-sqlite3 |
| 日期处理 | date-fns |
| 路由 | React Router 6 |

### 项目结构

```
discipline-punch-card/
├── electron/                # Electron 主进程
│   ├── main.ts             # 主进程入口 + IPC 处理
│   ├── preload.ts          # 预加载脚本（安全桥接）
│   └── database.ts         # 数据库初始化 + Schema
├── src/                    # React 前端代码
│   ├── components/         # 通用组件
│   │   └── MainLayout.tsx  # 主布局（侧边栏+头部）
│   ├── pages/              # 页面组件
│   │   ├── LoginPage.tsx       # 登录页
│   │   ├── RegisterPage.tsx    # 注册页
│   │   ├── Dashboard.tsx       # 仪表盘首页
│   │   ├── CheckInPage.tsx     # 打卡页面
│   │   ├── CalendarPage.tsx    # 日历视图
│   │   ├── StatisticsPage.tsx  # 数据统计
│   │   ├── ItemsManagePage.tsx # 项目管理
│   │   └── SettingsPage.tsx    # 设置页面
│   ├── stores/             # Zustand 状态管理
│   │   ├── authStore.ts    # 认证状态
│   │   ├── checkInStore.ts # 打卡状态
│   │   └── settingsStore.ts # 设置状态
│   ├── hooks/              # 自定义 Hooks
│   │   └── useClock.ts     # 实时时钟 Hook
│   ├── types/              # TypeScript 类型定义
│   │   └── index.ts        # 所有类型 + 常量
│   ├── database/           # 数据库 API 层
│   │   └── api.ts          # API 抽象层
│   ├── App.tsx             # 根组件 + 路由
│   ├── main.tsx            # 应用入口
│   └── index.css           # 全局样式 + 主题
├── docs/                   # 文档
├── public/                 # 静态资源
├── package.json            # 项目配置
├── tsconfig.json           # TypeScript 配置
├── vite.config.ts          # Vite 配置
├── tailwind.config.js      # Tailwind 配置
└── README.md               # 项目说明
```

### 数据库设计

#### users - 用户表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键，自增 |
| username | TEXT | 用户名（唯一） |
| password_hash | TEXT | SHA256 密码哈希 |
| created_at | DATETIME | 创建时间 |

#### check_in_items - 打卡项目表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键，自增 |
| user_id | INTEGER | 外键 → users.id |
| name | TEXT | 项目名称 |
| description | TEXT | 项目描述 |
| icon | TEXT | 图标（Emoji） |
| color | TEXT | 颜色代码 |
| is_default | INTEGER | 是否默认项目 |
| sort_order | INTEGER | 排序 |
| is_active | INTEGER | 软删除标记 |

#### check_in_records - 打卡记录表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键，自增 |
| user_id | INTEGER | 外键 → users.id |
| item_id | INTEGER | 外键 → check_in_items.id |
| check_date | DATE | 打卡日期 |
| content | TEXT | 打卡内容 |
| mood | TEXT | 心情记录 |
| UNIQUE | (user_id, item_id, check_date) | 每天每项仅一条 |

#### user_settings - 用户设置表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键，自增 |
| user_id | INTEGER | 外键 → users.id |
| theme | TEXT | 主题 |
| background_type | TEXT | 背景类型 |
| background_value | TEXT | 背景值 |
| clock_format | TEXT | 时间格式 |

### IPC 通信

前端通过 `preload.ts` 暴露的 `window.electronAPI` 与 Electron 主进程通信：

```typescript
// 认证
window.electronAPI.login(username, password)
window.electronAPI.register(username, password)

// 打卡项
window.electronAPI.getItems(userId)
window.electronAPI.createItem(userId, item)
window.electronAPI.updateItem(itemId, updates)
window.electronAPI.deleteItem(itemId)

// 打卡记录
window.electronAPI.getRecordsByDate(userId, date)
window.electronAPI.createRecord(userId, record)
window.electronAPI.updateRecord(recordId, updates)
window.electronAPI.deleteRecord(recordId)

// 统计
window.electronAPI.getStats(userId)
window.electronAPI.getCalendarData(userId, year, month?)

// 设置
window.electronAPI.getSettings(userId)
window.electronAPI.updateSettings(userId, updates)
```

## 🤝 贡献指南

欢迎贡献！请遵循以下步骤：

1. **Fork** 本仓库
2. 创建你的特性分支：`git checkout -b feature/amazing-feature`
3. 提交你的修改：`git commit -m 'feat: add amazing feature'`
4. 推送到分支：`git push origin feature/amazing-feature`
5. 提交 **Pull Request**

### 提交规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/)：
- `feat:` 新功能
- `fix:` 修复 Bug
- `docs:` 文档更新
- `style:` 代码格式
- `refactor:` 代码重构
- `perf:` 性能优化
- `test:` 测试相关
- `chore:` 构建/工具变动

## 📄 许可证

本项目采用 [MIT License](LICENSE) 开源许可。

## 🙏 致谢

- [Electron](https://www.electronjs.org/) - 跨平台桌面应用框架
- [React](https://react.dev/) - UI 框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [Recharts](https://recharts.org/) - React 图表库
- [Zustand](https://zustand-demo.pmnd.rs/) - 状态管理
- [Lucide](https://lucide.dev/) - 图标库
- [date-fns](https://date-fns.org/) - 日期工具库
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) - SQLite 驱动

---

<div align="center">

**💪 坚持每一天，遇见更好的自己！**

Made with ❤️ by Discipline Punch Card Team

</div>
