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
const startMerge = ( mergeHistoryData, historyIndex ) => {
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

    // Get the next action in the array, and store in background js,
    // -> as ACTION_TO_ADD, then redirect to add actions.
    // -> Keep doing this until no more actions left to add! 
    const nextActionToCreate = mergeHistoryData[historyIndex];
    
    // if there is no action, we're probably done! check if index
    // -> if out of bounds, or other error (bug)
    if (!nextActionToCreate) {
        // check index out of bounds - Merge is done!
        // -> Time to archive the other client records!
        if (historyIndex >= mergeHistoryData.length) {
            Utils_Warn(MESSAGE_SOURCE, 'Moving on to archiving!');
            sendStartArchiveProcess();
        }

        // other error?! What happened?!
        else {
            let errMsg = 'Why the heck are we not finding an action?? ' +
                'Index is: ' + historyIndex;
            Utils_Error(MESSAGE_SOURCE, errMsg, mergeHistoryData);
            Utils_KillAll(port, MESSAGE_SOURCE, errMsg);
        }
    }
    // else we have an action, let's create (add) it!
    // -> store to background.js, redirect, + increment historyIndex
    else {
        sendNextActionReady(nextActionToCreate);
    }
}

// ================================================================
//                     MESSAGE POSTING FUNCTIONS
// ================================================================
// Note: port codes come from "../js/portCodes.js"
const sendNextActionReady = (nextAction) => {
    port.postMessage({
        code: PCs.CS_BKG_ADD_NEXT_ACTION,
        data: nextAction,
    });
}
const sendStartArchiveProcess = () => {
    port.postMessage({
        code: PCs.CS_BKG_START_ARCHIVE
    });
}

// ================================================================
//                          PORT LISTENERS
// ================================================================
port.onMessage.addListener(msg => {
    const {
        code,
        mergeHistoryData, mergeHistoryIndex,
        autoImport, autoMerge,
    } = msg;

    // Utils_Log(MESSAGE_SOURCE, 'port msg received', msg);

    switch ( code ) {
        case PCs.BKG_CS_INIT_PORT:
            // Utils_Log(MESSAGE_SOURCE, `Successfully connected to background.js`);
            
            // fail if multiple automatic triggers are true
            // -> (can't do > 1 thing at same time)
            if (autoImport && autoMerge) {
                let err = 'Auto import / merge are both true! This shouldnt be possible.';
                Utils_Error(MESSAGE_SOURCE, err);
                Utils_KillAll(port, MESSAGE_SOURCE, err)
                return;
            }
            
            // auto import should never be true here...
            if (autoImport) {
                const errMsg = 'Somehow got here & auto import is set?' +
                    ' How?!? Shouldn\'t happen!!';
                Utils_Error(MESSAGE_SOURCE, errMsg);
                Utils_KillAll(port, MESSAGE_SOURCE, errMsg);
            }
            // if merge flag is true, start automatically!
            else if (autoMerge) { startMerge( mergeHistoryData, mergeHistoryIndex ); }
            break;

        case PCs.BKG_CS_START_IMPORT:
        case PCs.BKG_CS_START_MERGE:
			Utils_SendRedirectCode(port, 'SearchClientDetails/AdvancedSearch');
            break;

        default: // code not recognized - send error back
			Utils_SendPortCodeError(port, code, PCs.PORTNAME_CS_VIEW_ACTIONS);
    }
});