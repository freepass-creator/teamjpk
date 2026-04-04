/* ============================================================
   TEAMJPK — 스크립트 v2 (북극 오로라 밤하늘)
   ============================================================ */

// IIFE 간 공유 함수 (낮 캔버스 리사이즈)
var resizeDay = function () {};

/* ── 1. 히어로 밤하늘 캔버스 ── */
(function () {
  const canvas = document.getElementById('sky');
  const ctx    = canvas.getContext('2d');
  const dpr    = window.devicePixelRatio || 1;
  let W, H;
  let mouseX = 0.5, mouseY = 0.5;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    W = rect.width; H = rect.height;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();

  canvas.parentElement.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mouseX = e.clientX / r.width;
    mouseY = e.clientY / r.height;
  });

  /* ──────────────────────────────────────────
     별 색온도 팔레트 [R, G, B]
     실제 별은 온도에 따라 색이 달라집니다
  ────────────────────────────────────────── */
  const C = {
    blueWhite: [200, 220, 255], // 뜨거운 별 (Rigel, Vega 계열)
    white:     [240, 245, 255], // 일반 흰색 별
    yellow:    [255, 248, 225], // 황백색 별 (Polaris 계열)
    orange:    [255, 210, 155], // 주황색 별 (Kochab, Pollux 계열)
    red:       [255, 155,  90], // 붉은 초거성 (Betelgeuse)
  };

  /* ──────────────────────────────────────────
     배경 별 생성
     세 등급으로 나눠 밀도·밝기·반짝임 속도 차이
  ────────────────────────────────────────── */
  function makeBgStar(rMin, rMax, aMin, aMax, glow, colorPool) {
    const col = colorPool[Math.floor(Math.random() * colorPool.length)];
    return {
      x:       Math.random(),
      y:       Math.random(),
      r:       Math.random() * (rMax - rMin) + rMin,
      baseA:   Math.random() * (aMax - aMin) + aMin,
      // 반짝임 속도·진폭·위상을 각각 다르게
      twSpd:   Math.random() * 0.0028 + 0.0004,
      twAmp:   Math.random() * 0.32   + 0.08,
      twSpd2:  Math.random() * 0.0015 + 0.0003, // 크기 반짝임
      phase:   Math.random() * Math.PI * 2,
      phase2:  Math.random() * Math.PI * 2,
      color:   col,
      glow,
    };
  }

  const bgStars = [
    // 어둡고 작은 별 300개 (하늘을 촘촘하게)
    ...Array.from({ length: 300 }, () => makeBgStar(0.12, 0.50, 0.04, 0.22, false, [C.blueWhite, C.white, C.white])),
    // 중간 별 90개
    ...Array.from({ length: 90  }, () => makeBgStar(0.38, 0.95, 0.14, 0.48, false, [C.blueWhite, C.white, C.yellow])),
    // 밝은 별 28개 (글로우 포함)
    ...Array.from({ length: 28  }, () => makeBgStar(0.75, 1.70, 0.32, 0.70, true,  [C.blueWhite, C.white, C.yellow, C.orange])),
  ];

  /* ──────────────────────────────────────────
     별자리 정의
     실제 북극/겨울 하늘 위치 기반으로 배치
     Polaris 기준으로 공전 (매우 느리게)
  ────────────────────────────────────────── */
  const POLARIS = { x: 0.50, y: 0.07 }; // 북극성: 화면 위 중앙 고정

  const CONSTELLATIONS = [
    /* 큰곰자리 (Ursa Major / Big Dipper)
       북두칠성: 왼쪽 위, 국자 입구가 Polaris 방향 */
    {
      name: '큰곰자리',
      stars: [
        { x: 0.48, y: 0.17, r: 1.9, bright: false, color: C.blueWhite }, // η Alkaid  (손잡이 끝)
        { x: 0.42, y: 0.22, r: 2.0, bright: false, color: C.white     }, // ζ Mizar
        { x: 0.36, y: 0.24, r: 2.2, bright: true,  color: C.white     }, // ε Alioth  (밝음)
        { x: 0.31, y: 0.20, r: 1.6, bright: false, color: C.white     }, // δ Megrez  (가장 어두움)
        { x: 0.27, y: 0.28, r: 2.5, bright: true,  color: C.yellow    }, // α Dubhe   (국자 앞 위)
        { x: 0.29, y: 0.35, r: 2.2, bright: true,  color: C.blueWhite }, // β Merak   (국자 앞 아래)
        { x: 0.34, y: 0.36, r: 2.0, bright: false, color: C.white     }, // γ Phecda  (국자 뒤 아래)
        { x: 0.33, y: 0.29, r: 1.7, bright: false, color: C.white     }, // δ (Megrez 재사용 방지용 위치 조정)
      ],
      //  손잡이: 0-1-2-3, 국자: 3-4-5-6-7-3
      lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,3]],
    },

    /* 작은곰자리 (Ursa Minor) — Polaris 포함, 회전하지 않음 */
    {
      name: '작은곰자리',
      fixed: true,
      stars: [
        { x: 0.50, y: 0.07, r: 3.0, bright: true,  color: C.yellow  }, // α Polaris  (북극성, 황백색)
        { x: 0.46, y: 0.13, r: 1.4, bright: false, color: C.white   }, // δ
        { x: 0.42, y: 0.17, r: 1.3, bright: false, color: C.white   }, // ε
        { x: 0.39, y: 0.21, r: 1.4, bright: false, color: C.white   }, // ζ
        { x: 0.36, y: 0.17, r: 1.6, bright: false, color: C.white   }, // η
        { x: 0.32, y: 0.12, r: 2.0, bright: true,  color: C.orange  }, // γ Pherkad
        { x: 0.29, y: 0.08, r: 2.6, bright: true,  color: C.orange  }, // β Kochab   (주황색 거성)
      ],
      lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,3]],
    },

    /* 카시오페이아 (Cassiopeia) — 오른쪽 위, W 자 형태 */
    {
      name: '카시오페이아',
      stars: [
        { x: 0.73, y: 0.07, r: 2.0, bright: true,  color: C.white   }, // β Caph
        { x: 0.69, y: 0.12, r: 2.3, bright: true,  color: C.orange  }, // α Schedar  (주황)
        { x: 0.68, y: 0.18, r: 2.8, bright: true,  color: C.white   }, // γ (가장 밝음)
        { x: 0.74, y: 0.15, r: 1.9, bright: false, color: C.white   }, // δ
        { x: 0.79, y: 0.10, r: 2.1, bright: false, color: C.blueWhite }, // ε
      ],
      lines: [[0,1],[1,2],[2,3],[3,4]], // W 형
    },

    /* 케페우스 (Cepheus) — Polaris 위쪽, 집 모양 */
    {
      name: '케페우스',
      stars: [
        { x: 0.60, y: 0.06, r: 2.2, bright: true,  color: C.yellow    }, // α Alderamin
        { x: 0.65, y: 0.12, r: 1.8, bright: false, color: C.white      }, // β
        { x: 0.61, y: 0.18, r: 1.5, bright: false, color: C.white      }, // γ
        { x: 0.55, y: 0.16, r: 1.4, bright: false, color: C.white      }, // δ (변광성)
        { x: 0.56, y: 0.09, r: 1.6, bright: false, color: C.white      }, // ζ
      ],
      lines: [[0,1],[1,2],[2,3],[3,4],[4,0],[2,4]],
    },

    /* 페르세우스 (Perseus) — 오른쪽 중간 */
    {
      name: '페르세우스',
      stars: [
        { x: 0.76, y: 0.29, r: 2.8, bright: true,  color: C.yellow    }, // α Mirfak   (중심, 황색)
        { x: 0.71, y: 0.38, r: 2.2, bright: true,  color: C.blueWhite }, // β Algol    (변광성, 청백)
        { x: 0.73, y: 0.23, r: 1.7, bright: false, color: C.white      }, // γ
        { x: 0.80, y: 0.21, r: 1.8, bright: false, color: C.white      }, // δ
        { x: 0.84, y: 0.18, r: 1.6, bright: false, color: C.blueWhite  }, // ε
        { x: 0.82, y: 0.31, r: 1.6, bright: false, color: C.white      }, // ζ
        { x: 0.77, y: 0.34, r: 1.5, bright: false, color: C.white      }, // η
        { x: 0.68, y: 0.34, r: 1.5, bright: false, color: C.blueWhite  }, // π
      ],
      lines: [[0,2],[2,3],[3,4],[0,1],[0,5],[5,6],[6,7],[1,7]],
    },

    /* 오리온 (Orion) — 아래쪽 중앙, 겨울 대표 별자리
       Betelgeuse: 붉은 초거성 / Rigel: 파란 초거성 */
    {
      name: '오리온',
      stars: [
        { x: 0.40, y: 0.61, r: 3.8, bright: true, color: C.red        }, // α Betelgeuse (붉은 초거성, 매우 특징적)
        { x: 0.51, y: 0.58, r: 2.6, bright: true, color: C.blueWhite  }, // γ Bellatrix
        { x: 0.42, y: 0.68, r: 1.9, bright: false, color: C.blueWhite }, // δ Mintaka  (벨트 왼쪽)
        { x: 0.46, y: 0.69, r: 2.1, bright: false, color: C.blueWhite }, // ε Alnilam  (벨트 중앙, 가장 밝음)
        { x: 0.50, y: 0.68, r: 1.9, bright: false, color: C.blueWhite }, // ζ Alnitak  (벨트 오른쪽)
        { x: 0.43, y: 0.77, r: 2.1, bright: true,  color: C.blueWhite }, // κ Saiph   (왼발)
        { x: 0.52, y: 0.75, r: 3.3, bright: true,  color: C.blueWhite }, // β Rigel   (오른발, 파란 초거성)
      ],
      //  어깨-어깨, 어깨-벨트, 벨트 3개, 벨트-발
      lines: [[0,1],[0,2],[1,4],[2,3],[3,4],[2,5],[4,6]],
    },

    /* 쌍둥이자리 (Gemini) — 왼쪽 아래
       Castor(청백)와 Pollux(주황) 두 밝은 별이 쌍둥이 머리 */
    {
      name: '쌍둥이',
      stars: [
        { x: 0.27, y: 0.53, r: 2.5, bright: true,  color: C.blueWhite }, // α Castor   (청백)
        { x: 0.33, y: 0.52, r: 2.9, bright: true,  color: C.orange    }, // β Pollux   (주황, 약간 더 밝음)
        { x: 0.23, y: 0.59, r: 1.5, bright: false, color: C.white      },
        { x: 0.29, y: 0.58, r: 1.5, bright: false, color: C.white      },
        { x: 0.21, y: 0.65, r: 1.8, bright: false, color: C.yellow     }, // μ
        { x: 0.27, y: 0.64, r: 1.5, bright: false, color: C.white      },
        { x: 0.19, y: 0.71, r: 1.7, bright: true,  color: C.white      }, // η Tejat   (발)
        { x: 0.25, y: 0.70, r: 1.5, bright: false, color: C.white      },
      ],
      lines: [[0,1],[0,2],[2,4],[4,6],[1,3],[3,5],[5,7]],
    },
  ];

  /* ──────────────────────────────────────────
     유성 (계속 떨어짐)
  ────────────────────────────────────────── */
  const shooters = [];
  setInterval(() => {
    // 30% 확률로 두 개 동시
    const count = Math.random() < 0.3 ? 2 : 1;
    for (let n = 0; n < count; n++) {
      if (Math.random() < 0.78) {
        const spread = (Math.random() - 0.5) * 0.8; // 방향 분산
        const baseAngle = Math.PI / 4 + spread;      // 주로 좌상→우하
        const speed = Math.random() * 0.006 + 0.003;
        shooters.push({
          x:     Math.random() * 0.80 + 0.05,
          y:     Math.random() * 0.45,
          vx:    Math.cos(baseAngle) * speed,
          vy:    Math.sin(baseAngle) * speed,
          life:  1,
          decay: Math.random() * 0.010 + 0.005,
          len:   Math.random() * 100 + 50,
          width: Math.random() * 1.3 + 0.7,
        });
      }
    }
  }, 1400);

  /* ──────────────────────────────────────────
     오로라 렌더링 — 안개처럼 형태가 바뀌며 사라지는 버전

     핵심 설계:
     - 3개의 독립 밴드(band)가 각자 다른 위치·밝기·형태로 진화
     - 각 밴드에 느리게 이동하는 "안개 마스크"(fog mask) 적용
       → 특정 구역이 흐릿해졌다 나타났다를 반복
     - 형태 자체도 시간에 따라 morphing (단순 이동 X)
     - screen 블렌드 → 별빛이 오로라 뒤로 비침
  ────────────────────────────────────────── */
  function drawAurora(t) {
    const BASE  = H * 0.57;   // 오로라 기저선
    const MAX_H = H * 0.52;   // 최대 높이

    // 5가지 시간 스케일로 분리된 컴포넌트
    const tXS = t * 0.000012; // 극히 느림 — 밴드 위치 자체 변화
    const tS  = t * 0.000055; // 느림 — 형태 morphing
    const tM  = t * 0.000160; // 중간 — 안개 마스크 이동
    const tF  = t * 0.000380; // 빠름 — 커튼 ray shimmer
    const tXF = t * 0.000750; // 매우 빠름 — 세부 깜빡임

    const nStrips = Math.ceil(W / 2.5);
    const sw = W / nStrips;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    /* ── 독립 밴드 3개 정의 ──
       각 밴드는 phase 차이를 두어 독립적으로 진화 */
    const BANDS = [
      {
        phase:    0,
        // 밴드 중심이 tXS에 따라 느리게 이동 (0.25~0.75 범위)
        centerFn: ()   => 0.50 + Math.sin(tXS * 1.0)      * 0.18 + Math.sin(tXS * 0.4 + 1.2) * 0.10,
        widthFn:  ()   => 0.80 + Math.sin(tXS * 0.7)      * 0.15,
        brightFn: ()   => Math.max(0, 0.55 + Math.sin(tXS * 2.1)      * 0.30 + Math.sin(tXS * 0.9 + 0.8) * 0.15),
        color:    (a)  => `rgba(30,235,115,${a})`,   // 초록
        colorTop: (a)  => `rgba(90,255,170,${a})`,
        colorBot: (a)  => `rgba(5,155,130,${a})`,
      },
      {
        phase:    2.09, // 2π/3
        centerFn: ()   => 0.42 + Math.sin(tXS * 0.8 + 2.09) * 0.20 + Math.sin(tXS * 0.5 + 0.5) * 0.12,
        widthFn:  ()   => 0.65 + Math.sin(tXS * 0.6 + 2.09) * 0.18,
        brightFn: ()   => Math.max(0, 0.40 + Math.sin(tXS * 1.7 + 2.09) * 0.28 + Math.sin(tXS * 3.0 + 1.5) * 0.12),
        color:    (a)  => `rgba(20,210,100,${a})`,
        colorTop: (a)  => `rgba(70,245,160,${a})`,
        colorBot: (a)  => `rgba(10,140,120,${a})`,
      },
      {
        phase:    4.19, // 4π/3 — 보라/분홍 계열
        centerFn: ()   => 0.58 + Math.sin(tXS * 1.3 + 4.19) * 0.16 + Math.sin(tXS * 0.3 + 2.0) * 0.08,
        widthFn:  ()   => 0.50 + Math.sin(tXS * 0.9 + 4.19) * 0.15,
        brightFn: ()   => Math.max(0, 0.28 + Math.sin(tXS * 2.5 + 4.19) * 0.24 + Math.sin(tXS * 1.1 + 3.0) * 0.10),
        color:    (a)  => `rgba(130,45,210,${a})`,  // 보라
        colorTop: (a)  => `rgba(210,70,255,${a})`,
        colorBot: (a)  => `rgba(60,20,160,${a})`,
      },
    ];

    for (const band of BANDS) {
      const ph    = band.phase;
      const bBright = band.brightFn();
      if (bBright < 0.02) continue; // 이 밴드가 충분히 안 보이면 skip

      const bWidth  = band.widthFn();
      const bCenter = band.centerFn();

      for (let i = 0; i < nStrips; i++) {
        const nx = i / nStrips;
        const x  = nx * W;

        /* 공간 포락선: 밴드 중심 기준 부드러운 bell 곡선
           밴드 너비·위치가 시간에 따라 변해서 모양이 달라짐 */
        const dist  = (nx - bCenter) / bWidth;
        const envBase = Math.exp(-dist * dist * 2.8); // Gaussian bell
        if (envBase < 0.02) continue;

        /* 안개 마스크 (fog mask)
           여러 주파수의 느린 파동이 겹쳐 구역별로 독립 fade in/out
           이 값이 오로라가 "사라졌다 나타나는" 핵심 */
        const fog1 = Math.sin(nx * 4.5  + tM * 1.0  + ph * 0.8)  * 0.32;
        const fog2 = Math.sin(nx * 2.0  - tM * 0.6  + ph * 0.5)  * 0.28;
        const fog3 = Math.sin(nx * 8.5  + tM * 1.6  + ph * 1.3)  * 0.14;
        const fog4 = Math.sin(nx * 1.2  + tS * 0.4  + ph * 0.3)  * 0.20; // 매우 느린 변화
        // [-1, 1] 범위를 [0, 1]로 부드럽게 매핑
        const fogRaw = 0.52 + fog1 + fog2 + fog3 + fog4;
        const fogMask = Math.max(0, Math.min(1, fogRaw));

        const env = envBase * fogMask * bBright;
        if (env < 0.012) continue;

        /* 커튼 높이: 형태 morphing
           tS 기반 느린 컴포넌트가 시간에 따라 형태를 변형시킴
           단순 이동이 아니라 형태 자체가 바뀜 */
        const hMorph =                                  // 천천히 모양 변형
          Math.sin(nx * 6.0  + tS * 1.2 + ph)  * 0.18 +
          Math.sin(nx * 2.5  - tS * 0.7 + ph)  * 0.22 +
          Math.sin(nx * 11.0 + tS * 2.0 + ph)  * 0.08;
        const hShimmer =                                // 빠른 커튼 ray 표현
          Math.sin(nx * 18   + tF  * 1.0 + ph)  * 0.07 +
          Math.sin(nx * 28   + tXF * 0.8 + ph)  * 0.04;
        const hf = Math.max(0.04, 0.30 + hMorph + hShimmer) * env;
        const rayH = MAX_H * hf;
        if (rayH < 3) continue;

        /* 세기(shimmer): 빠른 반짝임 + 안개 마스크 영향 */
        const sv =
          Math.sin(nx * 22   + tF  * 2.2 + ph)  * 0.22 +
          Math.sin(nx * 9    - tM  * 1.5 + ph)  * 0.14 +
          Math.sin(nx * 40   + tXF * 1.5 + ph)  * 0.08;
        const intensity = Math.max(0.02, 0.42 + sv) * env;

        /* 아크 효과: 전체 오로라가 중앙에서 더 높이 솟음 */
        const arcLift = Math.pow(1 - Math.abs(nx - bCenter) / (bWidth * 0.6), 2) * H * 0.04;

        const yTop = BASE - rayH - arcLift;

        const g = ctx.createLinearGradient(x, yTop, x, BASE);
        g.addColorStop(0,    band.colorTop(`0`));
        g.addColorStop(0.05, band.colorTop(`${intensity * 0.08}`));
        g.addColorStop(0.18, band.colorTop(`${intensity * 0.35}`));
        g.addColorStop(0.42, band.color(`${intensity * 0.52}`));
        g.addColorStop(0.68, band.color(`${intensity * 0.30}`));
        g.addColorStop(0.88, band.colorBot(`${intensity * 0.12}`));
        g.addColorStop(1,    band.colorBot(`0`));

        ctx.fillStyle = g;
        ctx.fillRect(x, yTop, sw + 0.5, BASE - yTop);
      }
    }

    /* ── 배경 광배: 안개 마스크 없이 전체 분위기만 (매우 은은하게) ──
       전체 오로라 밝기(BANDS[0] 기준)에 연동해서 호흡하듯 변화 */
    const masterBright = BANDS[0].brightFn();
    const bgPulse = masterBright * (0.035 + Math.sin(tS * 3.0) * 0.010);
    const bgG = ctx.createLinearGradient(0, H * 0.04, 0, BASE);
    bgG.addColorStop(0,    'rgba(0,110,55,0)');
    bgG.addColorStop(0.30, `rgba(0,160,80,${bgPulse * 0.60})`);
    bgG.addColorStop(0.65, `rgba(0,140,75,${bgPulse})`);
    bgG.addColorStop(0.90, `rgba(0,90,70,${bgPulse * 0.35})`);
    bgG.addColorStop(1,    'rgba(0,60,55,0)');
    ctx.fillStyle = bgG;
    ctx.fillRect(0, H * 0.04, W, BASE - H * 0.04);

    ctx.restore();
  }

  /* ──────────────────────────────────────────
     메인 렌더 루프
  ────────────────────────────────────────── */
  function render(t) {
    ctx.clearRect(0, 0, W, H);

    // 시차 오프셋 (마우스 기반)
    const px = (mouseX - 0.5) * 5;
    const py = (mouseY - 0.5) * 3;

    // 하늘 자전각: Polaris를 중심으로 매우 느리게 공전
    // 1회전 = 약 25분 (관람 중에 살살 움직이는 게 느껴질 정도)
    const rot = t * 0.000004188; // 2π / (25 * 60 * 1000)

    /* ── 배경 별 ── */
    for (const s of bgStars) {
      // 밝기 반짝임
      const tw  = Math.sin(t * s.twSpd  + s.phase);
      const aMul = 0.52 + ((tw + 1) / 2) * 0.48;
      // 크기 반짝임 (약하게)
      const tw2  = Math.sin(t * s.twSpd2 + s.phase2);
      const rMul = 0.90 + ((tw2 + 1) / 2) * 0.10;

      const a  = s.baseA * aMul;
      const r  = s.r * rMul;
      const [rc, gc, bc] = s.color;
      const sx = s.x * W + px * 0.35;
      const sy = s.y * H + py * 0.35;

      if (s.glow) {
        const gl = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 4.5);
        gl.addColorStop(0, `rgba(${rc},${gc},${bc},${a * 0.38})`);
        gl.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gl;
        ctx.beginPath(); ctx.arc(sx, sy, r * 4.5, 0, Math.PI * 2); ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${rc},${gc},${bc},${a})`;
      ctx.fill();
    }

    /* ── 별자리 연결선 (오로라 아래에 그려 은은하게) ── */
    const polX = POLARIS.x * W + px * 0.5;
    const polY = POLARIS.y * H + py * 0.5;
    const cosR = Math.cos(rot), sinR = Math.sin(rot);

    // 화면 좌표 계산 함수 (회전 포함)
    function screenPos(s, fixed) {
      if (fixed) {
        return { sx: s.x * W + px * 0.5, sy: s.y * H + py * 0.5 };
      }
      const relX = s.x * W - POLARIS.x * W;
      const relY = s.y * H - POLARIS.y * H;
      return {
        sx: polX + relX * cosR - relY * sinR,
        sy: polY + relX * sinR + relY * cosR,
      };
    }

    // 전체 별자리 좌표 미리 계산
    const allScreenCoords = CONSTELLATIONS.map(c =>
      c.stars.map(s => screenPos(s, c.fixed))
    );

    ctx.save();
    ctx.strokeStyle = 'rgba(160,215,255,0.13)';
    ctx.lineWidth = 0.75;
    CONSTELLATIONS.forEach((c, ci) => {
      const sc = allScreenCoords[ci];
      for (const [a, b] of c.lines) {
        ctx.beginPath();
        ctx.moveTo(sc[a].sx, sc[a].sy);
        ctx.lineTo(sc[b].sx, sc[b].sy);
        ctx.stroke();
      }
    });
    ctx.restore();

    /* ── 오로라 (별 위, 별자리 아래) ── */
    drawAurora(t);

    /* ── 별자리 별 & 이름 (오로라 위에 선명하게) ── */
    CONSTELLATIONS.forEach((c, ci) => {
      const sc = allScreenCoords[ci];

      c.stars.forEach((s, si) => {
        const { sx, sy } = sc[si];

        // 개별 반짝임
        const tw    = Math.sin(t * 0.0019 + sx * 0.008 + sy * 0.006);
        const sizeTw = Math.sin(t * 0.0025 + sx * 0.010 - sy * 0.007 + 1.2);
        const aMul  = 0.48 + ((tw + 1) / 2) * 0.52;
        const rMul  = 0.88 + ((sizeTw + 1) / 2) * 0.12;
        const r     = s.r * rMul;
        const a     = aMul;
        const [rc, gc, bc] = s.color;

        if (s.bright) {
          // 외부 글로우
          const g1 = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 6.5);
          g1.addColorStop(0, `rgba(${rc},${gc},${bc},${a * 0.20})`);
          g1.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = g1;
          ctx.beginPath(); ctx.arc(sx, sy, r * 6.5, 0, Math.PI * 2); ctx.fill();

          // 내부 글로우
          const g2 = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 2.5);
          g2.addColorStop(0, `rgba(${rc},${gc},${bc},${a * 0.60})`);
          g2.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = g2;
          ctx.beginPath(); ctx.arc(sx, sy, r * 2.5, 0, Math.PI * 2); ctx.fill();
        }

        // 별 본체
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rc},${gc},${bc},${a})`;
        ctx.fill();
      });

      // 별자리 이름
      const first = sc[0];
      ctx.font = '300 9px Pretendard, sans-serif';
      ctx.fillStyle = 'rgba(165,215,245,0.22)';
      ctx.textAlign = 'left';
      ctx.fillText(c.name, first.sx + 12, first.sy - 9);
    });

    /* ── 유성 ── */
    for (let i = shooters.length - 1; i >= 0; i--) {
      const s = shooters[i];
      s.x += s.vx; s.y += s.vy; s.life -= s.decay;
      if (s.life <= 0 || s.x > 1.1 || s.y > 1.1) {
        shooters.splice(i, 1); continue;
      }

      const sx = s.x * W, sy = s.y * H;
      const tx = sx - s.vx * s.len, ty = sy - s.vy * s.len;

      // 꼬리 그라디언트
      const gr = ctx.createLinearGradient(sx, sy, tx, ty);
      gr.addColorStop(0,   `rgba(255,255,255,${s.life * 0.95})`);
      gr.addColorStop(0.15, `rgba(235,245,255,${s.life * 0.60})`);
      gr.addColorStop(0.45, `rgba(210,228,255,${s.life * 0.25})`);
      gr.addColorStop(1,   'rgba(190,215,255,0)');
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(tx, ty);
      ctx.strokeStyle = gr; ctx.lineWidth = s.width; ctx.stroke();

      // 머리 빛점 (작은 글로우)
      const hg = ctx.createRadialGradient(sx, sy, 0, sx, sy, 5);
      hg.addColorStop(0, `rgba(255,255,255,${s.life * 0.90})`);
      hg.addColorStop(1, 'rgba(200,225,255,0)');
      ctx.fillStyle = hg;
      ctx.beginPath(); ctx.arc(sx, sy, 5, 0, Math.PI * 2); ctx.fill();
    }

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

  window.addEventListener('resize', () => {
    resize();
    resizeDay();
  });
})();


/* ── 2. 낮 배경 캔버스 (은은한 파티클) ── */
(function () {
  const canvas = document.getElementById('ds');
  const ctx    = canvas.getContext('2d');
  const dpr    = window.devicePixelRatio || 1;
  let w, h;

  resizeDay = function () {
    const rect = canvas.getBoundingClientRect();
    w = rect.width; h = rect.height;
    canvas.width  = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  window.resizeDay();

  const particles = [
    ...Array.from({ length: 120 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.0 + 0.4, a: Math.random() * 0.08 + 0.02, sp: Math.random() * 0.0008 + 0.0003, ph: Math.random() * 6.28 })),
    ...Array.from({ length: 30  }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.5 + 0.6, a: Math.random() * 0.12 + 0.04, sp: Math.random() * 0.0005 + 0.0002, ph: Math.random() * 6.28 })),
  ];

  function drawDay(t) {
    ctx.clearRect(0, 0, w, h);
    for (const s of particles) {
      const a = s.a * (0.4 + ((Math.sin(t * s.sp + s.ph) + 1) / 2) * 0.6);
      ctx.beginPath(); ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(12,37,80,${a})`; ctx.fill();
    }
    requestAnimationFrame(drawDay);
  }
  requestAnimationFrame(drawDay);
})();


/* ── 3. 스크롤 시 네비게이션 스타일 전환 ── */
(function () {
  const hero = document.getElementById('hs');
  function onScroll() {
    const past = window.scrollY > hero.offsetHeight - 80;
    document.body.classList.toggle('hv', !past);
    document.getElementById('nv').classList.toggle('s', past);
  }
  window.addEventListener('scroll', onScroll);
  onScroll();
})();


/* ── 4. 스크롤 등장 애니메이션 ── */
(function () {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('v'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.rv').forEach(el => obs.observe(el));
})();


/* ── 5. 모바일 드로어 네비게이션 ── */
(function () {
  const btn      = document.getElementById('mbBtn');
  const drawer   = document.getElementById('navDrawer');
  const overlay  = document.getElementById('navOverlay');
  const closeBtn = document.getElementById('drawerClose');
  const links    = document.querySelectorAll('.drawer-link');

  function open() {
    drawer.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden'; // 배경 스크롤 막기
    btn.setAttribute('aria-expanded', 'true');
  }

  function close() {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    btn.setAttribute('aria-expanded', 'false');
  }

  btn.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', close);

  // 링크 클릭 시 드로어 닫고 해당 섹션으로 이동
  links.forEach(link => {
    link.addEventListener('click', () => {
      close();
    });
  });

  // ESC 키로 닫기
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') close();
  });
})();


/* ── 6. 내용 섹션 캔버스 비주얼 ── */
(function () {
  const dpr = window.devicePixelRatio || 1;

  /* 공통: 캔버스 초기화 */
  function initCanvas(id) {
    const el = document.getElementById(id);
    if (!el) return null;
    const ctx = el.getContext('2d');
    function resize() {
      const r = el.getBoundingClientRect();
      el.width  = r.width  * dpr;
      el.height = r.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);
    return { el, ctx, W: () => el.getBoundingClientRect().width, H: () => el.getBoundingClientRect().height };
  }

  /* ── About: 황금빛 네트워크 ──
     따뜻한 amber 색상의 연결망 — "모빌리티 생태계 연결" */
  (function () {
    const c = initCanvas('vc-about');
    if (!c) return;

    const NODES = Array.from({ length: 18 }, () => ({
      x:  Math.random(),
      y:  Math.random(),
      vx: (Math.random() - 0.5) * 0.00014,
      vy: (Math.random() - 0.5) * 0.00014,
      r:  Math.random() * 2.2 + 1.0,
      hub: Math.random() < 0.25,
    }));

    function draw(t) {
      const W = c.W(), H = c.H();
      const ctx = c.ctx;
      ctx.clearRect(0, 0, W, H);

      for (let i = 0; i < NODES.length; i++) {
        for (let j = i + 1; j < NODES.length; j++) {
          const dx = (NODES[i].x - NODES[j].x) * W;
          const dy = (NODES[i].y - NODES[j].y) * H;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxD = W * 0.35;
          if (dist < maxD) {
            const alpha = (1 - dist / maxD) * 0.28;
            ctx.beginPath();
            ctx.moveTo(NODES[i].x * W, NODES[i].y * H);
            ctx.lineTo(NODES[j].x * W, NODES[j].y * H);
            ctx.strokeStyle = `rgba(255,190,60,${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      for (const n of NODES) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0.03 || n.x > 0.97) n.vx *= -1;
        if (n.y < 0.03 || n.y > 0.97) n.vy *= -1;

        const tw = Math.sin(t * 0.0009 + n.x * 9 + n.y * 7);
        const a  = 0.5 + ((tw + 1) / 2) * 0.5;

        if (n.hub) {
          const g = ctx.createRadialGradient(n.x*W, n.y*H, 0, n.x*W, n.y*H, n.r * 6);
          g.addColorStop(0, `rgba(255,180,40,${a * 0.22})`);
          g.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(n.x*W, n.y*H, n.r*6, 0, Math.PI*2); ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(n.x*W, n.y*H, n.r, 0, Math.PI*2);
        ctx.fillStyle = `rgba(255,210,100,${a})`;
        ctx.fill();
      }
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  })();

  /* ── Role: 청록 웨이브 라인 ──
     여러 겹의 흐르는 파동 — "방향을 안내하는 흐름" */
  (function () {
    const c = initCanvas('vc-role');
    if (!c) return;

    const WAVES = [
      { amp: 0.13, freq: 1.8, phase: 0,    speed: 0.00055, y: 0.35, a: 0.55, w: 1.8 },
      { amp: 0.09, freq: 2.4, phase: 1.2,  speed: 0.00042, y: 0.50, a: 0.30, w: 1.2 },
      { amp: 0.15, freq: 1.3, phase: 2.5,  speed: 0.00068, y: 0.63, a: 0.20, w: 0.8 },
      { amp: 0.07, freq: 3.0, phase: 0.7,  speed: 0.00035, y: 0.75, a: 0.12, w: 0.6 },
    ];

    function draw(t) {
      const W = c.W(), H = c.H();
      const ctx = c.ctx;
      ctx.clearRect(0, 0, W, H);

      for (const wv of WAVES) {
        ctx.beginPath();
        for (let x = 0; x <= W; x += 2) {
          const norm = x / W;
          const y = (wv.y + Math.sin(norm * Math.PI * 2 * wv.freq + t * wv.speed + wv.phase) * wv.amp) * H;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(0,210,180,${wv.a})`;
        ctx.lineWidth = wv.w;
        ctx.stroke();
      }

      // 선도 광점: 가장 밝은 파도를 따라 움직이는 점
      const wv0 = WAVES[0];
      const px = (t * 0.00008 % 1) * W;
      const norm = px / W;
      const py = (wv0.y + Math.sin(norm * Math.PI * 2 * wv0.freq + t * wv0.speed + wv0.phase) * wv0.amp) * H;
      const g = ctx.createRadialGradient(px, py, 0, px, py, 16);
      g.addColorStop(0, 'rgba(0,240,200,0.45)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(px, py, 16, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(200,255,245,0.95)'; ctx.fill();

      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  })();

  /* ── Value: 보라빛 동심원 펄스 ──
     중심에서 번지는 동심원 파동 — "하나의 중심으로 수렴" */
  (function () {
    const c = initCanvas('vc-value');
    if (!c) return;

    const RINGS = Array.from({ length: 5 }, (_, i) => ({
      phase: (i / 5) * Math.PI * 2,
      speed: 0.00045,
    }));

    function draw(t) {
      const W = c.W(), H = c.H();
      const ctx = c.ctx;
      ctx.clearRect(0, 0, W, H);

      const cx = W * 0.5, cy = H * 0.5;
      const maxR = Math.min(W, H) * 0.45;

      for (const ring of RINGS) {
        const progress = ((t * ring.speed + ring.phase / (Math.PI * 2)) % 1);
        const r = progress * maxR;
        const a = (1 - progress) * 0.5;

        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(180,100,255,${a})`;
        ctx.lineWidth = 1.5 * (1 - progress);
        ctx.stroke();
      }

      // 중심 글로우
      const pulse = 0.7 + Math.sin(t * 0.0022) * 0.3;
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30 * pulse);
      cg.addColorStop(0, `rgba(200,130,255,${0.4 * pulse})`);
      cg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = cg;
      ctx.beginPath(); ctx.arc(cx, cy, 30 * pulse, 0, Math.PI*2); ctx.fill();

      ctx.beginPath(); ctx.arc(cx, cy, 4 * pulse, 0, Math.PI*2);
      ctx.fillStyle = `rgba(230,200,255,${0.9 * pulse})`; ctx.fill();

      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  })();

  /* ── Vision: 성장 바 차트 ──
     아래서 솟아오르는 골드 컬럼 — "측정 가능한 성장" */
  (function () {
    const c = initCanvas('vc-vision');
    if (!c) return;

    const BARS = [
      { x: 0.15, h: 0.55, phase: 0.0,  delay: 0    },
      { x: 0.28, h: 0.70, phase: 0.4,  delay: 120  },
      { x: 0.41, h: 0.48, phase: 0.8,  delay: 240  },
      { x: 0.54, h: 0.82, phase: 1.2,  delay: 360  },
      { x: 0.67, h: 0.63, phase: 1.6,  delay: 480  },
      { x: 0.80, h: 0.90, phase: 2.0,  delay: 600  },
    ];
    const BAR_W = 0.07;
    const BASE_Y = 0.88;

    function draw(t) {
      const W = c.W(), H = c.H();
      const ctx = c.ctx;
      ctx.clearRect(0, 0, W, H);

      // 베이스 라인
      ctx.beginPath();
      ctx.moveTo(W * 0.08, H * BASE_Y);
      ctx.lineTo(W * 0.92, H * BASE_Y);
      ctx.strokeStyle = 'rgba(255,200,80,0.18)';
      ctx.lineWidth = 1;
      ctx.stroke();

      for (const bar of BARS) {
        const breathe = 1 + Math.sin(t * 0.0014 + bar.phase) * 0.06;
        const h = bar.h * breathe;

        const bx = bar.x * W;
        const bw = BAR_W * W;
        const by = BASE_Y * H;
        const bh = h * H * 0.75;

        // 바 그라디언트
        const grad = ctx.createLinearGradient(bx, by - bh, bx, by);
        grad.addColorStop(0, 'rgba(255,210,60,0.85)');
        grad.addColorStop(0.6, 'rgba(255,170,30,0.50)');
        grad.addColorStop(1, 'rgba(255,140,0,0.10)');
        ctx.fillStyle = grad;
        ctx.fillRect(bx - bw/2, by - bh, bw, bh);

        // 상단 하이라이트
        const topG = ctx.createRadialGradient(bx, by - bh, 0, bx, by - bh, bw * 0.8);
        topG.addColorStop(0, 'rgba(255,240,150,0.60)');
        topG.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = topG;
        ctx.beginPath(); ctx.arc(bx, by - bh, bw * 0.8, 0, Math.PI*2); ctx.fill();
      }

      // 추세선 (바 상단 잇기)
      ctx.beginPath();
      BARS.forEach((bar, i) => {
        const breathe = 1 + Math.sin(t * 0.0014 + bar.phase) * 0.06;
        const bx = bar.x * W;
        const by = BASE_Y * H - bar.h * breathe * H * 0.75;
        i === 0 ? ctx.moveTo(bx, by) : ctx.lineTo(bx, by);
      });
      ctx.strokeStyle = 'rgba(255,220,80,0.35)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  })();
})();

/* ── 회원사 마키 (자동 좌우 스크롤) ── */
(function () {
  const track = document.getElementById('memberTrack');
  if (!track) return;

  // 아이템 복제해서 무한 루프 효과
  const clone = track.innerHTML;
  track.innerHTML = clone + clone;

  let x = 0;
  const speed = 0.5;       // px/frame
  let paused = false;
  let dragStart = null;
  let dragX = 0;

  function tick() {
    if (!paused) {
      x -= speed;
      // 원본 폭 = 전체 폭의 절반 → 절반 이상 지나면 리셋
      const halfW = track.scrollWidth / 2;
      if (Math.abs(x) >= halfW) x = 0;
      track.style.transform = `translateX(${x}px)`;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  // 호버하면 잠시 멈춤
  track.parentElement.addEventListener('mouseenter', () => { paused = true; });
  track.parentElement.addEventListener('mouseleave', () => { paused = false; });

  // 터치 드래그
  track.parentElement.addEventListener('touchstart', e => {
    paused = true;
    dragStart = e.touches[0].clientX;
    dragX = x;
  }, { passive: true });
  track.parentElement.addEventListener('touchmove', e => {
    if (dragStart === null) return;
    const dx = e.touches[0].clientX - dragStart;
    x = dragX + dx;
    track.style.transform = `translateX(${x}px)`;
  }, { passive: true });
  track.parentElement.addEventListener('touchend', () => {
    dragStart = null;
    paused = false;
  });
})();
