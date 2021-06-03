import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import { useSelector, useDispatch } from 'react-redux';
import {
    selectOpen,
    setOpen
} from '../form/ObservationFormSlice';

export default function ObservationDialog(props) {
    const {
        title,
        contentText,
        buttonName
    } = props
    const open = useSelector(selectOpen);
    const dispatch = useDispatch()


    const handleClose = () => {
        dispatch(setOpen(false));
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    {contentText}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="primary">
                    {buttonName}
                </Button>

            </DialogActions>
        </Dialog>
    );
}
