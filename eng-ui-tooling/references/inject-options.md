# 注入方式选项

本技能（eng-ui-tooling）不修改业务源码，只在"预览/运行流"注入内置的 `assets/annotate.js`。

## A. Vite 插件（推荐）
见 `../assets/vite-annotate-plugin.js`。把 `annotate.js` 复制到项目 `public/`，`vite.config.js` 引入插件即可。支持 `?annotate=1` 启用、`?annotate=0` 关闭。

## B. Nginx sub_filter
本地反代项目，location 里加：
```
sub_filter '</body>' '<script src="/annotate.js"></script></body>';
sub_filter_once on;
```
并把 annotate.js 放到 nginx 可访问路径。适合非 Vite / 已上线站本地预览。

## C. 浏览器扩展 / 书签
注入脚本到任意已加载页面，零服务端改动。适合标注第三方/生产环境（仅本地可见，不影响他人）。

## 选型
- 自家 Vite 项目 → A
- 任意栈 / 已上线站本地看 → B 或 C
- 临时标注第三方 → C
