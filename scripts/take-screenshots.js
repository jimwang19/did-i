const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  fs.mkdirSync('docs/screenshots', { recursive: true });

  const browser = await chromium.launch();
  // 宽视口，足以完整显示 device-1
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  await page.goto('http://localhost:8099/prototype.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 辅助：截取 #device-1 元素本身（裁剪到手机框）
  const device1 = page.locator('#device-1');

  // 每次截图前先把 device-1 滚动进视口
  const scrollToDevice1 = () => page.evaluate(() => {
    document.getElementById('device-1').scrollIntoView({ behavior: 'instant', block: 'center' });
  });

  // F1 今日确认面板（默认 today tab）
  await scrollToDevice1();
  await page.waitForTimeout(400);
  await device1.screenshot({ path: 'docs/screenshots/f1-today.png' });
  console.log('✅ f1-today.png');

  // F4 历史记录（从 today 页的 tab bar 点击）
  await page.locator('#page-today [data-tab="history"]').click();
  await page.waitForTimeout(500);
  await scrollToDevice1();
  await device1.screenshot({ path: 'docs/screenshots/f4-history.png' });
  console.log('✅ f4-history.png');

  // F3 设置 & 事项管理（从 history 页的 tab bar 点击）
  await page.locator('#page-history [data-tab="settings"]').click();
  await page.waitForTimeout(500);
  await scrollToDevice1();
  await device1.screenshot({ path: 'docs/screenshots/f3-settings.png' });
  console.log('✅ f3-settings.png');

  // 回今日，截确认操作面板
  await page.locator('#page-settings [data-tab="today"]').click();
  await page.waitForTimeout(500);
  await scrollToDevice1();
  await device1.screenshot({ path: 'docs/screenshots/f2-confirm-action.png' });
  console.log('✅ f2-confirm-action.png');

  // device-2 — 事项添加/编辑 form（F3 管理事项）
  const device2 = page.locator('#device-2');
  if (await device2.count() > 0) {
    await device2.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await device2.screenshot({ path: 'docs/screenshots/f3-item-edit.png' });
    console.log('✅ f3-item-edit.png');
  }

  // device-3 — 其他页面
  const device3 = page.locator('#device-3');
  if (await device3.count() > 0) {
    await device3.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await device3.screenshot({ path: 'docs/screenshots/device3.png' });
    console.log('✅ device3.png');
  }

  // 尝试点击已确认事项触发详情面板
  await page.locator('#page-settings [data-tab="today"]').click().catch(() => {});
  await page.waitForTimeout(300);
  await scrollToDevice1();
  const confirmedItem = page.locator('#device-1 .confirm-item.confirmed').first();
  if (await confirmedItem.count() > 0) {
    await confirmedItem.click();
    await page.waitForTimeout(500);
    await scrollToDevice1();
    await device1.screenshot({ path: 'docs/screenshots/f2-detail-sheet.png' });
    console.log('✅ f2-detail-sheet.png');
  }

  await browser.close();
  console.log('ALL DONE');
})().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
