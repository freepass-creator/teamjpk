/* teamjpk — 자체 스크립트 (별밤 캔버스 직접 구현 · 콘텐츠 렌더 · 인터랙션) */
(function () {
  "use strict";

  /* ── 데이터 ── */
  var SERVICES = [
    { n: "01", cat: "FLAGSHIP · 렌터카 관리 ERP", name: "렌터카매니저", desc: "차량 자산·계약·보험·수납·정비까지 렌터카 운영 전반을 통합 관리하는 자체 ERP. 차량 등록증 OCR 자동입력과 감사 로그 등 현장에서 다듬은 실전 기능을 갖췄습니다.", href: "https://freepasserp.com", cls: "s1", ic: "car" },
    { n: "02", cat: "영업중개 ERP · 플랫폼", name: "Freepasserp", desc: "렌터카사와 영업파트너를 잇는 영업중개 ERP·플랫폼. 상품·매물 동기화, 견적·계약·정산, 매물 공개 API까지 한 곳에서 자동화합니다.", href: "https://freepasserp.com", cls: "s2", ic: "link" },
    { n: "03", cat: "거래안전 플랫폼", name: "착한거래", desc: "비금융 거래의 거래이력을 본인 동의 기반으로 확인합니다. 신분증·셀카 본인확인과 거래이력 확인서 발급으로 안전한 거래를 돕습니다.", href: "#", cls: "s3", ic: "shield" },
    { n: "04", cat: "신차 렌탈 견적", name: "신차 렌탈 견적기", desc: "신차 장기렌탈 견적을 차종·트림·옵션별로 즉시 산출하는 견적 엔진. 웰릭스모빌리티 등 협력사 현장에 적용 중입니다.", href: "#", cls: "s4", ic: "tag" },
    { n: "05", cat: "중고차 렌탈·구독 견적", name: "중고차 렌탈/구독 견적기", desc: "중고차 렌탈·구독 월 납입을 차종·조건별로 자동 계산. 손오공렌터카 등 협력사 견적에 쓰이는 실전 견적기입니다.", href: "#", cls: "s5", ic: "refresh" },
    { n: "06", cat: "홈페이지 · 마케팅 페이지 제작", name: "웹·랜딩 제작", desc: "브랜드 홈페이지부터 마케팅 랜딩까지, 업계 특성에 맞춘 디자인으로 제작합니다. ERP·견적·예약 등 기존 시스템과의 페이지 연동 제작까지 가능 — 바로 이 사이트처럼.", href: "#", cls: "s6", ic: "web" }
  ];
  var AFFIL = [
    { role: "영업중개 ERP 운영", name: "프리패스모빌리티", desc: "영업파트너·렌터카사를 잇는 영업중개 ERP·플랫폼을 운영하는 관계사." },
    { role: "정비관리 ERP", name: "카벨 (carbell)", desc: "정비 이력·입출고·전국 정비 네트워크를 관리하는 정비관리 ERP." },
    { role: "렌터카 구독 직영", name: "스위치플랜", desc: "teamjpk 시스템으로 직영 운영하는 렌터카 구독 모델샵." }
  ];
  var MEMBERS = [
    { name: "웰릭스모빌리티", tags: ["렌터카", "자동차구독"] },
    { name: "손오공렌터카", tags: ["렌터카", "자동차구독"] },
    { name: "프라임구독", tags: ["자동차구독"] },
    { name: "국민차매매단지 김포공항점", tags: ["매매단지", "ERP"] }
  ];
  var NEWS = [
    { date: "2026.06.10", tag: "UPDATE", title: "착한거래 베타 오픈 — 렌터카 거래이력 확인 시작" },
    { date: "2026.05.28", tag: "NEWS", title: "서비스 이용 회원사 23개사 돌파" },
    { date: "2026.04.30", tag: "PARTNER", title: "카벨, 전국 정비 네트워크 확대" }
  ];
  var ICONS = {
    car: '<path d="M5 11l1.6-4.4A2 2 0 018.5 5.3h7a2 2 0 011.9 1.3L19 11"/><rect x="3" y="11" width="18" height="6" rx="2"/><circle cx="7.5" cy="17.5" r="1.4"/><circle cx="16.5" cy="17.5" r="1.4"/>',
    link: '<path d="M9 15l6-6"/><path d="M10.5 6.6l1.7-1.7a3.5 3.5 0 015 5l-2 2"/><path d="M13.5 17.4l-1.7 1.7a3.5 3.5 0 01-5-5l2-2"/>',
    shield: '<path d="M12 3l7 3v5c0 4.4-3 7.4-7 9-4-1.6-7-4.6-7-9V6z"/><path d="M9 12l2 2 4-4"/>',
    tag: '<path d="M3 11V5a2 2 0 012-2h6l9 9-8 8-9-9z"/><circle cx="7.5" cy="7.5" r="1.2"/><path d="M14 9h3M15.5 7.5v3"/>',
    refresh: '<path d="M4 12a8 8 0 0113.7-5.6L20 8"/><path d="M20 4v4h-4"/><path d="M20 12a8 8 0 01-13.7 5.6L4 16"/><path d="M4 20v-4h4"/>',
    web: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 8.5h18"/><path d="M7 12h6M7 15.5h9"/>'
  };
  var ARR = '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  var EXT = '<svg viewBox="0 0 24 24"><path d="M7 17L17 7M17 7H8M17 7v9"/></svg>';
  var $ = function (s) { return document.querySelector(s); };

  /* ── 내비게이션 방향표 (직진 / 우회전 / 좌회전 / 유턴) ── */
  function mStraight(c){ c.beginPath();c.moveTo(0,20);c.lineTo(0,-14);c.stroke(); c.beginPath();c.moveTo(-9,-5);c.lineTo(0,-16);c.lineTo(9,-5);c.stroke(); }
  function mRight(c){ c.beginPath();c.moveTo(-8,20);c.lineTo(-8,-4);c.quadraticCurveTo(-8,-12,0,-12);c.lineTo(12,-12);c.stroke(); c.beginPath();c.moveTo(4,-21);c.lineTo(15,-12);c.lineTo(4,-3);c.stroke(); }
  function mLeft(c){ c.beginPath();c.moveTo(8,20);c.lineTo(8,-4);c.quadraticCurveTo(8,-12,0,-12);c.lineTo(-12,-12);c.stroke(); c.beginPath();c.moveTo(-4,-21);c.lineTo(-15,-12);c.lineTo(-4,-3);c.stroke(); }
  function mUturn(c){ c.beginPath();c.moveTo(-10,18);c.lineTo(-10,-4);c.quadraticCurveTo(-10,-16,0,-16);c.quadraticCurveTo(10,-16,10,-4);c.lineTo(10,8);c.stroke(); c.beginPath();c.moveTo(1,-1);c.lineTo(10,10);c.lineTo(19,-1);c.stroke(); }
  var MAN = [mStraight, mRight, mLeft, mUturn];
  var navCycle = -1, navIdx = 0, navLabel = "D+200";
  // 거리 대신 비즈니스 수치: 날짜·회사수·금액·건수·성장률 랜덤 조합
  var LABELS = ["D+30", "D+100", "D+365", "D+1000", "+12개사", "+23개사", "+1,200만원", "+5,000만원", "+1억", "+3,752건", "+10,000건", "월 +18%", "재이용 99%"];
  function drawNav() {
    var now = performance.now(), per = 6500, ph = now % per, a;
    // 천천히 은은하게: 페이드인 1100 → 머무름 3200 → 페이드아웃 1100 → 빈 텀 1100
    if (ph < 1100) a = ph / 1100; else if (ph < 4300) a = 1; else if (ph < 5400) a = (5400 - ph) / 1100; else a = 0;
    a = a * a * (3 - 2 * a); // smoothstep 가감속
    var cyc = Math.floor(now / per);
    if (cyc !== navCycle) { // 랜덤(직전과 다른 방향) + 랜덤 D+수치
      navCycle = cyc;
      navIdx = (navIdx + 1 + Math.floor(Math.random() * (MAN.length - 1))) % MAN.length;
      navLabel = LABELS[Math.floor(Math.random() * LABELS.length)];
    }
    var m = W < 760; // 모바일: 상단바 아래(고정 120px) 중앙에 작게
    var nx = m ? W * 0.5 : W * 0.70, ny = m ? 120 : H * 0.50, sc = m ? 1.7 : 3;
    cx.save();
    cx.translate(nx, ny);
    cx.scale(sc, sc);
    cx.globalAlpha = a * 0.94;
    cx.strokeStyle = "rgba(192,212,255,.98)"; cx.lineWidth = 4; cx.lineJoin = "round"; cx.lineCap = "round";
    cx.shadowColor = "rgba(120,160,255,.7)"; cx.shadowBlur = 5;
    MAN[navIdx](cx);
    cx.restore();
    // 거리 대신 D+수치 (200m 전방 → D+200)
    cx.save();
    cx.globalAlpha = a;
    cx.fillStyle = "rgba(198,216,255,.96)";
    cx.font = "700 " + (m ? 22 : 28) + "px 'Exo 2', sans-serif";
    cx.textAlign = "center"; cx.textBaseline = "middle";
    cx.shadowColor = "rgba(120,160,255,.6)"; cx.shadowBlur = 7;
    cx.fillText(navLabel, nx, ny + (m ? 44 : 96));
    cx.restore();
    cx.globalAlpha = 1;
  }

  /* ── 콘텐츠 렌더 ── */
  $("#bento").innerHTML = SERVICES.map(function (s) {
    var ext = s.href.indexOf("http") === 0;
    return '<a class="svc ' + s.cls + '" href="' + s.href + '"' + (ext ? ' target="_blank" rel="noopener noreferrer"' : "") + '>' +
      '<div class="top"><span class="ic"><svg viewBox="0 0 24 24">' + ICONS[s.ic] + '</svg></span>' +
      '<span class="open">' + (ext ? "바로가기 " + EXT : "준비중") + '</span></div>' +
      '<div><div class="cat">' + s.n + " · " + s.cat + '</div><div class="nm">' + s.name + '</div><div class="ds">' + s.desc + '</div></div></a>';
  }).join("");

  $("#affil").innerHTML = AFFIL.map(function (a) {
    return '<div class="af"><div class="role">' + a.role + '</div><h3>' + a.name + '</h3><p>' + a.desc + '</p></div>';
  }).join("");

  var mcard = function (m) {
    return '<div class="mcard"><span class="mn">' + m.name + '</span><span class="mt">' +
      m.tags.map(function (t) { return "<span>" + t + "</span>"; }).join("") + '</span></div>';
  };
  var loop = MEMBERS.concat(MEMBERS, MEMBERS, MEMBERS);
  $("#mq").innerHTML = loop.map(mcard).join("");

  $("#news-list").innerHTML = NEWS.map(function (n) {
    return '<a class="nrow" href="#"><span class="date">' + n.date + '</span><span class="tag">' + n.tag +
      '</span><span class="ti">' + n.title + '</span><span class="ar">' + ARR + '</span></a>';
  }).join("");

  /* ── 별밤 캔버스 (직접 구현) ── */
  var cv = $("#stars"), cx = cv.getContext("2d"), stars = [], shoot = null, W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
  var ROT = 0.00009, RC = Math.cos(ROT), RS = Math.sin(ROT), PX = 0, PY = 0; // 극점 중심 아주 느린 회전(보조)
  var feature = null; // 배경보다 큰 예쁜 별 (대각선 우측 상단)
  function rand(a, b) { return a + Math.random() * (b - a); }
  function build() {
    var host = cv.parentElement;
    W = host.clientWidth; H = host.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    PX = W * 0.52; PY = H * 0.40; // 천구 극점 (이 점을 중심으로 하늘이 회전)
    var count = Math.round(W * H / 8000);
    stars = [];
    for (var i = 0; i < count; i++) {
      var r = rand(0.4, 1.8);
      // 깊이감 있는 드리프트: 큰 별일수록 빠르게(시차), 좌하단으로 천천히 흐름
      stars.push({ x: rand(0, W), y: rand(0, H), r: r, a: rand(0.2, 0.95), tw: rand(0.004, 0.02),
        dir: Math.random() > 0.5 ? 1 : -1, hue: Math.random() > 0.8 ? 1 : 0,
        vx: -(0.025 + r * 0.04), vy: 0.008 + r * 0.012 });
    }
    // 은하수: 대각선 띠를 따라 촘촘한 흐릿한 별구름
    var band = Math.round(W * H / 4500);
    for (var j = 0; j < band; j++) {
      var t = Math.random();
      var bx = t * W * 1.1 - W * 0.05;
      var by = H * 0.92 - t * H * 0.8 + (Math.random() - 0.5) * H * 0.26;
      var br = rand(0.25, 0.95);
      stars.push({ x: bx, y: by, r: br, a: rand(0.06, 0.42), tw: rand(0.004, 0.014),
        dir: Math.random() > 0.5 ? 1 : -1, hue: Math.random() > 0.62 ? 1 : 0, vx: 0, vy: 0 });
    }
    // 배경보다 조금 큰 "예쁜 별" — 대각선 우측 상단 (모바일은 더 위 모서리)
    feature = (W < 760)
      ? { x: W * 0.84, y: H * 0.19, a: 0.65, dir: 1, tw: 0.01 }
      : { x: W * 0.78, y: H * 0.24, a: 0.65, dir: 1, tw: 0.01 };
  }
  function spawnShoot() {
    if (shoot || Math.random() > 0.012) return;
    var sx = rand(W * 0.1, W * 0.7);
    shoot = { x: sx, y: rand(0, H * 0.4), len: rand(80, 160), vx: rand(4, 7), vy: rand(2, 3.5), life: 1 };
  }
  function frame() {
    cx.clearRect(0, 0, W, H);
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      s.a += s.tw * s.dir;
      if (s.a > 0.95) s.dir = -1; else if (s.a < 0.16) s.dir = 1;
      // 하늘이 극점(PX,PY)을 중심으로 천천히 회전 — 단순 좌우 이동이 아닌 원형 회전
      var dx = s.x - PX, dy = s.y - PY;
      s.x = PX + dx * RC - dy * RS;
      s.y = PY + dx * RS + dy * RC;
      if (s.r > 1.1) { // 밝은 별 헤일로
        cx.beginPath(); cx.arc(s.x, s.y, s.r * 2.6, 0, 6.283);
        cx.fillStyle = "rgba(160,190,255," + (s.a * 0.12) + ")"; cx.fill();
      }
      cx.beginPath();
      cx.arc(s.x, s.y, s.r, 0, 6.283);
      cx.fillStyle = s.hue ? "rgba(150,185,255," + s.a + ")" : "rgba(255,255,255," + s.a + ")";
      cx.fill();
    }
    // 배경보다 조금 큰 예쁜 별 (은은한 트윙클)
    if (feature) {
      feature.a += feature.tw * feature.dir;
      if (feature.a > 1) feature.dir = -1; else if (feature.a < 0.45) feature.dir = 1;
      var fr = 18 + feature.a * 8;
      var fg = cx.createRadialGradient(feature.x, feature.y, 0, feature.x, feature.y, fr);
      fg.addColorStop(0, "rgba(234,242,255," + (0.85 * feature.a) + ")");
      fg.addColorStop(0.28, "rgba(156,192,255," + (0.30 * feature.a) + ")");
      fg.addColorStop(1, "rgba(91,140,255,0)");
      cx.fillStyle = fg; cx.beginPath(); cx.arc(feature.x, feature.y, fr, 0, 6.283); cx.fill();
      cx.fillStyle = "rgba(255,255,255," + Math.min(1, feature.a + 0.2) + ")";
      cx.beginPath(); cx.arc(feature.x, feature.y, 2.8, 0, 6.283); cx.fill();
    }
    // 우측 공간 한가운데: 내비게이션 방향표 (직진/좌우회전/유턴 은은하게 전환)
    drawNav();
    spawnShoot();
    if (shoot) {
      var g = cx.createLinearGradient(shoot.x, shoot.y, shoot.x - shoot.len, shoot.y - shoot.len * 0.5);
      g.addColorStop(0, "rgba(180,205,255," + (0.8 * shoot.life) + ")");
      g.addColorStop(1, "rgba(180,205,255,0)");
      cx.strokeStyle = g; cx.lineWidth = 1.4; cx.beginPath();
      cx.moveTo(shoot.x, shoot.y); cx.lineTo(shoot.x - shoot.len, shoot.y - shoot.len * 0.5); cx.stroke();
      shoot.x += shoot.vx; shoot.y += shoot.vy; shoot.life -= 0.012;
      if (shoot.x > W + shoot.len || shoot.life <= 0) shoot = null;
    }
    requestAnimationFrame(frame);
  }
  build(); frame();
  var rz; window.addEventListener("resize", function () { clearTimeout(rz); rz = setTimeout(build, 200); });

  /* ── 스크롤 리빌 ── */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });
  }

  /* ── 숫자 카운트업 ── */
  function countUp(el) {
    var target = +el.dataset.count, dur = 1400, t0 = null;
    function tick(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * e).toLocaleString();
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if ("IntersectionObserver" in window) {
    var nio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { countUp(e.target); nio.unobserve(e.target); } });
    }, { threshold: 0.6 });
    document.querySelectorAll("[data-count]").forEach(function (el) { nio.observe(el); });
  }

  /* ── 네비 스크롤 그림자 + 모바일 드로어 ── */
  var nav = $("#nav");
  function onScroll() { nav.classList.toggle("scr", window.scrollY > 30); }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  $("#burger").addEventListener("click", function () { nav.classList.toggle("open"); });
  $("#drawer").addEventListener("click", function (e) { if (e.target.tagName === "A") nav.classList.remove("open"); });
})();
