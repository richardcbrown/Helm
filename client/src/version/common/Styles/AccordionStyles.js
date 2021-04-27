import { makeStyles } from "@material-ui/core"

export const usePrimaryAccordionStyles = makeStyles((theme) => {
  return {
    mainHeader: {
      backgroundColor: theme.palette.mainColor,
      color: theme.palette.common.white,
    },
    icon: {
      color: theme.palette.common.white,
    },
    container: {
      border: `1px solid ${"#D8DDE0"}`,
      borderRadius: 0,
    },
  }
})
