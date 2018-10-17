//----------------------------------------------------------------
//      NOTE: ONLY EDIT CODE IN /public/* - NOT IN /build/*
//----------------------------------------------------------------

// ===============================================================
//                           CONSTANTS
// ===============================================================
const MESSAGE_SOURCE = RIPS_PAGE_KEYS.ADD_ACTIONS;

// ===============================================================
//                          PORT CONNECT
// ===============================================================
const port = chrome.runtime.connect({ name: PCs.PORTNAME_CS_ADD_ACTION });

// ===============================================================
//                         MAIN FUNCTIONS
// ===============================================================
const startMerge = ( actionToCreate ) => {    
    // get service dropdown selector
    const serviceSelector = FIELD_IDS_ADD_ACTION[ADD_ACTION_SERVICE];
    
    // get date selector
    const dateSelector = FIELD_IDS_ADD_ACTION[ADD_ACTION_DATE];

    // get caseworker selector
    const caseworkerSelector = FIELD_IDS_ADD_ACTION[ADD_ACTION_CASEWORKER]

    // insert easy data immediately into html
    const elemSetSuccess = [
        // service dropdown
        Utils_SetSelectOneElem(
            Utils_QueryDoc(serviceSelector),
            actionToCreate[ACTION_SERVICE]
        ),
        // date input
        Utils_SetInputElem(
            Utils_QueryDoc(dateSelector),
            actionToCreate[ACTION_DATE]
        ),
        // caseworker dropdown
        Utils_SetSelectOneElem(
            Utils_QueryDoc(caseworkerSelector),
            actionToCreate[ACTION_CASEWORKER]
        )
    ];

    // now wait a bit until the action select box
    // -> populates with that service's actions. Hopefully the
    // -> notes 'document' is also available in the HTML
    const actionSelector = FIELD_IDS_ADD_ACTION[ADD_ACTION_NAME];
    Utils_WaitForCondition(
        Utils_OnSelectOneElemHasSelectedOption, {
            selectElem: Utils_QueryDoc(actionSelector)
        }, 500, 3
    )
    .then(() => {
        // TODO: also check if attendance notes document is available
        // -> in html? naah, wrap it up in the Fcondition param above
        debugger;
    })
    .catch((errMsg) => {
        // error if not all conditions passed
        const err = `Some conditions failed! Check 'em!`;
        Utils_Error(MESSAGE_SOURCE, err);
        Utils_Error(MESSAGE_SOURCE, 'UTILS ERROR:', errMsg);
    });
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
        actionToCreate,
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
            else if (autoMerge) { startMerge( actionToCreate ); }
            break;

        case PCs.BKG_CS_START_IMPORT:
        case PCs.BKG_CS_START_MERGE:
			Utils_SendRedirectCode(port, 'SearchClientDetails/AdvancedSearch');
            break;

        default: // code not recognized - send error back
			Utils_SendPortCodeError(port, code, PCs.PORTNAME_CS_ADD_ACTION);
    }
});