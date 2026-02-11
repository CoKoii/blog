---
description: >
  Cloudflare Tunnel 联调教程（全局安装版）：
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
Cloudflare Tunnel 的做法很直接：把 `localhost` 映射成一个公网 HTTPS 地址，拿来做联调和回调调试。

---

## 快速开始

### 1. 安装

```bash
npm install -g cloudflared
```

### 2. 验证

```bash
cloudflared --version
```

能输出版本号就说明可用。

### 3. 暴露本地端口

假设你的服务跑在 `http://localhost:3000`：

```bash
cloudflared tunnel --url http://localhost:3000
```

启动后会拿到一个 `https://xxxx.trycloudflare.com` 地址，发给前端、测试或第三方回调平台即可。

---

## 国内网络建议（更稳）

部分网络下 UDP/QUIC 不稳定，建议直接用 HTTP/2：

```bash
cloudflared tunnel \
  --protocol http2 \
  --edge-ip-version 4 \
  --no-autoupdate \
  --url http://localhost:3000
```

- `--protocol http2`：走 TCP，通常更稳
- `--edge-ip-version 4`：避免 IPv6 路由问题
- `--no-autoupdate`：减少联调中途重连

---

## 常见问题

### 每次重启地址都变

`trycloudflare.com` 是临时域名，重启就会变。  
需要固定域名时，改用登录 Cloudflare 账号后的命名 Tunnel。

### 访问超时或出现 502/504

先确认本地服务是通的：

```bash
curl http://localhost:3000
```

本地不通，隧道一定不通。其次检查 `--url` 端口是否写对。

### 联调时偶发断开

优先使用上面的“稳定参数”命令，并保持终端窗口不要关闭。

---

## 一句话总结

开发联调用 Cloudflare Tunnel 很省事：先保证本地服务可用，再把端口映射到 HTTPS 公网地址。
