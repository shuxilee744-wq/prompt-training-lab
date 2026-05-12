# 发布指南

## 方式一：GitHub Pages

1. 新建 GitHub 仓库，例如 `prompt-training-lab`。
2. 上传本项目所有文件。
3. 打开仓库 Settings。
4. 进入 Pages。
5. Source 选择 `Deploy from a branch`。
6. Branch 选择 `main`，目录选择 `/root`。
7. 保存后等待部署完成。

部署完成后，会得到类似这样的地址：

```text
https://你的用户名.github.io/prompt-training-lab/
```

## 方式二：Vercel

1. 登录 Vercel。
2. Import Project。
3. 选择这个 GitHub 仓库。
4. Framework Preset 选择 `Other`。
5. Build Command 留空。
6. Output Directory 留空或使用根目录。
7. Deploy。

## 方式三：Netlify

1. 登录 Netlify。
2. Add new site。
3. 选择 Import from Git 或直接拖拽项目文件夹。
4. Build command 留空。
5. Publish directory 使用项目根目录。
6. Deploy。

## 方式四：直接打包给朋友

可以把整个项目压缩成 zip 发给朋友。

朋友如果只是想看页面，可以用任意静态服务器打开。如果已经安装 Node.js：

```bash
npm run dev
```

然后访问：

```text
http://127.0.0.1:5180/
```

## 发布前检查

```bash
npm run check
```

确认本地可以打开：

```text
http://127.0.0.1:5180/
```

