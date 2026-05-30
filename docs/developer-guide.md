# 🔧 开发者指南

## 目录

1. [开发环境搭建](#开发环境搭建)
2. [项目架构](#项目架构)
3. [开发工作流](#开发工作流)
4. [添加新功能](#添加新功能)
5. [构建与发布](#构建与发布)
6. [代码规范](#代码规范)

---

## 开发环境搭建

### 前提条件

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Git**
- **Python** >= 3.8（better-sqlite3 编译需要）
- **C++ 编译工具链**

### Windows 环境

```bash
# 1. 安装 Visual Studio Build Tools
# https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022
# 选择 "Desktop development with C++"

# 2. 安装 Node.js
# https://nodejs.org/

# 3. 安装 Python
# https://www.python.org/downloads/

# 4. 克隆项目
git clone https://github.com/yourusername/discipline-punch-card.git
cd discipline-punch-card

# 5. 安装依赖
npm install

# 6. 启动开发
npm run electron:dev
```

### Linux 环境

```bash
# 1. 安装编译工具
sudo apt-get update
sudo apt-get install -y build-essential python3 git

# 2. 安装 Node.js (使用 nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# 3. 克隆项目
git clone https://github.com/yourusername/discipline-punch-card.git
cd discipline-punch-card

# 4. 安装依赖
npm install

# 5. 启动开发
npm run electron:dev
```

## 项目架构

### 架构概览

```
┌─────────────────────────────────────────────────┐
│                  Electron Main                   │
│  ┌───────────┐  ┌───────────┐  ┌─────────────┐  │
│  │  main.ts   │  │ preload.ts│  │ database.ts │  │
│  │ IPC 处理   │  │ 安全桥接  │  │ SQLite 管理 │  │
│  └───────────┘  └───────────┘  └─────────────┘  │
└─────────────────────────────────────────────────┘
                        │ IPC
┌─────────────────────────────────────────────────┐
│               Renderer Process                   │
│  ┌─────────────────────────────────────────────┐│
│  │              React Application              ││
│  │  ┌─────────┐ ┌─────────┐ ┌──────────────┐  ││
│  │  │  Pages   │ │ Stores  │ │  Components  │  ││
│  │  │ 8 pages  │ │ Zustand │ │  MainLayout  │  ││
│  │  └─────────┘ └─────────┘ └──────────────┘  ││
│  └─────────────────────────────────────────────┘│
└─────────────────────────────────────────────────┘
```

### 数据流

```
用户操作 → React Component → Zustand Store → API Layer → IPC → Electron Main → SQLite
                                                              ↓ (开发模式)
                                                        localStorage Mock
```

### 双模式运行

项目支持两种运行模式：

1. **浏览器模式** (`npm run dev`)
   - 纯前端运行，无需 Electron
   - 数据存储在 localStorage
   - 方便前端开发和调试

2. **桌面模式** (`npm run electron:dev`)
   - 完整的 Electron 桌面应用
   - 数据存储在 SQLite
   - 接近生产环境

两种模式通过 `src/database/api.ts` 中的 `getAPI()` 自动切换。

## 开发工作流

### 日常开发

```bash
# 终端 1: 启动 Vite 开发服务器
npm run dev

# 终端 2: 启动 Electron
# 等待 Vite 服务器启动后运行
npm run electron:dev
# 或使用 wait-on 自动等待
npx wait-on http://localhost:5173 && electron .
```

### 目录说明

```
src/
├── components/       # 可复用组件
├── pages/           # 页面组件（每个路由对应一个页面）
├── stores/          # Zustand 状态管理
├── hooks/           # 自定义 React Hooks
├── types/           # TypeScript 类型 + 常量
├── database/        # API 抽象层
├── App.tsx          # 根组件 + 路由配置
├── main.tsx         # 应用入口
└── index.css        # 全局样式 + Tailwind + 主题
```

## 添加新功能

### 添加新页面

1. 在 `src/pages/` 创建页面组件
2. 在 `src/App.tsx` 添加路由
3. 在 `src/components/MainLayout.tsx` 添加导航项

```tsx
// 1. 创建 src/pages/NewPage.tsx
export default function NewPage() {
  return <div>New Page</div>
}

// 2. 在 App.tsx 添加路由
<Route path="new-page" element={<NewPage />} />

// 3. 在 MainLayout.tsx 添加导航
{ to: '/new-page', icon: NewIcon, label: '新页面' }
```

### 添加新的 IPC 通道

1. 在 `electron/preload.ts` 添加类型安全的方法
2. 在 `electron/main.ts` 添加 ipcMain.handle 处理函数
3. 在 `src/database/api.ts` 的 mock API 中添加对应方法

```typescript
// preload.ts
newMethod: (param: string) => ipcRenderer.invoke('channel:newMethod', param),

// main.ts
ipcMain.handle('channel:newMethod', (_event, param: string) => {
  // 处理逻辑
  return { success: true, data: result }
})

// api.ts (mock)
newMethod: async (param: string) => {
  // mock 实现
  return { success: true, data: [] }
}
```

### 添加新的状态管理

在 `src/stores/` 创建新的 Zustand store：

```typescript
import { create } from 'zustand'

interface NewStore {
  data: any[]
  isLoading: boolean
  fetchData: () => Promise<void>
}

export const useNewStore = create<NewStore>((set) => ({
  data: [],
  isLoading: false,
  fetchData: async () => {
    set({ isLoading: true })
    // 调用 API
    set({ data: result, isLoading: false })
  },
}))
```

## 构建与发布

### 构建配置

构建配置在 `package.json` 的 `build` 字段：

```json
{
  "build": {
    "appId": "com.discipline.punchcard",
    "productName": "自律打卡",
    "win": {
      "target": ["nsis"],
      "icon": "public/icon.png"
    },
    "linux": {
      "target": ["AppImage", "deb"],
      "icon": "public/icon.png"
    }
  }
}
```

### 构建命令

```bash
# 全平台构建
npm run build

# 仅 Windows
npm run build:win

# 仅 Linux
npm run build:linux
```

### 版本发布流程

1. 更新 `package.json` 版本号
2. 更新 CHANGELOG
3. 创建 git tag: `git tag v1.0.0`
4. 推送 tag: `git push origin v1.0.0`
5. CI/CD 自动构建并发布到 GitHub Releases

## 代码规范

### TypeScript

- 使用严格模式 (`strict: true`)
- 所有函数参数必须有类型
- 避免使用 `any`，优先使用具体类型
- 导出类型使用 `interface` 或 `type`

### React 组件

- 使用函数组件 + Hooks
- 组件文件名使用 PascalCase
- 默认导出页面组件
- Props 类型内联或使用 interface

### 样式

- 优先使用 Tailwind CSS 类名
- 自定义样式放在 `index.css` 的 `@layer components` 中
- 使用 CSS 变量实现主题切换
- 暗色模式使用 `dark:` 前缀

### 命名规范

- **文件**: PascalCase（组件），camelCase（工具/Store）
- **变量/函数**: camelCase
- **常量**: UPPER_SNAKE_CASE
- **类型/接口**: PascalCase
- **CSS 类**: kebab-case

### Git 提交规范

```
feat: 添加日历热力图功能
fix: 修复打卡记录重复问题
docs: 更新用户使用指南
style: 调整侧边栏间距
refactor: 重构状态管理逻辑
perf: 优化图表渲染性能
test: 添加打卡功能单元测试
chore: 更新依赖版本
```

### 代码审查清单

- [ ] 类型定义完整
- [ ] 错误处理适当
- [ ] 没有硬编码的魔法值
- [ ] 暗色模式适配
- [ ] 响应式布局
- [ ] 加载状态处理
- [ ] 空状态处理
- [ ] 无障碍访问
