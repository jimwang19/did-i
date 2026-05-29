const automator = require('miniprogram-automator')
const path = require('node:path')
const fs = require('node:fs/promises')
const { spawnSync } = require('node:child_process')

// 微信开发者工具 CLI 真实路径
const CLI_PATH = 'd:\\Program Files (x86)\\Tencent\\微信web开发者工具\\cli.bat'
// 项目目录
const PROJECT_PATH = path.resolve(__dirname, '..', '.claude', 'worktrees', 'feat+mvp-miniprogram')
// 自动化端口
const AUTO_PORT = 9420
// 开发者工具 HTTP 服务端口
const DEVTOOLS_PORT = 10089
const TARGET_PAGE = '/pages/index/index'
const OUTPUT_DIR = path.resolve(__dirname, '..', 'test-outputs')

/**
 * 探测开发者工具当前 HTTP 服务端口
 */
function detectHttpPort() {
  if (process.env.WECHAT_DEVTOOLS_PORT) {
    return Number(process.env.WECHAT_DEVTOOLS_PORT)
  }
  try {
    const result = spawnSync(
      CLI_PATH,
      ['auto', '--project', PROJECT_PATH, '--port', '9999'],
      { encoding: 'utf8', timeout: 8000 },
    )
    const output = (result.stdout || '') + (result.stderr || '')
    const match = output.match(/started on http:\/\/127\.0\.0\.1:(\d+)/)
    if (match) return Number(match[1])
  } catch (_) {}
  return null
}

/**
 * 用 CLI v2 命令开启自动化 WebSocket 端口
 */
function enableAutomation(httpPort) {
  const args = ['auto', '--project', PROJECT_PATH, '--auto-port', String(AUTO_PORT)]
  if (httpPort) args.push('--port', String(httpPort))
  const result = spawnSync(CLI_PATH, args, { encoding: 'utf8', timeout: 20000 })
  return {
    success: result.status === 0,
    output: (result.stdout || '') + (result.stderr || ''),
  }
}

async function main() {
  let miniProgram
  const results = []
  const consoleEvents = []
  const exceptionEvents = []

  try {
    await fs.mkdir(OUTPUT_DIR, { recursive: true })

    // Step 1: 直接连接到已运行的自动化服务
    console.log('正在连接开发者工具...')
    miniProgram = await automator.connect({
      wsEndpoint: `ws://127.0.0.1:${AUTO_PORT}`,
    })
    console.log('✓ 已连接')

    // 监听控制台输出和异常
    miniProgram.on('console', (payload) => {
      consoleEvents.push(payload)
    })

    miniProgram.on('exception', (payload) => {
      exceptionEvents.push(payload)
    })

    // Step 3: 跳转首页
    console.log('正在加载首页...')
    const page = await miniProgram.reLaunch(TARGET_PAGE)
    await page.waitFor(1000)
    console.log('✓ 首页已加载')

    // === 验证 1: 页面标题 ===
    console.log('\n--- 验证页面标题 ---')
    const title = await page.$('.header-title')
    if (title) {
      const text = await title.text()
      console.log(`✓ 页面标题: "${text}"`)
      results.push({ name: '页面标题', pass: text.includes('今日') })
    } else {
      console.log('✗ 页面标题未找到')
      results.push({ name: '页面标题', pass: false })
    }

    // === 验证 2: 底部操作区 ===
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

    // === 验证 3: 卡片渲染 ===
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

    // === 验证 4: 添加事项按钮 ===
    console.log('\n--- 验证添加事项按钮 ---')
    const addBtn = await page.$('.add-item')
    if (addBtn) {
      console.log('✓ 添加事项按钮存在')
      results.push({ name: '添加事项按钮', pass: true })
    } else {
      console.log('✗ 未找到添加事项按钮')
      results.push({ name: '添加事项按钮', pass: false })
    }

    // === 验证 5: 筛选按钮 ===
    console.log('\n--- 验证筛选按钮 ---')
    const filterBtn = await page.$('.filter-chip')
    if (filterBtn) {
      console.log('✓ 筛选按钮存在')
      results.push({ name: '筛选按钮', pass: true })
    } else {
      console.log('✗ 未找到筛选按钮')
      results.push({ name: '筛选按钮', pass: false })
    }

    // === 截图 ===
    console.log('\n--- 截图 ---')
    const imgPath = path.join(OUTPUT_DIR, 'index-page.png')
    await miniProgram.screenshot({ path: imgPath })
    console.log(`✓ 截图: ${imgPath}`)

    // === 验证 6: 控制台输出 ===
    console.log('\n--- 验证控制台输出 ---')
    const consoleErrors = consoleEvents.filter(event => event && event.type === 'error')
    if (consoleErrors.length) {
      console.log(`✗ 存在 console.error: ${consoleErrors.length} 个`)
      results.push({ name: '控制台错误', pass: false, detail: `${consoleErrors.length} 个错误` })
    } else {
      console.log('✓ 无控制台错误')
      results.push({ name: '控制台错误', pass: true })
    }

    if (exceptionEvents.length) {
      console.log(`✗ 存在异常: ${exceptionEvents.length} 个`)
      results.push({ name: '页面异常', pass: false, detail: `${exceptionEvents.length} 个异常` })
    } else {
      console.log('✓ 无页面异常')
      results.push({ name: '页面异常', pass: true })
    }

    // === 汇总 ===
    console.log('\n========== 验证结果 ==========')
    let allOk = true
    results.forEach(r => {
      const m = r.pass ? '✓' : '✗'
      console.log(`  ${m} ${r.name}${r.detail ? ' — ' + r.detail : ''}`)
      if (!r.pass) allOk = false
    })
    console.log(allOk ? '\n✅ 全部通过！' : '\n❌ 部分未通过')

  } finally {
    if (miniProgram) {
      await miniProgram.close().catch(() => {})
      console.log('\n已断开连接')
    }
  }
}

main().catch(e => {
  console.error('测试过程中出错:', e)
  process.exit(1)
})
