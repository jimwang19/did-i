# ADR-0003: 暗色主题直接复刻原型设计

**Date**: 2026-05-28
**Status**: accepted
**Deciders**: 项目决策

## Context

产品原型 `prototype.html` 已完成多轮交互迭代，暗色主题（背景 `#0c0f14`、强调色 `#4ecdc4`、确认色 `#81c784`）经过视觉评审确认。UI 规格书（`ui-spec.md`）和视觉风格指南（`visual-style-guide.md`）已定稿。

## Decision

MVP 小程序的视觉风格直接复刻原型的暗色主题，不从零设计。CSS 设计令牌通过 `app.wxss` 的 Page 级 CSS 变量映射。

## Alternatives Considered

### Alternative 1: 从零设计浅色主题
- **Pros**: 更传统、更广谱用户友好
- **Cons**: 需要重新做视觉设计、延长开发周期
- **Why not**: 暗色主题已通过原型验证，浅色主题无产品规格支撑

### Alternative 2: 支持明暗切换
- **Pros**: 用户可自选偏好
- **Cons**: 增加 UI 复杂度、需要维护两套设计令牌
- **Why not**: MVP 最简原则，暗色主题足够日常使用，明暗切换为后期增强

## Consequences

### Positive
- 零额外设计成本，原型到代码直接映射
- 保持体验一致性，用户从原型到 MVP 视觉感受相同
- 设计令牌系统清晰，后续换主题只需改变量值

### Negative
- 暗色主题可能不适合所有用户（如户外强光环境）
- 部分用户偏好系统主题跟随

### Risks
- **风险**: 暗色主题在某些场景可读性差
- **缓解**: 确保文字对比度符合 WCAG 标准，必要时微调
