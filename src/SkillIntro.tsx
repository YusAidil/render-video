import React from "react";
import {
  AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame, useVideoConfig,
} from "remotion";
import { AUDIO_FILE, DURATION_FRAMES, FPS } from "./config";
import { CAPTIONS } from "./captions";

const SANS = "'Segoe UI', Arial, sans-serif";
const MONO = "Consolas, 'Courier New', monospace";
const C = {
  bg: "#0b0f1a", win: "#1a1b26", side: "#16161e", line: "rgba(255,255,255,0.08)",
  text: "#c0caf5", dim: "#565f89", soft: "#9aa5ce", blue: "#7aa2f7", green: "#9ece6a",
  purple: "#bb9af7", accent: "#ff8a5c", gold: "#ffd479",
};
const TOTAL = DURATION_FRAMES / FPS;
const T = { s1: 6.6, s2: 13.54, s3: 20.07, s4: 26.36 }; // awal tiap adegan (detik)
const clampOpt = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const prog = (t: number, a: number, b: number, easing = Easing.out(Easing.cubic)) =>
  interpolate(t, [a, b], [0, 1], { ...clampOpt, easing });
const sw = (t: number, a: number, b: number, f = 0.35) =>
  interpolate(t, [a, a + f, b - f, b], [0, 1, 1, 0], clampOpt);
const rnd = (i: number, k: number) => {
  const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/* ---------- Efek ketik ---------- */
type Tok = [string, string];
const nChars = (t: number, start: number, cps: number) => Math.max(0, Math.floor((t - start) * cps));
const sliceTok = (line: Tok[], n: number): Tok[] => {
  const out: Tok[] = [];
  let left = n;
  for (const [s, c] of line) {
    if (left <= 0) break;
    out.push([s.slice(0, left), c]);
    left -= s.length;
  }
  return out;
};

const CodeLines: React.FC<{
  lines: Tok[][]; n: number; t: number; size: number; lh: number; gutter?: boolean;
}> = ({ lines, n, t, size, lh, gutter }) => {
  let left = n;
  const blink = Math.sin(t * 9) > -0.3 ? 1 : 0;
  return (
    <div style={{ fontFamily: MONO, fontSize: size, lineHeight: `${lh}px` }}>
      {lines.map((ln, i) => {
        const len = ln.reduce((a, [s]) => a + s.length, 0);
        const started = left > 0 || i === 0;
        const typingHere = (left > 0 && left <= len + 1) || (i === lines.length - 1 && left > 0) || (i === 0 && left <= 0);
        const shown = Math.max(0, Math.min(len, left));
        left -= len + 1;
        if (!started) return null;
        return (
          <div key={i} style={{ display: "flex", whiteSpace: "pre", height: lh }}>
            {gutter && (
              <span style={{ width: 52, color: C.dim, opacity: 0.6, textAlign: "right", paddingRight: 20 }}>{i + 1}</span>
            )}
            <span>
              {sliceTok(ln, shown).map(([s, c], k) => (
                <span key={k} style={{ color: c }}>{s}</span>
              ))}
              {typingHere && (
                <span style={{
                  display: "inline-block", width: "0.55em", height: "1.05em", marginLeft: 2,
                  verticalAlign: "text-bottom", background: C.accent, opacity: blink,
                }} />
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const SKILL_LINES: Tok[][] = [
  [["---", C.dim]],
  [["name", C.blue], [": ", C.text], ["remotion-video", C.green]],
  [["description", C.blue], [": ", C.text], ["Bikin video dari narasi", C.green]],
  [["---", C.dim]],
  [],
  [["# Aturan", C.purple]],
  [["- Pakai Remotion + React", C.text]],
  [["- Render lokal di laptop", C.text]],
  [["- Jangan ubah narasi", C.text]],
];

const CHAT_CODE: Tok[][] = [
  [["export ", C.purple], ["const ", C.purple], ["Root ", C.blue], ["= () => (", C.text]],
  [["  <", C.text], ["Composition", C.gold], [" id=", C.blue], ['"Video"', C.green]],
  [["    fps", C.blue], ["={", C.text], ["60", C.accent], ["}", C.text], [" width", C.blue], ["={", C.text], ["1080", C.accent], ["}", C.text]],
  [["    height", C.blue], ["={", C.text], ["1920", C.accent], ["} />", C.text]],
  [[");", C.text]],
];

/* ---------- Explorer & tab ---------- */
const TREE = [
  { label: "my-skill", d: 0, folder: true, from: 4.2 },
  { label: "SKILL.md", d: 1, folder: false, from: 4.8 },
  { label: "video-remotion", d: 0, folder: true, from: 14.0 },
  { label: "package.json", d: 1, folder: false, from: 14.6 },
  { label: "src", d: 1, folder: true, from: 15.4 },
  { label: "Root.tsx", d: 2, folder: false, from: 16.0 },
  { label: "Video.tsx", d: 2, folder: false, from: 17.0 },
  { label: "public", d: 1, folder: true, from: 18.2 },
  { label: "voice.wav", d: 2, folder: false, from: 18.7 },
];
const TABS = [
  { label: "SKILL.md", from: 4.8, a: 4.8, b: T.s2 },
  { label: "Claude", from: T.s2, a: T.s2, b: T.s3 },
  { label: "Preview", from: T.s3, a: T.s3, b: 99 },
];

const WX = 60, WY = 360, WW = 960, WH = 860, SIDE = 270, TITLE = 64, TABH = 56;

const IDE: React.FC<{ t: number }> = ({ t }) => {
  const enter = prog(t, 0.1, 1.3);
  const dim = prog(t, T.s4, T.s4 + 0.7);
  const edW = WW - SIDE;
  const edH = WH - TITLE - TABH;
  const term = prog(t, 20.3, 20.9);
  const cmd1 = "> npm start".slice(0, nChars(t, 20.9, 14));
  const cmd2 = "> npm run render".slice(0, nChars(t, 23.2, 16));
  const pr = prog(t, 24.4, 26.2, Easing.linear);

  return (
    <div style={{
      position: "absolute", left: WX, top: WY, width: WW, height: WH, borderRadius: 28,
      background: C.win, border: `1px solid ${C.line}`, boxShadow: "0 40px 120px rgba(0,0,0,0.55)",
      overflow: "hidden", opacity: enter * (1 - 0.88 * dim), filter: `blur(${dim * 6}px)`,
      transform: `translateY(${(1 - enter) * 70}px) scale(${0.94 + 0.06 * enter - 0.05 * dim})`,
    }}>
      {/* Title bar */}
      <div style={{
        height: TITLE, display: "flex", alignItems: "center", padding: "0 24px",
        background: "#13141c", borderBottom: `1px solid ${C.line}`,
      }}>
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
          <div key={c} style={{ width: 16, height: 16, borderRadius: 8, background: c, marginRight: 10 }} />
        ))}
        <div style={{ flex: 1, textAlign: "center", color: C.dim, fontSize: 22, marginRight: 90, fontFamily: SANS }}>
          video-remotion — Editor
        </div>
      </div>

      {/* Sidebar */}
      <div style={{ position: "absolute", left: 0, top: TITLE, width: SIDE, bottom: 0, background: C.side, borderRight: `1px solid ${C.line}` }}>
        <div style={{ position: "absolute", left: 24, top: 20, color: C.dim, fontSize: 18, letterSpacing: 3, fontFamily: SANS }}>
          EXPLORER
        </div>
        {TREE.map((r, i) => {
          const a = prog(t, r.from, r.from + 0.4);
          const flash = 1 - prog(t, r.from, r.from + 0.9);
          const active = r.label === "SKILL.md" && t >= 4.8 && t < T.s2;
          return (
            <div key={r.label} style={{
              position: "absolute", left: 14, right: 10, top: 62 + i * 52, height: 44, display: "flex",
              alignItems: "center", paddingLeft: r.d * 24 + 10, borderRadius: 10, fontFamily: SANS, fontSize: 24,
              color: active ? "#fff" : C.text,
              background: active ? "rgba(122,162,247,0.18)" : `rgba(255,138,92,${0.2 * flash * a})`,
              opacity: a, transform: `translateX(${(1 - a) * -16}px)`,
            }}>
              <span style={{ width: 26, color: C.dim }}>{r.folder ? "▾" : ""}</span>
              {r.label}
            </div>
          );
        })}
      </div>

      {/* Tab bar */}
      <div style={{
        position: "absolute", left: SIDE, top: TITLE, right: 0, height: TABH, display: "flex",
        background: "#13141c", borderBottom: `1px solid ${C.line}`,
      }}>
        {TABS.map((tb) => {
          const o = prog(t, tb.from, tb.from + 0.3);
          const active = t >= tb.a && t < tb.b;
          return (
            <div key={tb.label} style={{
              opacity: o, padding: "0 28px", display: "flex", alignItems: "center", fontFamily: SANS, fontSize: 22,
              color: active ? "#fff" : C.dim, background: active ? C.win : "transparent",
              borderBottom: `3px solid ${active ? C.accent : "transparent"}`,
            }}>{tb.label}</div>
          );
        })}
      </div>

      {/* Area editor */}
      <div style={{ position: "absolute", left: SIDE, top: TITLE + TABH, width: edW, height: edH, overflow: "hidden" }}>
        {/* Welcome */}
        <div style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          color: "rgba(255,255,255,0.12)", fontSize: 54, fontFamily: SANS, fontWeight: 700,
          opacity: 1 - prog(t, 4.6, 5.2),
        }}>Welcome</div>

        {/* SKILL.md */}
        <div style={{ position: "absolute", inset: 0, padding: "34px 24px", opacity: sw(t, 5.0, T.s2 + 0.4) }}>
          <CodeLines lines={SKILL_LINES} n={nChars(t, 7.2, 28)} t={t} size={27} lh={46} gutter />
        </div>

        {/* Chat Claude */}
        <div style={{ position: "absolute", inset: 0, padding: 32, opacity: sw(t, T.s2, T.s3 + 0.4), fontFamily: SANS }}>
          <div style={{
            marginLeft: "auto", width: "fit-content", maxWidth: 520, background: "#2a2e45", color: "#fff",
            fontSize: 26, padding: "18px 24px", borderRadius: 22,
            opacity: prog(t, 13.9, 14.3), transform: `translateY(${(1 - prog(t, 13.9, 14.4)) * 24}px)`,
          }}>Buatkan motion design Remotion 29 detik</div>

          <div style={{ marginTop: 28, display: "flex", gap: 16, opacity: prog(t, 14.9, 15.3) }}>
            <div style={{
              width: 44, height: 44, borderRadius: 22, background: C.accent, color: "#1a1b26",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, flexShrink: 0,
            }}>✦</div>
            <div style={{ color: C.text, fontSize: 26, paddingTop: 6 }}>Siap! Ini project-nya:</div>
          </div>

          <div style={{
            marginTop: 20, marginLeft: 60, background: "#11121a", borderRadius: 18, padding: "22px 26px",
            border: `1px solid ${C.line}`, opacity: prog(t, 15.2, 15.6),
          }}>
            <CodeLines lines={CHAT_CODE} n={nChars(t, 15.4, 45)} t={t} size={24} lh={38} />
          </div>

          <div style={{ marginTop: 22, marginLeft: 60, color: C.green, fontSize: 26, opacity: prog(t, 19.0, 19.4) }}>
            ✔ Project dibuat
          </div>
        </div>

        {/* Preview */}
        <div style={{
          position: "absolute", inset: 0, opacity: sw(t, T.s3, TOTAL + 1), display: "flex",
          flexDirection: "column", alignItems: "center", paddingTop: 22,
        }}>
          <div style={{
            width: 260, height: 38, borderRadius: 19, background: "#11121a", color: C.dim, fontSize: 18,
            display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, marginBottom: 12,
          }}>localhost:3000</div>
          <div style={{
            width: 220, height: 390, borderRadius: 18, overflow: "hidden", position: "relative",
            background: "linear-gradient(#0d1b3d, #1a2a52)", border: `1px solid ${C.line}`,
          }}>
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} style={{
                position: "absolute", left: rnd(i, 1) * 210, top: rnd(i, 2) * 200, width: 3, height: 3, borderRadius: 2,
                background: "#fff", opacity: 0.4 + 0.5 * Math.sin(t * 2 + i) ** 2,
              }} />
            ))}
            <div style={{
              position: "absolute", left: 75, top: 120 + Math.sin(t * 1.5) * 10, width: 70, height: 70, borderRadius: 35,
              background: "radial-gradient(circle at 40% 38%, #fffdf0, #f3e9b8)",
              boxShadow: "0 0 40px 14px rgba(255,240,190,0.35)",
            }} />
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 110, background: "#070b17", borderRadius: "60% 60% 0 0" }} />
            <div style={{ position: "absolute", left: 14, right: 14, bottom: 14, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.15)" }}>
              <div style={{ width: `${((t * 0.35) % 1) * 100}%`, height: "100%", borderRadius: 3, background: C.accent }} />
            </div>
          </div>
        </div>

        {/* Terminal */}
        <div style={{
          position: "absolute", left: 0, right: 0, bottom: 0, height: 250, background: "#0f1019",
          borderTop: `1px solid ${C.line}`, padding: "14px 26px", fontFamily: MONO, fontSize: 25, color: C.text,
          transform: `translateY(${(1 - term) * 250}px)`,
        }}>
          <div style={{ color: C.dim, fontSize: 16, letterSpacing: 3, fontFamily: SANS }}>TERMINAL</div>
          <div style={{ marginTop: 12, height: 40 }}>{cmd1}</div>
          <div style={{ height: 40, color: C.green, opacity: prog(t, 21.9, 22.2) }}>ready - http://localhost:3000</div>
          <div style={{ height: 44 }}>{cmd2}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, opacity: prog(t, 24.3, 24.5) }}>
            <span style={{ color: C.soft }}>Rendering</span>
            <div style={{ width: 340, height: 14, borderRadius: 7, background: "rgba(255,255,255,0.12)" }}>
              <div style={{ width: `${pr * 100}%`, height: "100%", borderRadius: 7, background: C.accent }} />
            </div>
            <span style={{ color: C.gold }}>{Math.round(pr * 100)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------- Judul bab di atas jendela ---------- */
const Chip: React.FC<{ t: number; from: number; to: number; num: string; label: string }> = ({ t, from, to, num, label }) => (
  <div style={{
    position: "absolute", left: 0, right: 0, top: 150, display: "flex", justifyContent: "center",
    alignItems: "center", gap: 24, opacity: sw(t, from, to), transform: `translateY(${(1 - prog(t, from, from + 0.5)) * 30}px)`,
  }}>
    <div style={{
      width: 84, height: 84, borderRadius: 42, background: C.accent, color: "#1a1b26", fontSize: 40,
      fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center",
    }}>{num}</div>
    <div style={{ color: "#fff", fontSize: 58, fontWeight: 700 }}>{label}</div>
  </div>
);

const Header: React.FC<{ t: number }> = ({ t }) => (
  <>
    <div style={{
      position: "absolute", left: 0, right: 0, top: 110, textAlign: "center",
      opacity: sw(t, 0, 3.9), transform: `translateY(${(1 - prog(t, 0.2, 1.1)) * 40}px)`,
    }}>
      <div style={{ fontSize: 124, fontWeight: 800, color: "#fff", letterSpacing: -2 }}>Yus Aidil</div>
      <div style={{ height: 6, width: prog(t, 0.9, 1.7) * 360, background: C.accent, borderRadius: 3, margin: "6px auto 18px" }} />
      <div style={{ fontSize: 44, color: C.soft, opacity: prog(t, 1.6, 2.4) }}>Mahasiswa Informatika</div>
    </div>
    <Chip t={t} from={3.5} to={T.s2 + 0.4} num="01" label="Bikin skill sendiri" />
    <Chip t={t} from={T.s2} to={T.s3 + 0.4} num="02" label="Claude nulis kode Remotion" />
    <Chip t={t} from={T.s3} to={T.s4 + 0.4} num="03" label="Preview & render di laptop" />
  </>
);

/* ---------- Kartu penutup ---------- */
const EndCard: React.FC<{ t: number }> = ({ t }) => {
  const a = prog(t, 26.5, 27.3);
  return (
    <div style={{
      position: "absolute", left: 0, right: 0, top: 430, textAlign: "center", fontFamily: SANS,
      opacity: a, transform: `translateY(${(1 - a) * 40}px) scale(${0.94 + 0.06 * a})`,
    }}>
      {["Skill +", "Remotion"].map((w) => (
        <div key={w} style={{
          fontSize: 140, fontWeight: 800, lineHeight: 1.05, letterSpacing: -3,
          background: `linear-gradient(90deg, #ffffff, ${C.accent})`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>{w}</div>
      ))}
      <div style={{ marginTop: 26, fontSize: 52, color: C.soft, opacity: prog(t, 26.8, 27.2) }}>Tanpa edit manual</div>
      <div style={{
        margin: "26px auto 0", width: "fit-content", padding: "14px 34px", borderRadius: 40,
        background: "rgba(158,206,106,0.15)", border: `1px solid ${C.green}`, color: C.green, fontSize: 36,
        fontFamily: MONO, opacity: prog(t, 27.3, 27.7),
      }}>✔ out/skill-remotion.mp4</div>
      <div style={{ marginTop: 30, fontSize: 58, fontWeight: 700, color: C.accent, opacity: prog(t, 28.3, 28.7) }}>
        Kamu juga bisa coba!
      </div>
    </div>
  );
};

const DOTS = Array.from({ length: 36 }, (_, i) => ({
  x: rnd(i, 1) * 1080, y: rnd(i, 2) * 1920, r: 2 + rnd(i, 3) * 4, sp: 10 + rnd(i, 4) * 30, o: 0.15 + rnd(i, 5) * 0.35,
}));

export const SkillIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const cam = interpolate(
    t, [0, T.s1, 9, T.s2, 17, T.s3, T.s4, TOTAL], [1, 1.03, 1.1, 1.1, 1.0, 1.0, 1.04, 1.0],
    { ...clampOpt, easing: Easing.inOut(Easing.cubic) },
  );
  const overlay = Math.max(interpolate(t, [0, 0.4], [1, 0], clampOpt), interpolate(t, [TOTAL - 0.5, TOTAL], [0, 1], clampOpt));

  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: SANS }}>
      <Audio src={staticFile(AUDIO_FILE)} />

      {/* Latar: gradasi, grid, partikel */}
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 28%, #1b2550 0%, #0b0f1a 62%)" }} />
      <AbsoluteFill style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
        backgroundSize: "60px 60px", backgroundPosition: `${t * 6}px ${t * 6}px`,
        WebkitMaskImage: "radial-gradient(circle at 50% 40%, #000 20%, transparent 75%)",
      }} />
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        {DOTS.map((d, i) => (
          <circle key={i} cx={d.x} cy={(((d.y - t * d.sp) % 1920) + 1920) % 1920} r={d.r} fill="#fff" opacity={d.o} />
        ))}
      </svg>

      {/* Kamera: header + jendela editor */}
      <AbsoluteFill style={{ transform: `scale(${cam})`, transformOrigin: "540px 790px" }}>
        <Header t={t} />
        <IDE t={t} />
      </AbsoluteFill>
      <EndCard t={t} />

      {/* Subtitle */}
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 0, height: 800,
        background: "linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0.6))",
      }} />
      {CAPTIONS.filter((c) => t >= c.from && t <= c.to).map((c, ci) => {
        const words = c.text.split(" ");
        const out = interpolate(t, [c.to - 0.2, c.to], [1, 0], clampOpt);
        return (
          <div key={ci} style={{
            position: "absolute", left: 0, right: 0, bottom: 300, padding: "0 90px", boxSizing: "border-box",
            textAlign: "center", fontFamily: SANS, fontSize: 62, lineHeight: 1.3, fontWeight: 700,
            color: "#fff", textShadow: "0 4px 28px rgba(0,0,0,0.9)", opacity: out,
          }}>
            {words.map((w, i) => {
              const ws = c.from + (i / words.length) * (c.to - c.from) * 0.65;
              const o = interpolate(t, [ws, ws + 0.2], [0, 1], clampOpt);
              return (
                <span key={i} style={{
                  display: "inline-block", marginRight: "0.28em", opacity: o, transform: `translateY(${(1 - o) * 16}px)`,
                }}>{w}</span>
              );
            })}
          </div>
        );
      })}

      {/* Vignette + fade */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5))" }} />
      <AbsoluteFill style={{ background: "#000", opacity: overlay }} />
    </AbsoluteFill>
  );
};