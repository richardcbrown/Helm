export default (state = {}, action) => {
  switch (action.type) {
    case "SET_ACCESSIBILITY_MESSAGE": {
      const { message } = action

      return {
        ...state,
        message,
      }
    }
    default: {
      return state
    }
  }
}
