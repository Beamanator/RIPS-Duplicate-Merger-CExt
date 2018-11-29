import * as actionTypes from '../actions/actionTypes';
import * as portCodes from '../portCodes';
import * as actions from './index';
import * as dialogConfigs from '../../shared/notifyDialogConfigs';

// store background port in store
const portSet = (port) => {
    console.log('<port action> storing bkg port');
    return {
        type: actionTypes.BACKGROUND_PORT_SET,
        port: port
    };
};

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

    console.log('<port action.js> init background port');
    return dispatch => {
        // set up local port
        const port = chrome.runtime.connect({ name: portCodes.PORTNAME_REACT_APP });

        // wait for port to tell us we're connected
        port.onMessage.addListener(msg => {
            // make sure code is not empty
            console.assert( msg.code && msg.code.trim() !== '');
            console.log('<port action.js> msg received from background.js', msg);

            switch( msg.code ) {
                // called when port gets connected to background.js
                case portCodes.BKG_RA_INIT_PORT:
                    dispatch(portSet(port));
                    break;

                // called when import was stopped b/c of some error message
                case portCodes.BKG_RA_STOP_IMPORT_WITH_ERROR:
                    dispatch(actions.notifyDialogOpenNew(
                        dialogConfigs.importError(msg.message)
                    ));
                    // options page open - handled when error sent
                    break;

                // called when rips archive process has completed
                case portCodes.BKG_RA_ARCHIVE_DONE:
                    console.info('success! archive is done!');
                    // show notification dialog
                    dispatch(actions.notifyDialogOpenNew(
                        dialogConfigs.archiveDone()
                    ));
                    break;

                // called when rips data import has completed
                case portCodes.BKG_RA_IMPORT_DONE:
                    // tell import we're done and are successful
                    console.info('import done - data:', msg.data);
                    dispatch(actions.ripsFetchSuccess(msg.data));

                    // show the notification dialog
                    dispatch(actions.notifyDialogOpenNew(
                        dialogConfigs.importDone()
                    ));
                    // options page open - handled in background.js
                    break;

                // called when some error occurres anywhere, and everything
                // -> should stop
                case portCodes.BKG_RA_KILL_ALL:
                    dispatch(actions.notifyDialogOpenNew(
                        dialogConfigs.fatalError(
                            msg.error + `; source: <${msg.source}>`
                        )
                    ));
                    // options page open - handled in background.js
                    break;

                // invalid msg code recognized in background.js
                case portCodes.BKG_RA_ERROR_CODE_NOT_RECOGNIZED:
                    dispatch(actions.notifyDialogOpenNew(
                        dialogConfigs.RABkgPortError(`${msg.source} - ${msg.data}`)
                    ));
                    // options page open - handled when error sent
                    break;
                
                // invalid msg code recognized here :)
                default:
                    dispatch(actions.notifyDialogOpenNew(
                        dialogConfigs.RABkgPortError(
                            `REACT MSG CODE <${msg.code}> NOT VALID`
                        )
                    ));
                    // open options page (handled in background.js)
                    // tell background.js to stop import
                    port.postMessage({
                        code: portCodes.RA_BKG_ERROR_BKG_CODE_NOT_RECOGNIZED,
                        errCode: msg.code
                    });
            }
        });
    };
};