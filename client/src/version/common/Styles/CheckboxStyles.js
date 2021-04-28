import { makeStyles } from "@material-ui/core"

export const usePrimaryCheckboxStyles = makeStyles((theme) => {
  return {
    muiCheckboxRoot: {
      color: theme.palette.mainColor,
      backgroundColor: theme.palette.common.white,
      borderColor: theme.palette.mainColor,
    },
    checkboxIcon: {
      color: theme.palette.mainColor,
      border: `2px solid ${theme.palette.mainColor}`,
      borderRadius: "2px",
      fontSize: "14px",
      margin: 3,
    },
  }
})

export const usePrimaryRadioStyles = makeStyles((theme) => {
  return {
    muiRadioRoot: {
      color: theme.palette.mainColor,

      "&.Mui-checked": {
        color: theme.palette.mainColor,
      },
    },
  }
})
