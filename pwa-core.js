const PWA_CONFIG = {
  APP_NAME:    'Lịch sử dụng nhà sinh hoạt',
  APP_DESC:    'Quản lý và theo dõi lịch sử dụng nhà sinh hoạt cộng đồng',
  APP_ICON:    'icon-1000.png',
  APP_VERSION: 'v1.0.0',
  THEME_COLOR: '#0d47a1',
  ACCENT_COLOR:'#008EFF',
  BADGE_LABEL: 'Ứng dụng cộng đồng',
  SW_PATH:     'sw.js',
  SPLASH_DELAY:  3000,   // ms — ẩn splash sau khi load xong
  SPLASH_MAX:    6000,   // ms — fallback nếu load treo
  OVERLAY_DELAY: 1000,   // ms — delay hiện overlay cài đặt (Android/PC)
  IOS_DELAY:     1500,   // ms — delay hiện overlay iOS

  // ── Xoay màn hình ──────────────────────────────────────────────
  // 'any'        → cho phép xoay tự do (mặc định)
  // 'portrait'   → khoá dọc
  // 'landscape'  → khoá ngang
  ORIENTATION: 'portrait',

  // ── Giữ màn hình luôn sáng ─────────────────────────────────────
  // true  → bật Wake Lock (màn hình không tắt khi mở app)
  // false → tắt (hành vi mặc định của hệ thống)
  WAKE_LOCK: true,
};

/* ─────────────────────────────────────────────────────────────────
   BƯỚC 1 — CSS CRITICAL: Inject NGAY SYNCHRONOUS vào <head>
   Chạy trước khi browser vẽ bất kỳ pixel nào → triệt tiêu FOUC
───────────────────────────────────────────────────────────────── */
(function injectCSS() {
  const T = PWA_CONFIG.THEME_COLOR;
  const A = PWA_CONFIG.ACCENT_COLOR;

  const css = `
/* ══ NỀN KHỞI ĐỘNG — không dùng splash, chỉ giữ màu nền xanh ══ */
/* Che khoảng trắng trong lúc app load mà không cần splash screen  */
body { background: linear-gradient(135deg, #0d1b2a 0%, #1b2d45 50%, #0d1b2a 100%); }


/* ══ INSTALL OVERLAY ═════════════════════════════════════════════ */
#pwa-overlay {
  position: fixed; inset: 0; z-index: 99998;
  background: rgba(0,0,0,.5);
  backdrop-filter: blur(28px) saturate(180%);
  -webkit-backdrop-filter: blur(28px) saturate(180%);
  display: none; align-items: center; justify-content: center;
  padding: 16px env(safe-area-inset-right, 16px) 16px env(safe-area-inset-left, 16px);
  animation: pwaOverlayIn .25s ease both;
}
#pwa-overlay.pwa-active { display: flex; }
@keyframes pwaOverlayIn {
  from { opacity: 0; } to { opacity: 1; }
}
#pwa-card {
  /* iOS-style frosted glass */
  background: rgba(255,255,255,.82);
  backdrop-filter: blur(40px) saturate(200%);
  -webkit-backdrop-filter: blur(40px) saturate(200%);
  border: 1px solid rgba(255,255,255,.9);
  width: 100%; max-width: 380px;
  border-radius: 28px;
  padding: 28px 24px 24px;
  box-shadow:
    0 0 0 1px rgba(255,255,255,.6) inset,
    0 32px 80px rgba(0,0,0,.28),
    0 8px 24px rgba(0,0,0,.14);
  animation: pwaCardIn .4s cubic-bezier(.32,1.28,.64,1) both;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif;
  position: relative;
  overflow: hidden;
}
/* Drag handle — hidden for centered dialog */
#pwa-card::before { display: none; }
/* Noise texture overlay for depth */
#pwa-card::after {
  content: '';
  position: absolute; inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
  opacity: .4;
}
@keyframes pwaCardIn {
  from { opacity: 0; transform: scale(.88) translateY(12px); }
  to   { opacity: 1; transform: scale(1)   translateY(0); }
}
.pwa-icon-box {
  width: 64px; height: 64px; border-radius: 18px;
  background: linear-gradient(135deg, ${A}, ${T});
  display: flex; align-items: center; justify-content: center;
  font-size: 30px; flex-shrink: 0;
  box-shadow: 0 6px 20px rgba(13,71,161,.3), 0 1px 0 rgba(255,255,255,.5) inset;
  margin: 0 auto 14px;
}
.pwa-app-name { font-size: 20px; font-weight: 800; color: ${T}; text-align: center; word-break: break-word; overflow-wrap: break-word; line-height: 1.3; max-width: 100%; hyphens: auto; }
.pwa-app-desc { font-size: 13px; color: rgba(0,0,0,.45); margin-top: 4px; text-align: center; }
.pwa-divider  { height: 1px; background: rgba(0,0,0,.08); margin: 16px 0; }
.pwa-step     { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 14px; }
.pwa-step-num {
  width: 28px; height: 28px; border-radius: 50%;
  background: rgba(13,71,161,.1); color: ${T};
  font-weight: 800; font-size: 13px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; margin-top: 1px;
  border: 1px solid rgba(13,71,161,.15);
}
.pwa-step-text { font-size: 14px; color: rgba(0,0,0,.75); line-height: 1.6; }
.pwa-step-text b { color: ${T}; }
.pwa-cta-text {
  font-size: 16px; color: rgba(0,0,0,.7); margin-bottom: 18px;
  line-height: 1.6; text-align: center;
}
.pwa-warn {
  background: rgba(255,193,7,.12); border: 1px solid rgba(255,193,7,.4);
  border-radius: 12px; padding: 10px 14px;
  font-size: 13px; color: #7a5c00; font-weight: 600;
  margin-bottom: 18px;
}
#pwa-btn-install {
  width: 100%; padding: 16px;
  background: linear-gradient(135deg, ${A}, ${T});
  color: #fff; border: none; border-radius: 16px;
  font-size: 17px; font-weight: 800;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(13,71,161,.35), 0 1px 0 rgba(255,255,255,.25) inset;
  display: flex; align-items: center; justify-content: center; gap: 10px;
  transition: transform .15s, box-shadow .15s;
  letter-spacing: -.2px;
}
#pwa-btn-install:hover  { transform: translateY(-1px); box-shadow: 0 12px 32px rgba(13,71,161,.45), 0 1px 0 rgba(255,255,255,.25) inset; }
#pwa-btn-install:active { transform: scale(.97); box-shadow: 0 4px 12px rgba(13,71,161,.3); }
.pwa-dismiss {
  display: table; margin: 14px auto 0;
  font-size: 13px; color: rgba(0,0,0,.4);
  border: 1px solid rgba(0,0,0,.12); border-radius: 10px;
  cursor: pointer; user-select: none;
  padding: 7px 18px; background: rgba(0,0,0,.04);
  text-align: center; transition: background .2s ease, color .2s ease;
  font-weight: 500;
}
.pwa-dismiss:hover { background: rgba(0,0,0,.1); color: rgba(0,0,0,.7); }
.pwa-badge {
  display: inline-block;
  background: rgba(13,71,161,.1); color: #1565c0;
  font-size: 11px; font-weight: 700;
  border-radius: 8px; padding: 3px 10px;
  margin: 8px 0 0;
  border: 1px solid rgba(13,71,161,.15);
}
.pwa-after-note {
  margin-top: 14px; font-size: 12px; color: rgba(0,0,0,.35);
  line-height: 1.6; text-align: center;
}
/* ── Nút xem hình minh hoạ ── */
.pwa-guide-btn {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  width: 100%; margin: 14px 0 4px;
  padding: 12px 16px;
  background: rgba(13,71,161,.08);
  border: 1.5px solid rgba(13,71,161,.25);
  border-radius: 14px;
  font-size: 14px; font-weight: 700; color: ${T};
  cursor: pointer; transition: background .18s, transform .12s;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
}
.pwa-guide-btn:active { background: rgba(13,71,161,.16); transform: scale(.97); }

/* ══ GUIDE PANEL fullscreen ══════════════════════════════════════ */
#pwa-guide-panel {
  position: fixed; inset: 0; z-index: 99999;
  background: linear-gradient(160deg,#0a1628 0%,#0d2144 55%,#0a1628 100%);
  display: none; flex-direction: column;
  overflow-y: auto; -webkit-overflow-scrolling: touch;
}
#pwa-guide-panel.open { display: flex; }
@keyframes gpIn { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:none} }
#pwa-gp-close {
  position: sticky; top: 0; z-index: 2;
  display: flex; align-items: center; gap: 8px;
  padding: 14px 18px 10px;
  background: linear-gradient(to bottom,rgba(10,22,40,1) 70%,transparent);
  border: none; cursor: pointer; width: 100%;
  font-family: -apple-system,sans-serif;
  color: rgba(255,255,255,.55); font-size: 14px; font-weight: 600;
}
#pwa-gp-close-icon {
  width: 30px; height: 30px; border-radius: 50%;
  background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.2);
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; color: #fff; flex-shrink: 0;
}
#pwa-gp-heading {
  text-align: center; padding: 4px 20px 16px;
  animation: gpIn .4s .05s ease both;
}
#pwa-gp-heading h2 {
  font-family: -apple-system,sans-serif;
  font-size: 20px; font-weight: 800; color: #fff; margin: 0 0 4px;
}
#pwa-gp-heading p { font-size: 13px; color: rgba(255,255,255,.45); margin: 0; }
#pwa-gp-body {
  display: flex; align-items: flex-start; justify-content: center;
  gap: 18px; padding: 0 16px 28px; flex-wrap: wrap;
  animation: gpIn .4s .1s ease both;
}
#pwa-gp-phone { flex-shrink: 0; width: 186px; filter: drop-shadow(0 20px 48px rgba(0,0,0,.7)); }
#pwa-gp-phone img { width: 100%; height: auto; display: block; border-radius: 26px; }
#pwa-gp-steps { flex: 1; min-width: 180px; max-width: 260px; display: flex; flex-direction: column; gap: 9px; padding-top: 4px; }
.gp-step {
  display: flex; align-items: flex-start; gap: 10px;
  background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1);
  border-radius: 13px; padding: 10px 12px;
  animation: gpIn .4s ease both;
}
.gp-step:nth-child(1){animation-delay:.12s}.gp-step:nth-child(2){animation-delay:.18s}
.gp-step:nth-child(3){animation-delay:.24s}.gp-step:nth-child(4){animation-delay:.30s}
.gp-step:nth-child(5){animation-delay:.36s}.gp-step:nth-child(6){animation-delay:.42s}
.gp-num {
  width: 26px; height: 26px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 800; font-family: -apple-system,sans-serif; border: 1.5px solid;
}
.gp-n1{background:rgba(0,190,255,.15);border-color:rgba(0,190,255,.5);color:#00beff}
.gp-n2{background:rgba(255,200,0,.12);border-color:rgba(255,200,0,.45);color:#ffc800}
.gp-n3{background:rgba(50,230,120,.12);border-color:rgba(50,230,120,.45);color:#32e678}
.gp-n4{background:rgba(255,100,150,.12);border-color:rgba(255,100,150,.45);color:#ff6496}
.gp-n5{background:rgba(180,100,255,.12);border-color:rgba(180,100,255,.45);color:#c97aff}
.gp-n6{background:rgba(255,160,50,.12);border-color:rgba(255,160,50,.45);color:#ffa032}
.gp-text { font-family: -apple-system,sans-serif; font-size: 13px; line-height: 1.55; color: rgba(255,255,255,.82); }
.gp-text b { font-weight: 700; }
.c-blue{color:#4fc3f7;font-weight:700} .c-green{color:#69f0ae;font-weight:700}
.c-yellow{color:#ffd54f;font-weight:700} .c-purple{color:#c97aff;font-weight:700}
#pwa-gp-note {
  margin: 0 16px 32px;
  background: rgba(50,230,120,.1); border: 1px solid rgba(50,230,120,.3);
  border-radius: 13px; padding: 12px 16px;
  font-family: -apple-system,sans-serif; font-size: 13px;
  color: #69f0ae; font-weight: 600; text-align: center; line-height: 1.5;
  animation: gpIn .4s .44s ease both;
}
`;

  // Inject vào <head> NGAY LẬP TỨC — synchronous, không chờ DOM
  // → CSS có mặt trước khi browser render bất kỳ pixel nào của <body>
  const style = document.createElement('style');
  style.id = 'pwa-core-css';
  style.textContent = css;
  document.head.appendChild(style);
})();

/* ─────────────────────────────────────────────────────────────────
   BƯỚC 2 — Không dùng splash screen.
   Màu nền xanh đã được inject qua CSS ở BƯỚC 1 (body background).
───────────────────────────────────────────────────────────────── */

/* ─────────────────────────────────────────────────────────────────
   BƯỚC 3 — OVERLAY HTML + LOGIC: Chờ DOMContentLoaded
   Overlay không cần hiện ngay → inject sau khi DOM sẵn sàng là đủ
───────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function onDOMReady() {
  document.removeEventListener('DOMContentLoaded', onDOMReady);

  /* ── Inject Overlay HTML ── */
  (function injectOverlay() {
    const { APP_NAME, APP_DESC, BADGE_LABEL } = PWA_CONFIG;
    
    // Escape helper — chống XSS nhưng giữ lại thẻ <br> để xuống dòng
    const esc = (s) => s
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/&lt;br&gt;/gi, '<br>'); // Cho phép thẻ <br> để xuống dòng

    const overlay = document.createElement('div');
    overlay.id = 'pwa-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Cài đặt ứng dụng');
    overlay.innerHTML = `
    <div id="pwa-card">
      <div style="text-align:center; margin-bottom:20px;">
        <div class="pwa-icon-box">📲</div>
        <div class="pwa-app-name">${esc(APP_NAME)}</div>
        <div class="pwa-app-desc">${esc(APP_DESC)}</div>
        <div><span class="pwa-badge">${esc(BADGE_LABEL)}</span></div>
      </div>
      <div class="pwa-divider"></div>

      <!-- Android / Desktop / Chrome -->
      <div id="pwa-block-android" hidden>
        <div class="pwa-cta-text">
          Cài lên màn hình chính<br>Y như một ứng dụng<br>(không cần app store)
        </div>
        <button id="pwa-btn-install" type="button">
          <span style="font-size:22px">📥</span> Cài đặt ứng dụng
        </button>
        <div class="pwa-after-note">
          ✅ Sau khi cài xong, hãy mở app từ màn hình chính — không cần vào link này nữa.<br>
          🗑️ Gỡ cài đặt: Chuột phải vào icon → <b>Gỡ cài đặt</b> (PC) hoặc giữ icon → <b>Xoá</b> (Android)
        </div>
      </div>

      <!-- iOS Safari -->
      <div id="pwa-block-ios" hidden>
        <div class="pwa-warn">
          ⚠️ Phải mở bằng <b>Safari</b> — không dùng Chrome, Zalo, Facebook
        </div>
        <div class="pwa-step">
          <div class="pwa-step-num">1</div>
          <div class="pwa-step-text">Đi tới <b>Safari</b> 🧭 trên iPhone của bạn</div>
        </div>
        <div class="pwa-step">
          <div class="pwa-step-num">2</div>
          <div class="pwa-step-text">Truy cập vào <b>trang web</b> này</div>
        </div>
        <div class="pwa-step">
          <div class="pwa-step-num">3</div>
          <div class="pwa-step-text">Chạm vào <b>nút Chia sẻ 📤</b> — nếu tab ở Dưới/Trên cùng thì chạm vào <b>⬆️</b></div>
        </div>
        <div class="pwa-step">
          <div class="pwa-step-num">4</div>
          <div class="pwa-step-text">Cuộn danh sách xuống, chạm vào <b>"Thêm vào Màn hình chính" 🏠</b></div>
        </div>
        <div class="pwa-step">
          <div class="pwa-step-num">5</div>
          <div class="pwa-step-text">Bật <b>Mở dưới dạng ứng dụng web</b></div>
        </div>
        <div class="pwa-step">
          <div class="pwa-step-num">6</div>
          <div class="pwa-step-text">Chạm vào <b>"Thêm"</b> ✅</div>
        </div>
        <button class="pwa-guide-btn" id="pwa-btn-guide" type="button">
          🖼️ Xem hình minh hoạ từng bước
        </button>
        <div class="pwa-after-note">
          ✅ Sau khi cài xong, mở app từ màn hình chính — không cần vào link này nữa.
        </div>
      </div>

      <button class="pwa-dismiss" id="pwa-btn-dismiss" type="button">Để sau</button>
    </div>
  `;
    document.body.appendChild(overlay);

    /* ── Guide Panel HTML ── */
    const gp = document.createElement('div');
    gp.id = 'pwa-guide-panel';
    gp.innerHTML = `
      <button id="pwa-gp-close" type="button" aria-label="Đóng">
        <span id="pwa-gp-close-icon">✕</span>
        <span>Đóng hướng dẫn</span>
      </button>
      <div id="pwa-gp-heading">
        <h2>📲 Thêm vào Màn hình chính</h2>
        <p>Thực hiện từng bước trên iPhone của bạn</p>
      </div>
      <div id="pwa-gp-body">
        <div id="pwa-gp-phone"><img src="ip.png" alt="Minh hoạ iPhone"></div>
        <div id="pwa-gp-steps">
          <div class="gp-step">
            <div class="gp-num gp-n1">1</div>
            <div class="gp-text">Mở <b>Safari</b> 🧭 trên iPhone —<br><span class="c-blue">không dùng Chrome, Zalo, Facebook</span></div>
          </div>
          <div class="gp-step">
            <div class="gp-num gp-n2">2</div>
            <div class="gp-text">Truy cập vào <b>trang web</b> này</div>
          </div>
          <div class="gp-step">
            <div class="gp-num gp-n3">3</div>
            <div class="gp-text">Chạm <span class="c-yellow">nút Chia sẻ 📤</span><br>ở thanh Safari phía dưới hoặc trên</div>
          </div>
          <div class="gp-step">
            <div class="gp-num gp-n4">4</div>
            <div class="gp-text">Cuộn xuống, chọn<br><span class="c-green">➕ Thêm vào Màn hình chính</span></div>
          </div>
          <div class="gp-step">
            <div class="gp-num gp-n5">5</div>
            <div class="gp-text">Bật <span class="c-purple"><b>Mở dưới dạng ứng dụng web</b></span></div>
          </div>
          <div class="gp-step">
            <div class="gp-num gp-n6">6</div>
            <div class="gp-text">Chạm <b>"Thêm"</b> góc trên phải ✅</div>
          </div>
        </div>
      </div>
      <div id="pwa-gp-note">✅ Sau khi cài xong — mở app từ màn hình chính<br>không cần vào link này nữa</div>
    `;
    document.body.appendChild(gp);
  })();

  /* ─────────────────────────────────────────────────────────────
     BƯỚC 3b — LOGIC: Splash timer + Overlay + SW
     Chạy bên trong DOMContentLoaded đã mở ở trên
  ───────────────────────────────────────────────────────────── */
  const cfg = PWA_CONFIG;

  /* ── Helpers ── */
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  // navigator.standalone: true=PWA đã cài, false=Safari thường, undefined=non-iOS
  // Phải === true để tránh undefined bị hiểu sai
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches
                    || (/** @type {any} */(window.navigator).standalone === true);

  /* ── Overlay helpers ── */
  const overlay = document.getElementById('pwa-overlay');
  const card    = document.getElementById('pwa-card');

  // ═══════════════════════════════════════════════════════
  // KIỂM TRA ĐÃ CÀI APP CHƯA
  // ═══════════════════════════════════════════════════════
  function hasInstalled() {
    try {
      return localStorage.getItem('pwa-installed') === '1';
    } catch (_) {
      return false;
    }
  }

  function markAsInstalled() {
    try {
      localStorage.setItem('pwa-installed', '1');
    } catch (_) {}
  }

  function clearInstalledFlag() {
    try {
      localStorage.removeItem('pwa-installed');
    } catch (_) {}
  }

  function showOverlay(type) {
    if (!overlay) return;
    const blockAndroid = document.getElementById('pwa-block-android');
    const blockIOS     = document.getElementById('pwa-block-ios');
    if (type === 'android') {
      blockAndroid?.removeAttribute('hidden');
      blockIOS?.setAttribute('hidden', '');
    } else {
      blockIOS?.removeAttribute('hidden');
      blockAndroid?.setAttribute('hidden', '');
    }
    overlay.classList.add('pwa-active');
    if (card) { card.style.animation = 'none'; card.offsetHeight; card.style.animation = ''; }
    overlay.setAttribute('tabindex', '-1');
    overlay.focus();
  }

  window.showPwaOverlay = () => showOverlay(isIOS ? 'ios' : 'android');

  function hideOverlay() {
    if (!overlay) return;
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity .25s ease';
    setTimeout(() => {
      overlay.classList.remove('pwa-active');
      overlay.style.opacity = '';
      overlay.style.transition = '';
    }, 260);
  }

  window.dismissPwaOverlay = hideOverlay;
  document.getElementById('pwa-btn-dismiss')?.addEventListener('click', hideOverlay);
  overlay?.addEventListener('click', (e) => { if (e.target === overlay) hideOverlay(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay?.classList.contains('pwa-active')) hideOverlay();
  });

  /* ── Guide panel iOS ── */
  const gpEl = document.getElementById('pwa-guide-panel');
  document.getElementById('pwa-btn-guide')?.addEventListener('click', () => {
    gpEl?.classList.add('open');
    gpEl?.scrollTo(0, 0);
  });
  function closeGP() { gpEl?.classList.remove('open'); }
  document.getElementById('pwa-gp-close')?.addEventListener('click', closeGP);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeGP(); });

  /* ─────────────────────────────────────────────────────────────
     TÍNH NĂNG MỚI #1 — SCREEN ORIENTATION LOCK
     Khoá hoặc cho phép xoay màn hình theo PWA_CONFIG.ORIENTATION
     Chỉ hoạt động khi app đang chạy ở chế độ standalone (đã cài)
     hoặc nếu browser hỗ trợ khi ở tab thường.

     Cấu hình:
       ORIENTATION: 'any'       → xoay tự do (mặc định)
       ORIENTATION: 'portrait'  → khoá dọc
       ORIENTATION: 'landscape' → khoá ngang
  ───────────────────────────────────────────────────────────── */
  (function initOrientation() {
    const mode = cfg.ORIENTATION || 'any';
    // 'any' → không cần làm gì, đây là hành vi mặc định của browser
    if (mode === 'any') return;

    const screenOrientation = screen?.orientation;
    if (!screenOrientation || typeof screenOrientation.lock !== 'function') {
      console.info('[PWA] Screen Orientation API không được hỗ trợ trên thiết bị này.');
      return;
    }

    // Map giá trị config → chuỗi hợp lệ của Screen Orientation API
    const orientationMap = {
      portrait:  'portrait-primary',
      landscape: 'landscape-primary',
    };
    const lockValue = orientationMap[mode] || mode;

    // Khoá xoay — API yêu cầu user gesture hoặc fullscreen ở một số browser;
    // dùng 'load' để thử sớm nhất có thể.
    window.addEventListener('load', () => {
      screenOrientation.lock(lockValue)
        .then(() => console.info(`[PWA] Orientation locked: ${lockValue}`))
        .catch((err) => console.warn('[PWA] Orientation lock failed:', err.message));
    }, { once: true });

    // Expose để có thể mở khoá thủ công từ code ngoài nếu cần
    window.pwaUnlockOrientation = () => screenOrientation.unlock();
    window.pwaLockOrientation   = (val) => screenOrientation.lock(val || lockValue);
  })();

  /* ─────────────────────────────────────────────────────────────
     TÍNH NĂNG MỚI #2 — WAKE LOCK (giữ màn hình luôn sáng)
     Sử dụng Screen Wake Lock API (được hỗ trợ tốt trên Chrome/Edge/Android)
     iOS Safari hỗ trợ từ iOS 16.4+.

     Cấu hình:
       WAKE_LOCK: true  → bật giữ sáng
       WAKE_LOCK: false → tắt (mặc định)

     Tự động xin lại Wake Lock khi tab được focus trở lại
     (vì Wake Lock bị hủy khi người dùng chuyển tab / khoá máy).
  ───────────────────────────────────────────────────────────── */
  (function initWakeLock() {
    if (!cfg.WAKE_LOCK) return;

    if (!('wakeLock' in navigator)) {
      console.info('[PWA] Wake Lock API không được hỗ trợ trên trình duyệt này.');
      return;
    }

    let wakeLockSentinel = null;

    async function requestWakeLock() {
      try {
        wakeLockSentinel = await navigator.wakeLock.request('screen');
        wakeLockSentinel.addEventListener('release', () => {
          console.info('[PWA] Wake Lock đã được giải phóng.');
          wakeLockSentinel = null;
        });
        console.info('[PWA] Wake Lock đã bật — màn hình sẽ không tắt.');
      } catch (err) {
        // Thường gặp nếu tab không ở foreground hoặc hệ thống từ chối
        console.warn('[PWA] Wake Lock request failed:', err.message);
      }
    }

    // Xin Wake Lock ngay khi trang load xong
    window.addEventListener('load', requestWakeLock, { once: true });

    // Tự động xin lại khi tab được focus trở lại
    // (Wake Lock bị hủy tự động khi tab mất focus / máy khoá màn hình)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && !wakeLockSentinel) {
        requestWakeLock();
      }
    });

    // Expose để tắt/bật thủ công từ code ngoài nếu cần
    window.pwaReleaseWakeLock = async () => {
      if (wakeLockSentinel) {
        await wakeLockSentinel.release();
        wakeLockSentinel = null;
      }
    };
    window.pwaRequestWakeLock = requestWakeLock;
  })();

  /* ── Service Worker + Auto-update ── */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register(cfg.SW_PATH)
        .then((reg) => {
          reg.addEventListener('updatefound', () => {
            const nw = reg.installing;
            if (!nw) return;
            nw.addEventListener('statechange', () => {
              if (nw.state === 'installed' && navigator.serviceWorker.controller) {
                if (confirm('🔄 Đã có phiên bản mới! Nhấn OK để cập nhật.')) {
                  nw.postMessage({ type: 'SKIP_WAITING' });
                  navigator.serviceWorker.addEventListener('controllerchange',
                    () => window.location.reload(), { once: true });
                }
              }
            });
          });
        })
        .catch((err) => console.warn('[PWA] SW registration failed:', err));
    });
  }

  /* ─────────────────────────────────────────────────────────────
     LOGIC HIỂN THỊ OVERLAY (FIX LỖI CHROME ANDROID)
     
     Vấn đề: Trên Chrome Android, sau khi cài app từ overlay và mở app
     từ màn hình chính (standalone), trình duyệt vẫn có thể mở lại 
     tab Chrome cũ. Tab cũ này KHÔNG ở standalone mode, và localStorage
     'pwa-installed' đã được set → code cũ sẽ xoá flag này và hiện lại overlay.
     
     Fix: Chỉ xoá flag và hiện overlay khi CHẮC CHẮN không phải standalone
     VÀ không có beforeinstallprompt event đã từng fire.
  ───────────────────────────────────────────────────────────── */
  
  // Nếu đang ở standalone → KHÔNG hiện overlay (app đã cài và đang chạy đúng)
  if (isStandalone) {
    console.info('[PWA] App đang chạy ở chế độ standalone — không hiện overlay');
    return;
  }

  /* ── iOS: hiện overlay ── */
  if (isIOS) {
    // iOS: nếu không ở standalone, luôn hiện overlay
    // (không cần check localStorage vì iOS Safari dễ bị mất flag)
    clearInstalledFlag(); // Xoá flag cũ nếu có
    setTimeout(() => showOverlay('ios'), cfg.IOS_DELAY);
  }

  /* ── Android / PC: beforeinstallprompt + fallback ── */
  if (!isIOS) {
    let deferredPrompt = null;
    let shown = false;
    let beforeinstallpromptFired = false; // ← THÊM FLAG NÀY

    function showAndroid() {
      if (shown) return;
      shown = true;
      showOverlay('android');
    }

    // Lắng nghe beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      beforeinstallpromptFired = true; // ← ĐÁNH DẤU event đã fire
      
      // Nếu browser fire event này, nghĩa là đủ điều kiện cài đặt
      // Hiện overlay sau delay
      setTimeout(showAndroid, cfg.OVERLAY_DELAY);
      
      // Xử lý nút cài đặt
      document.getElementById('pwa-btn-install')?.addEventListener('click', async () => {
        hideOverlay();
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        deferredPrompt = null;
        if (outcome === 'accepted') {
          markAsInstalled();
        }
      }, { once: true });
    });

    // Kiểm tra xem có nên hiện fallback sau 3s không
    setTimeout(() => {
      // Chỉ hiện fallback nếu beforeinstallprompt CHƯA fire
      // (trường hợp browser không hỗ trợ hoặc đã từ chối trước đó)
      if (!beforeinstallpromptFired) {
        console.info('[PWA] beforeinstallprompt không fire — hiện fallback overlay');
        
        // Trong trường hợp fallback, kiểm tra localStorage
        if (hasInstalled()) {
          // Nếu đã có flag nhưng beforeinstallprompt không fire
          // Có thể user đã cài rồi xoá, hoặc localStorage còn sót
          // Vì không có cách nào xác định chính xác, ta xoá flag và hiện overlay
          clearInstalledFlag();
        }
        
        showAndroid();
      }
    }, 3000);

    // Khi app được cài đặt thành công (qua bất kỳ cách nào)
    window.addEventListener('appinstalled', () => {
      hideOverlay();
      markAsInstalled();
    });
  }

}); // end DOMContentLoaded