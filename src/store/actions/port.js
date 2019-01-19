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

export const startImport = () => ({
    type: actionTypes.APP_IMPORT_START,
});

export const stopImport = ({
    type: actionTypes.APP_IMPORT_STOP,
});

export const startMerge = () => ({
    type: actionTypes.APP_MERGE_START,
});

export const stopMerge = () => ({
    type: actionTypes.APP_MERGE_STOP,
});

export const backgroundPortInit = (chrome) => {
    if (!chrome) {
        console.warn(
            'No "chrome" var available. Probably because code is' +
            ' running outside of an extension. Check if NODE_ENV' +
            " is set to 'development' or 'production'.\n" +
            'NODE_ENV: ' + process.env.NODE_ENV
        );
        return { type: actionTypes.BLANK_ACTION };
    }

    console.log('<port action.js> init background port');

    return (dispatch, getState) => {
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
                    // options page open - handled in background.js
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
                            msg.error + `. Err comes from: <${msg.source}>`
                        )
                    ));
                    // options page open - handled in background.js
                    // NOTE: import / merge in progress NOT reset
                    // -> b/c at this point, code may need to be fixed
                    break;

                // called when extension is reminding user to log in!
                case portCodes.BKG_RA_LOGIN_REMINDER:
                    dispatch(actions.notifyDialogOpenNew(
                        dialogConfigs.fatalError(
                            'Please login to RIPS and try again!!'
                        )
                    ));

                    const { importInProgress, mergeInProgress } = getState();
                    // dispatch action to reset importInProgress / mergeInProgress
                    // (which ever is appropriate) back to false
                    if (mergeInProgress) dispatch(stopMerge());
                    else if (importInProgress) dispatch(stopImport());
                    else console.error('... what? How are neither in progress?');
                    break;

                // called when there are no RIPS tabs open! tell user
                // -> to open RIPS, then start over
                case portCodes.BKG_RA_NO_RIPS_TABS:
                    dispatch(actions.notifyDialogOpenNew(
                        dialogConfigs.fatalError(
                            'No RIPS tabs open! Please open and sign in ' +
                            'to RIPS, then try again.'
                        )
                    ));

                    const { importInProgress, mergeInProgress } = getState();
                    // dispatch action to reset importInProgress / mergeInProgress
                    // (which ever is appropriate) back to false
                    if (mergeInProgress) dispatch(stopMerge());
                    else if (importInProgress) dispatch(stopImport());
                    else console.error('... what? How are neither in progress?');
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