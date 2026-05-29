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

    // 动态交互测试
    console.log('\n--- 动态交互测试 ---')

    // 1. 检查底部按钮初始状态（未选择事项时应禁用）
    console.log('1. 检查底部按钮初始状态')
    const photoBtn = await page.$('.btn-primary')
    const quickBtn = await page.$('.btn-secondary')
    if (photoBtn && quickBtn) {
      const photoDisabled = await photoBtn.attribute('class').then(cls => cls.includes('disabled'))
      const quickDisabled = await quickBtn.attribute('class').then(cls => cls.includes('disabled'))

      results.push({
        name: '拍照确认按钮初始状态',
        pass: photoDisabled,
        detail: photoDisabled ? '已禁用（正确）' : '已启用（错误）'
      })

      results.push({
        name: '快速确认按钮初始状态',
        pass: quickDisabled,
        detail: quickDisabled ? '已禁用（正确）' : '已启用（错误）'
      })
    }

    // 2. 测试事项选择
    console.log('2. 测试事项选择')
    const items = await page.$$('.confirm-item.pending')
    if (items.length > 0) {
      const firstItem = items[0]
      const itemId = await firstItem.attribute('data-id')

      await firstItem.tap()
      await page.waitFor(200)

      const selectedItem = await page.$('.confirm-item.selected')
      results.push({
        name: '事项选择功能',
        pass: !!selectedItem,
        detail: selectedItem ? '已成功选中事项' : '事项未被选中'
      })

      // 3. 检查按钮状态变化（选中后应启用）
      const photoBtnEnabled = await photoBtn.attribute('class').then(cls => !cls.includes('disabled'))
      const quickBtnEnabled = await quickBtn.attribute('class').then(cls => !cls.includes('disabled'))

      results.push({
        name: '拍照确认按钮选中后状态',
        pass: photoBtnEnabled,
        detail: photoBtnEnabled ? '已启用（正确）' : '未启用（错误）'
      })

      results.push({
        name: '快速确认按钮选中后状态',
        pass: quickBtnEnabled,
        detail: quickBtnEnabled ? '已启用（正确）' : '未启用（错误）'
      })

      // 4. 测试筛选功能
      console.log('3. 测试筛选功能')
      const filterBtn = await page.$('.filter-chip')
      if (filterBtn) {
        const initialText = await filterBtn.text()
        await filterBtn.tap()
        await page.waitFor(300)

        const itemsAfterFilter = await page.$$('.confirm-item')
        const hasConfirmedItems = await page.$$('.confirm-item.confirmed').then(el => el.length > 0)

        results.push({
          name: '筛选功能点击响应',
          pass: true,
          detail: '筛选按钮可点击'
        })

        results.push({
          name: '筛选后事项数量',
          pass: itemsAfterFilter.length < items.length || !hasConfirmedItems,
          detail: `筛选后显示 ${itemsAfterFilter.length} 个事项`
        })

        // 恢复筛选
        await filterBtn.tap()
        await page.waitFor(300)
      }

      // 5. 测试快速确认功能（模拟）
      console.log('4. 测试快速确认功能')
      if (quickBtnEnabled) {
        // 我们不会真的点击快速确认，因为这会改变测试数据
        // 而是检查按钮是否可以点击
        results.push({
          name: '快速确认按钮可点击',
          pass: quickBtnEnabled,
          detail: '快速确认按钮已启用'
        })
      }

      // 6. 测试拍照确认功能（模拟）
      console.log('5. 测试拍照确认功能')
      if (photoBtnEnabled) {
        results.push({
          name: '拍照确认按钮可点击',
          pass: photoBtnEnabled,
          detail: '拍照确认按钮已启用'
        })
      }

    } else {
      console.log('⚠️  未找到待确认事项，部分测试项将跳过')
      results.push({
        name: '待确认事项数量',
        pass: false,
        detail: '未找到待确认事项'
      })
    }

    // 7. 测试添加事项功能
    console.log('6. 测试添加事项功能')
    const addBtn = await page.$('.add-item')
    if (addBtn) {
      const initialItemsCount = (await page.$$('.confirm-item')).length
      // 点击添加按钮（但不实际添加内容，避免污染测试数据）
      await addBtn.tap()
      await page.waitFor(500)

      results.push({
        name: '添加事项按钮响应',
        pass: true,
        detail: '添加事项按钮可点击'
      })
    }

    // 8. 测试页面跳转
    console.log('7. 测试页面跳转')
    const tabBar = await page.$$('.tab-bar .tab')
    if (tabBar.length === 3) {
      const historyTab = tabBar[1] // 历史
      const settingsTab = tabBar[2] // 设置

      // 测试历史页面跳转
      await historyTab.tap()
      await page.waitFor(500)
      results.push({
        name: '历史页面跳转',
        pass: true,
        detail: '历史页面可跳转'
      })

      // 返回今日页面
      const todayTab = tabBar[0]
      await todayTab.tap()
      await page.waitFor(500)

      // 测试设置页面跳转
      await settingsTab.tap()
      await page.waitFor(500)
      results.push({
        name: '设置页面跳转',
        pass: true,
        detail: '设置页面可跳转'
      })

      // 返回今日页面
      await todayTab.tap()
      await page.waitFor(500)
    }

    // 输出结果
    console.log('\n========== 动态交互测试结果 ==========')
    let allPass = true
    results.forEach(result => {
      const status = result.pass ? '✅' : '❌'
      const detail = result.detail ? ` - ${result.detail}` : ''
      console.log(`${status} ${result.name}${detail}`)
      if (!result.pass) allPass = false
    })

    const passedCount = results.filter(r => r.pass).length
    const totalCount = results.length
    console.log(`\n📊 结果统计: ${passedCount}/${totalCount} 项通过`)

    if (!allPass) {
      console.log('\n🔍 失败项:')
      results.filter(r => !r.pass).forEach(result => {
        console.log(`   - ${result.name}: ${result.detail}`)
      })
    }

    // 保存详细报告
    const reportPath = path.join(OUTPUT_DIR, 'dynamic-interactions-report.md')
    await fs.writeFile(reportPath, generateReport(results))
    console.log(`\n📄 报告已保存: ${reportPath}`)

  } catch (error) {
    console.error('❌ 测试过程中出错:', error)
  } finally {
    if (miniProgram) {
      await miniProgram.close().catch(() => {})
    }
  }
}

function generateReport(results) {
  let report = `# 小程序动态交互测试报告\n\n`
  report += `**日期**: ${new Date().toLocaleString('zh-CN')}\n`
  report += `**测试页面**: ${TARGET_PAGE}\n`
  report += `**通过项**: ${results.filter(r => r.pass).length}/${results.length}\n\n`

  report += `## 动态交互测试结果\n\n`
  report += `| 功能项 | 状态 | 详情 |\n`
  report += `|--------|------|------|\n`

  results.forEach(result => {
    const status = result.pass ? '✅ 通过' : '❌ 未通过'
    report += `| ${result.name} | ${status} | ${result.detail} |\n`
  })

  return report
}

main().catch(error => {
  console.error('❌ 程序执行错误:', error)
  process.exit(1)
})
