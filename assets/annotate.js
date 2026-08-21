/**
 * ui-byte-canvas · UI 批注层模板（纯脚本，注入任意静态页面即可用）
 * 定稿标准（engineer 技能 ui_design.md 批注闭环）：
 *  - 悬浮批注工具栏（右上角，可收起）
 *  - 右键任意 [data-ui] 组件 → 弹出批注窗口
 *  - 一个组件只能有一个批注（按 data-ui 唯一键）：无→新建；有→再次右键显示当前批注（可改/删）
 *  - localStorage 持久化（key: ubc-annotations），刷新不丢
 *  - 导出 JSON / 复制 JSON 交 AI
 *
 * 使用：
 *  1. 在目标页面每个可批注元素加 data-ui（层级点分路径）+ data-label（人类可读名）
 *  2. 引入本脚本：<script src="annotate.js"></script>（或复制本文件内容到页面内）
 *  3. 打开页面 → 右键任意组件批注 → 「复制」粘贴给 AI
 *
 * 依赖：无（原生 JS + CSS 内联注入，任何框架/纯 HTML 均可）
 */
(function () {
  if (window.__ubcAnnotateLoaded) return;
  window.__ubcAnnotateLoaded = true;

  var LS_KEY = 'ubc-annotations';

  // ── 样式注入 ──
  var css = [
    '.ubc-annot-bar{position:fixed;top:8px;right:12px;z-index:99999;display:flex;align-items:center;gap:8px;background:#2d2d30;border:1px solid #f0a020;border-radius:8px;padding:6px 12px;box-shadow:0 4px 16px rgba(0,0,0,.5);font:12px/1.4 -apple-system,"PingFang SC","Microsoft YaHei",sans-serif}',
    '.ubc-annot-bar b{color:#f0a020;font-size:12px}',
    '.ubc-annot-bar button{background:#185fa5;color:#fff;border:none;padding:4px 12px;border-radius:4px;font-size:12px;cursor:pointer}',
    '.ubc-annot-bar button.ghost{background:#3e3e42;color:#e8e8e8}',
    '.ubc-annot-bar .hint{font-size:11px;color:#8a8a8a}',
    '.ubc-annot-bar .close{background:transparent!important;color:#8a8a8a!important;padding:2px 6px!important}',
    '.ubc-annot-bubble{position:fixed;z-index:100000;width:300px;background:#2d2d30;border:1px solid #f0a020;border-radius:8px;padding:12px;box-shadow:0 8px 32px rgba(0,0,0,.6);font:12px/1.4 -apple-system,"PingFang SC","Microsoft YaHei",sans-serif;color:#e8e8e8}',
    '.ubc-annot-bubble .ui{font-size:11px;color:#f0a020;font-family:Consolas,monospace;word-break:break-all}',
    '.ubc-annot-bubble .label{font-size:12px;font-weight:600;margin:6px 0;display:flex;justify-content:space-between}',
    '.ubc-annot-bubble .exists{font-size:10px;font-weight:400;color:#f0a020}',
    '.ubc-annot-bubble textarea{width:100%;background:#1e1e1e;color:#e8e8e8;border:1px solid #3e3e42;border-radius:4px;padding:8px;font-size:12px;outline:none;resize:vertical;min-height:64px;font-family:inherit}',
    '.ubc-annot-bubble .actions{display:flex;gap:8px;margin-top:8px;justify-content:flex-end}',
    '.ubc-annot-bubble .actions button{padding:5px 14px;border-radius:4px;font-size:12px;cursor:pointer;border:none;background:#3e3e42;color:#e8e8e8}',
    '.ubc-annot-bubble .actions .del{background:transparent;color:#f14c4c;border:1px solid #f14c4c;padding:4px 12px}',
    '.ubc-annot-bubble .actions .save{background:#f0a020;color:#1e1e1e;font-weight:600}',
    '[data-ui]:hover{outline:1px dashed rgba(240,160,32,.8);outline-offset:1px}',
  ].join('');
  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ── 数据 ──
  function loadSaved() {
    try {
      return JSON.parse(localStorage.getItem(LS_KEY) || '{}');
    } catch (e) {
      return {};
    }
  }
  var annots = loadSaved();

  function findUi(el) {
    var cur = el;
    while (cur && cur !== document.body) {
      if (cur.hasAttribute && cur.hasAttribute('data-ui')) return cur;
      cur = cur.parentElement;
    }
    return null;
  }

  // ── 悬浮工具栏 ──
  var bar = document.createElement('div');
  bar.className = 'ubc-annot-bar';
  function renderBar() {
    var n = Object.keys(annots).length;
    bar.innerHTML =
      '<b>批注 ' + n + ' 条</b>' +
      '<button id="ubc-export">导出 JSON</button>' +
      '<button id="ubc-copy" class="ghost">复制</button>' +
      '<button id="ubc-clear" class="ghost">清空</button>' +
      '<span class="hint">右键任意组件批注 · 一个组件一条</span>' +
      '<button class="close" id="ubc-hide">✕</button>';
    bar.querySelector('#ubc-export').onclick = exportJson;
    bar.querySelector('#ubc-copy').onclick = copyJson;
    bar.querySelector('#ubc-clear').onclick = function () {
      if (confirm('清空全部批注？')) {
        annots = {};
        localStorage.setItem(LS_KEY, '{}');
        renderBar();
      }
    };
    bar.querySelector('#ubc-hide').onclick = function () {
      bar.style.display = 'none';
      showBtn.style.display = 'block';
    };
  }
  document.body.appendChild(bar);
  renderBar();

  var showBtn = document.createElement('button');
  showBtn.textContent = '批注';
  showBtn.style.cssText =
    'position:fixed;top:8px;right:12px;z-index:99999;display:none;background:#2d2d30;border:1px solid #f0a020;border-radius:6px;padding:4px 12px;font-size:12px;color:#f0a020;cursor:pointer';
  showBtn.onclick = function () {
    showBtn.style.display = 'none';
    bar.style.display = 'flex';
  };
  document.body.appendChild(showBtn);

  // ── 右键批注窗口（单组件单批注） ──
  var bubble = null;
  document.addEventListener('contextmenu', function (e) {
    var uiEl = findUi(e.target);
    if (!uiEl) return;
    e.preventDefault();
    var ui = uiEl.getAttribute('data-ui');
    var label = uiEl.getAttribute('data-label') || ui;
    var existing = annots[ui];
    showBubble(ui, label, existing ? existing.text : '', Boolean(existing), e.clientX, e.clientY);
  });

  function showBubble(ui, label, text, editing, x, y) {
    closeBubble();
    bubble = document.createElement('div');
    bubble.className = 'ubc-annot-bubble';
    bubble.innerHTML =
      '<div class="ui">' + ui + '</div>' +
      '<div class="label">' + label + (editing ? '<span class="exists">已有批注（编辑中）</span>' : '') + '</div>' +
      '<textarea placeholder="写批注…"></textarea>' +
      '<div class="actions">' +
      (editing ? '<button class="del">删除</button><div style="flex:1"></div>' : '<div style="flex:1"></div>') +
      '<button class="cancel">取消</button>' +
      '<button class="save">' + (editing ? '更新' : '保存') + '</button>' +
      '</div>';
    document.body.appendChild(bubble);

    var ta = bubble.querySelector('textarea');
    ta.value = text;
    ta.focus();

    // 定位防溢出
    var bw = bubble.offsetWidth;
    var bh = bubble.offsetHeight;
    bubble.style.left = Math.max(8, Math.min(x, window.innerWidth - bw - 12)) + 'px';
    bubble.style.top = Math.max(8, Math.min(y + 14, window.innerHeight - bh - 12)) + 'px';

    bubble.querySelector('.cancel').onclick = closeBubble;
    bubble.querySelector('.save').onclick = function () {
      var v = ta.value.trim();
      if (!v) return;
      annots[ui] = { ui: ui, label: label, text: v, time: new Date().toISOString() };
      localStorage.setItem(LS_KEY, JSON.stringify(annots));
      renderBar();
      closeBubble();
    };
    var delBtn = bubble.querySelector('.del');
    if (delBtn) {
      delBtn.onclick = function () {
        delete annots[ui];
        localStorage.setItem(LS_KEY, JSON.stringify(annots));
        renderBar();
        closeBubble();
      };
    }
    // Escape 关闭
    var onKey = function (ev) {
      if (ev.key === 'Escape') {
        closeBubble();
        document.removeEventListener('keydown', onKey);
      }
    };
    document.addEventListener('keydown', onKey);
  }

  function closeBubble() {
    if (bubble) {
      bubble.remove();
      bubble = null;
    }
  }

  function exportJson() {
    var list = Object.values(annots);
    if (!list.length) return alert('还没有批注，右键任意组件添加');
    var blob = new Blob([JSON.stringify(list, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'ui-annotations.json';
    a.click();
  }

  function copyJson() {
    var list = Object.values(annots);
    if (!list.length) return alert('还没有批注');
    var json = JSON.stringify(list, null, 2);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(json).then(function () {
        alert('已复制 ' + list.length + ' 条批注到剪贴板，直接粘贴给 AI');
      });
    } else {
      alert(json);
    }
  }
})();
