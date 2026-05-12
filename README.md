# Prompt 训练场

一个面向中文用户的 Prompt 写作训练网页。

它不是模板仓库，也不是纯教程文档，而是一个可以跟着练习的工作台：学习规则、查看弱/强例子、动手改写 prompt，并获得即时结构评分。

## 功能

- 10 节 Prompt 写作课程
- 弱写法 / 强写法对照
- 练习编辑器
- 实时规则评分
- Prompt 诊断页
- 模板库
- 本地进度保存
- 纯静态网页，无需后端

## 本地预览

```bash
npm run dev
```

打开：

```text
http://127.0.0.1:5180/
```

## 检查

```bash
npm run check
```

## 部署

这是一个纯静态项目。可以部署到：

- GitHub Pages
- Vercel
- Netlify
- Cloudflare Pages
- Nginx
- 任意静态文件服务器

入口文件是 `index.html`。

## 数据说明

课程、练习和模板都在：

```text
src/data.js
```

评分逻辑在：

```text
src/main.js
```

目前评分不调用 AI API，只使用本地规则检测：

- 角色清晰度
- 任务明确度
- 框架可执行性
- 输出具体度
- 约束有效性
- 空泛词风险

## 隐私

应用不上传用户输入。练习内容、诊断内容和学习进度只保存在浏览器本地 `localStorage`。

