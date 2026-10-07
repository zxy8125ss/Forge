# Forge

> Forge your 10,000 hours. 用计时器丈量成长，用记录留住走过的路。

个人成长计时 PWA：为想长期坚持的事建项目、专注计时、记录心得，按累计时长晋级（起步 → 摸索 → 渐悟 → 立足 → 专业 → 资深 → 大师）。

线上地址：https://zxy8125ss.github.io/Forge/ （手机浏览器打开后"添加到主屏幕"即可当 App 用）

## 功能

- **熔炉**：项目列表，新建项目（名称、emoji、颜色、每日/每周目标、打卡时刻），阶段进度条
- **专注**：倒计时 / 正计时，Web Worker 后台计时，锁屏回来自动校正；锁屏和控制中心显示计时信息
- **背景声音**：3 种环境白噪声（单曲循环）+ 10 首公有领域古典乐（随机连播，来源见 `public/music/CREDITS.md`）
- **历程**：每次专注的记录时间线，可删除并自动扣回时长
- **印记**：今日 / 本周 / 累计时长、连续天数、近 7 日趋势、项目占比

数据只存在本机浏览器的 IndexedDB（`forge-db`），不上传。

## 技术栈

React 19 + Vite + Tailwind CSS v4 + Zustand + idb + vite-plugin-pwa；数字字体 Barlow Condensed（本地打包，不依赖 Google Fonts）

```
src/
├── App.jsx              页面切换
├── db/index.js          IndexedDB 封装
├── store/               Zustand：项目与记录、计时状态
├── hooks/               useTimer（Web Worker 计时）、useAudio（声音播放）
├── workers/             计时 Worker
├── data/                声音曲目、心境表情
├── lib/                 里程碑计算、格式化工具
├── components/          底部导航、项目卡片、底部弹窗、计时环、声音面板、标志
└── pages/               熔炉 / 专注 / 历程 / 印记
public/                  图标、插画、白噪声、music/ 古典乐
docs/                    构建产物，GitHub Pages 从这里发布
```

## 开发与发布

```bash
npm install
npm run dev        # 本地预览
npm run release    # 构建并更新 docs/
git add -A && git commit -m "..." && git push   # 推送后 GitHub Pages 自动更新
```

GitHub Pages 设置：Source 选 `Deploy from a branch`，分支 `main`，目录 `/docs`。
