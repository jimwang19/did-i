const automator = require('miniprogram-automator')
const path = require('node:path')
const fs = require('node:fs/promises')
const { spawnSync } = require('node:child_process')

// 配置
const CLI_PATH = 'd:\\Program Files (x86)\\Tencent\\微信web开发者工具\\cli.bat'
const PROJECT_PATH = path.resolve(__dirname, '..', '.claude', 'worktrees', 'feat+mvp-miniprogram')
const AUTO_PORT = 9420
const DEVTOOLS_PORT = 10089
const TARGET_PAGE = '/pages/index/index'
const OUTPUT_DIR = path.resolve(__dirname, '..', 'test-outputs')

// 设计令牌对比
const DESIGN_TOKENS = {
  colors: {
    bg: '#0c0f14',
    surface: '#161b22',
    accent: '#4ecdc4',
    accentSoft: 'rgba(78,205,196,.15)',
    success: '#81c784',
    successSoft: 'rgba(129,199,132,.12)',
    pending: '#546e7a',
    pendingSoft: 'rgba(84,110,122,.12)',
    text: '#e6edf3',
    textMid: '#8b949e',
    textSoft: '#546e7a',
    border: 'rgba(255,255,255,.08)'
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px'
  },
  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    full: '999px'
  }
}

// 原型功能对比清单
const PROTOTYPE_FEATURES = [
  { name: '页面标题', selector: '.header-title', expected: '今日', type: 'text' },
  { name: '日期副标题', selector: '.date-sub', type: 'text' },
  { name: '筛选按钮', selector: '.filter-chip', type: 'exists' },
  { name: '筛选按钮文字', selector: '.filter-chip', expected: '隐藏已确认', type: 'text' },
  { name: '待确认数量', selector: '.filter-count', type: 'text' },
  { name: '事项列表', selector: '.confirm-item', type: 'exists' },
  { name: '事项数量', selector: '.confirm-item', type: 'count', expectedMin: 1 },
  { name: '状态标签', selector: '.status-badge', type: 'exists' },
  { name: '添加事项按钮', selector: '.add-item', expected: '添加新事项', type: 'text' },
  { name: '底部操作栏', selector: '.bottom-bar', type: 'exists' },
  { name: '拍照确认按钮', selector: '.btn-primary', expected: '📷 拍照确认', type: 'text' },
  { name: '快速确认按钮', selector: '.btn-secondary', expected: '✓ 快速确认', type: 'text' },
  { name: '选择提示', selector: '.selected-hint', expected: '点选任意事项，底部按钮确认该项', type: 'text' }
]

async function main() {
  let miniProgram
  const results = []

  try {
    await fs.mkdir(OUTPUT_DIR, { recursive: true })

    console.log('正在连接开发者工具...')
    miniProgram = await automator.connect({
      wsEndpoint: `ws://127.0.0.1:${AUTO_PORT}`,
    })
    console.log('✓ 已连接')

    const page = await miniProgram.reLaunch(TARGET_PAGE)
    await page.waitFor(1000)
    console.log('✓ 页面已加载')

    // 截图对比
    const screenshotPath = path.join(OUTPUT_DIR, 'compare-page.png')
    await miniProgram.screenshot({ path: screenshotPath })
    console.log(`✓ 截图保存: ${screenshotPath}`)

    // 验证原型功能
    console.log('\n--- 原型功能对比验证 ---')
    for (const feature of PROTOTYPE_FEATURES) {
      try {
        let pass = false
        let detail = ''

        if (feature.type === 'exists') {
          const element = await page.$(feature.selector).catch(() => null)
          pass = !!element
          detail = element ? '存在' : '未找到'
        } else if (feature.type === 'count') {
          const elements = await page.$$(feature.selector).catch(() => [])
          pass = elements.length >= (feature.expectedMin || 1)
          detail = `找到 ${elements.length} 个，期望 >= ${feature.expectedMin || 1}`
        } else if (feature.type === 'text') {
          const element = await page.$(feature.selector).catch(() => null)
          if (element) {
            const text = await element.text()
            if (feature.expected) {
              pass = text.includes(feature.expected)
              detail = `实际: "${text}", 期望包含: "${feature.expected}"`
            } else {
              pass = !!text.trim()
              detail = text.trim()
            }
          } else {
            pass = false
            detail = '未找到元素'
          }
        }

        results.push({
          name: feature.name,
          pass,
          detail
        })
      } catch (error) {
        results.push({
          name: feature.name,
          pass: false,
          detail: `错误: ${error.message}`
        })
      }
    }

    // 验证颜色样式
    console.log('\n--- 颜色样式对比 ---')
    const colorChecks = [
      { selector: '.page', style: 'background-color', expected: DESIGN_TOKENS.colors.bg, name: '页面背景' },
      { selector: '.page-header', style: 'background-color', expected: DESIGN_TOKENS.colors.surface, name: '页面标题背景' },
      { selector: '.confirm-item.confirmed', style: 'background-color', expected: DESIGN_TOKENS.colors.successSoft, name: '已确认事项背景', optional: true },
      { selector: '.confirm-item.pending', style: 'background-color', expected: DESIGN_TOKENS.colors.pendingSoft, name: '待确认事项背景' },
      { selector: '.btn-primary', style: 'background-color', expected: DESIGN_TOKENS.colors.accent, name: '主按钮背景' },
      { selector: '.btn-secondary', style: 'background-color', expected: DESIGN_TOKENS.colors.accentSoft, name: '次按钮背景' },
      { selector: '.btn-primary', style: 'color', expected: DESIGN_TOKENS.colors.bg, name: '主按钮文字' },
      { selector: '.btn-secondary', style: 'color', expected: DESIGN_TOKENS.colors.accent, name: '次按钮文字' }
    ]

    for (const check of colorChecks) {
      try {
        const element = await page.$(check.selector).catch(() => null)
        if (!element && check.optional) {
          results.push({ name: check.name, pass: true, detail: '⏭ 跳过（无匹配元素）' })
          continue
        }
        if (element) {
          const actualStyle = await element.style(check.style).catch(() => null)
          if (actualStyle) {
            // 简单的颜色匹配（去除可能的 rgba 差异）
            const normalizedActual = actualStyle.trim().replace(/\s/g, '').toLowerCase()
            const normalizedExpected = check.expected.toLowerCase()

            const toRgba = (color) => {
              // hex to rgb
              const hex = color.match(/^#([0-9a-f]{6})$/i)
              if (hex) {
                const v = parseInt(hex[1], 16)
                return `rgb(${(v>>16)&255},${(v>>8)&255},${v&255})`
              }
              return color.replace(/\s/g, '').replace(/rgba?\(([^)]+)\)/, (_, p) => {
                const parts = p.split(',')
                return parts.length === 4
                  ? `rgba(${parts.join(',')})`
                  : `rgb(${parts.join(',')})`
              })
            }
            const normA = toRgba(normalizedActual)
            const normE = toRgba(normalizedExpected)
            let pass = normA === normE
            if (!pass) {
              // 数值容差比对（允许 ±2 的浮点误差）
              const rgbA = normA.match(/rgba?\((\d+),(\d+),(\d+)(?:,([\d.]+))?\)/)
              const rgbE = normE.match(/rgba?\((\d+),(\d+),(\d+)(?:,([\d.]+))?\)/)
              if (rgbA && rgbE) {
                const channels = [0, 1, 2]
                pass = channels.every(i => Math.abs(parseInt(rgbA[i+1]) - parseInt(rgbE[i+1])) <= 2)
                if (pass && (rgbA[4] !== undefined || rgbE[4] !== undefined)) {
                  const aA = parseFloat(rgbA[4] ?? 1)
                  const aE = parseFloat(rgbE[4] ?? 1)
                  pass = Math.abs(aA - aE) <= 0.02
                }
              }
            }

            results.push({
              name: check.name,
              pass,
              detail: `实际: "${actualStyle}", 期望: "${check.expected}"`
            })
          } else {
            results.push({
              name: check.name,
              pass: false,
              detail: '无法获取样式'
            })
          }
        } else {
          results.push({
            name: check.name,
            pass: false,
            detail: '未找到元素'
          })
        }
      } catch (error) {
        results.push({
          name: check.name,
          pass: false,
          detail: `错误: ${error.message}`
        })
      }
    }

    // 输出结果
    console.log('\n========== 对比结果 ==========')
    let allPass = true
    results.forEach(result => {
      const status = result.pass ? '✅' : '❌'
      const detail = result.detail ? ` - ${result.detail}` : ''
      console.log(`${status} ${result.name}${detail}`)
      if (!result.pass) allPass = false
    })

    // 统计结果
    const passedCount = results.filter(r => r.pass).length
    const totalCount = results.length
    console.log(`\n📊 结果统计: ${passedCount}/${totalCount} 项通过`)

    if (!allPass) {
      console.log('\n🔍 主要差异:')
      results.filter(r => !r.pass).forEach(result => {
        console.log(`   - ${result.name}: ${result.detail}`)
      })
    }

    // 保存详细报告
    const reportPath = path.join(OUTPUT_DIR, 'prototype-comparison-report.md')
    const report = generateReport(results, DESIGN_TOKENS)
    await fs.writeFile(reportPath, report)
    console.log(`\n📄 报告已保存: ${reportPath}`)

  } catch (error) {
    console.error('❌ 测试过程中出错:', error)
  } finally {
    if (miniProgram) {
      await miniProgram.close().catch(() => {})
    }
  }
}

function generateReport(results, designTokens) {
  let report = `# 小程序 vs 原型设计对比报告\n\n`
  report += `**日期**: ${new Date().toLocaleString('zh-CN')}\n`
  report += `**测试页面**: ${TARGET_PAGE}\n`
  report += `**通过项**: ${results.filter(r => r.pass).length}/${results.length}\n\n`

  report += `## 设计令牌对比\n\n`
  report += `### 颜色\n`
  report += `| 名称 | 原型值 | 小程序实现 |\n`
  report += `|------|--------|------------|\n`
  Object.entries(designTokens.colors).forEach(([key, value]) => {
    report += `| ${key} | ${value} | ❓ 待验证 |\n`
  })

  report += `\n### 间距\n`
  report += `| 名称 | 原型值 | 小程序实现 |\n`
  report += `|------|--------|------------|\n`
  Object.entries(designTokens.spacing).forEach(([key, value]) => {
    report += `| ${key} | ${value} | ❓ 待验证 |\n`
  })

  report += `\n### 圆角\n`
  report += `| 名称 | 原型值 | 小程序实现 |\n`
  report += `|------|--------|------------|\n`
  Object.entries(designTokens.radius).forEach(([key, value]) => {
    report += `| ${key} | ${value} | ❓ 待验证 |\n`
  })

  report += `\n## 功能对比详细结果\n\n`
  report += `| 功能项 | 状态 | 详情 |\n`
  report += `|--------|------|------|\n`

  results.forEach(result => {
    const status = result.pass ? '✅ 通过' : '❌ 未通过'
    report += `| ${result.name} | ${status} | ${result.detail} |\n`
  })

  report += `\n## 截图对比\n\n`
  report += `- 小程序截图: [compare-page.png](compare-page.png)\n`

  return report
}

main().catch(error => {
  console.error('❌ 程序执行错误:', error)
  process.exit(1)
})
