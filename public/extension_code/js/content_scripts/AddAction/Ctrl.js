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
    // get service, date, caseworker selectors
    const serviceSelector = FIELD_IDS_ADD_ACTION[ADD_ACTION_SERVICE];
    const dateSelector = FIELD_IDS_ADD_ACTION[ADD_ACTION_DATE];
    const caseworkerSelector = FIELD_IDS_ADD_ACTION[ADD_ACTION_CASEWORKER]

    // insert easy data immediately into html (ALL FIELDS ARE REQUIRED)
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

    // check if any initial insert failed
    if (elemSetSuccess.includes(false)) {
        const errMsg = 'Not all fields inserted correctly! Check ' +
            'array for fails [Service, Date, Caseworker]:';
        Utils_Error(MESSAGE_SOURCE, errMsg, elemSetSuccess);
        return;
    }

    // now wait a bit until the action select box
    // -> populates with that service's actions. Hopefully the
    // -> notes 'document' is also available in the HTML
    const actionSelector = FIELD_IDS_ADD_ACTION[ADD_ACTION_NAME];
    const notesFinder = FIELD_IDS_ADD_ACTION[ADD_ACTION_NOTES_FINDER];
    Utils_WrapMultiConditions(
        [[
            Utils_OnSelectOneElemHasSelectedOption, {
                selectElem: Utils_QueryDoc(actionSelector)
            }
        ], [
            Utils_OnElemFoundWithCustomFunction, {
                selectorFn: notesFinder
            }
        ]], 500, 3
    )
    .then(() => {
        // insert last two elements!
        const actionSelector = FIELD_IDS_ADD_ACTION[ADD_ACTION_NAME];
        const noteInsertFunction = FIELD_IDS_ADD_ACTION[ADD_ACTION_NOTES];

        // insert 2nd group of data into html elements
        const elemSetSuccess2 = [
            Utils_SetSelectOneElem(
                Utils_QueryDoc(actionSelector),
                actionToCreate[ACTION_NAME]
            ),
            noteInsertFunction(
                actionToCreate[ACTION_NOTES]
            )
        ];

        // check if any initial insert failed
        if (elemSetSuccess2.includes(false)) {
            const errMsg = 'Not all fields inserted correctly! Check ' +
                'array for fails [action, notes]:';
            Utils_Error(MESSAGE_SOURCE, errMsg, elemSetSuccess2);
            return;
        }

        // at this point, all fields have been entered, so click save!
        const saveBtnSelector = FIELD_IDS_ADD_ACTION[ADD_ACTION_SAVE_BUTTON];
        const clickSuccess = Utils_ClickElem(
            Utils_QueryDoc(saveBtnSelector)
        );
        // handle click fail
        if (!clickSuccess) {
            let errMsg = `Couldn't click save somehow! ` +
                `<${saveBtnSelector}>`;
            Utils_Error(MESSAGE_SOURCE, errMsg);
        }
    })
    .catch((errMsg) => {
        // error if not all conditions passed
        // -> NOTE: Only one error message will be present here
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