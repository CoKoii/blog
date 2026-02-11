---
description: >
  Cloudflare Tunnel 联调教程（命令行 + Docker）：
  用 cloudflared 把 localhost 暴露成 HTTPS 地址，
  解决前后端远程联调、真机调试和第三方回调调试。
tags:
  - Cloudflare Tunnel
  - cloudflared
  - 前后端远程联调
  - 内网穿透
  - 本地接口调试
date: 2026-02-11
coverImage: https://caokai-blog.oss-cn-hangzhou.aliyuncs.com/cloudflare-tunnel.webp
wordCount: 780
readTime: 3
location: 杭州
comments: 0
---

## 前言

没有公网 IP 时，前后端联调最常见的问题是：别人访问不到你的本地服务。  
Cloudflare Tunnel 的作用很简单：把本机 `localhost` 临时变成一个可访问的 HTTPS 地址。

---

## 开始前

默认你的本地服务已运行在 `3000` 端口。下面两种方式任选其一：

- 方式 A：本机安装 `cloudflared`
- 方式 B：用 Docker 跑 `cloudflared`（更方便开关）

---

## 方式 A：命令行（最快）

### 1. 安装并验证

```bash
npm install -g cloudflared
cloudflared --version
```

### 2. 启动隧道

```bash
cloudflared tunnel --url http://localhost:3000
```

启动后会得到一个 `https://xxxx.trycloudflare.com` 地址，发给前端、测试或第三方回调平台即可。

### 3. 关闭隧道

当前终端按 `Ctrl + C`。

---

## 如果在国内感觉延迟较高,可以试试这条启动命令，我自己测试感觉延迟更低一些：

```bash
cloudflared tunnel \
  --protocol http2 \
  --edge-ip-version 4 \
  --no-autoupdate \
  --url http://localhost:3000
```

---

## 方式 B：Docker（开关更方便）

如果你本机有 Docker，用容器管理 `cloudflared` 的启停会更直观。

```yaml
services:
  cloudflared:
    image: cloudflare/cloudflared:latest
    container_name: cloudflared-3000
    restart: unless-stopped
    command: >
      tunnel --protocol http2 --edge-ip-version 4 --no-autoupdate
      --url http://host.docker.internal:3000
```

常用命令：

```bash
docker compose up -d cloudflared     # 启动
docker compose stop cloudflared      # 停止
docker compose start cloudflared     # 再启动
docker compose logs -f cloudflared   # 查看日志
```

`host.docker.internal` 指向宿主机，所以这里会转发到你本机的 `3000` 端口。

---

## 常见问题

### 每次重启地址都变

`trycloudflare.com` 是临时域名，重启就会变。  
需要固定域名时，改用登录 Cloudflare 账号后的命名 Tunnel。

### 访问超时或出现 502/504

按这个顺序检查：

1. 本地服务是否可用：`curl http://localhost:3000`
2. `--url` 里的端口是否写对
3. 换成上面的“网络不稳时”命令再试

### 联调时偶发断开

优先使用上面的“稳定参数”命令，并保持终端窗口不要关闭。

---

## 一句话总结

先确认本地服务可用，再开 Tunnel 拿到 HTTPS 地址发给联调方；不用时直接停掉命令或容器。
