(function () {
  var SKIP_SECTIONS = {
    intro: true,
    colors: true,
    typography: true,
    spacing: true,
    shadows: true,
    radius: true,
    layout: true,
    'sample-pages': true,
    'figma-mcp': true
  };

  var VOID_TAGS = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function toPascalCase(str) {
    return str
      .split(/[-_\s]+/)
      .filter(Boolean)
      .map(function (part) {
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join('');
  }

  function formatHtml(html) {
    var tab = '  ';
    var indent = 0;
    var lines = html
      .trim()
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/>\s+</g, '>\n<')
      .split('\n')
      .map(function (line) { return line.trim(); })
      .filter(Boolean);

    return lines.map(function (line) {
      var isClosing = /^<\//.test(line);
      var isSelfClosing = /\/>$/.test(line);
      var isVoid = new RegExp('^<(' + VOID_TAGS.join('|') + ')\\b', 'i').test(line);
      var isInlineClose = /^<[^/!][^>]*>[^<]*<\/[^>]+>$/.test(line);

      if (isClosing) {
        indent = Math.max(0, indent - 1);
      }

      var formatted = tab.repeat(indent) + line;

      if (!isClosing && !isSelfClosing && !isVoid && !isInlineClose && /^<[^/!]/.test(line)) {
        indent += 1;
      }

      return formatted;
    }).join('\n');
  }

  function convertInlineStyle(styleStr) {
    var entries = styleStr.split(';').filter(function (s) { return s.trim(); }).map(function (pair) {
      var idx = pair.indexOf(':');
      if (idx === -1) {
        return null;
      }
      var key = pair.slice(0, idx).trim().replace(/-([a-z])/g, function (_, c) {
        return c.toUpperCase();
      });
      var val = pair.slice(idx + 1).trim();
      if (/^-?\d+(\.\d+)?$/.test(val)) {
        return key + ': ' + val;
      }
      return key + ": '" + val.replace(/'/g, "\\'") + "'";
    }).filter(Boolean);

    return entries.join(', ');
  }

  function htmlToJsx(html) {
    var jsx = formatHtml(html);

    jsx = jsx.replace(/\bclass=/g, 'className=');
    jsx = jsx.replace(/\bfor=/g, 'htmlFor=');
    jsx = jsx.replace(/\btabindex=/g, 'tabIndex=');
    jsx = jsx.replace(/\breadonly\b/g, 'readOnly');
    jsx = jsx.replace(/\bmaxlength=/g, 'maxLength=');
    jsx = jsx.replace(/\bcolspan=/g, 'colSpan=');
    jsx = jsx.replace(/\browspan=/g, 'rowSpan=');
    jsx = jsx.replace(/\bautocomplete=/g, 'autoComplete=');
    jsx = jsx.replace(/\bcharset=/g, 'charSet=');
    jsx = jsx.replace(/\bstroke-width=/g, 'strokeWidth=');

    jsx = jsx.replace(/\sdisabled(?=\s|\/?>)/g, ' disabled={true}');
    jsx = jsx.replace(/\schecked(?=\s|\/?>)/g, ' defaultChecked={true}');
    jsx = jsx.replace(/\sselected(?=\s|\/?>)/g, ' selected={true}');

    jsx = jsx.replace(/\sstyle="([^"]*)"/g, function (_, styleStr) {
      return ' style={{' + convertInlineStyle(styleStr) + '}}';
    });

    VOID_TAGS.forEach(function (tag) {
      var re = new RegExp('<' + tag + '(\\s[^>]*?)?>', 'gi');
      jsx = jsx.replace(re, function (match, attrs) {
        if (/\/>\s*$/.test(match)) {
          return match;
        }
        return '<' + tag + (attrs || '') + ' />';
      });
    });

    jsx = jsx.replace(/\sselected=\{true\}/g, '');

    return jsx;
  }

  function indentLines(text, spaces) {
    var pad = ' '.repeat(spaces);
    return text.split('\n').map(function (line) {
      return line ? pad + line : line;
    }).join('\n');
  }

  function buildNextJsMarkup(jsxBody, componentName) {
    return [
      '// Place in components/ or app/ — import DS CSS once in app/layout.tsx:',
      "// import '@/styles/jrt/main.css'",
      '',
      'export function ' + componentName + '() {',
      '  return (',
      '    <>',
      indentLines(jsxBody, 6),
      '    </>',
      '  );',
      '}',
      '',
      '// Usage (App Router):',
      '// import { ' + componentName + ' } from \'@/components/' + componentName + '\';',
      '// export default function Page() { return <' + componentName + ' />; }'
    ].join('\n');
  }

  function deriveComponentName(sectionId, index, total) {
    var base = toPascalCase(sectionId || 'Component') + 'Example';
    return total > 1 ? base + (index + 1) : base;
  }

  function createMarkupBlock(sourceHtml, componentName) {
    var htmlMarkup = formatHtml(sourceHtml);
    var jsxBody = htmlToJsx(sourceHtml);
    var nextMarkup = buildNextJsMarkup(jsxBody, componentName);

    var block = document.createElement('div');
    block.className = 'ds-markup';

    block.innerHTML =
      '<div class="ds-markup__header">' +
        '<div class="ds-markup__tabs" role="tablist">' +
          '<button type="button" class="ds-markup__tab is-active" role="tab" aria-selected="true" data-tab="html">HTML</button>' +
          '<button type="button" class="ds-markup__tab" role="tab" aria-selected="false" data-tab="nextjs">Next.js</button>' +
        '</div>' +
        '<button type="button" class="btn btn--subtle btn--sm ds-markup__copy">Copy</button>' +
      '</div>' +
      '<pre class="ds-markup__code ds-markup__panel is-active" data-panel="html"><code>' +
        escapeHtml(htmlMarkup) +
      '</code></pre>' +
      '<pre class="ds-markup__code ds-markup__panel" data-panel="nextjs" hidden><code>' +
        escapeHtml(nextMarkup) +
      '</code></pre>';

    var copyBtn = block.querySelector('.ds-markup__copy');
    var tabs = block.querySelectorAll('.ds-markup__tab');
    var panels = block.querySelectorAll('.ds-markup__panel');
    var activeTab = 'html';
    var snippets = { html: htmlMarkup, nextjs: nextMarkup };

    function setActiveTab(tabName) {
      activeTab = tabName;
      tabs.forEach(function (tab) {
        var isActive = tab.dataset.tab === tabName;
        tab.classList.toggle('is-active', isActive);
        tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
      panels.forEach(function (panel) {
        var isActive = panel.dataset.panel === tabName;
        panel.classList.toggle('is-active', isActive);
        panel.hidden = !isActive;
      });
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        setActiveTab(tab.dataset.tab);
      });
    });

    copyBtn.addEventListener('click', function () {
      navigator.clipboard.writeText(snippets[activeTab]).then(function () {
        var original = copyBtn.textContent;
        copyBtn.textContent = 'Copied';
        copyBtn.disabled = true;
        setTimeout(function () {
          copyBtn.textContent = original;
          copyBtn.disabled = false;
        }, 1500);
      });
    });

    return block;
  }

  function initMarkupSections() {
    document.querySelectorAll('.ds-section[id]').forEach(function (section) {
      if (SKIP_SECTIONS[section.id]) {
        return;
      }

      var demos = section.querySelectorAll('.ds-demo');
      demos.forEach(function (demo, index) {
        if (demo.dataset.skipMarkup !== undefined) {
          return;
        }

        var source = demo.dataset.markupSource
          ? document.querySelector(demo.dataset.markupSource)
          : demo;

        if (!source) {
          return;
        }

        var componentName = demo.dataset.componentName ||
          deriveComponentName(section.id, index, demos.length);

        demo.classList.add('ds-demo--has-markup');
        demo.insertAdjacentElement('afterend', createMarkupBlock(source.innerHTML, componentName));
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMarkupSections);
  } else {
    initMarkupSections();
  }
})();
