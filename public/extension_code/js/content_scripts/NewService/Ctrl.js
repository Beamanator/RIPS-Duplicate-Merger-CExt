//----------------------------------------------------------------
//      NOTE: ONLY EDIT CODE IN /public/* - NOT IN /build/*
//----------------------------------------------------------------

// ===============================================================
//                           CONSTANTS
// ===============================================================
const MESSAGE_SOURCE = RIPS_PAGE_KEYS.NEW_SERVICE;

// ===============================================================
//                          PORT CONNECT
// ===============================================================
const port = chrome.runtime.connect({ name: PCs.PORTNAME_CS_NEW_SERVICE });

// ===============================================================
//                         MAIN FUNCTIONS
// ===============================================================
const startMerge = ( serviceData ) => {
    // get service description, start date, caseworker selectors
    const serviceDescSelector = FIELD_IDS_NEW_SERVICE[NEW_SERVICE_DESCRIPTION];
    const serviceStartSelector = FIELD_IDS_NEW_SERVICE[NEW_SERVICE_START_DATE];
    const serviceCwSelector = FIELD_IDS_NEW_SERVICE[NEW_SERVICE_CASEWORKER];
    
    // input data & get successes
    const elemSetSuccesses = [
        // service description dropdown
        Utils_SetSelectOneElem(
            Utils_QueryDoc(serviceDescSelector),
            serviceData[ACTION_SERVICE]
        ),
        // service start date input
        Utils_SetInputElem(
            Utils_QueryDoc(serviceStartSelector),
            serviceData[ACTION_DATE]
        ),
        // service caseworker dropdown
        Utils_SetSelectOneElem(
            Utils_QueryDoc(serviceCwSelector),
            serviceData[ACTION_CASEWORKER]
        )
    ];
    
    // TODO: MAYBE check action box is populated
    // -> most likely we can skip this check
    
    // if any inserts failed, throw error
    if (elemSetSuccesses.includes(false)) {
        let errMsg = `Some errors found in [service, date, cw] inserts`;
        Utils_Error(MESSAGE_SOURCE, errMsg, elemSetSuccesses);
        return;
    }
    // else, no errors so click save!
    else {
        const saveBtnSelector = FIELD_IDS_NEW_SERVICE[NEW_SERVICE_SAVE_BUTTON];
        const clickSuccess = Utils_ClickElem(
            Utils_QueryDoc(saveBtnSelector)
        );
        // handle click fail
        if (!clickSuccess) {
            let errMsg = `Couldn't click save somehow! ` +
                `<${saveBtnSelector}>`;
            Utils_Error(MESSAGE_SOURCE, errMsg);
        }
    }
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
        serviceToCreate,
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
            else if (autoMerge) { startMerge( serviceToCreate ); }
            break;

        case PCs.BKG_CS_START_IMPORT:
        case PCs.BKG_CS_START_MERGE:
			Utils_SendRedirectCode(port, 'SearchClientDetails/AdvancedSearch');
            break;

        default: // code not recognized - send error back
			Utils_SendPortCodeError(port, code, PCs.PORTNAME_CS_NEW_SERVICE);
    }
});