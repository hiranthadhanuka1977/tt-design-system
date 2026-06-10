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

  function escapeAttr(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;');
  }

  function escapeText(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function isVoidTag(tag) {
    return VOID_TAGS.indexOf(tag.toLowerCase()) !== -1;
  }

  function meaningfulChildren(node) {
    var result = [];
    for (var i = 0; i < node.childNodes.length; i++) {
      var child = node.childNodes[i];
      if (child.nodeType === Node.TEXT_NODE) {
        if (child.textContent.trim()) {
          result.push(child);
        }
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        result.push(child);
      }
    }
    return result;
  }

  function serializeNode(node, depth) {
    var tab = '  ';
    var pad = tab.repeat(depth);

    if (node.nodeType === Node.TEXT_NODE) {
      return [pad + escapeText(node.textContent.trim())];
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return [];
    }

    var tag = node.tagName.toLowerCase();
    var booleanAttrs = { checked: true, disabled: true, readonly: true, required: true, multiple: true, selected: true };
    var attrs = [];
    for (var i = 0; i < node.attributes.length; i++) {
      var attr = node.attributes[i];
      if (booleanAttrs[attr.name.toLowerCase()] && (attr.value === '' || attr.value === attr.name)) {
        attrs.push(attr.name);
      } else {
        attrs.push(attr.name + '="' + escapeAttr(attr.value) + '"');
      }
    }
    var attrStr = attrs.length ? ' ' + attrs.join(' ') : '';

    if (isVoidTag(tag)) {
      return [pad + '<' + tag + attrStr + '>'];
    }

    var children = meaningfulChildren(node);

    if (children.length === 0) {
      return [pad + '<' + tag + attrStr + '></' + tag + '>'];
    }

    if (children.length === 1 && children[0].nodeType === Node.TEXT_NODE) {
      return [pad + '<' + tag + attrStr + '>' + escapeText(children[0].textContent.trim()) + '</' + tag + '>'];
    }

    var lines = [pad + '<' + tag + attrStr + '>'];
    for (var j = 0; j < children.length; j++) {
      lines = lines.concat(serializeNode(children[j], depth + 1));
    }
    lines.push(pad + '</' + tag + '>');
    return lines;
  }

  function serializeNodes(nodes, depth) {
    var lines = [];
    for (var k = 0; k < nodes.length; k++) {
      lines = lines.concat(serializeNode(nodes[k], depth));
    }
    return lines;
  }

  function formatHtml(html) {
    var template = document.createElement('template');
    template.innerHTML = html.trim();
    return serializeNodes(template.content.childNodes, 0).join('\n');
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
    jsx = jsx.replace(/\breadonly(?:="")?/g, 'readOnly');
    jsx = jsx.replace(/\bmaxlength=/g, 'maxLength=');
    jsx = jsx.replace(/\bcolspan=/g, 'colSpan=');
    jsx = jsx.replace(/\browspan=/g, 'rowSpan=');
    jsx = jsx.replace(/\bautocomplete=/g, 'autoComplete=');
    jsx = jsx.replace(/\bcharset=/g, 'charSet=');
    jsx = jsx.replace(/\bstroke-width=/g, 'strokeWidth=');
    jsx = jsx.replace(/\bstroke-linecap=/g, 'strokeLinecap=');
    jsx = jsx.replace(/\bstroke-linejoin=/g, 'strokeLinejoin=');
    jsx = jsx.replace(/\bfill-rule=/g, 'fillRule=');
    jsx = jsx.replace(/\bclip-rule=/g, 'clipRule=');

    jsx = jsx.replace(/\s(checked|disabled|required|multiple|readonly)(?:="")?(?=\s|\/?>)/gi, function (_, attr) {
      if (attr.toLowerCase() === 'readonly') {
        return ' readOnly={true}';
      }
      if (attr.toLowerCase() === 'checked') {
        return ' defaultChecked={true}';
      }
      return ' ' + attr + '={true}';
    });

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

    jsx = jsx.replace(/\sselected(?:=\{true\}|="")?(?=\s|\/?>)/gi, '');
    jsx = jsx.replace(/\sdefaultChecked=\{true\}\sdefaultChecked=\{true\}/g, ' defaultChecked={true}');

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

  function createMarkupBlock(sourceHtml, componentName, options) {
    options = options || {};
    var htmlMarkup = formatHtml(sourceHtml);
    var jsxBody = htmlToJsx(sourceHtml);
    var nextMarkup = buildNextJsMarkup(jsxBody, componentName);

    var block = document.createElement('div');
    block.className = 'ds-markup';

    var noteHtml = options.showcaseNote
      ? '<p class="ds-markup__note">Showcase layout classes/styles on the demo container (e.g. <code>ds-demo--inline</code>, grid spacing) are omitted — copy the component markup below.</p>'
      : '';

    block.innerHTML =
      '<div class="ds-markup__header">' +
        '<div class="ds-markup__tabs" role="tablist">' +
          '<button type="button" class="ds-markup__tab is-active" role="tab" aria-selected="true" data-tab="html">HTML</button>' +
          '<button type="button" class="ds-markup__tab" role="tab" aria-selected="false" data-tab="nextjs">Next.js</button>' +
        '</div>' +
        '<button type="button" class="btn btn--subtle btn--sm ds-markup__copy">Copy</button>' +
      '</div>' +
      noteHtml +
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

  function initIconography() {
    var grid = document.getElementById('icon-grid');
    if (!grid) {
      return;
    }

    fetch('icons/manifest.json')
      .then(function (res) { return res.json(); })
      .then(function (manifest) {
        manifest.icons.forEach(function (icon) {
          var item = document.createElement('button');
          item.type = 'button';
          item.className = 'icon-grid__item';
          item.dataset.category = icon.category;
          item.title = 'Click to copy class name';
          item.innerHTML =
            '<span class="icon icon--lg" aria-hidden="true">' +
              '<span class="icon-glyph icon-glyph--' + icon.id + '"></span>' +
            '</span>' +
            '<span class="icon-grid__name">' + icon.name + '</span>' +
            '<span class="icon-grid__id">icon-glyph--' + icon.id + '</span>';

          item.addEventListener('click', function () {
            var className = 'icon-glyph--' + icon.id;
            navigator.clipboard.writeText(className).then(function () {
              item.style.borderColor = 'var(--color-success-500)';
              setTimeout(function () {
                item.style.borderColor = '';
              }, 800);
            });
          });

          grid.appendChild(item);
        });

        var filters = document.querySelectorAll('[data-icon-filter]');
        filters.forEach(function (chip) {
          chip.addEventListener('click', function () {
            var category = chip.dataset.iconFilter;
            filters.forEach(function (c) { c.classList.remove('is-selected'); });
            chip.classList.add('is-selected');
            grid.querySelectorAll('.icon-grid__item').forEach(function (el) {
              var show = category === 'all' || el.dataset.category === category;
              el.classList.toggle('is-hidden', !show);
            });
          });
        });
      })
      .catch(function () {
        grid.innerHTML = '<p class="text-secondary">Could not load icons/manifest.json. Serve via a local HTTP server.</p>';
      });
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

        var showcaseNote = demo.hasAttribute('style') ||
          /\b(ds-demo--inline|ds-demo--stack|ds-demo--grid|mt-\d)\b/.test(demo.className);

        demo.classList.add('ds-demo--has-markup');
        demo.insertAdjacentElement('afterend', createMarkupBlock(source.innerHTML, componentName, {
          showcaseNote: showcaseNote
        }));
      });
    });
  }

  function bootShowcase() {
    initIconography();
    initMarkupSections();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootShowcase);
  } else {
    bootShowcase();
  }
})();
