const automator = require('miniprogram-automator')
const path = require('node:path')
const fs = require('node:fs/promises')
const { spawnSync } = require('node:child_process')

// 微信开发者工具 CLI 真实路径
const CLI_REAL_PATH = 'd:\\Program Files (x86)\\Tencent\\微信web开发者工具\\cli.bat'
// 项目目录
const PROJECT_PATH = path.resolve(__dirname, '..', '.claude', 'worktrees', 'feat+mvp-miniprogram')
// 自动化端口
const AUTO_PORT = 9420
// 开发者工具 HTTP 服务端口
const DEVTOOLS_PORT = 10089
const TARGET_PAGE = '/pages/index/index'
const OUTPUT_DIR = path.resolve(__dirname, '..', 'test-outputs')

/**
 * 用 CLI v2 命令开启自动化 WebSocket 端口。
 * --port 指定开发者工具 HTTP 服务端口，避免冲突。
 */
function enableAutomation() {
  const args = [
    'auto',
    '--project', PROJECT_PATH,
    '--auto-port', AUTO_PORT,
    '--port', DEVTOOLS_PORT
  ]
  console.log(`执行: "${CLI_REAL_PATH}" ${args.join(' ')}`)
  const result = spawnSync(CLI_REAL_PATH, args, {
    encoding: 'utf8',
    timeout: 20000,
  })
  return {
    success: result.status === 0,
    output: (result.stdout || '') + (result.stderr || ''),
  }
}

async function main() {
  let miniProgram
  const results = []

  try {
    await fs.mkdir(OUTPUT_DIR, { recursive: true })

    console.log('自动化服务已运行，正在连接...')

    // Step 1: connect 到 ws 端点
    console.log('正在连接开发者工具...')
    miniProgram = await automator.connect({
      wsEndpoint: `ws://127.0.0.1:${AUTO_PORT}`,
    })
    console.log('✓ 已连接')

    const page = await miniProgram.reLaunch(TARGET_PAGE)
    await page.waitFor(2000)
    console.log('✓ 已加载首页')

    // === 验证 1: 底部操作区 ===
    console.log('\n--- 验证底部操作区 ---')
    const bottomBar = await page.$('.bottom-bar')
    const selectedHint = await page.$('.selected-hint')

    if (bottomBar) {
      console.log('✓ 底部按钮栏存在')
      const buttons = await page.$$('.btn')
      console.log(`  按钮数量: ${buttons.length} (期望 2)`)
      if (buttons.length === 2) results.push({ name: '底部按钮数量', pass: true })
      else results.push({ name: '底部按钮数量', pass: false, detail: `${buttons.length} 个` })
    } else {
      console.log('✗ 底部按钮栏未找到')
      results.push({ name: '底部按钮栏', pass: false })
    }

    if (selectedHint) {
      const hintText = await selectedHint.text()
      console.log(`✓ 选择提示: "${hintText}"`)
      results.push({ name: '选择提示', pass: true })
    } else {
      console.log('✓ 选择提示未显示（未选中事项）')
      results.push({ name: '选择提示', pass: true, detail: '未选中事项' })
    }

    // === 验证 2: 卡片渲染 ===
    console.log('\n--- 验证卡片渲染 ---')
    const items = await page.$$('.confirm-item')
    console.log(`卡片数量: ${items.length}`)

    if (items.length > 0) {
      const c = items[0]
      const hasIcon = await c.$('.item-icon')
      const hasName = await c.$('.name')
      const hasBadge = await c.$('.status-badge')
      const hasBtn = await c.$('.check-btn')
      console.log(`  图标:${hasIcon?'✓':'✗'} 名称:${hasName?'✓':'✗'} 徽标:${hasBadge?'✓':'✗'} 按钮:${hasBtn?'✓':'✗'}`)
      results.push({
        name: '卡片结构', pass: !!(hasIcon && hasName && hasBadge && hasBtn),
        detail: `icon:${!!hasIcon} name:${!!hasName} badge:${!!hasBadge} btn:${!!hasBtn}`
      })
    } else {
      results.push({ name: '卡片渲染', pass: true, detail: '无事项' })
    }

    // === 验证 3: 添加事项按钮 ===
    console.log('\n--- 验证添加事项按钮 ---')
    const addBtn = await page.$('.add-item')
    if (addBtn) {
      console.log('✓ 添加事项按钮存在')
      results.push({ name: '添加事项按钮', pass: true })
    } else {
      console.log(' 未找到')
      results.push({ name: '添加事项按钮', pass: false })
    }

    // === 截图 ===
    console.log('\n--- 截图 ---')
    const imgPath = path.join(OUTPUT_DIR, 'index-page.png')
    await miniProgram.screenshot({ path: imgPath })
    console.log(`✓ 截图: ${imgPath}`)

    // === 汇总 ===
    console.log('\n========== 验证结果 ==========')
    let allOk = true
    results.forEach(r => {
      const m = r.pass ? '✓' : '✗'
      console.log(`  ${m} ${r.name}${r.detail ? ' — ' + r.detail : ''}`)
      if (!r.pass) allOk = false
    })
    console.log(allOk ? '\n全部通过！' : '\n部分未通过')

  } finally {
    if (miniProgram) {
      await miniProgram.close().catch(() => {})
      console.log('\n已断开连接')
    }
  }
}

main().catch(e => { console.error(e); process.exit(1) })
