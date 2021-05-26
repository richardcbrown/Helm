import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';

import { useDispatch, useSelector } from 'react-redux';
import {
    selectOpen,
    setOpen
} from './ConfirmationDialogSlice';
import { handleReset } from '../stepper/VerticalLinearStepperSlice';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function AlertDialogSlide() {
    const open = useSelector(selectOpen);
    const dispatch = useDispatch();

    const onCloseHandler = () => {
        dispatch(handleReset())
        dispatch(setOpen(false))
    }

    return (
        <div>
            <Dialog
                open={open}
                TransitionComponent={Transition}
                keepMounted
                maxWidth="md"
                onBackdropClick={() => onCloseHandler()}
                onClose={() => onCloseHandler()}
                aria-labelledby="alert-dialog-slide-title"
                aria-describedby="alert-dialog-slide-description"

            >
                <DialogTitle id="alert-dialog-slide-title">{"About me submitted successfully"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-slide-description">
                        About me responses have been submitted successfully.
                </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        color="primary"
                        onClick={() => onCloseHandler()} >
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
