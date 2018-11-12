import * as actionTypes from '../actions/actionTypes';
import { updateObject } from '../../shared/utils';

const initialState = {
    open: false,
    title: 'Notification!',
    showActionButton: true,
    buttonActionText: 'Run',
    buttonCloseText: 'Close',
    dialogContent: 'test text from redux',
};

const notifyDialogClose = (state, action) => {
    return updateObject(state, {
        open: action.isOpen
    });
};

const notifyDialogOpen = (state, action) => {
    return updateObject(state, {
        open: action.isOpen
    });
};

const notifyDialogSetData = (state, action) => {
    console.log(action)
    return updateObject(state, {
        ...action.newConfig
    });
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.NOTIFY_DIALOG_CLOSE: return notifyDialogClose(state, action);
        case actionTypes.NOTIFY_DIALOG_OPEN: return notifyDialogOpen(state, action);
        case actionTypes.NOTIFY_DIALOG_SET_DATA: return notifyDialogSetData(state, action);

        default:
            return state;
    }
};

export default reducer;