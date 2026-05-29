# ADR-0001: 微信小程序原生开发（不选跨平台框架）

**Date**: 2026-05-28
**Status**: accepted
**Deciders**: 项目决策

## Context

MVP 阶段产品规格明确平台为"微信小程序"（Phase 1），Phase 2 才是"原生 App"，Phase 3 才考虑"跨平台"。当前无跨平台需求。

## Decision

MVP 使用微信小程序原生开发 + TypeScript，不引入 Taro、uni-app 等跨平台框架。

## Alternatives Considered

### Alternative 1: Taro (React)
- **Pros**: React 生态、组件库丰富、可编译多端
- **Cons**: 额外编译层、学习成本、小程序 API 间接调用
- **Why not**: MVP 仅覆盖微信端，跨平台是 Phase 3 的需求，此时引入属于过度工程

### Alternative 2: uni-app (Vue)
- **Pros**: 学习成本低、插件生态丰富
- **Cons**: 运行时开销、调试困难、框架锁定
- **Why not**: 同上，MVP 阶段不需要多端发布能力

## Consequences

### Positive
- 最直接调用微信 API，无框架封装损耗
- 开发工具链简单（微信开发者工具即可）
- 无框架学习成本，TypeScript 官方支持

### Negative
- 如果 Phase 3 需要跨平台，需重构代码
- 不享受 React/Vue 生态的组件和状态管理

### Risks
- **风险**: Phase 3 跨平台改造工作量大
- **缓解**: MVP 先验证需求（7日留存 > 25%），需求成立再投入跨平台
