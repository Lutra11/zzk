export function createRoleProgress() {
  return {
    groupIndex: 0,
    phase: 'situation',       // situation -> choice -> subchoice -> result -> question -> reveal
    optionIndex: null,         // 第一级选择 (0,1,2)
    subOptionIndex: null,      // 第二级选择 (0,1)
    selections: []
  }
}

export function chooseOption(progress, optionIndex) {
  if (progress.phase !== 'choice') return false
  progress.optionIndex = optionIndex
  progress.subOptionIndex = null
  progress.phase = 'subchoice'
  return true
}

export function chooseSubOption(progress, subIndex) {
  if (progress.phase !== 'subchoice' || progress.optionIndex === null) return false
  progress.subOptionIndex = subIndex
  progress.selections[progress.groupIndex] = { option: progress.optionIndex, sub: subIndex }
  progress.phase = 'result'
  return true
}

export function continueAfterResult(progress, groupCount) {
  if (progress.phase !== 'result') return false

  if (progress.groupIndex < groupCount - 1) {
    progress.groupIndex += 1
    progress.optionIndex = null
    progress.subOptionIndex = null
    progress.phase = 'situation'
  } else {
    progress.phase = 'question'
  }
  return true
}
