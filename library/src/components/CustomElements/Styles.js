import { createMuiTheme } from "@material-ui/core/styles"

function getCurrentPalette(target) {
        return {
            mainColor: getComputedStyle(target).getPropertyValue("--main-color").trim(),
            dangerColor: getComputedStyle(target).getPropertyValue("--danger-color").trim(),
            viewButton: getComputedStyle(target).getPropertyValue("--view-button").trim(),
            disabledColor: getComputedStyle(target).getPropertyValue("--disabled-color").trim(),
            borderColor: getComputedStyle(target).getPropertyValue("--border-color").trim(),
            paperColor: getComputedStyle(target).getPropertyValue("--paper-color").trim(),
            toolbarColor: getComputedStyle(target).getPropertyValue("--toolbar-color").trim(),
            fontColor: getComputedStyle(target).getPropertyValue("--font-color").trim(),
            primaryFont: getComputedStyle(target).getPropertyValue("--primary-font").trim(),
            primaryFontSize: getComputedStyle(target).getPropertyValue("--primary-font-size").trim()
        }
    }

export function getCurrentTheme(target) {
    const palette = getCurrentPalette(target)

    return createMuiTheme({
        palette: palette,
        typography: {
        //   fontFamily: '"HK Grotesk Regular", Arial, sans-serif',
        //   fontSize: 14,
            fontFamily: palette.primaryFont,
            fontSize: Number(palette.primaryFontSize),
        },
        overrides: {
          MuiInput: {
            root: {
              //border: `2px solid ${palette.inputBorderColor}`,
              border: "var(--input-border)",
              paddingLeft: "5px",
              paddingRight: "5px",
              "&.Mui-focused": {
                boxShadow: `0px 0px 0px 4px ${palette.highlightColor}`,
              },
              "&.Mui-disabled": {
                border: `2px solid ${palette.disabledFontColor}`,
              },
            },
            input: {
              "&:focus": {
                backgroundColor: "inherit !important",
              },
            },
            underline: {
              "&:before": {
                display: "none",
              },
              "&:after": {
                display: "none",
              },
            },
          },
          MuiFormLabel: {
            root: {
              lineHeight: 1.5,
              "&.Mui-focused": {
                color: palette.fontColor,
              },
            },
          },
          MuiInputLabel: {
            animated: {
              marginLeft: 5,
            },
            shrink: {
              "&.Mui-focused": {
                transform: "translate(0, -4px) scale(0.75)",
              },
            },
          },
          MuiList: {
            root: {
              backgroundColor: palette.paperColor,
            },
          },
          MuiPaper: {
            elevation1: {
              boxShadow: "none",
              backgroundColor: palette.paperColor,
            },
          },
          MuiTable: {
            root: {
              backgroundColor: palette.paperColor,
              border: `var(--table-border)`,
            },
          },
          MuiTableHead: {
            root: {
                backgroundColor: "var(--table-background-color)", 
              //backgroundColor: isContrastMode ? palette.paperColor : palette.borderColor,
              color: "var(--table-head-color)",
            },
          },
          MuiTableRow: {
            head: {
              height: 48,
            },
          },
          MuiTableCell: {
            head: {
              color: palette.fontColor,
              fontSize: 16,
              fontWeight: 800,
            },
            paddingNone: {
              paddingLeft: 10,
            },
          },
          MuiTypography: {
            root: {
              fontFamily: '"HK Grotesk SemiBold", Arial, sans-serif',
              fontSize: 17,
              color: palette.fontColor,
            },
            body1: {
              fontFamily: '"HK Grotesk Regular", Arial, sans-serif',
              fontSize: 14,
              color: palette.fontColor,
            },
            body2: {
              fontFamily: '"HK Grotesk SemiBold", Arial, sans-serif',
              fontSize: 14,
              color: palette.fontColor,
            },
          },
        },
      })
}
