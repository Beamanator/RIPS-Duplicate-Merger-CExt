import * as actionTypes from './actionTypes';

// add client data to store
export const tableAddClientData = (key, data) => {
    return {
        type: actionTypes.TABLE_ADD_CLIENT_DATA,
        data: data,
        key: key
    };
};

// add 'selected' row array to store
export const tableAddSelected = (key, data) => {
    return {
        type: actionTypes.TABLE_ADD_SELECTED,
        data: data,
        key: key
    };
};

// calculate which rows have not been selected yet
export const tableCalcUnselected = (selectedRowData) => {
    // TODO: do data processing?
    console.log('selected data!', selectedRowData);
    return {
        type: actionTypes.TABLE_CALC_UNSELECTED,
        data: selectedRowData
    };
};