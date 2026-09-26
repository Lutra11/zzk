export function createRoleProgress() {
  return {
    groupIndex: 0,
    phase: 'situation',
    optionIndex: null,
    selections: []
  }
}

export function chooseOption(progress, optionIndex) {
  if (progress.phase !== 'choice' || ![0, 1].includes(optionIndex)) return false

  progress.optionIndex = optionIndex
  progress.selections[progress.groupIndex] = optionIndex
  progress.phase = 'result'
  return true
}

export function continueAfterResult(progress, groupCount) {
  if (progress.phase !== 'result') return false

  if (progress.groupIndex < groupCount - 1) {
    progress.groupIndex += 1
    progress.optionIndex = null
    progress.phase = 'situation'
  } else {
    progress.phase = 'question'
  }
  return true
}
