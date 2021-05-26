import React, { useEffect } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';


import { useSelector, useDispatch } from 'react-redux';
import {
    selectTabTitles,
    selectValue,
    setValue,
    setTabTitles
} from './ObservationTabsSlice';

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.paper,
        width: "100%",
    },
}));

export default function ObservationTabs(props) {
    const classes = useStyles();
    const theme = useTheme();
    const value = useSelector(selectValue);
    const tabTitles = useSelector(selectTabTitles);
    const dispatch = useDispatch();

    const {
        configuration
    } = props

    useEffect(() => {
        dispatch(setTabTitles(configuration.observations))
    }, [])

    const handleChange = (event, newValue) => {
        dispatch(setValue(newValue));
    };

    const handleChangeIndex = (index) => {
        dispatch(setValue(index));
    };
    function a11yProps(index) {
        return {
            id: `simple-tab-${index}`,
            'aria-controls': `simple-tabpanel-${index}`,
        };
    }

    return (
        <div className={classes.root}>
            <AppBar position="static" color="default">
                <Tabs
                    value={value}
                    onChange={handleChange}
                    indicatorColor="primary"
                    textColor="primary"
                    variant="scrollable"
                    scrollButtons="off"
                >
                    {tabTitles.map((tabTitle, index) => (
                        <Tab label={tabTitle} {...a11yProps(index)} />
                    ))}

                </Tabs>
            </AppBar>
        </div >
    );
}
