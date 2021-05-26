import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';

const useStyles = makeStyles((theme) => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        width: 200,
    },
}));

export default function DatePickers() {
    const classes = useStyles();

    const getDateNow = () => {
        const date = new Date()
        const [day, month, year] = date.toLocaleDateString("en-GB").split("/")
        const transformedDate = `${year}-${month}-${day}`
        console.log(transformedDate)
        return transformedDate;
    }

    return (
        <form className={classes.container} noValidate>
            <TextField
                id="date"
                label="Date"
                type="date"
                defaultValue={getDateNow()}
                className={classes.textField}
                InputLabelProps={{
                    shrink: true,
                }}
            />
        </form>
    );
}
