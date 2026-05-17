---
title: 'cursor-talk-to-figma-mcp使用方法(window版)'
date: 2025-05-10
---

## 前言

项目地址：https://github.com/sonnylazuardi/cursor-talk-to-figma-mcp?tab=readme-ov-file

mac 端可根据项目 readme 进行部署。

## 准备工作

- 安装[Bun](https://bun.sh/)，在终端执行以下命令

```jsx
powershell -c "irm bun.sh/install.ps1 | iex"
```

- [Figma 桌面版](https://www.figma.com/downloads/)
- [Cursor](https://cursor.sh/)

## 下载项目到本地

```jsx
git clone https://github.com/MehhdiMarzban/cursor-talk-to-figma-mcp.git
```

## 安装依赖

在项目目录下的终端执行

```jsx
bun install
```

## 安装并使用 figma 插件

[Cursor Talk To Figma MCP Plugin](https://www.figma.com/community/plugin/1485687494525374295/cursor-talk-to-figma-mcp-plugin)

安装完成后可打开一个项目，然后使用这个插件

![image.png](https://blog-images.luckyabner.top/image.webp)

然后打开 Use localhost，这时候我们点击 Connect，会显示’Disconnected from server’

![image.png](https://blog-images.luckyabner.top/20250531002537307.webp)

我们根据下面的提示，在终端执行这段命令
![image.png](https://blog-images.luckyabner.top/20250601135032868.webp)

然后再次点击 Connect，显示连接成功，将上面显示的 MCP Configuration 复制下来

![image.png](https://blog-images.luckyabner.top/20250601135130028.webp)

## Cursor 配置

在项目的根目录创建一个.cursor 文件夹，在里面建一个 mcp.json
![image.png](https://blog-images.luckyabner.top/20250601135144194.webp)

## 连接 MCP

Ctrl+I 打开 cursor 代理模式，输入`talk to figma channel id:**f2u99k5f**` ，将这个 id 替换为你自己 figma 插件那里显示的 id，下图为成功的例子
![image.png](https://blog-images.luckyabner.top/20250601135158225.webp)

连接成功之后就可以让 AI 根据你的指令去完成对应的 figma 操作了。

## 注意事项

我在使用时，发现会有字体缺失的情况，要避免这种情况可以在 prompt 规定”使用安全且稳定的字体“。

在生成过程中，每添加一个元素都会让你决定接受或取消，如果想让它默认一直接受的话，可以打开 cursor 的设置，在 Features→Chat 下勾选‘Enable auto-run mode’选项。
![image.png](https://blog-images.luckyabner.top/20250601135207732.webp)

具体效果取决于你的 prompt 和模型的选择，我使用下来并没有很惊艳，只能实现基本的一些功能，有时候生成元素的层级也有问题，还得自己调整，而且也用不了 UI 库，现在只能用来作为辅助。
