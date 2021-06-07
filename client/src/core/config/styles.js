import get from "lodash/get"
import DeepMerge from "deepmerge"

import { createMuiTheme } from "@material-ui/core/styles"
import { themeImages } from "../../version/config/theme.config"

export const ITEMS_PER_PAGE = 10

// const defaultLightPalette = {
//   type: "light",
//   mainColor: "#0D672F",
//   dangerColor: "#da534f",
//   viewButton: "#30ad57",
//   disabledColor: "#e9e4e4",
//   borderColor: "#e5e5e5",
//   paperColor: "#fff",
//   toolbarColor: "#e5e5e5",
//   fontColor: "#000",
// }

// const defaultDarkPalette = {
//   type: "dark",
//   mainColor: "#000",
//   dangerColor: "#000",
//   viewButton: "#000",
//   disabledColor: "#e9e4e4",
//   borderColor: "#000",
//   paperColor: "#fff",
//   fontColor: "#000",
//   toolbarColor: "#fff",
//   background: {
//     default: "#fff",
//     paper: "#fff",
//   },
//   text: {
//     primary: "#000",
//     secondary: "#000",
//     disabled: "#000",
//   },
//   // background: "#fff",
//   // text: "#000",
//   // divider: "#000",
// }

/**
 * This function defined background-rule for Patient Summary panels and for table headings
 *
 * @author Bogdan Shcherban <bsc@piogroup.net>
 * @param {boolean} isContrastMode
 * @param {string}  themeColor
 * @param {string}  imageName
 * @return {string}
 */
function getBackground(isContrastMode, themeColor, imageName) {
  let result = themeColor
  return isContrastMode ? "#000" : result
}

function getCurrentPalette(target) {
//   return isContrastMode
//     ? DeepMerge(defaultDarkPalette, window.config.darkPalette)
//     : DeepMerge(defaultLightPalette, window.config.lightPalette)

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

/**
 * This function returns current theme settings
 *
 * @author Bogdan Shcherban <bsc@piogroup.net>
 */
export function getCurrentTheme(isContrastMode) {
  const backgroundImage = isContrastMode ? null : get(themeImages, "backgroundImage", null)
  const palette = getCurrentPalette(document.body)
  return createMuiTheme({
    palette: palette,
    typography: {
    //   fontFamily: '"HK Grotesk Regular", Arial, sans-serif',
    //   fontSize: 14,
        fontFamily: palette.primaryFont,
        fontSize: palette.primaryFontSize
    },
    tableHeader: {
      tableHeaderBlock: {
        background: getBackground(isContrastMode, palette.mainColor, "tableHeaderImage"),
      },
    },
    patientSummaryPanel: {
      container: {
        background: `url(${backgroundImage})`,
      },
      topBlock: {
        background: getBackground(isContrastMode, palette.mainColor, "cardBackgroundImage"),
      },
    },
    cardBackground: {
      topBlock: {
        background: getBackground(isContrastMode, palette.mainColor, "cardBackgroundImage"),
      },
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
        },
        body1: {
          fontFamily: '"HK Grotesk Regular", Arial, sans-serif',
          fontSize: 14,
        },
        body2: {
          fontFamily: '"HK Grotesk SemiBold", Arial, sans-serif',
          fontSize: 14,
        },
      },
    },
  })
}
