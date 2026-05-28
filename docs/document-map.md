# 文档关系图

> 项目文档的依赖、引用和产出关系。维护时同步更新本文档。

## 流程总览

```
市场调研          产品定义             设计              开发规划           原型开发
(Stage 1)        (Stage 2)          (Stage 3)         (Stage 4)         (Stage 5)
    │                │                  │                  │                  │
    ▼                ▼                  ▼                  ▼                  ▼
 竞品分析 ──→ 产品PRD ──→ 交互设计 ──→ Blueprint ──→ MVP原型
              │    │         │                              │
              │    └──→ 产品规格书 ──→ UI规格              │
              │         │         └──→ 视觉风格指南 ───────┘
              │         │
              │    反方论证(归档)
              │
              └──→ 开发流程技能映射
```

## 文档清单与关系

| 文档 | 输入（依赖） | 输出（被谁引用） | 状态 |
|------|-------------|-----------------|------|
| **竞品分析报告** `01-research/market-competitive-analysis.md` | 外部数据源 | → PRD、UI规格 | ✅ 已完成 |
| **产品定位PRD** `.claude/prds/memo-tool.prd.md` | ← 竞品分析 | → 产品规格书、Blueprint | ✅ 已完成 |
| **产品规格书** `02-product/product-spec.md` | ← PRD、竞品分析 | → 交互设计、UI规格、原型 | ✅ 已完成 |
| **反方论证分析** `01-research/devil-advocate-analysis.md` | ← 产品规格书 | → Issue跟踪 | ✅ 已完成 |
| **交互设计** `03-design/interaction-design.md` | ← 产品规格书 | → Blueprint、UI规格 | ✅ 已完成 |
| **UI规格** `03-design/ui-spec.md` | ← 交互设计、视觉风格 | → Blueprint、原型 | ✅ 已完成 |
| **视觉风格指南** `03-design/visual-style-guide.md` | ← 交互设计、UI规格 | → 原型 | ✅ 已完成 |
| **高保真原型** `prototype.html` | ← 全部设计文档 | → 用户验证 | 🔄 迭代中 |
| **MVP 架构方案** `04-plan/mvp-architecture-plan.md` | ← 全部设计文档 | → 原型实现 | 🔄 迭代中 |
| **MVP Blueprint** `04-plan/mvp-features-blueprint.md` | ← PRD、产品规格书 | → 原型（逐步实现） | 待创建 |
| **开发流程技能映射** `04-plan/dev-workflow-skills.md` | ← 全部文档 | → 开发流程参考 | 待创建 |

## 引用规则

1. **上游变更必须通知下游**：修改PRD时，检查规格书和Blueprint是否需要同步
2. **规格书是功能唯一来源**：CLAUDE.md 规定"修改前先看规格书"
3. **归档文档不再维护**：反方论证的结论已转化，文档仅供回溯
4. **路径约定**：文档间引用使用相对路径
