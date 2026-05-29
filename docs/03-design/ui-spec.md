# UI 规格：过门不忘 (memo-tool)

> 版本: 1.0 | 日期: 2026-05-27 | 状态: **草稿**
> **输入**: ← [交互设计](interaction-design.md) · [视觉风格指南](visual-style-guide.md)
> **被引用**: → [文档关系图](../document-map.md)

---

## 一、设计令牌

### 1.1 色彩

| 令牌 | 值 | 用途 |
|------|-----|------|
| `--color-bg` | `#0c0f14` | 页面背景 |
| `--color-surface` | `#161b22` | 卡片/面板背景 |
| `--color-surface-hover` | `#1c2129` | 卡片悬停 |
| `--color-accent` | `#4ecdc4` | 主强调色（确认、CTA） |
| `--color-accent-soft` | `rgba(78,205,196,.15)` | 强调色淡底 |
| `--color-success` | `#81c784` | 已确认状态 |
| `--color-success-soft` | `rgba(129,199,132,.12)` | 已确认底色 |
| `--color-pending` | `#546e7a` | 待确认状态 |
| `--color-warning` | `#ffb74d` | 警告/提示 |
| `--color-danger` | `#ef5350` | 删除/危险操作 |
| `--color-text` | `#e6edf3` | 主文字 |
| `--color-text-soft` | `#8b949e` | 次要文字 |
| `--color-text-muted` | `#484f58` | 占位/禁用 |
| `--color-border` | `rgba(255,255,255,.08)` | 分割线/边框 |

### 1.2 间距

| 令牌 | 值 | 用途 |
|------|-----|------|
| `--space-xs` | `4px` | 紧凑间距 |
| `--space-sm` | `8px` | 元素内间距 |
| `--space-md` | `16px` | 卡片内间距 |
| `--space-lg` | `24px` | 区块间距 |
| `--space-xl` | `32px` | 页面边距 |

### 1.3 圆角

| 令牌 | 值 | 用途 |
|------|-----|------|
| `--radius-sm` | `8px` | 小元素（chip、badge） |
| `--radius-md` | `12px` | 卡片、输入框 |
| `--radius-lg` | `16px` | 面板、弹窗 |
| `--radius-full` | `999px` | 头像、圆形按钮 |

### 1.4 字体

| 令牌 | 值 |
|------|-----|
| `--font-body` | `-apple-system, "PingFang SC", "Microsoft YaHei", sans-serif` |
| `--font-size-xs` | `11px` |
| `--font-size-sm` | `13px` |
| `--font-size-md` | `15px` |
| `--font-size-lg` | `18px` |
| `--font-size-xl` | `24px` |

---

## 二、核心组件规格

### 2.1 事项卡片（ConfirmItem）

**已确认状态**:

```
┌──────────────────────────────────┐
│ ✅  锁车                  08:32  │  ← 绿色✅ + 事项名 + 时间
│ 📷 拍照确认        [缩略图 40×40]│  ← 确认方式 + 照片缩略图
└──────────────────────────────────┘
```

| 属性 | 值 |
|------|-----|
| 背景 | `--color-success-soft` |
| 边框 | `1px solid rgba(129,199,132,.2)` |
| 左边框 | `3px solid --color-success` |
| 圆角 | `--radius-md` |
| 内间距 | `12px 14px` |
| ✅图标 | `20px`, `--color-success` |
| 事项名 | `--font-size-md`, `--color-text`, `font-weight: 600` |
| 时间 | `--font-size-sm`, `--color-success` |
| 确认方式 | `--font-size-xs`, `--color-text-soft` |

**待确认状态**:

```
┌──────────────────────────────────┐
│ ⏳  服药                 待确认  │  ← 灰色⏳ + 事项名 + "待确认"
│ 点击确认                         │  ← 引导文字
└──────────────────────────────────┘
```

| 属性 | 值 |
|------|-----|
| 背景 | `--color-surface` |
| 边框 | `1px solid --color-border` |
| 左边框 | `3px solid --color-pending` |
| ⏳图标 | `20px`, `--color-pending` |
| "待确认" | `--font-size-xs`, `--color-pending` |
| "点击确认" | `--font-size-xs`, `--color-text-muted` |

### 2.2 确认操作面板（ConfirmSheet）

| 属性 | 值 |
|------|-----|
| 类型 | 底部弹出面板（action sheet） |
| 背景 | `--color-surface` |
| 圆角 | `--radius-lg` 顶部 |
| 最大高度 | `60vh` |

**拍照确认按钮**:
- 高度: `56px`
- 背景: `--color-accent`
- 文字: `#0c0f14`, `--font-size-md`, `font-weight: 700`
- 圆角: `--radius-md`
- 图标: 📷 左侧

**按钮确认按钮**:
- 高度: `48px`
- 背景: `--color-accent-soft`
- 边框: `1px solid rgba(78,205,196,.3)`
- 文字: `--color-accent`, `--font-size-md`, `font-weight: 600`

### 2.3 添加事项输入

| 属性 | 值 |
|------|-----|
| 输入框背景 | `--color-surface` |
| 边框 | `1px solid --color-border` (focus: `--color-accent`) |
| 圆角 | `--radius-md` |
| 高度 | `44px` |
| 占位文字 | `--color-text-muted` |

### 2.4 图标选择器

| 属性 | 值 |
|------|-----|
| 布局 | 横向滚动网格，每行 5 个 |
| 单元格 | `48×48px` |
| 选中态 | `--color-accent-soft` 背景 + `--color-accent` 边框 |
| 未选中态 | `--color-surface` 背景 |

---

## 三、页面布局规格

### 3.1 首页（确认面板）

| 属性 | 值 |
|------|-----|
| 顶部栏高度 | `56px` |
| 日期文字 | `--font-size-sm`, `--color-text-soft` |
| "今日"标题 | `--font-size-xl`, `--color-text`, `font-weight: 700` |
| 事项列表间距 | `--space-sm` |
| 页面边距 | `--space-md` 左右 |
| 底部导航高度 | `56px` + 安全区 |

### 3.2 历史记录

| 属性 | 值 |
|------|-----|
| 日期分组头 | `--font-size-sm`, `--color-text-soft`, `font-weight: 600` |
| 记录项 | 与确认卡片类似，紧凑版 |
| 照片缩略图 | `32×32px`, `--radius-sm` |

---

## 四、动画规格

| 动画 | 时长 | 缓动 | 说明 |
|------|------|------|------|
| 确认 ✅ 闪烁 | `300ms` | `ease-out` | 确认完成时 ✅ 图标缩放弹跳 |
| 面板弹出 | `250ms` | `cubic-bezier(.32,.72,0,1)` | 确认面板从底部滑入 |
| 状态切换 | `200ms` | `ease` | 卡片从待确认变为已确认的背景色过渡 |
| 页面切换 | `200ms` | `ease` | tab 切换淡入淡出 |

---

## 变更日志

| 日期 | 版本 | 变更 |
|------|------|------|
| 2026-05-27 | 1.0 | 初始版本 |
