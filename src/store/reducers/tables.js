import * as actionTypes from '../actions/actionTypes';
import { updateObject } from '../../shared/utils';

const initialState = {
    clientData: {},
    selected: {},
    unselected: []
};

const tableAddClientData = (state, action) => {
    return updateObject(state, {
        clientData: updateObject(state.clientData, {
            [action.key]: action.data
        })
    });
};

const tableAddSelected = (state, action) => {
    return updateObject(state, {
        selected: updateObject(state.selected, {
            [action.key]: action.data
        })
    });
};

const tableCalcUnselected = (state, action) => {
    return updateObject(state, {
        unselected: action.data
    });
};

const reducer = (state = initialState, action) => {
    switch(action.type) {
        case actionTypes.TABLE_ADD_CLIENT_DATA: return tableAddClientData(state, action);
        case actionTypes.TABLE_ADD_SELECTED: return tableAddSelected(state, action);
        case actionTypes.TABLE_CALC_UNSELECTED: return tableCalcUnselected(state, action);

        default:
            return state;
    }
};

export default reducer;