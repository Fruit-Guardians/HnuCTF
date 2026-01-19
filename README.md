<div align="center">

# 🚀 HnuCTF

**海南大学网络安全竞赛平台**

[![Go](https://img.shields.io/badge/Go-1.24+-00ADD8?style=for-the-badge&logo=go&logoColor=white)](https://golang.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)](https://kubernetes.io/)

</div>

## 📖 项目简介

HnuCTF 是由海南大学网络安全团队 (HNUSEC) 主办的现代化 CTF 竞赛平台，支持大规模并发和动态容器管理。

> 🚀 本项目基于 [A1CTF](https://github.com/carbofish/A1CTF) 开源项目二次开发，感谢原作者 @carbofish 的贡献！

### ✨ 核心特性

- 🎯 **现代化界面** - 基于 React 18 + TypeScript 的响应式前端
- ⚡ **高性能后端** - Go 1.24+ 构建的高并发服务
- 🐳 **容器化部署** - Kubernetes 动态容器支持
- 🔄 **实时更新** - WebSocket 实时比分和状态同步
- 📊 **监控告警** - Prometheus 指标监控

---

## 🚀 快速开始

### 📋 前置要求

- Docker & Docker Compose
- Node.js 22+
- Go 1.24+
- Kubernetes (用于动态容器)

### 🔧 本地开发

```bash
# 1. 克隆项目
git clone https://github.com/Fruit-Guardians/HnuCTF.git
cd HnuCTF

# 2. 配置
cp config.example.yaml config.yaml
# 编辑 config.yaml 配置数据库和 K8s

# 3. 启动后端 (Docker)
docker compose up -d --build

# 4. 启动前端 (开发模式)
cd clientapp
npm install
npm run dev
```

### 🌐 访问地址

- **前端界面**: http://localhost:5172
- **后端API**: http://localhost:8081

---

## 📁 项目结构

```
HnuCTF/
├── clientapp/          # React 前端应用
│   ├── app/            # 路由和页面
│   ├── components/     # React 组件
│   └── public/         # 静态资源
├── src/                # Go 后端
│   ├── controllers/    # API 控制器
│   ├── db/             # 数据库模型
│   └── modules/        # 业务模块
├── migrations/         # 数据库迁移
├── i18n/               # 国际化文件
└── docker-compose.yml  # Docker 配置
```

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

本项目采用 [AGPL-3.0 License](LICENSE) 开源协议。

---

<div align="center">

**Powered by [A1CTF](https://github.com/carbofish/A1CTF)**

**由 [HNUSEC](https://www.hnusec.com) 维护**

</div>
