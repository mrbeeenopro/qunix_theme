import type { Plugin } from 'vite';

export function qunixPreloaderPlugin(): Plugin {
  return {
    name: 'qunix-preloader-plugin',
    transformIndexHtml(html: string) {
      const preloaderStyles = `
  <style id="qunix-build-preloader-css">
    body {
      margin: 0;
      padding: 0;
      background-color: #070708;
      color: #e2e8f0;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      overflow-x: hidden;
    }
    .qunix-build-shell {
      position: fixed;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background-color: #070708;
      background-position: center;
      background-size: cover;
      background-repeat: no-repeat;
      z-index: 99999;
      transition: opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .qunix-build-shell.qunix-fade-out {
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
    }
    .qunix-build-blur-overlay {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at 50% 35%, rgba(108, 92, 231, 0.22), transparent 70%), rgba(7, 7, 8, 0.75);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
    }
    .qunix-build-content {
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .qunix-build-brand {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 14px;
      margin-bottom: 24px;
    }
    .qunix-build-icon-img {
      max-width: 240px;
      max-height: 80px;
      width: auto;
      height: auto;
      object-fit: contain;
      animation: qunix-pulse 1.8s ease-in-out infinite;
    }
    .qunix-build-title {
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.5px;
      color: #ffffff;
      text-shadow: 0 2px 10px rgba(0,0,0,0.5);
    }
    .qunix-build-subtitle {
      margin-top: 14px;
      font-family: monospace, system-ui;
      font-size: 11px;
      letter-spacing: 2px;
      color: #a9b1d6;
      text-transform: uppercase;
      text-shadow: 0 0 10px rgba(122, 162, 247, 0.4);
    }
    @keyframes qunix-pulse {
      0%, 100% { transform: scale(1.03); opacity: 1; }
      50% { transform: scale(0.97); opacity: 0.85; }
    }
  </style>`;

      const preloaderRoot = `
  <div id="root">
    <div class="qunix-build-shell" id="qunix-preloader-shell">
      <div class="qunix-build-blur-overlay"></div>
      <div class="qunix-build-content">
        <div class="qunix-build-brand">
          <img src="/icon.svg" class="qunix-build-icon-img" id="qunix-preloader-icon" alt="App Icon" style="max-width: 240px; max-height: 80px; width: auto; height: auto; object-fit: contain;" onError="this.src='/icon.svg'" />
          <div class="qunix-build-title" id="qunix-preloader-title">Calagopus</div>
        </div>
        <div id="qunix-preloader-slot">
          <canvas id="qunix-preloader-spinner-canvas" width="440" height="140" style="width: 220px; height: 70px; display: block; margin: 0 auto;"></canvas>
        </div>
        <div class="qunix-build-subtitle" id="qunix-preloader-text">INITIALIZING PANEL...</div>
      </div>
    </div>
    <script id="qunix-build-preloader-js">
      (function() {
        window.__qunixPreloaderStartTime = performance.now();

        function drawSpinner(ctx, style, activeColor, cx, loaderY, time) {
          if (style === 'circular') {
            var orbitR1 = 20, orbitR2 = 12;
            ctx.save();
            ctx.translate(cx, loaderY);
            ctx.rotate(time * 1.2);
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = activeColor;
            ctx.shadowColor = activeColor;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(0, 0, orbitR1, 0, Math.PI * 1.3);
            ctx.stroke();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(orbitR1 * Math.cos(Math.PI * 1.3), orbitR1 * Math.sin(Math.PI * 1.3), 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            ctx.save();
            ctx.translate(cx, loaderY);
            ctx.rotate(-time * 1.5);
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#bb9af7';
            ctx.shadowColor = '#bb9af7';
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(0, 0, orbitR2, 0, Math.PI * 1.1);
            ctx.stroke();
            ctx.restore();

            ctx.save();
            ctx.translate(cx, loaderY);
            var coreScale = 3 + Math.sin(time * 2.0) * 1.0;
            ctx.fillStyle = activeColor;
            ctx.shadowColor = activeColor;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(0, 0, coreScale, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          } else if (style === 'dots') {
            var dotCount = 5, dotSpacing = 16;
            var totalW = (dotCount - 1) * dotSpacing;
            var startX = cx - totalW / 2;
            for (var i = 0; i < dotCount; i++) {
              var dx = startX + i * dotSpacing;
              var phase = time * 2.2 - i * 0.5;
              var dy = loaderY + Math.sin(phase) * 5;
              var scale = 3.2 + Math.sin(phase) * 0.9;
              var alpha = 0.4 + 0.6 * ((Math.sin(phase) + 1) / 2);
              ctx.save();
              ctx.fillStyle = activeColor;
              ctx.globalAlpha = alpha;
              ctx.shadowColor = activeColor;
              ctx.shadowBlur = 8;
              ctx.beginPath();
              ctx.arc(dx, dy, Math.max(1, scale), 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            }
          } else if (style === 'cyber') {
            var scanW = 180, scanH = 22;
            var sx = cx - scanW / 2;
            var sy = loaderY - scanH / 2;
            ctx.save();
            ctx.strokeStyle = activeColor + '44';
            ctx.lineWidth = 1;
            ctx.fillStyle = 'rgba(0,0,0,0.35)';
            ctx.beginPath();
            ctx.rect(sx, sy, scanW, scanH);
            ctx.fill();
            ctx.stroke();

            ctx.strokeStyle = 'rgba(255,255,255,0.06)';
            for (var gx = sx + 15; gx < sx + scanW; gx += 15) {
              ctx.beginPath();
              ctx.moveTo(gx, sy);
              ctx.lineTo(gx, sy + scanH);
              ctx.stroke();
            }

            var sweep = ((Math.sin(time * 1.4) + 1) / 2) * (scanW - 24);
            var beamX = sx + 12 + sweep;
            var beamGrad = ctx.createLinearGradient(beamX - 16, sy, beamX + 16, sy);
            beamGrad.addColorStop(0, 'transparent');
            beamGrad.addColorStop(0.5, activeColor);
            beamGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = beamGrad;
            ctx.shadowColor = activeColor;
            ctx.shadowBlur = 12;
            ctx.fillRect(beamX - 16, sy, 32, scanH);

            ctx.strokeStyle = activeColor;
            ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(sx, sy + 5); ctx.lineTo(sx, sy); ctx.lineTo(sx + 5, sy); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(sx + scanW - 5, sy); ctx.lineTo(sx + scanW, sy); ctx.lineTo(sx + scanW, sy + 5); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(sx, sy + scanH - 5); ctx.lineTo(sx, sy + scanH); ctx.lineTo(sx + 5, sy + scanH); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(sx + scanW - 5, sy + scanH); ctx.lineTo(sx + scanW, sy + scanH); ctx.lineTo(sx + scanW, sy + 5); ctx.stroke();
            ctx.restore();
          } else if (style === 'cube') {
            ctx.save();
            var size = 15;
            var rotX = time * 0.55, rotY = time * 0.75, rotZ = time * 0.35;
            var vertices = [
              [-size, -size, -size], [size, -size, -size], [size, size, -size], [-size, size, -size],
              [-size, -size, size], [size, -size, size], [size, size, size], [-size, size, size]
            ];
            var edges = [
              [0, 1], [1, 2], [2, 3], [3, 0],
              [4, 5], [5, 6], [6, 7], [7, 4],
              [0, 4], [1, 5], [2, 6], [3, 7]
            ];
            var projected = [];
            vertices.forEach(function(v) {
              var x = v[0], y = v[1], z = v[2];
              var x1 = x * Math.cos(rotY) + z * Math.sin(rotY);
              var z1 = -x * Math.sin(rotY) + z * Math.cos(rotY);
              var y2 = y * Math.cos(rotX) - z1 * Math.sin(rotX);
              var z2 = y * Math.sin(rotX) + z1 * Math.cos(rotX);
              var x3 = x1 * Math.cos(rotZ) - y2 * Math.sin(rotZ);
              var y3 = x1 * Math.sin(rotZ) + y2 * Math.cos(rotZ);
              var fov = 180;
              var sc = fov / (fov + z2);
              projected.push({ x: cx + x3 * sc, y: loaderY + y3 * sc });
            });
            ctx.strokeStyle = activeColor;
            ctx.lineWidth = 1.6;
            ctx.shadowColor = activeColor;
            ctx.shadowBlur = 8;
            edges.forEach(function(e) {
              ctx.beginPath();
              ctx.moveTo(projected[e[0]].x, projected[e[0]].y);
              ctx.lineTo(projected[e[1]].x, projected[e[1]].y);
              ctx.stroke();
            });
            ctx.fillStyle = '#ffffff';
            projected.forEach(function(p) {
              ctx.beginPath();
              ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
              ctx.fill();
            });
            ctx.restore();
          } else if (style === 'wave') {
            var barCount = 7, barSpacing = 7, barW = 4;
            var totalW = barCount * barW + (barCount - 1) * (barSpacing - barW);
            var startX = cx - totalW / 2;
            for (var i = 0; i < barCount; i++) {
              var bx = startX + i * barSpacing;
              var phase = time * 2.5 + i * 0.55;
              var barH = 6 + 18 * Math.abs(Math.sin(phase));
              var by = loaderY - barH / 2;
              var grad = ctx.createLinearGradient(bx, by, bx, by + barH);
              grad.addColorStop(0, activeColor);
              grad.addColorStop(1, '#bb9af7');
              ctx.save();
              ctx.fillStyle = grad;
              ctx.shadowColor = activeColor;
              ctx.shadowBlur = 6;
              ctx.beginPath();
              if (typeof ctx.roundRect === 'function') {
                ctx.roundRect(bx, by, barW, barH, 2);
              } else {
                ctx.rect(bx, by, barW, barH);
              }
              ctx.fill();
              ctx.restore();
            }
          } else {
            var barW = 160, barH = 3.5;
            var rx = cx - barW / 2;
            var ry = loaderY - barH / 2;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.beginPath();
            if (typeof ctx.roundRect === 'function') {
              ctx.roundRect(rx, ry, barW, barH, 2);
            } else {
              ctx.rect(rx, ry, barW, barH);
            }
            ctx.fill();
            var barWFill = barW * 0.42;
            var slideProgress = (time * 0.5) % 1.6;
            var fillX = rx - barWFill + (slideProgress / 1.6) * (barW + barWFill);
            fillX = Math.max(rx, Math.min(rx + barW - barWFill, fillX));
            var barGrad = ctx.createLinearGradient(fillX, ry, fillX + barWFill, ry);
            barGrad.addColorStop(0, activeColor);
            barGrad.addColorStop(1, '#bb9af7');
            ctx.save();
            ctx.shadowColor = activeColor;
            ctx.shadowBlur = 10;
            ctx.fillStyle = barGrad;
            ctx.beginPath();
            if (typeof ctx.roundRect === 'function') {
              ctx.roundRect(fillX, ry, barWFill, barH, 2);
            } else {
              ctx.rect(fillX, ry, barWFill, barH);
            }
            ctx.fill();
            ctx.restore();
          }
        }

        function startSpinner(canvas, style, color) {
          var ctx = canvas.getContext('2d');
          if (!ctx) return function() {};
          var width = 220, height = 70;
          var dpr = window.devicePixelRatio || 1;
          canvas.width = Math.round(width * dpr);
          canvas.height = Math.round(height * dpr);
          canvas.style.width = width + 'px';
          canvas.style.height = height + 'px';
          var cx = width / 2, cy = height / 2;
          var lastTimestamp = performance.now();
          var virtualTime = 0;
          var animId = null;
          function loop(now) {
            var delta = Math.min(Math.max(0, (now - lastTimestamp) / 1000), 0.033);
            lastTimestamp = now;
            virtualTime += delta;
            ctx.save();
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, width, height);
            drawSpinner(ctx, style, color, cx, cy, virtualTime);
            ctx.restore();
            animId = requestAnimationFrame(loop);
          }
          animId = requestAnimationFrame(loop);
          return function() {
            if (animId !== null) {
              cancelAnimationFrame(animId);
              animId = null;
            }
          };
        }

        function applyPreloaderSettings() {
          try {
            var raw = localStorage.getItem('qunix_theme_settings');
            var s = raw ? JSON.parse(raw) : {};
            if (s.enable_preloader === false) {
              var css = document.getElementById('qunix-build-preloader-css');
              if (css) css.remove();
              var shell = document.getElementById('qunix-preloader-shell');
              if (shell) shell.remove();
              return;
            }
            var shell = document.getElementById('qunix-preloader-shell');
            if (!shell) return;
            
            var bg = s.preloader_bg_image || s.preloaderBgImage || s.background_image || s.backgroundImage || s.wallpaper || s.wallpaper_image || '';
            if (bg && bg.trim()) {
              shell.style.backgroundImage = 'url("' + bg + '")';
            }
            if (s.preloader_bg_color || s.preloaderBgColor) {
              shell.style.backgroundColor = s.preloader_bg_color || s.preloaderBgColor;
            }

            var iconImg = document.getElementById('qunix-preloader-icon');
            var isBannerPreloader = false;
            if (iconImg) {
              var logo = s.preloader_logo || s.preloaderLogo || s.site_logo || s.siteLogo || s.app_logo || s.appLogo || '';
              if (!logo) {
                try {
                  var g = JSON.parse(localStorage.getItem('global') || '{}');
                  if (g?.state?.settings?.app?.banner) {
                    logo = g.state.settings.app.banner;
                    isBannerPreloader = true;
                  } else {
                    logo = g?.state?.settings?.app?.icon || g?.state?.settings?.app?.iconLight || '';
                  }
                } catch (_) {}
              }
              if (!logo) {
                try {
                  var pSettings = JSON.parse(localStorage.getItem('settings') || localStorage.getItem('panel_settings') || '{}');
                  if (pSettings?.app?.banner) {
                    logo = pSettings.app.banner;
                    isBannerPreloader = true;
                  } else {
                    logo = pSettings?.app?.icon || pSettings?.app?.iconLight || '';
                  }
                } catch (_) {}
              }
              if (!logo) logo = '/icon.svg';
              if (logo.indexOf('banner') !== -1 || logo.indexOf('2016') !== -1) {
                isBannerPreloader = true;
              }
              iconImg.src = logo;
              if (isBannerPreloader) {
                iconImg.style.maxWidth = 'min(520px, 92vw)';
                iconImg.style.maxHeight = '130px';
                iconImg.style.marginBottom = '16px';
              }
            }

            var titleEl = document.getElementById('qunix-preloader-title');
            if (titleEl) {
              var appTitle = s.site_title || s.siteTitle || s.app_title || s.appTitle || '';
              if (!appTitle) {
                try {
                  var g = JSON.parse(localStorage.getItem('global') || '{}');
                  appTitle = g?.state?.settings?.app?.name || '';
                } catch (_) {}
              }
              if (!appTitle) {
                try {
                  var pSettings = JSON.parse(localStorage.getItem('settings') || localStorage.getItem('panel_settings') || '{}');
                  appTitle = pSettings?.app?.name || '';
                } catch (_) {}
              }
              if (!appTitle) {
                var ogSite = document.querySelector('meta[property="og:site_name"]');
                if (ogSite && ogSite.getAttribute('content')) {
                  appTitle = ogSite.getAttribute('content');
                }
              }
              if (!appTitle) {
                var appMeta = document.querySelector('meta[name="application-name"]');
                if (appMeta && appMeta.getAttribute('content')) {
                  appTitle = appMeta.getAttribute('content');
                }
              }
              if (!appTitle && document.title) {
                var cleaned = document.title.split(' - ')[0].split(' | ')[0].trim();
                if (cleaned && cleaned !== 'Calagopus') {
                  appTitle = cleaned;
                }
              }
              if (!appTitle) appTitle = 'Calagopus';

              if (isBannerPreloader) {
                titleEl.style.display = 'none';
              } else {
                titleEl.textContent = appTitle;
                titleEl.style.display = 'block';
              }
            }

            var color = s.preloader_color || s.preloaderColor || s.accent_color || s.accentColor || s.button_color || s.buttonColor || '#7aa2f7';
            var style = s.preloader_style || s.preloaderStyle || 'bar';
            var canvas = document.getElementById('qunix-preloader-spinner-canvas');

            if (canvas) {
              if (window.__qunixStaticPreloaderStop) {
                try { window.__qunixStaticPreloaderStop(); } catch(_) {}
              }
              window.__qunixStaticPreloaderStop = startSpinner(canvas, style, color);
            }

            var textEl = document.getElementById('qunix-preloader-text');
            var txt = s.preloader_text || s.preloaderText;
            if (!txt || !txt.trim()) {
              txt = 'INITIALIZING PANEL...';
            }
            if (textEl) {
              textEl.textContent = txt.trim();
              textEl.style.display = 'block';
            }
          } catch(e) {}
        }
        applyPreloaderSettings();
        if (document.readyState !== 'complete') {
          window.addEventListener('DOMContentLoaded', applyPreloaderSettings);
        }
      })();
    </script>
  </div>`;

      // Inject style in head
      let transformedHtml = html.replace('</head>', `${preloaderStyles}\n</head>`);
      // Replace root div with preloader shell + instant script
      transformedHtml = transformedHtml.replace(/<div id="root">[\s\S]*?<\/div>/, preloaderRoot);
      return transformedHtml;
    },
  };
}
