import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
    },
    button: {
        marginTop: theme.spacing(1),
        marginRight: theme.spacing(1),
    },
    actionsContainer: {
        marginBottom: theme.spacing(2),
    },
    resetContainer: {
        padding: theme.spacing(3),
    },
    question: {
        cursor: "pointer",
    },
    buttonRight: {
        float: 'right'
    },
    spinner: {
        display: 'flex',
        '& > * + *': {
            marginLeft: theme.spacing(2),
        },
    },
    sectionDesktop: {
        display: 'none',
        [theme.breakpoints.up('md')]: {
            display: 'flex',
        },
        paddingTop: "1%",
    },
    sectionMobile: {
        display: 'flex',
        [theme.breakpoints.up('md')]: {
            display: 'none',
        },
        paddingTop: "1%",
    },
    viewButton: {
        display: "flex",
        width: 110,
        height: 40,
        padding: 0,
        backgroundColor: "white",
        color: theme.palette.mainColor,
        border: `1px solid ${theme.palette.mainColor}`,
        borderRadius: 25,
        fontSize: 16,
        fontWeight: 800,
        "&:hover": {
            backgroundColor: theme.palette.mainColor,
            color: "white",
        },
        textDecorationLine: "none",
        fontFamily: theme.typography.fontFamily,
        alignItems: "center",
        justifyContent: "center",
    },
}));