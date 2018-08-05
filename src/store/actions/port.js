import * as actionTypes from '../actions/actionTypes';
import * as portCodes from '../portCodes';
import * as actions from './index';

// store background port in store
const portSet = (port) => {
    console.log('<port action> setting port');
    return {
        type: actionTypes.BACKGROUND_PORT_SET,
        port: port
    };
};

const portError = (error) => {
    return {
        type: actionTypes.BACKGROUND_PORT_ERROR,
        error: error
    };
};

// remove background port in store
// const portRemove = () => {
//     console.log('<port action> removing port');
//     return {
//         type: actionTypes.BACKGROUND_PORT_REMOVE
//     };
// };

export const backgroundPortInit = (chrome) => {
    if (!chrome) {
        console.warn(
            'No "chrome" var available. Probably because code is' +
            ' running outside of an extension. Check if NODE_ENV' +
            ' is set to \'development\' or \'production\'.\n' +
            'NODE_ENV: ' + process.env.NODE_ENV
        );
        return { type: actionTypes.BLANK_ACTION };
    }

    console.log('<port action> init background port');
    return dispatch => {
        // set up local port
        const port = chrome.runtime.connect({ name: portCodes.REACT_APP_PORT });

        // wait for port to tell us we're connected
        port.onMessage.addListener(msg => {
            // make sure code is not empty
            console.assert( msg.code && msg.code.trim() !== '');
            console.log('<port action> msg received from background.js', msg);

            switch( msg.code ) {
                // called when port gets connected to background.js
                case portCodes.INIT_PORT:
                    dispatch(portSet(port));
                    break;

                // called when user data comes back from background.js
                // case portCodes.USER_DATA_PAYLOAD:
                //     // store user data in store / dispatch action to do that
                //     const userData = msg.data;
                //     dispatch(actions.ripsAddUserData(userData));

                //     // send message back, indicating data was received &
                //     //  data fetch can continue
                //     port.postMessage({ code: portCodes.CONTINUE_IMPORT });
                //     break;

                // called when rips word import has completed
                case portCodes.IMPORT_DONE:
                    // tell import we're done and are successful
                    // dispatch(actions.ripsFetchSuccess());
                    console.log('done?');
                    break;

                // invalid msg code recognized in background.js
                case portCodes.ERROR_CODE_NOT_RECOGNIZED:
                    dispatch(portError( `${msg.source} - ${msg.data}` ));
                    break;
                
                // invalid msg code recognized here :)
                default:
                    dispatch(portError(
                        `REACT MSG CODE <${msg.code}> NOT VALID`
                    ));
                    // tell background.js to stop import
                    port.postMessage({
                        code: portCodes.ERROR_BKG_CODE_NOT_RECOGNIZED,
                        errCode: msg.code
                    });
            }
        });
    };
};