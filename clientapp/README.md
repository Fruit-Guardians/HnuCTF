<div align="center">

# 🎯 A1CTF Frontend

**Modern React-based CTF Platform Interface**

[![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React Router](https://img.shields.io/badge/React_Router-v7-CA4245?style=for-the-badge&logo=react-router&logoColor=white)](https://reactrouter.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

</div>

---

## ⚠️ **开发阶段警告 / Development Warning**

> **🚧 This frontend application is part of A1CTF project which is still in development stage. 🚧**

---

## 📖 项目简介 / Project Overview

A1CTF Frontend 是 A1CTF 平台的现代化前端界面，基于 React 18 + TypeScript 构建，提供流畅的用户体验和丰富的交互功能。

A1CTF Frontend is the modern web interface for the A1CTF platform, built with React 18 + TypeScript, providing smooth user experience and rich interactive features.

## ✨ 核心特性 / Key Features

- 🎯 **CTF 专用界面** - 专为 CTF 竞赛设计的用户界面
- 🚀 **服务端渲染** - React Router v7 提供的 SSR 支持
- ⚡ **热模块替换** - 开发时的快速热更新
- 🔒 **TypeScript** - 完整的类型安全支持
- 🎨 **现代化设计** - Tailwind CSS + Radix UI 组件库
- 🌐 **国际化** - 支持中英文切换
- 🌙 **主题切换** - 明暗主题无缝切换
- 📱 **响应式设计** - 完美适配移动端和桌面端
- 🔄 **实时更新** - WebSocket 实时数据同步
- 📊 **数据可视化** - 丰富的图表和统计展示

## 🏗️ 技术栈 / Tech Stack

### 核心框架 / Core Framework
- **React 18** - 现代化 React 框架
- **TypeScript 5+** - 类型安全的 JavaScript
- **React Router v7** - 全栈 React 路由解决方案
- **Vite** - 快速的构建工具

### UI 组件 / UI Components
- **Tailwind CSS** - 实用优先的 CSS 框架
- **Radix UI** - 无样式的可访问组件库
- **Lucide React** - 美观的图标库
- **Mac Scrollbar** - macOS 风格滚动条

### 开发工具 / Development Tools
- **Monaco Editor** - 代码编辑器
- **React Hook Form** - 表单管理
- **Recharts** - 数据可视化
- **React Hot Toast** - 通知提示
- **i18next** - 国际化支持

## 🚀 快速开始 / Quick Start

### 📋 前置要求 / Prerequisites

- Node.js 22+
- npm 或 pnpm
- A1CTF 后端服务运行中

### 🔧 安装步骤 / Installation

1. **安装依赖 / Install Dependencies**
   ```bash
   npm install
   # 或者 / or
   pnpm install
   ```

2. **启动开发服务器 / Start Development Server**
   ```bash
   npm run dev
   # 或者 / or
   pnpm dev
   ```

3. **访问应用 / Access Application**
   
   打开浏览器访问: http://localhost:5173

### 🏗️ 构建生产版本 / Building for Production

```bash
npm run build
# 或者 / or
pnpm build
```

### 🔍 类型检查 / Type Checking

```bash
npm run typecheck
# 或者 / or
pnpm typecheck
```

## 📁 项目结构 / Project Structure

```
clientapp/
├── 📁 app/                    # 应用路由和页面
│   ├── 📁 routes/            # 路由定义
│   ├── 📄 root.tsx           # 根组件
│   └── 📄 routes.ts          # 路由配置
├── 📁 components/            # React 组件
│   ├── 📁 admin/            # 管理员组件
│   ├── 📁 user/             # 用户组件
│   ├── 📁 ui/               # 基础 UI 组件
│   └── 📁 dialogs/          # 对话框组件
├── 📁 contexts/             # React Context
├── 📁 hooks/                # 自定义 Hooks
├── 📁 utils/                # 工具函数
├── 📁 public/               # 静态资源
│   ├── 📁 images/          # 图片资源
│   └── 📁 locales/         # 国际化文件
├── 📄 package.json          # 项目配置
├── 📄 vite.config.ts        # Vite 配置
├── 📄 tailwind.config.js    # Tailwind 配置
└── 📄 tsconfig.json         # TypeScript 配置
```

## 🎨 主要功能模块 / Main Feature Modules

### 🏠 用户界面 / User Interface
- **首页** - 平台介绍和活动展示
- **比赛页面** - CTF 比赛列表和详情
- **题目页面** - 挑战题目展示和提交
- **排行榜** - 实时比分和排名
- **个人中心** - 用户信息和统计

### 🛠️ 管理界面 / Admin Interface
- **系统管理** - 平台配置和监控
- **比赛管理** - 比赛创建和管理
- **题目管理** - 挑战题目编辑
- **用户管理** - 用户和团队管理
- **容器管理** - 动态容器控制

## 🔧 开发指南 / Development Guide

### 🎯 代码规范 / Code Standards
- 使用 TypeScript 进行类型定义
- 遵循 React Hooks 最佳实践
- 使用 Tailwind CSS 进行样式编写
- 组件采用函数式编程风格

### 🌐 国际化 / Internationalization
- 支持中文和英文
- 使用 i18next 进行文本管理
- 翻译文件位于 `public/locales/`

### 🎨 主题系统 / Theme System
- 支持明暗主题切换
- 使用 CSS 变量进行主题管理
- 主题配置在 `app.css` 中定义

## 🔗 相关链接 / Related Links

- [React Router 文档](https://reactrouter.com/)
- [Tailwind CSS 文档](https://tailwindcss.com/)
- [Radix UI 文档](https://www.radix-ui.com/)
- [TypeScript 文档](https://www.typescriptlang.org/)
