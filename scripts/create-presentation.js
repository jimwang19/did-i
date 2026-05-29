const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const { FaBrain, FaCheckCircle, FaShieldAlt, FaUsers, FaSearch, FaMobileAlt, FaRocket, FaChartLine, FaCamera, FaHistory, FaLock, FaPrescriptionBottle, FaHome, FaSync } = require("react-icons/fa");
const { MdDoNotDisturb, MdSpeed, MdSecurity } = require("react-icons/md");
const path = require("path");

// ── Icon helpers ──
function renderIconSvg(IconComponent, color = "#FFFFFF", size = 256) {
  const cssColor = color.length === 6 ? `#${color}` : color;
  return ReactDOMServer.renderToStaticMarkup(
    React.createElement(IconComponent, { color: cssColor, size: String(size) })
  );
}

async function iconToBase64Png(IconComponent, color, size = 256) {
  const svg = renderIconSvg(IconComponent, color, size);
  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + pngBuffer.toString("base64");
}

// ── Color palette (Ocean + Teal, aligned with product design tokens) ──
const C = {
  bgDark: "0c0f14",
  bgContent: "141922",
  surface: "1c2333",
  surfaceLight: "243044",
  accent: "4ecdc4",
  accentDim: "3ab5ad",
  success: "81c784",
  pending: "546e7a",
  text: "e6edf3",
  textSoft: "8b949e",
  textMuted: "484f58",
  white: "ffffff",
  border: "2a3444",
};

// ── Common shadow factory ──
const mkShadow = () => ({ type: "outer", color: "000000", blur: 8, offset: 3, angle: 135, opacity: 0.2 });

async function main() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = "过门不忘团队";
  pres.title = "过门不忘 — 项目介绍";

  // Pre-generate icons
  const ico = {
    brain: await iconToBase64Png(FaBrain, C.accent),
    check: await iconToBase64Png(FaCheckCircle, C.success),
    shield: await iconToBase64Png(FaShieldAlt, C.accent),
    users: await iconToBase64Png(FaUsers, C.accent),
    search: await iconToBase64Png(FaSearch, C.accent),
    mobile: await iconToBase64Png(FaMobileAlt, C.accent),
    rocket: await iconToBase64Png(FaRocket, C.accent),
    chart: await iconToBase64Png(FaChartLine, C.success),
    camera: await iconToBase64Png(FaCamera, C.accent),
    history: await iconToBase64Png(FaHistory, C.accent),
    lock: await iconToBase64Png(FaLock, C.accent),
    prescription: await iconToBase64Png(FaPrescriptionBottle, C.success),
    home: await iconToBase64Png(FaHome, C.pending),
  };

  // ─────────────────────────────────────────────
  // SLIDE 1: Title (dark)
  // ─────────────────────────────────────────────
  {
    const s = pres.addSlide();
    s.background = { color: C.bgDark };

    // Large accent decorative circle (bottom right)
    s.addShape(pres.shapes.OVAL, {
      x: 7.5, y: 2.5, w: 4, h: 4,
      fill: { color: C.accent, transparency: 92 },
    });

    // Accent line at top-left
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.8, y: 1.0, w: 0.06, h: 1.2,
      fill: { color: C.accent },
    });

    s.addText("过门不忘", {
      x: 1.1, y: 1.2, w: 7, h: 1.0,
      fontSize: 48, fontFace: "Georgia", bold: true,
      color: C.text, margin: 0,
    });

    s.addText('告别“门口”效应，1 秒确认，安心转身向前走', {
      x: 1.1, y: 2.4, w: 7, h: 0.6,
      fontSize: 18, fontFace: "Calibri", italic: true,
      color: C.accent, margin: 0,
    });

    s.addText('"Did I?" Confirmation Tool for Everyone', {
      x: 1.1, y: 3.1, w: 7, h: 0.4,
      fontSize: 13, fontFace: "Calibri",
      color: C.textSoft, margin: 0,
    });

    // Bottom bar
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0, y: 5.1, w: 10, h: 0.525,
      fill: { color: C.surface },
    });
    s.addText("项目介绍  ·  2026-05-28  ·  Stage 3→5 原型迭代中", {
      x: 0.8, y: 5.15, w: 8, h: 0.4,
      fontSize: 11, fontFace: "Calibri",
      color: C.textSoft, margin: 0,
    });

    // Small icon at bottom right
    s.addImage({ data: ico.brain, x: 9.2, y: 5.15, w: 0.4, h: 0.4 });
  }

  // ─────────────────────────────────────────────
  // SLIDE 2: 问题 — 门口效应
  // ─────────────────────────────────────────────
  {
    const s = pres.addSlide();
    s.background = { color: C.bgContent };

    // Icon circle
    s.addShape(pres.shapes.OVAL, {
      x: 0.7, y: 0.55, w: 0.55, h: 0.55,
      fill: { color: C.accent },
    });
    s.addImage({ data: ico.brain, x: 0.775, y: 0.625, w: 0.4, h: 0.4 });

    s.addText("问题：为什么我们会忘？", {
      x: 1.4, y: 0.55, w: 7.5, h: 0.55,
      fontSize: 32, fontFace: "Georgia", bold: true,
      color: C.text, margin: 0,
    });

    // Left column: explanation
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.8, y: 1.5, w: 5.0, h: 3.6,
      fill: { color: C.surface }, shadow: mkShadow(),
      rectRadius: 0.12,
    });

    s.addText([
      { text: "门口效应 (Doorway Effect)", options: { fontSize: 16, bold: true, color: C.accent, breakLine: true, paraSpaceAfter: 8 } },
      { text: "Radvansky 2011 实验证明：", options: { fontSize: 13, color: C.text, breakLine: true, paraSpaceAfter: 4 } },
      { text: "走过一扇门，遗忘率翻倍。", options: { fontSize: 14, bold: true, color: C.text, breakLine: true, paraSpaceAfter: 10 } },
      { text: "这是所有人的正常认知机制——", options: { fontSize: 13, color: C.text, breakLine: true, paraSpaceAfter: 4 } },
      { text: "不是病，是人脑按空间组织记忆的必然结果。", options: { fontSize: 13, color: C.text, breakLine: true, paraSpaceAfter: 12 } },
      { text: "“我锁门了没？”", options: { fontSize: 16, italic: true, color: C.textSoft, breakLine: true, paraSpaceAfter: 4 } },
      { text: "“我今天吃药了吗？”", options: { fontSize: 16, italic: true, color: C.textSoft } },
    ], { x: 1.1, y: 1.6, w: 4.4, h: 3.3, margin: [12, 0, 12, 16] });

    // Right column: stat callout
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 6.1, y: 1.5, w: 3.2, h: 1.6,
      fill: { color: C.accent, transparency: 88 },
    });
    s.addText("6 亿", {
      x: 6.1, y: 1.55, w: 3.2, h: 0.8,
      fontSize: 56, fontFace: "Georgia", bold: true,
      color: C.accent, align: "center", margin: 0,
    });
    s.addText("中国成年人\n都是潜在用户", {
      x: 6.1, y: 2.35, w: 3.2, h: 0.7,
      fontSize: 13, fontFace: "Calibri",
      color: C.textSoft, align: "center", margin: 0,
    });

    // Right column: current workarounds
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 6.1, y: 3.4, w: 3.2, h: 1.7,
      fill: { color: C.surface },
    });
    s.addText([
      { text: "现在的应对方式", options: { fontSize: 13, bold: true, color: C.textSoft, breakLine: true, paraSpaceAfter: 6 } },
      { text: "回去看一眼", options: { bullet: true, fontSize: 12, color: C.text, breakLine: true } },
      { text: "微信发自己一条", options: { bullet: true, fontSize: 12, color: C.text, breakLine: true } },
      { text: "反复确认（焦虑）", options: { bullet: true, fontSize: 12, color: C.text } },
    ], { x: 6.3, y: 3.5, w: 2.8, h: 1.5, margin: [8, 0, 8, 10] });

    // Bottom quote
    s.addText('智能门锁/EV 车 App 的"状态可查"功能彻底消除了确认焦虑 — 需求真实且痛感强', {
      x: 0.8, y: 5.0, w: 8.5, h: 0.35,
      fontSize: 11, fontFace: "Calibri", italic: true,
      color: C.textSoft, margin: 0,
    });
  }

  // ─────────────────────────────────────────────
  // SLIDE 3: 目标用户
  // ─────────────────────────────────────────────
  {
    const s = pres.addSlide();
    s.background = { color: C.bgContent };

    s.addShape(pres.shapes.OVAL, {
      x: 0.7, y: 0.55, w: 0.55, h: 0.55,
      fill: { color: C.accent },
    });
    s.addImage({ data: ico.users, x: 0.775, y: 0.625, w: 0.4, h: 0.4 });

    s.addText("目标用户：面向普通人，不是病人", {
      x: 1.4, y: 0.55, w: 7.5, h: 0.55,
      fontSize: 32, fontFace: "Georgia", bold: true,
      color: C.text, margin: 0,
    });

    // User cards in 2x2 grid
    const users = [
      { icon: ico.lock, emoji: "🚲", title: "通勤锁车族", stat: "3.5 亿辆电动车", freq: "每日 1-2 次", intensity: "高", color: C.accent },
      { icon: ico.prescription, emoji: "💊", title: "规律服药人群", stat: "约 2 亿慢性病患者", freq: "每日 1-3 次", intensity: "极高", color: C.success },
      { icon: ico.home, emoji: "", title: "日常确认者", stat: "关火、锁门、喂宠物", freq: "每周 1-5 次", intensity: "中", color: C.pending },
      { icon: ico.shield, emoji: "🔄", title: "反复确认型", stat: "约 3000-5000 万", freq: "每日多次", intensity: "极高", color: C.accent },
    ];

    const cardW = 4.3, cardH = 1.65, gapX = 0.5, gapY = 0.3;
    const startX = 0.8, startY = 1.4;

    users.forEach((u, i) => {
      const col = i % 2, row = Math.floor(i / 2);
      const cx = startX + col * (cardW + gapX);
      const cy = startY + row * (cardH + gapY);

      s.addShape(pres.shapes.RECTANGLE, {
        x: cx, y: cy, w: cardW, h: cardH,
        fill: { color: C.surface }, shadow: mkShadow(),
      });
      // Left accent bar
      s.addShape(pres.shapes.RECTANGLE, {
        x: cx, y: cy, w: 0.06, h: cardH,
        fill: { color: u.color },
      });

      s.addImage({ data: u.icon, x: cx + 0.2, y: cy + 0.2, w: 0.4, h: 0.4 });
      s.addText(u.title, {
        x: cx + 0.7, y: cy + 0.15, w: 3.3, h: 0.4,
        fontSize: 16, fontFace: "Georgia", bold: true,
        color: C.text, margin: 0,
      });
      s.addText([
        { text: u.stat, options: { fontSize: 12, color: C.textSoft, breakLine: true, paraSpaceAfter: 3 } },
        { text: `频次: ${u.freq}`, options: { fontSize: 11, color: C.textMuted, breakLine: true } },
        { text: `痛感: ${u.intensity}`, options: { fontSize: 11, color: C.textMuted } },
      ], { x: cx + 0.7, y: cy + 0.65, w: 3.3, h: 0.9, margin: 0 });

      // Intensity badge
      const badgeColor = u.intensity === "极高" ? C.success : u.intensity === "高" ? C.accent : C.pending;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: cx + 2.9, y: cy + 0.2, w: 1.1, h: 0.3,
        fill: { color: badgeColor, transparency: 80 },
        rectRadius: 0.1,
      });
      s.addText(u.intensity, {
        x: cx + 2.9, y: cy + 0.2, w: 1.1, h: 0.3,
        fontSize: 10, fontFace: "Calibri", bold: true,
        color: badgeColor, align: "center", margin: 0,
      });
    });

    // Footer
    s.addText("SAM（可触达市场）: 通勤锁车族 + 规律服药人群 ≈ 1.8-2 亿人", {
      x: 0.8, y: 5.15, w: 8, h: 0.3,
      fontSize: 11, fontFace: "Calibri", italic: true,
      color: C.textMuted, margin: 0,
    });
  }

  // ─────────────────────────────────────────────
  // SLIDE 4: 市场机会
  // ─────────────────────────────────────────────
  {
    const s = pres.addSlide();
    s.background = { color: C.bgContent };

    s.addShape(pres.shapes.OVAL, {
      x: 0.7, y: 0.55, w: 0.55, h: 0.55,
      fill: { color: C.accent },
    });
    s.addImage({ data: ico.search, x: 0.775, y: 0.625, w: 0.4, h: 0.4 });

    s.addText("市场机会：全球蓝海，中国零空白", {
      x: 1.4, y: 0.55, w: 7.5, h: 0.55,
      fontSize: 32, fontFace: "Georgia", bold: true,
      color: C.text, margin: 0,
    });

    // Left: global landscape
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.8, y: 1.4, w: 4.5, h: 3.7,
      fill: { color: C.surface },
    });
    s.addText("全球竞品格局", {
      x: 1.0, y: 1.5, w: 4.0, h: 0.4,
      fontSize: 18, fontFace: "Georgia", bold: true,
      color: C.accent, margin: 0,
    });

    s.addText([
      { text: "15+ 款直接竞品（2024-2026 上架）", options: { bullet: true, fontSize: 13, color: C.text, breakLine: true } },
      { text: "全部来自海外（美/欧/日）", options: { bullet: true, fontSize: 13, color: C.text, breakLine: true } },
      { text: "小团队/个人开发者，无大厂壁垒", options: { bullet: true, fontSize: 13, color: C.text, breakLine: true } },
      { text: "品类处于快速膨胀期", options: { bullet: true, fontSize: 13, color: C.text, breakLine: true } },
      { text: "OCD/ADHD 定位正在退潮", options: { bullet: true, fontSize: 13, color: C.text, breakLine: true } },
      { text: "功能门槛极低，护城河浅", options: { bullet: true, fontSize: 13, color: C.text, breakLine: true } },
    ], { x: 1.0, y: 2.0, w: 4.1, h: 2.8, margin: [4, 0, 4, 10] });

    // Right: opportunity callout
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 5.6, y: 1.4, w: 3.8, h: 1.2,
      fill: { color: C.accent, transparency: 85 },
    });
    s.addText("🇨🇳 中国市场：零空白", {
      x: 5.8, y: 1.45, w: 3.4, h: 0.5,
      fontSize: 20, fontFace: "Georgia", bold: true,
      color: C.accent, margin: 0,
    });
    s.addText('没有任何一款专门的"做过确认"类 App', {
      x: 5.8, y: 1.95, w: 3.4, h: 0.5,
      fontSize: 12, fontFace: "Calibri",
      color: C.text, margin: 0,
    });

    // Right: key opportunities
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 5.6, y: 2.85, w: 3.8, h: 2.25,
      fill: { color: C.surface },
    });
    s.addText("机会空间", {
      x: 5.8, y: 2.95, w: 3.4, h: 0.35,
      fontSize: 16, fontFace: "Georgia", bold: true,
      color: C.success, margin: 0,
    });
    s.addText([
      { text: "面向普通人的确认工具", options: { bullet: true, fontSize: 12, color: C.text, breakLine: true } },
      { text: "微信小程序生态", options: { bullet: true, fontSize: 12, color: C.text, breakLine: true } },
      { text: "拍照 + AI 自动识别（未来）", options: { bullet: true, fontSize: 12, color: C.text, breakLine: true } },
      { text: "IoT 联动（未来）", options: { bullet: true, fontSize: 12, color: C.text } },
    ], { x: 5.8, y: 3.35, w: 3.4, h: 1.6, margin: [2, 0, 2, 8] });
  }

  // ─────────────────────────────────────────────
  // SLIDE 5: 产品定位
  // ─────────────────────────────────────────────
  {
    const s = pres.addSlide();
    s.background = { color: C.bgContent };

    s.addShape(pres.shapes.OVAL, {
      x: 0.7, y: 0.55, w: 0.55, h: 0.55,
      fill: { color: C.accent },
    });
    s.addImage({ data: ico.shield, x: 0.775, y: 0.625, w: 0.4, h: 0.4 });

    s.addText("产品定位：不是提醒，是确认", {
      x: 1.4, y: 0.55, w: 7.5, h: 0.55,
      fontSize: 32, fontFace: "Georgia", bold: true,
      color: C.text, margin: 0,
    });

    // Comparison: two columns
    // Left: "我们不是"
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.8, y: 1.4, w: 4.3, h: 3.5,
      fill: { color: C.surface },
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.8, y: 1.4, w: 4.3, h: 0.5,
      fill: { color: C.pending, transparency: 70 },
    });
    s.addText("不是提醒工具", {
      x: 0.8, y: 1.42, w: 4.3, h: 0.45,
      fontSize: 16, fontFace: "Georgia", bold: true,
      color: C.text, align: "center", margin: 0,
    });

    s.addText([
      { text: '❌ “该做了”提醒', options: { fontSize: 13, color: C.textSoft, breakLine: true, paraSpaceAfter: 4 } },
      { text: '❌ 健康数据追踪', options: { fontSize: 13, color: C.textSoft, breakLine: true, paraSpaceAfter: 4 } },
      { text: '❌ 社交/社区功能', options: { fontSize: 13, color: C.textSoft, breakLine: true, paraSpaceAfter: 4 } },
      { text: '❌ OCD/ADHD 医疗工具', options: { fontSize: 13, color: C.textSoft } },
    ], { x: 1.0, y: 2.0, w: 3.9, h: 2.5, margin: [12, 0, 12, 16] });

    // Right: "我们是"
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 5.4, y: 1.4, w: 4.3, h: 3.5,
      fill: { color: C.surface },
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x: 5.4, y: 1.4, w: 4.3, h: 0.5,
      fill: { color: C.success, transparency: 70 },
    });
    s.addText("是确认工具", {
      x: 5.4, y: 1.42, w: 4.3, h: 0.45,
      fontSize: 16, fontFace: "Georgia", bold: true,
      color: C.text, align: "center", margin: 0,
    });

    s.addText([
      { text: '✅ “做过了吗”确认', options: { fontSize: 13, color: C.text, breakLine: true, paraSpaceAfter: 4 } },
      { text: '✅ 1 秒确认，安心转身', options: { fontSize: 13, color: C.text, breakLine: true, paraSpaceAfter: 4 } },
      { text: '✅ 面向普通人的日常工具', options: { fontSize: 13, color: C.text, breakLine: true, paraSpaceAfter: 4 } },
      { text: '✅ 拍照证明 + 时间戳记录', options: { fontSize: 13, color: C.text } },
    ], { x: 5.6, y: 2.0, w: 3.9, h: 2.5, margin: [12, 0, 12, 16] });

    // Step comparison at bottom
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.8, y: 5.1, w: 8.9, h: 0.4,
      fill: { color: C.surface },
    });
    s.addText([
      { text: "过门不忘: 2步 ~3秒  ", options: { fontSize: 11, bold: true, color: C.success } },
      { text: "|  ", options: { fontSize: 11, color: C.textMuted } },
      { text: "微信发自己: 4步 ~8秒", options: { fontSize: 11, color: C.textSoft } },
    ], { x: 0.8, y: 5.12, w: 8.9, h: 0.35, fontSize: 11, fontFace: "Calibri", align: "center", margin: 0 });
  }

  // ─────────────────────────────────────────────
  // SLIDE 6: 核心功能
  // ─────────────────────────────────────────────
  {
    const s = pres.addSlide();
    s.background = { color: C.bgContent };

    s.addShape(pres.shapes.OVAL, {
      x: 0.7, y: 0.55, w: 0.55, h: 0.55,
      fill: { color: C.accent },
    });
    s.addImage({ data: ico.mobile, x: 0.775, y: 0.625, w: 0.4, h: 0.4 });

    s.addText("MVP 核心功能", {
      x: 1.4, y: 0.55, w: 7.5, h: 0.55,
      fontSize: 32, fontFace: "Georgia", bold: true,
      color: C.text, margin: 0,
    });

    // 4 feature cards horizontal
    const features = [
      { icon: ico.check, title: "今日确认面板", desc: "打开即看到所有事项的今日状态，不是空列表", tag: "P0" },
      { icon: ico.camera, title: "快速确认", desc: "点按钮或拍照，不超过 2 步完成", tag: "P0" },
      { icon: ico.history, title: "历史记录", desc: "按日期回看，支持照片查看和筛选", tag: "P1" },
      { icon: ico.shield, title: "本地优先", desc: "无需登录，数据存本地，隐私安全", tag: "P0" },
    ];

    const fw = 2.1, fh = 3.2, fg = 0.17;
    const fsx = 0.8;

    features.forEach((f, i) => {
      const fx = fsx + i * (fw + fg);

      s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: fx, y: 1.4, w: fw, h: fh,
        fill: { color: C.surface }, shadow: mkShadow(),
        rectRadius: 0.1,
      });
      // Top accent
      s.addShape(pres.shapes.RECTANGLE, {
        x: fx, y: 1.4, w: fw, h: 0.06,
        fill: { color: C.accent },
      });

      s.addImage({ data: f.icon, x: fx + 0.75, y: 1.65, w: 0.5, h: 0.5, sizing: { type: 'contain', w: 0.5, h: 0.5 } });

      s.addText(f.title, {
        x: fx + 0.15, y: 2.3, w: fw - 0.3, h: 0.4,
        fontSize: 14, fontFace: "Georgia", bold: true,
        color: C.text, align: "center", margin: 0,
      });
      s.addText(f.desc, {
        x: fx + 0.15, y: 2.8, w: fw - 0.3, h: 1.2,
        fontSize: 11, fontFace: "Calibri",
        color: C.textSoft, align: "center", margin: [4, 6, 4, 6],
      });

      // Tag
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: fx + 0.65, y: 4.15, w: 0.7, h: 0.25,
        fill: { color: C.accent, transparency: 80 },
        rectRadius: 0.08,
      });
      s.addText(f.tag, {
        x: fx + 0.65, y: 4.15, w: 0.7, h: 0.25,
        fontSize: 9, fontFace: "Calibri", bold: true,
        color: C.accent, align: "center", margin: 0,
      });
    });

    // Core flow at bottom
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 1.5, y: 4.85, w: 7.0, h: 0.55,
      fill: { color: C.accent, transparency: 88 },
    });
    s.addText("打开小程序 → 看到今日状态 → 点击确认（按钮/拍照） → 安心离开", {
      x: 1.5, y: 4.88, w: 7.0, h: 0.5,
      fontSize: 12, fontFace: "Calibri",
      color: C.accent, align: "center", margin: 0,
    });
  }

  // ─────────────────────────────────────────────
  // SLIDE 7: 三阶段路线图
  // ─────────────────────────────────────────────
  {
    const s = pres.addSlide();
    s.background = { color: C.bgContent };

    s.addShape(pres.shapes.OVAL, {
      x: 0.7, y: 0.55, w: 0.55, h: 0.55,
      fill: { color: C.accent },
    });
    s.addImage({ data: ico.rocket, x: 0.775, y: 0.625, w: 0.4, h: 0.4 });

    s.addText("三阶段路线图", {
      x: 1.4, y: 0.55, w: 7.5, h: 0.55,
      fontSize: 32, fontFace: "Georgia", bold: true,
      color: C.text, margin: 0,
    });

    const phases = [
      {
        title: "Phase 1 · MVP",
        platform: "微信小程序",
        goal: "验证需求是否存在",
        features: ["今日确认面板", "拍照/按钮确认", "自定义事项", "历史记录"],
        color: C.accent,
        icon: ico.mobile,
      },
      {
        title: "Phase 2 · 体验升级",
        platform: "原生 App",
        goal: "核心体验极致化",
        features: ["锁屏 Widget", "桌面 Widget", "Apple Watch", "语音确认"],
        color: C.accent,
        icon: ico.check,
      },
      {
        title: "Phase 3 · 增强与变现",
        platform: "跨平台",
        goal: "AI + IoT 联动",
        features: ["AI 拍照识别", "家人共享", "GPS 离家提醒", "IoT 联动"],
        color: C.accentDim,
        icon: ico.rocket,
      },
    ];

    const pw = 3.0, ph = 3.5, pg = 0.25;
    const psx = 0.65;

    phases.forEach((p, i) => {
      const px = psx + i * (pw + pg);

      s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: px, y: 1.4, w: pw, h: ph,
        fill: { color: C.surface }, shadow: mkShadow(),
        rectRadius: 0.1,
      });
      // Top bar
      s.addShape(pres.shapes.RECTANGLE, {
        x: px, y: 1.4, w: pw, h: 0.08,
        fill: { color: p.color },
      });

      s.addImage({ data: p.icon, x: px + 1.2, y: 1.6, w: 0.5, h: 0.5 });

      s.addText(p.title, {
        x: px + 0.15, y: 2.2, w: pw - 0.3, h: 0.35,
        fontSize: 18, fontFace: "Georgia", bold: true,
        color: p.color, align: "center", margin: 0,
      });
      s.addText(p.platform, {
        x: px + 0.15, y: 2.55, w: pw - 0.3, h: 0.25,
        fontSize: 12, fontFace: "Calibri", bold: true,
        color: C.text, align: "center", margin: 0,
      });
      s.addText(p.goal, {
        x: px + 0.15, y: 2.8, w: pw - 0.3, h: 0.3,
        fontSize: 11, fontFace: "Calibri", italic: true,
        color: C.textSoft, align: "center", margin: 0,
      });

      // Divider
      s.addShape(pres.shapes.LINE, {
        x: px + 0.3, y: 3.15, w: pw - 0.6, h: 0,
        line: { color: C.border, width: 1 },
      });

      s.addText(p.features.map((f, fi) => ({
        text: f,
        options: { bullet: true, fontSize: 12, color: C.textSoft, breakLine: fi < p.features.length - 1 },
      })), {
        x: px + 0.3, y: 3.25, w: pw - 0.6, h: 1.4,
        margin: [4, 0, 4, 8],
      });
    });

    // Arrow connectors
    phases.slice(0, -1).forEach((_, i) => {
      const ax = psx + (i + 1) * (pw + pg) - pg;
      s.addText("→", {
        x: ax - 0.1, y: 2.8, w: 0.45, h: 0.35,
        fontSize: 20, fontFace: "Calibri", bold: true,
        color: C.accent, align: "center", margin: 0,
      });
    });
  }

  // ─────────────────────────────────────────────
  // SLIDE 8: 验证指标 & 结论 (dark)
  // ─────────────────────────────────────────────
  {
    const s = pres.addSlide();
    s.background = { color: C.bgDark };

    s.addShape(pres.shapes.OVAL, {
      x: 0.7, y: 0.55, w: 0.55, h: 0.55,
      fill: { color: C.accent },
    });
    s.addImage({ data: ico.chart, x: 0.775, y: 0.625, w: 0.4, h: 0.4 });

    s.addText("验证指标 & 下一步", {
      x: 1.4, y: 0.55, w: 7.5, h: 0.55,
      fontSize: 32, fontFace: "Georgia", bold: true,
      color: C.text, margin: 0,
    });

    // Metrics in 3 columns
    const metrics = [
      { value: "> 40%", label: "次日留存", desc: "产品是否有即时价值" },
      { value: "> 25%", label: "7日留存", desc: "是否有持续需求" },
      { value: "> 3次/周", label: "确认频次", desc: "是否真正在用" },
      { value: "> 30%", label: "拍照占比", desc: "拍照是否核心功能" },
      { value: "> 30", label: "NPS", desc: "是否优于替代方案" },
    ];

    const mw = 1.7, mh = 1.6, mg = 0.15;
    const msx = 0.8;

    metrics.forEach((m, i) => {
      const mx = msx + i * (mw + mg);

      s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: mx, y: 1.4, w: mw, h: mh,
        fill: { color: C.surface },
      });

      s.addText(m.value, {
        x: mx, y: 1.5, w: mw, h: 0.6,
        fontSize: 28, fontFace: "Georgia", bold: true,
        color: C.accent, align: "center", margin: 0,
      });
      s.addText(m.label, {
        x: mx, y: 2.1, w: mw, h: 0.3,
        fontSize: 13, fontFace: "Calibri", bold: true,
        color: C.text, align: "center", margin: 0,
      });
      s.addText(m.desc, {
        x: mx, y: 2.4, w: mw, h: 0.5,
        fontSize: 10, fontFace: "Calibri",
        color: C.textSoft, align: "center", margin: [2, 4, 2, 4],
      });
    });

    // Bottom conclusion
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 1.0, y: 3.5, w: 8.0, h: 1.2,
      fill: { color: C.accent, transparency: 90 },
    });
    s.addText([
      { text: "判定标准", options: { fontSize: 14, bold: true, color: C.accent, breakLine: true, paraSpaceAfter: 6 } },
      { text: "7日留存 > 25%  → 需求成立，进入 Phase 2 原生 App 开发", options: { fontSize: 13, color: C.text, breakLine: true } },
      { text: "7日留存 < 25%  → Pivot 或 Stop", options: { fontSize: 13, color: C.textSoft } },
    ], { x: 1.3, y: 3.55, w: 7.4, h: 1.1, margin: [8, 0, 8, 12] });

    // Final tagline
    s.addText("1 秒确认，安心转身", {
      x: 1.0, y: 5.0, w: 8, h: 0.5,
      fontSize: 24, fontFace: "Georgia", bold: true,
      color: C.accent, align: "center", margin: 0,
    });
  }

  // ── Save ──
  const outPath = path.join(__dirname, "过门不忘-项目介绍.pptx");
  await pres.writeFile({ fileName: outPath });
  console.log(`Done: ${outPath}`);
}

main().catch(console.error);
