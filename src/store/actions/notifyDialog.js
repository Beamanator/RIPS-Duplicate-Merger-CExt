import * as actionTypes from './actionTypes';

// close the dialog
export const notifyDialogClose = () => {
    return {
        type: actionTypes.NOTIFY_DIALOG_CLOSE,
        isOpen: false,
    };
};

// open the dialog (only called internally)
const notifyDialogOpen = () => {
    return {
        type: actionTypes.NOTIFY_DIALOG_OPEN,
        isOpen: true,
    };
};

// set the dialog data (only called internally)
const notifyDialogSetData = (config) => {
    return {
        type: actionTypes.NOTIFY_DIALOG_SET_DATA,
        newConfig: config,
    };
};

/**
 * For available params & their defaults, see reducer initialState
 */
export const notifyDialogOpenNew = (config) => {
    return dispatch => {
        // first, set the new dialog config data
        dispatch(notifyDialogSetData(config));

        // second, open the notification dialog
        dispatch(notifyDialogOpen());
    };
};