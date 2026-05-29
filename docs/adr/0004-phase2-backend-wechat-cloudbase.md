# ADR-0004: Phase 2 后端服务选型 — 微信云开发 (CloudBase)

**Date**: 2026-05-29
**Status**: accepted
**Deciders**: 项目决策

## Context

MVP（Phase 1）采用纯本地存储验证需求（见 ADR-0002）。当 7 日留存率 > 30% 且收到用户换机丢数据的反馈时，需要引入后端服务支持云同步和多设备能力。

Phase 2 核心新增功能：
- 微信登录（openId 绑定）
- 确认记录云同步
- 多设备查看历史

## Decision

Phase 2 后端选用**微信云开发 (CloudBase)**，不自建服务端。

## Rationale

| 维度 | 微信云开发 | 自建后端 |
|------|-----------|---------|
| 与小程序集成 | 原生，openId 直通，无需手动对接微信登录 | 需单独实现微信登录流程 |
| 冷启动成本 | 无服务器运维，控制台直接操作 | 需要 server + DB + API + 运维 |
| 费用 | 免费额度覆盖早期量级 | 固定服务器费用 |
| 数据模型兼容 | 本地 JSON 直接写入云数据库 | 需设计 REST API |
| MVP 迁移成本 | `storage.ts` 增加云端写入逻辑，数据模型已预留 `syncId` | 需要重写存储层 |

## Implementation Plan

1. `storage.ts` 改造为**双写模式**：本地优先写，后台异步同步云端
2. 登录：`wx.login` → 获取 openId → 关联本地数据
3. 云数据库集合：`items`、`confirmations`（结构与本地 JSON 一致）
4. 照片：继续本地存储，不上传云端（隐私保护，Phase 3 再评估）

## Trigger Condition

满足以下任一条件时启动 Phase 2 开发：
- 7 日留存率持续 > 30%（连续两周）
- 收到 ≥ 3 条「换机/清缓存丢数据」的用户反馈

## Alternatives Considered

### Alternative 1: 自建后端 (Node.js + 云服务器)
- **Why not**: 运维成本高，早期用户量不值得投入，Phase 3 商业化时再评估

### Alternative 2: Supabase / Firebase
- **Why not**: 非微信生态，微信登录对接需额外工作，国内访问稳定性存疑

## Consequences

### Positive
- openId 登录零成本，用户无感知
- 本地数据模型与云端结构对齐，迁移改动最小
- `syncId` 字段已在 MVP 数据模型中预留，无需 schema 变更

### Negative
- 数据锁定在微信生态，未来跨平台（Phase 3）需迁移
- 云开发免费额度有上限，用户增长后需付费

### Risks
- **风险**: Phase 3 原生 App 无法使用微信云开发
- **缓解**: Phase 3 时评估自建后端，Phase 2 数据可导出迁移
