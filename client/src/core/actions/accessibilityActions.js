export const accessibilityActionTypes = {
  setMessage: "SET_ACCESSIBILITY_MESSAGE",
}

export function setAccessibilityMessage(message) {
  return {
    type: accessibilityActionTypes.setMessage,
    message,
  }
}
