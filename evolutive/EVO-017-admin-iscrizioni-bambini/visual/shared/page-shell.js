/**
 * Triono Racing · Portale — page-shell.js
 *
 * Renders the same page markup at two viewport widths (mobile 375 + desktop 1280)
 * side-by-side, using CSS container queries so responsive behavior is driven by
 * container width, not viewport width.
 *
 * Usage in a mockup file:
 *   <div id="mount"></div>
 *   <template id="page-content">
 *     <!-- full page markup (navbar + content + footer) -->
 *   </template>
 *   <script src="../shared/page-shell.js"></script>
 *   <script>
 *     mountMockup({
 *       crumb: ['Mockup', 'Auth', 'Login'],
 *       title: 'Login · /portale/login',
 *       route: '/portale/login',
 *       statusBarTheme: 'light',  // 'light' = dark icons on white, 'dark' = white icons on dark
 *       desktopScale: 0.62,
 *       annotations: [
 *         { ref: 1, text: 'Form Clerk con appearance Triono' },
 *         ...
 *       ]
 *     });
 *   </script>
 */

(function () {
  'use strict';

  function el(tag, attrs, ...children) {
    const e = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        if (k === 'class') e.className = attrs[k];
        else if (k === 'html') e.innerHTML = attrs[k];
        else if (k === 'style' && typeof attrs[k] === 'object') {
          Object.assign(e.style, attrs[k]);
        } else if (k.startsWith('on') && typeof attrs[k] === 'function') {
          e.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
        } else if (attrs[k] != null) {
          e.setAttribute(k, attrs[k]);
        }
      }
    }
    for (const c of children) {
      if (c == null || c === false) continue;
      if (typeof c === 'string') e.appendChild(document.createTextNode(c));
      else e.appendChild(c);
    }
    return e;
  }

  function nowLabel() {
    return '9:41';
  }

  function statusBar(theme) {
    return el('div', { class: 'frame-mobile-status' + (theme === 'dark' ? ' on-dark' : '') },
      el('span', null, nowLabel()),
      el('span', { class: 'right' },
        // signal bars + wifi + battery (compact SVG)
        el('span', { html: `
          <svg width="16" height="10" viewBox="0 0 16 10" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style="margin-right:5px;vertical-align:middle">
            <rect x="0" y="6" width="3" height="4" rx="0.5"/>
            <rect x="4" y="4" width="3" height="6" rx="0.5"/>
            <rect x="8" y="2" width="3" height="8" rx="0.5"/>
            <rect x="12" y="0" width="3" height="10" rx="0.5"/>
          </svg>
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right:5px;vertical-align:middle">
            <path d="M7 9.5L7 9.5C7.55 9.5 8 9.05 8 8.5C8 7.95 7.55 7.5 7 7.5C6.45 7.5 6 7.95 6 8.5C6 9.05 6.45 9.5 7 9.5Z" fill="currentColor"/>
            <path d="M2 4.5C3.5 3 5 2 7 2C9 2 10.5 3 12 4.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" fill="none"/>
            <path d="M4 6.2C4.8 5.5 5.8 5 7 5C8.2 5 9.2 5.5 10 6.2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" fill="none"/>
          </svg>
          <svg width="26" height="12" viewBox="0 0 26 12" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle">
            <rect x="0.5" y="0.5" width="22" height="11" rx="3" stroke="currentColor" opacity="0.4"/>
            <rect x="23.5" y="3.5" width="2" height="5" rx="1" fill="currentColor" opacity="0.4"/>
            <rect x="2" y="2" width="18" height="8" rx="2" fill="currentColor"/>
          </svg>
        `})
      )
    );
  }

  window.mountMockup = function (opts) {
    const {
      crumb = ['Mockup'],
      title = 'Mockup',
      route = '/',
      statusBarTheme = 'light',
      desktopScale = 0.62,
      annotations = [],
      stateLegend = null  // optional: { tag: 'STATO', items: ['Form vuoto', 'Hover su CTA'] }
    } = opts || {};

    const tmpl = document.getElementById('page-content');
    if (!tmpl) {
      console.error('mountMockup: missing <template id="page-content">');
      return;
    }
    const pageHTML = tmpl.innerHTML;

    const mount = document.getElementById('mount') || document.body;

    // --- HEADER ---
    const header = el('div', { class: 'shell-header' },
      el('div', null,
        el('div', { class: 'shell-crumb' },
          ...crumb.map((c, i) => {
            const isLast = i === crumb.length - 1;
            return el('span', null,
              i > 0 ? el('span', { class: 'sep' }, ' / ') : null,
              isLast ? el('span', null, c) : el('a', { href: i === 0 ? '../index.html' : '#' }, c)
            );
          })
        ),
        el('div', { class: 'shell-title', style: { marginTop: '6px' } }, title)
      ),
      el('div', { class: 'shell-meta' },
        el('span', { class: 'shell-state-pill' },
          el('span', { class: 'dot' }),
          el('span', null, route)
        ),
        el('span', null, 'DS v0.1 · mockup statico')
      )
    );
    mount.appendChild(header);

    // --- LEGEND (optional) ---
    if (stateLegend) {
      const legend = el('div', { class: 'state-legend' },
        el('span', { class: 'lg-title' }, stateLegend.tag || 'STATO RAPPRESENTATO'),
        ...stateLegend.items.map(it =>
          el('span', { class: 'lg-item' },
            el('span', { class: 'marker-ref' }, String(it.ref || '·')),
            el('span', null, it.text)
          )
        )
      );
      mount.appendChild(legend);
    }

    // --- VIEWPORTS ---
    const vp = el('div', { class: 'viewports' });

    // Mobile column
    const mobileCol = el('div', { class: 'vp-mobile' });
    mobileCol.appendChild(el('div', { class: 'vp-label' },
      el('span', null, 'Mobile'),
      el('span', { class: 'badge-px' }, '375 × 760')
    ));
    const mobileFrame = el('div', { class: 'frame-mobile' },
      el('div', { class: 'frame-mobile-inner' },
        el('div', { class: 'frame-mobile-notch' }),
        statusBar(statusBarTheme),
        el('div', { class: 'frame-mobile-scroll', html: pageHTML })
      )
    );
    mobileCol.appendChild(mobileFrame);
    vp.appendChild(mobileCol);

    // Desktop column
    const desktopCol = el('div', { class: 'vp-desktop' });
    desktopCol.appendChild(el('div', { class: 'vp-label' },
      el('span', null, 'Desktop'),
      el('span', { class: 'badge-px' }, '1280 × auto · scale ' + Math.round(desktopScale * 100) + '%')
    ));
    const desktopStage = el('div', { class: 'frame-desktop-stage' });
    desktopStage.style.transform = 'scale(' + desktopScale + ')';
    desktopStage.appendChild(el('div', { class: 'frame-desktop-inner', html: pageHTML }));

    const desktopWrap = el('div', { class: 'frame-desktop-wrap' },
      el('div', { class: 'frame-desktop-chrome' },
        el('div', { class: 'dot', style: { background: '#FF5F57' } }),
        el('div', { class: 'dot', style: { background: '#FEBC2E' } }),
        el('div', { class: 'dot', style: { background: '#28C840' } }),
        el('div', { class: 'url' }, 'portale.trionoracing.it' + route)
      ),
      desktopStage
    );

    desktopCol.appendChild(desktopWrap);
    vp.appendChild(desktopCol);

    mount.appendChild(vp);

    // After mount, size the desktop wrap to fit its scaled content height
    requestAnimationFrame(() => {
      const innerH = desktopStage.firstElementChild.offsetHeight;
      desktopStage.style.height = (innerH * desktopScale) + 'px';
      desktopStage.style.width  = '1280px';
      desktopWrap.style.maxWidth = (1280 * desktopScale) + 'px';
    });

    // --- ANNOTATIONS ---
    if (annotations && annotations.length) {
      const list = el('div', {
        class: 'annot-list',
        style: {
          maxWidth: '1680px',
          margin: '32px auto 0',
          padding: '24px 28px',
          background: '#fff',
          border: '1px solid var(--line)',
          borderRadius: '14px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '18px 28px',
          fontSize: '13px',
          color: 'var(--ink)'
        }
      });
      list.appendChild(el('div', {
        style: {
          gridColumn: '1 / -1',
          fontFamily: 'var(--f-mono)',
          fontSize: '11px',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--ink-muted)'
        }
      }, 'Note di design'));
      annotations.forEach((a, i) => {
        list.appendChild(el('div', { style: { display: 'flex', gap: '10px', alignItems: 'flex-start' } },
          el('span', { class: 'marker-ref', style: { marginTop: '2px' } }, String(a.ref || (i + 1))),
          el('span', { style: { lineHeight: '1.5' }, html: a.text })
        ));
      });
      mount.appendChild(list);
    }
  };

})();
