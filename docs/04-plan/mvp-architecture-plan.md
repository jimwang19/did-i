# MVP 架构设计与技术选型

> 版本: 1.0 | 日期: 2026-05-28 | 状态: **草稿**
> **输入**: ← [产品规格书](../02-product/product-spec.md) · [交互设计](../03-design/interaction-design.md) · [UI规格](../03-design/ui-spec.md) · [视觉风格指南](../03-design/visual-style-guide.md) · [PRD](../../.claude/prds/memo-tool.prd.md)
> **输出**: → MVP 代码实现

---

## 一、技术选型决策

### 1.1 开发平台

**选型**: 微信小程序原生开发

| 决策维度 | 产品规格对齐 | 技术依据 |
|---------|-------------|---------|
| 平台 | 规格书明确 Phase 1 平台为微信小程序 | 原生开发 API 调用最直接，无框架学习成本 |
| 语言 | 无明确要求 | TypeScript + `miniprogram-api-typings`，减少运行时错误 |
| UI | 无明确要求 | 原生 WXML + WXSS，MVP 不引入第三方库 |
| 构建 | 无明确要求 | 微信开发者工具自带编译，无需 webpack/vite |

### 1.2 存储策略（对齐 F5 数据存储规格）

| 规格书要求 | 技术方案 | 依据 |
|-----------|---------|------|
| 本地优先，无需登录 | `wx.setStorageSync` 存事项+记录 | 小程序本地存储 API，10MB 配额 |
| 照片仅存本地 | `wx.saveFile` + `wx.getSavedFileList` | 微信文件系统，独立于 localStorage |
| 照片不上传服务器 | 不做网络请求，纯本地 | MVP 明确不做云同步 |
| 确认记录本地存储 | JSON 序列化后存 `wx.setStorageSync` | 纯文本记录，容量可控 |

### 1.3 为什么不选跨平台框架

MVP 阶段产品规格明确"微信小程序"为唯一平台（Phase 1），Phase 2 才是"原生 App"，Phase 3 才是"跨平台"。此时引入 Taro/uni-app 属于过度工程。

---

## 二、功能-技术映射

### 2.1 F1 → 今日确认面板（首页）

| 规格书要求 | 技术实现 |
|-----------|---------|
| 首页展示所有事项确认状态 | `pages/index` 页面，`wx:for` 渲染事项列表 |
| 无需操作即可查看 | `onShow` 生命周期自动加载数据 |
| 名称 + 状态图标 + 确认时间 | 卡片组件显示 `item.name` + `item.icon` + 确认记录时间 |
| 每日 00:00 自动重置 | `onLaunch` / `onShow` 检测日期变化，重置今日状态 |
| 首次使用预设模板 | `utils/constants.ts` 定义默认事项，`hasSeenOnboarding` 判断是否初始化 |
| 空状态引导 | 事项列表为空时显示引导视图 |

### 2.2 F2 → 确认操作

| 规格书要求 | 技术实现 |
|-----------|---------|
| 按钮确认（1次点击） | `wx:tap` → 写入确认记录 → 更新 UI |
| 拍照确认（1次点击 + 1次拍照） | `wx.chooseMedia` → `wx.saveFile` → 写入记录 → 更新 UI |
| 记录：事项名+时间+方式+照片 | `Confirmation` 数据模型，`method` 字段区分 button/camera |
| 同日多次确认保留最近一次 | 查询同 `itemId` + 同 `date` 的记录，`push` 后取最新 |
| 确认后即时显示 ✅ + 时间 | 本地状态即时更新，不依赖重渲染 |

### 2.3 F3 → 事项管理

| 规格书要求 | 技术实现 |
|-----------|---------|
| 创建、编辑、删除 | `pages/index` 内嵌表单弹窗，或独立 `pages/edit-item` |
| 预设模板：锁车、服药 | `constants.ts` 定义 `{name, icon}` 数组 |
| 自定义事项 | 用户输入名称 + 选择图标 |
| 事项属性：名称 + 图标 | `Item` 接口：`name: string, icon: string` |
| 拖拽排序 | MVP 简化为"排序按钮"（上移/下移），`sortOrder` 字段控制 |
| 免费版最多 10 个 | 添加前检查 `items.length >= 10`，提示上限 |

### 2.4 F4 → 历史记录

| 规格书要求 | 技术实现 |
|-----------|---------|
| 查看历史确认记录 | `pages/history` 页面 |
| 日期 + 状态 + 时间 + 照片缩略图 | 按 `date` 分组渲染，照片显示缩略图 |
| 按事项筛选 | `picker` 组件选择事项，过滤记录 |
| 按日期范围筛选 | MVP 简化为"最近 N 天"选择器 |

### 2.5 F5 → 数据存储

| 规格书要求 | 技术实现 |
|-----------|---------|
| 本地优先 | 所有数据存 `wx.setStorageSync`，无网络请求 |
| 事项列表 + 确认记录 + 照片 | 分别存 `memo_items`、`memo_confirmations`、文件系统 |
| 登录后可云同步（中期） | MVP 不实现，数据模型预留 `syncId` 字段 |
| 隐私：照片仅存本地 | `wx.saveFile` 仅本地可访问，不上传 |

---

## 三、数据模型

```typescript
// 事项定义 — 对应 F3 规格
interface Item {
  id: string;           // 唯一 ID (UUID 或时间戳)
  name: string;         // 事项名称 (如"锁车")，最多 10 字符
  icon: string;         // 图标标识 (emoji 或预设 key)
  sortOrder: number;    // 排序权重，数值越小越靠前
  createdAt: string;    // 创建时间 ISO 8601
}

// 确认记录 — 对应 F2 规格
interface Confirmation {
  itemId: string;       // 关联事项 ID
  date: string;         // 确认日期 YYYY-MM-DD
  timestamp: string;    // 确认时间 HH:mm:ss
  method: 'button' | 'camera'; // 确认方式
  photoPath?: string;   // 照片本地路径 (仅拍照确认时有)
}

// 全局设置
interface AppSettings {
  hasSeenOnboarding: boolean;     // 是否已完成首次引导
  lastOpenDate: string;           // 上次打开日期 YYYY-MM-DD (用于每日重置判断)
}

// 存储结构 — 对应 F5 规格
interface AppData {
  items: Item[];
  confirmations: Confirmation[];
  settings: AppSettings;
}
```

---

## 四、工程目录结构

```
miniprogram/
├── app.ts                      # 入口: 初始化数据、检测每日重置
├── app.json                    # 全局配置: pages, window, tabBar
├── app.wxss                    # 全局样式: 设计令牌 (对齐 ui-spec.md)
├── project.config.json         # 微信项目配置
│
├── pages/
│   ├── index/                  # F1 + F3: 今日确认面板 + 事项管理
│   │   ├── index.ts
│   │   ├── index.wxml
│   │   ├── index.wxss
│   │   └── index.json
│   └── history/                # F4: 历史记录
│       ├── history.ts
│       ├── history.wxml
│       ├── history.wxss
│       └── history.json
│
├── components/
│   ├── item-card/              # 事项卡片 (显示名称/图标/状态/时间)
│   │   ├── item-card.ts
│   │   ├── item-card.wxml
│   │   ├── item-card.wxss
│   │   └── item-card.json
│   └── confirm-sheet/          # 确认操作面板 (底部弹出: 拍照/按钮)
│       ├── confirm-sheet.ts
│       ├── confirm-sheet.wxml
│       ├── confirm-sheet.wxss
│       └── confirm-sheet.json
│
├── utils/
│   ├── storage.ts              # 存储封装 (对齐 F5: 本地优先策略)
│   ├── date.ts                 # 日期工具 (每日重置判断)
│   └── constants.ts            # 预设事项/图标 (对齐 F3: 锁车/服药模板)
│
└── types/
    └── index.ts                # TypeScript 类型定义
```

---

## 五、存储策略详细设计

### 5.1 分层存储

| 数据类型 | 存储 API | Key | 容量预估 | 对应规格 |
|---------|---------|-----|---------|---------|
| 事项列表 | `wx.setStorageSync` | `memo_items` | < 1KB (≤10 事项) | F3 |
| 确认记录 | `wx.setStorageSync` | `memo_confirmations` | < 100KB (纯文本) | F2, F4 |
| 全局设置 | `wx.setStorageSync` | `memo_settings` | < 1KB | F5 |
| 确认照片 | `wx.saveFile` → 存路径 | 文件系统 | 10MB 配额内 | F2, F5 |

### 5.2 存储封装

`utils/storage.ts` 提供统一读写入口：

```typescript
// 读取并解析 JSON，失败返回默认值
function get<T>(key: string, fallback: T): T

// 写入 JSON 序列化，捕获 QuotaExceededError
function set(key: string, value: unknown): boolean

// 照片专用：保存文件并返回路径
function savePhoto(tempFilePath: string): Promise<string>

// 照片清理：删除 7 天前照片
function cleanupPhotos(keepDays: number): Promise<void>
```

### 5.3 照片清理策略

- MVP 保留最近 7 天照片
- `onLaunch` 时调用 `cleanupPhotos(7)`
- 空间不足时优先清理照片，不阻断按钮确认

### 5.4 每日重置机制

```
onLaunch / onShow:
  读取 settings.lastOpenDate
  对比 today
  如果 lastOpenDate != today:
    → 记录已"过了一天"，今日所有事项状态 = 待确认
    → 更新 settings.lastOpenDate = today
    → 保存 settings
```

不依赖后台定时器，纯打开时判断（符合"本地优先"规格）。

---

## 六、设计令牌迁移（对齐 ui-spec.md）

原型 `prototype.html` CSS 变量 → 小程序 `app.wxss` Page 级 CSS 变量：

| 令牌 | 值 | 用途 | 来源 |
|------|-----|------|------|
| `--color-bg` | `#0c0f14` | 页面背景 | ui-spec.md 1.1 |
| `--color-surface` | `#161b22` | 卡片/面板背景 | ui-spec.md 1.1 |
| `--color-surface-hover` | `#1c2129` | 卡片悬停 | ui-spec.md 1.1 |
| `--color-accent` | `#4ecdc4` | 主强调色 | ui-spec.md 1.1 |
| `--color-accent-soft` | `rgba(78,205,196,.15)` | 强调色淡底 | ui-spec.md 1.1 |
| `--color-success` | `#81c784` | 已确认状态 | ui-spec.md 1.1 |
| `--color-success-soft` | `rgba(129,199,132,.12)` | 已确认底色 | ui-spec.md 1.1 |
| `--color-pending` | `#546e7a` | 待确认状态 | ui-spec.md 1.1 |
| `--color-text` | `#e6edf3` | 主文字 | ui-spec.md 1.1 |
| `--color-text-soft` | `#8b949e` | 次要文字 | ui-spec.md 1.1 |
| `--color-border` | `rgba(255,255,255,.08)` | 分割线 | ui-spec.md 1.1 |
| `--space-xs` | `4px` | 紧凑间距 | ui-spec.md 1.2 |
| `--space-sm` | `8px` | 元素内间距 | ui-spec.md 1.2 |
| `--space-md` | `16px` | 卡片内间距 | ui-spec.md 1.2 |
| `--space-lg` | `24px` | 区块间距 | ui-spec.md 1.2 |
| `--radius-sm` | `8px` | 小元素圆角 | ui-spec.md 1.3 |
| `--radius-md` | `12px` | 卡片圆角 | ui-spec.md 1.3 |
| `--radius-lg` | `16px` | 面板圆角 | ui-spec.md 1.3 |

视觉风格（暗色主题、绿色=安心、灰色=中性、青色=行动）对齐 `visual-style-guide.md`。

---

## 七、用户故事-流程映射

### US1: 通勤锁车确认（P0）

```
打开小程序 → onShow 加载数据 → 渲染今日面板
  → 看到"🚲 锁车 ⏳ 待确认"
  → 点击卡片 → 底部弹出确认面板
  → 点"快速确认" → 写入记录 → UI 变 "🚲 锁车 ✅ 08:32"
  → 安心离开
```

### US2: 规律服药确认（P0）

```
同上流程，选择"拍照确认" → 调用相机 → 拍照 → 保存
  → UI 变 "💊 服药 ✅ 08:15 · 拍照"
```

### US3: 事后焦虑查看（P0）

```
打开小程序 → 切"历史" tab → 按日期分组查看
  → 看到"关火 ✅ 昨天 22:05" → 确认已关
```

### US4: 自定义事项管理（P1）

```
首页点"添加事项" → 输入名称 + 选图标 → 保存
  → 首页面板新增事项
```

---

## 八、实施步骤

| 步骤 | 对应规格 | 内容 | 验证 |
|------|---------|------|------|
| 1. 项目骨架 | F5 | 创建目录 + app.* + project.config.json | 开发者工具打开无报错 |
| 2. 类型 + 工具 | F2, F3, F5 | types/index.ts, utils/* | tsc --noEmit 通过 |
| 3. 首页面板 | F1 | pages/index，事项列表渲染 | 看到预设锁车/服药 |
| 4. 确认操作 | F2 | confirm-sheet 组件，按钮+拍照 | 确认后状态变 ✅，数据持久化 |
| 5. 事项管理 | F3 | 添加/编辑/删除/排序 | 新增事项出现在首页 |
| 6. 历史记录 | F4 | pages/history，按日期分组 | 记录正确归入历史 |
| 7. 每日重置 | F1, F5 | 日期检测 + 状态重置 | 改日期后打开面板重置 |

---

## 九、明确不做（对齐产品规格书第五节）

| 不做 | 原因 |
|------|------|
| 云同步/多设备 | F5 规格明确"登录后可云同步"为中期功能 |
| 登录体系 | MVP 本地优先，无需登录 |
| 第三方 UI 库 | 保持最简，MVP 不需要 |
| 跨平台框架 | Phase 1 仅微信小程序，Phase 3 才跨平台 |
| "该做了"提醒 | 产品规格书明确不做提醒功能 |
| 推送通知 | 产品规格书明确不做 |

---

## 十、风险与缓解

| 风险 | 可能性 | 影响 | 缓解 |
|------|--------|------|------|
| 照片超出 10MB 存储 | 中 | 高 | 照片存文件系统（非 localStorage），7 天自动清理 |
| 微信存储 API 兼容 | 低 | 中 | 使用稳定的 `StorageSync` API，不依赖实验性 API |
| 真机性能 | 低 | 低 | MVP 数据量小，≤10 事项 + ≤7 天照片 |

---

## 变更日志

| 日期 | 版本 | 变更 |
|------|------|------|
| 2026-05-28 | 1.0 | 初始版本，对齐产品规格书 F1-F5 |
