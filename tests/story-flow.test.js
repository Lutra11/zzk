import test from 'node:test'
import assert from 'node:assert/strict'

import { STORIES } from '../src/story-data.js'
import { createRoleProgress, chooseOption, continueAfterResult } from '../src/story-flow.js'

test('每个角色包含三组二选一情境，且每个选项都有结局', () => {
  for (const role of ['xiao', 'li']) {
    const story = STORIES[role]
    assert.equal(story.groups.length, 3)

    for (const group of story.groups) {
      assert.equal(group.options.length, 2)
      for (const option of group.options) {
        assert.ok(option.text.trim())
        assert.ok(option.result.trim())
      }
    }
  }
})

test('选择后先展示对应结局，再进入下一组选项', () => {
  const progress = createRoleProgress()
  progress.phase = 'choice'

  chooseOption(progress, 1)
  assert.equal(progress.phase, 'result')
  assert.equal(progress.optionIndex, 1)

  continueAfterResult(progress, 3)
  assert.equal(progress.phase, 'situation')
  assert.equal(progress.groupIndex, 1)
  assert.equal(progress.optionIndex, null)
})

test('完成第三组结局后进入课堂追问', () => {
  const progress = createRoleProgress()
  progress.groupIndex = 2
  progress.phase = 'result'
  progress.optionIndex = 0

  continueAfterResult(progress, 3)

  assert.equal(progress.phase, 'question')
  assert.equal(progress.groupIndex, 2)
})
