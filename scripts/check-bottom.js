const automator = require('miniprogram-automator')
const path = require('path')
const fs = require('fs/promises')

async function main() {
  const miniProgram = await automator.connect({ wsEndpoint: 'ws://127.0.0.1:9420' })
  const page = await miniProgram.reLaunch('/pages/index/index')
  await page.waitFor(1000)

  const outDir = path.resolve('test-outputs')
  await fs.mkdir(outDir, { recursive: true })
  await miniProgram.screenshot({ path: path.join(outDir, 'bottom-compare.png') })

  const bottomBar = await page.$('.bottom-bar')
  const selectedHint = await page.$('.selected-hint')
  const btnPrimary = await page.$('.btn-primary')
  const btnSecondary = await page.$('.btn-secondary')

  if (bottomBar) {
    console.log('=== bottom-bar ===')
    console.log('position:', await bottomBar.style('position'))
    console.log('bottom:', await bottomBar.style('bottom'))
    console.log('padding:', await bottomBar.style('padding'))
    console.log('background:', await bottomBar.style('background-color'))
    console.log('border-top:', await bottomBar.style('border-top'))
    console.log('border-bottom:', await bottomBar.style('border-bottom'))
  }
  if (selectedHint) {
    console.log('=== selected-hint ===')
    console.log('position:', await selectedHint.style('position'))
    console.log('bottom:', await selectedHint.style('bottom'))
    console.log('padding:', await selectedHint.style('padding'))
    console.log('text:', await selectedHint.text())
  }
  if (btnPrimary) {
    console.log('=== btn-primary ===')
    console.log('padding:', await btnPrimary.style('padding'))
    console.log('font-size:', await btnPrimary.style('font-size'))
    console.log('height:', await btnPrimary.style('height'))
  }
  if (btnSecondary) {
    console.log('=== btn-secondary ===')
    console.log('padding:', await btnSecondary.style('padding'))
    console.log('font-size:', await btnSecondary.style('font-size'))
    console.log('height:', await btnSecondary.style('height'))
  }

  await miniProgram.close()
}
main().catch(e => console.error(e))
