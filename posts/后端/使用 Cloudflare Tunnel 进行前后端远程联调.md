---
description: >
  Cloudflare Tunnel 新手联调教程 ( 命令行 + Docker ) ：
  把本地 localhost 临时变成 HTTPS 链接，
  方便前端、测试和第三方回调一起调试
tags:
  - Cloudflare Tunnel
  - cloudflared
  - 前后端远程联调
  - 内网穿透
  - 本地接口调试
date: 2026-02-11
coverImage: https://caokai-blog.oss-cn-hangzhou.aliyuncs.com/cloudflare-tunnel.webp
location: 杭州
---

## 前言

做联调时最常见的尴尬是：接口在你电脑上能跑，但别人打不开
Cloudflare Tunnel 就是解决这件事的，它会给你一个临时 `https://xxxx.trycloudflare.com` 地址，让别人也能访问你本地的服务

## 先准备好这 3 件事

1.  你的本地服务已经启动 ( 下面示例用 `3000` 端口 )
2.  先在本机自检：`curl http://localhost:3000` 能拿到响应
3.  二选一：命令行方式 或 Docker 方式

## 方式 A：命令行 ( 最快 )

### 1. 安装并验证

```bash
npm install -g cloudflared
cloudflared --version
```

### 2. 启动隧道

```bash
cloudflared tunnel --url http://localhost:3000
```

看到日志里出现 `https://xxxx.trycloudflare.com` 后，这个地址就是别人访问你本地服务的入口，把它发给前端、测试或第三方回调平台即可

### 3. 关闭隧道

当前终端按 `Ctrl + C`

## 方式 B: Docker ( 开关更方便 )

如果你平时就用 Docker，用容器管理 `cloudflared` 会更直观

### 1. 准备 `compose` 配置

如果当前目录还没有 `docker-compose.yml`，先新建一个，再粘贴下面内容
如果已经有这个文件，把下面的 `cloudflared` 服务加进去

```yaml
services:
  cloudflared:
    image: cloudflare/cloudflared: latest
    container_name: cloudflared-3000
    restart: unless-stopped
    command: >
      tunnel --url http://host.docker.internal:3000
```

### 2. 启动并拿地址

```bash
docker compose up -d cloudflared     # 启动
docker compose logs -f cloudflared   # 看日志并复制地址
```

日志里出现 `https://xxxx.trycloudflare.com` 后，这个地址就可以直接发给联调方，他们会通过它访问你本机服务

常用开关命令：

```bash
docker compose stop cloudflared      # 停止
docker compose start cloudflared     # 再启动
```

### 3. 图形化开关 ( 更省事 )

如果你不想记命令，也可以直接用 Docker Desktop 里的按钮控制容器启动和停止：

![Docker Desktop 里 cloudflared-3000 的 Start/Stop 按钮](https://caokai-blog.oss-cn-hangzhou.aliyuncs.com/docker-desktop-cloudflared.webp)

`host.docker.internal` 可以理解成「容器访问你这台电脑」的入口地址

## 网络不稳时 ( 可选 )

联调时偶尔掉线或延迟高，可以试试这条命令 ( 不用纠结参数含义，直接复制即可 ) ：

```bash
cloudflared tunnel \
  --protocol http2 \
  --edge-ip-version 4 \
  --no-autoupdate \
  --url http://localhost:3000
```

## 常见问题 ( 按顺序排查 )

### 1. 打不开、超时、502/504

1.  本地服务是否可用：`curl http://localhost:3000`
2.  `--url` 里的端口是否写对
3.  Docker 方式确认用了 `host.docker.internal`
4.  还不稳就换上面的「网络不稳」命令

### 2. 为什么每次地址都不一样？

`trycloudflare.com` 是临时地址，重启后会变，这是正常现象
如果你需要固定不变的地址，再登录 Cloudflare 账号创建你自己的 Tunnel

### 3. 联调到一半断了

命令行方式下，终端关掉连接就会断
Docker 方式一般更稳一些，遇到问题先看日志

## 一句话总结

先确认本地服务能跑，再开 Tunnel 拿到 HTTPS 地址发给联调方；联调结束就把命令或容器停掉
