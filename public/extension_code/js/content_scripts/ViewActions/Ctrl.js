//----------------------------------------------------------------
//      NOTE: ONLY EDIT CODE IN /public/* - NOT IN /build/*
//----------------------------------------------------------------

// ===============================================================
//                           CONSTANTS
// ===============================================================
const MESSAGE_SOURCE = RIPS_PAGE_KEYS.VIEW_ACTIONS;

// ===============================================================
//                          PORT CONNECT
// ===============================================================
const port = chrome.runtime.connect({ name: PCs.PORTNAME_CS_VIEW_ACTIONS });

// ===============================================================
//                         MAIN FUNCTIONS
// ===============================================================
const startMerge = ( mergeHistoryData ) => {
    // First, filter out actions that are service-only
    // -> like "Service started", "Service reopened"
    // -> Note: other actions 'closed', 'closed - reopened at...'
    // -> are already filtered out in History Ctrl.js
    const actionsToFilter = [
        'Service started',
        'Service reopened',
    ];
    mergeHistoryData = mergeHistoryData.filter(action =>
        // if action IS in 'actionsToFilter', return false (to remove)
        !actionsToFilter.includes(action[ACTION_NAME])
    );

    // TODO: pop the first action off of the array, and store
    // -> in background js, then redirect to add actions
    // -> keep doing this until no more actions left to add! 
    console.log(mergeHistoryData);
    debugger;
}

// ================================================================
//                     MESSAGE POSTING FUNCTIONS
// ================================================================
// Note: port codes come from "../js/portCodes.js"

// ================================================================
//                          PORT LISTENERS
// ================================================================
port.onMessage.addListener(msg => {
    const {
        code,
        mergeHistoryData,
        autoImport, autoMerge,
        // postSaveRedirectFlag
    } = msg;

    Utils_Log(MESSAGE_SOURCE, 'port msg received', msg);

    switch ( code ) {
        case PCs.BKG_CS_INIT_PORT:
            Utils_Log(MESSAGE_SOURCE, `Successfully connected to background.js`);
            
            // fail if multiple automatic triggers are true
            // -> (can't do > 1 thing at same time)
            if (autoImport && autoMerge) {
                Utils_Error(MESSAGE_SOURCE, 'Auto import / merge are both true! :(');
                return;
            }
            
            // auto import should never be true here...
            if (autoImport) {
                const errMsg = 'Somehow got here & auto import is set?' +
                    ' How?!? Shouldn\'t happen!!';
                Utils_Error(MESSAGE_SOURCE, errMsg);
            }
            // if merge flag is true, start automatically!
            else if (autoMerge) { startMerge( mergeHistoryData ); }
            break;

        case PCs.BKG_CS_START_IMPORT:
        case PCs.BKG_CS_START_MERGE:
			Utils_SendRedirectCode(port, 'SearchClientDetails/AdvancedSearch');
            break;

        default: // code not recognized - send error back
			Utils_SendPortCodeError(port, code, PCs.PORTNAME_CS_VIEW_ACTIONS);
    }
});