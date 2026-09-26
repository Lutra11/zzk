import test from 'node:test'
import assert from 'node:assert/strict'

import { resolvePublicAsset } from '../src/public-asset.js'

test('公共资源路径会保留 Vite 的部署基础路径', () => {
  assert.equal(resolvePublicAsset('/zzk/', 'xiao-wang.png'), '/zzk/xiao-wang.png')
  assert.equal(resolvePublicAsset('/', 'li-yong.png'), '/li-yong.png')
})
