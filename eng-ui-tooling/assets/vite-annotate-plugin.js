// vite-annotate-plugin.js
// 用法（项目 vite.config.js）：
//   import { annotateInject } from './vite-annotate-plugin.js';
//   export default { plugins: [annotateInject()] };
// 并把 annotate.js 放到项目 public/ 目录（或改 scriptSrc 指向你的托管地址）。
//
// 行为：HTML 注入 <script src="/annotate.js">；
//   ?annotate=1 强制启用，?annotate=0 强制关闭，默认按 opts.always。
export function annotateInject(opts = {}) {
  const scriptSrc = opts.scriptSrc || '/annotate.js';
  const enableParam = opts.enableParam || 'annotate';
  const always = !!opts.always;
  return {
    name: 'live-annotate-inject',
    transformIndexHtml(html, ctx) {
      const url = (ctx && ctx.server && ctx.server.req && ctx.server.req.url) || '';
      const forcedOn = url.includes(enableParam + '=1');
      const forcedOff = url.includes(enableParam + '=0');
      const enabled = forcedOn || (always && !forcedOff);
      if (!enabled) return html;
      const tag = '<script src="' + scriptSrc + '"></script>';
      if (html.includes('</body>')) return html.replace('</body>', tag + '</body>');
      return html + tag;
    },
  };
}
