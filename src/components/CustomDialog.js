import React from 'react';

import {
    Button,

    Dialog, DialogActions, DialogContent,
    DialogTitle, // DialogContentText,
} from '@material-ui/core';

const CustomDialog = (props) => {
    const {
        isOpen, handleClose, title, buttonCloseText,
        showActionButton, buttonActionText, buttonActionFunction,
    } = props;

    return (
        <Dialog
            open={isOpen}
            onClose={handleClose}
            aria-labelledby="merge-dialog-title"
            aria-describedby="merge-dialog-description"
        >
            <DialogTitle id="merge-dialog-title">
                {title}
            </DialogTitle>
            <DialogContent>
                {props.children}
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={handleClose}
                    color="primary"
                >
                    {buttonCloseText}
                </Button>
                {showActionButton ? <Button
                    onClick={buttonActionFunction}
                    color="primary" autoFocus
                >
                    {buttonActionText}
                </Button> : null}
            </DialogActions>
        </Dialog>
    );
}

export default CustomDialog;
