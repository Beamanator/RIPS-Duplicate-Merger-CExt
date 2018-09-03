// import * as actionTypes from './actionTypes';

// // add client data to store
// // export const tableAddClientData = (key, data) => {
// //     console.log('[tables actions] tableaddclient', key, data)
// //     return {
// //         type: actionTypes.TABLE_ADD_CLIENT_DATA,
// //         data: data,
// //         key: key
// //     };
// // };

// // add 'selected' row array to store
// export const tableAddSelected = (key, data) => {
//     return {
//         type: actionTypes.TABLE_ADD_SELECTED,
//         data: data,
//         key: key
//     };
// };

// const tableSaveUnselected = (data) => {
//     return {
//         type: actionTypes.TABLE_SAVE_UNSELECTED,
//         data: data
//     };
// };

// // calculate which rows have not been selected yet
// export const tableCalcUnselected = () => {
//     return (dispatch, getState) => {
//         const { selected } = getState();

//         console.log('[tables action] tablecalcunselected', selected);

//         // TODO: do data processing, then pass data back to state!
//         dispatch(tableSaveUnselected([]))
//     }
// };