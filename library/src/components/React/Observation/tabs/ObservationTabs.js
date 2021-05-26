import React from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';


import { useSelector, useDispatch } from 'react-redux';
import {
    selectValue,
    setValue
} from './ObservationTabsSlice';

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.paper,
        width: 500,
    },
}));

export default function ObservationTabs() {
    const classes = useStyles();
    const theme = useTheme();
    const value = useSelector(selectValue);
    const dispatch = useDispatch()

    const handleChange = (event, newValue) => {
        dispatch(setValue(newValue));
    };

    const handleChangeIndex = (index) => {
        dispatch(setValue(index));
    };

    return (
        <div className={classes.root}>
            <AppBar position="static" color="default">
                <Tabs
                    value={value}
                    onChange={handleChange}
                    indicatorColor="primary"
                    textColor="primary"
                    variant="fullWidth"
                    aria-label="full width tabs example"
                >
                    <Tab label="Height &#38; Weight" />
                    <Tab label="Blood Pressure" />
                    <Tab label="Oxygen Saturation" />
                </Tabs>
            </AppBar>
        </div >
    );
}
