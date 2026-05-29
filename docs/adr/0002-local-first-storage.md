# ADR-0002: 本地优先存储策略（不依赖后端）

**Date**: 2026-05-28
**Status**: accepted
**Deciders**: 项目决策

## Context

产品规格书 F5 明确"本地优先，无需登录即可使用完整功能"，"照片仅存本地，不上传服务器（MVP 阶段）"。MVP 目标是验证需求是否存在，不是构建完整产品。

## Decision

MVP 所有数据存本地：文本数据用 `wx.setStorageSync`，照片用 `wx.saveFile` 文件系统。不做任何网络请求，不依赖云端服务。

## Alternatives Considered

### Alternative 1: 微信云开发 (CloudBase)
- **Pros**: 内置数据库、免服务器、支持云同步
- **Cons**: 依赖微信云服务、产生费用、增加架构复杂度
- **Why not**: MVP 不需要云同步功能，规格明确"登录后可云同步"为中期功能

### Alternative 2: 自建后端 + API
- **Pros**: 完全自主、可扩展
- **Cons**: 需要服务器、数据库、API 开发、运维成本
- **Why not**: 过度工程，MVP 只需验证需求，不需要服务端

## Consequences

### Positive
- 零服务器成本，零运维
- 用户数据隐私保护更好（照片不上传）
- 开发速度快，无后端联调
- 用户体验：即时响应，无网络延迟

### Negative
- 数据不跨设备，用户换手机丢失数据
- 无法收集使用数据（留存率、频次等验证指标需要手动统计）
- 存储受限（10MB localStorage + 10MB 文件系统）

### Risks
- **风险**: 照片超出 10MB 存储
- **缓解**: 照片存文件系统（非 localStorage），7 天自动清理
- **风险**: 无法自动收集验证指标数据
- **缓解**: MVP 阶段内嵌反馈问卷手动收集 NPS
