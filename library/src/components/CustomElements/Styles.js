import { createMuiTheme } from "@material-ui/core/styles"


const defaultLightPalette = {
    type: "light",
    mainColor: "#0D672F",
    dangerColor: "#da534f",
    viewButton: "#30ad57",
    disabledColor: "#e9e4e4",
    borderColor: "#e5e5e5",
    paperColor: "#fff",
    toolbarColor: "#e5e5e5",
    fontColor: "#000",
}


function getBackground(isContrastMode, themeColor, imageName) {
    let result = themeColor
    return isContrastMode ? "#000" : result
}
export function getCurrentTheme(isContrastMode) {
    return createMuiTheme({
        palette: defaultLightPalette,
        typography: {
            fontFamily: '"HK Grotesk Regular", Arial, sans-serif',
            fontSize: 14,
        },
        tableHeader: {
            tableHeaderBlock: {
                background: getBackground(isContrastMode, defaultLightPalette.mainColor, "tableHeaderImage"),
            },
        },
        patientSummaryPanel: {
            container: {
                // background: `url(${backgroundImage})`,
            },
            topBlock: {
                background: getBackground(isContrastMode, defaultLightPalette.mainColor, "cardBackgroundImage"),
            },
        },
        cardBackground: {
            topBlock: {
                background: getBackground(isContrastMode, defaultLightPalette.mainColor, "cardBackgroundImage"),
            },
        },
        overrides: {
            MuiInput: {
                root: {
                    border: `2px solid ${defaultLightPalette.inputBorderColor}`,
                    paddingLeft: "5px",
                    paddingRight: "5px",
                    "&.Mui-focused": {
                        boxShadow: `0px 0px 0px 4px ${defaultLightPalette.highlightColor}`,
                    },
                    "&.Mui-disabled": {
                        border: `2px solid ${defaultLightPalette.disabledFontColor}`,
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
                        color: defaultLightPalette.fontColor,
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
                    backgroundColor: defaultLightPalette.paperColor,
                },
            },
            MuiPaper: {
                elevation1: {
                    boxShadow: "none",
                    backgroundColor: defaultLightPalette.paperColor,
                },
            },
            MuiTable: {
                root: {
                    backgroundColor: defaultLightPalette.paperColor,
                    border: `1px solid ${defaultLightPalette.borderColor}`,
                },
            },
            MuiTableHead: {
                root: {
                    backgroundColor: isContrastMode ? defaultLightPalette.paperColor : defaultLightPalette.borderColor,
                    color: isContrastMode ? defaultLightPalette.paperColor : defaultLightPalette.fontColor,
                },
            },
            MuiTableRow: {
                head: {
                    height: 48,
                },
            },
            MuiTableCell: {
                head: {
                    color: defaultLightPalette.fontColor,
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
    },
    )
}