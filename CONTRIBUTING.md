# 🤝 贡献指南

感谢你对自律打卡项目的关注！我们欢迎任何形式的贡献。

## 贡献方式

### 报告问题 (Bug Report)

如果你发现了 Bug，请提交 Issue 并包含以下信息：

- **问题描述**：清晰描述你遇到的问题
- **复现步骤**：详细的复现步骤
- **期望行为**：你期望发生什么
- **实际行为**：实际发生了什么
- **截图**：如果可能，提供截图
- **环境信息**：操作系统、Node.js 版本、应用版本

### 功能建议 (Feature Request)

如果你有新功能建议：

1. 在提交 Issue 前搜索是否已有类似建议
2. 清晰描述功能的意义和使用场景
3. 如果有参考实现，欢迎提供

### 提交代码 (Pull Request)

1. **Fork** 本仓库
2. 克隆到本地：
   ```bash
   git clone https://github.com/YOUR_USERNAME/discipline-punch-card.git
   cd discipline-punch-card
   ```
3. 创建特性分支：
   ```bash
   git checkout -b feature/your-feature-name
   # 或
   git checkout -b fix/your-fix-name
   ```
4. 安装依赖：`npm install`
5. 开发和测试
6. 提交代码：
   ```bash
   git add .
   git commit -m "feat: 添加XXX功能"
   ```
7. 推送到你的仓库：
   ```bash
   git push origin feature/your-feature-name
   ```
8. 在 GitHub 上创建 Pull Request

## 开发规范

### 分支命名

- `feature/xxx` - 新功能
- `fix/xxx` - Bug 修复
- `docs/xxx` - 文档更新
- `refactor/xxx` - 代码重构
- `perf/xxx` - 性能优化
- `chore/xxx` - 构建/工具

### 提交信息格式

```
<type>: <description>

[optional body]

[optional footer]
```

示例：
```
feat: 添加日历热力图视图

- 实现年/月双视图切换
- 支持 GitHub 风格的热力图显示
- 点击日期查看当天打卡详情

Closes #42
```

### 代码风格

- 使用 TypeScript 严格模式
- 组件使用函数组件 + Hooks
- 样式使用 Tailwind CSS
- 遵循项目现有的代码风格

### Pull Request 要求

- [ ] 代码通过 TypeScript 类型检查
- [ ] 新功能添加了相应的文档
- [ ] 提交信息符合规范
- [ ] 没有引入新的 lint 警告
- [ ] 在本地测试通过

## 项目结构

详细的项目结构请参考 [开发指南](docs/developer-guide.md)。

## 开发设置

```bash
# 安装依赖
npm install

# 启动浏览器开发模式
npm run dev

# 启动 Electron 开发模式
npm run electron:dev

# 类型检查
npm run type-check
```

## 联系方式

- 提交 [GitHub Issue](https://github.com/yourusername/discipline-punch-card/issues)
- 提交 [Pull Request](https://github.com/yourusername/discipline-punch-card/pulls)

## 行为准则

- 尊重所有贡献者
- 保持专业和友好的交流
- 接受建设性批评
- 聚焦在项目利益上

---

再次感谢你的贡献！🎉
