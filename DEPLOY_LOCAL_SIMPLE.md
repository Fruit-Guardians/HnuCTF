# A1CTF 本地极速启动指南

## 1. 准备环境
确保已安装 **Docker Desktop** 并开启 **Kubernetes** 功能（设置 -> Kubernetes -> Enable Kubernetes）。

## 2. 配置文件
1. **K8s 配置**：
   复制 `~/.kube/config` (Windows是 `%USERPROFILE%\.kube\config`) 到项目根目录，重命名为 `k8sconfig.yaml`。

2. **项目配置** (`config.yaml`)：
   确保 `node-ip-map` 指向 `127.0.0.1`：
   ```yaml
   k8s:
     k8s-config-file: "k8sconfig.yaml"
     node-ip-map:
       - { name: "docker-desktop", "address": "127.0.0.1" }
     # 注意：name 必须填 kubectl get nodes 看到的节点名
   ```

## 3. 一键启动
在项目根目录运行：
```bash
docker compose up -d --build
```

## 4. 访问
- **前端**: http://localhost:5173
- **后端**: http://localhost:8081
- **账户**: 自动创建管理员 (看 `docker compose logs app` 输出的初始密码)

## 5. 前端独立开发
如果您只想修改前端代码，无需每次重启 Docker。
1. 保持 Docker 后端运行 (提供 API)。
2. 在新终端运行：
   ```bash
   cd clientapp
   npm install
   npm run dev
   ```
3. 访问 `http://localhost:5173` 进行开发（支持热更新）。

