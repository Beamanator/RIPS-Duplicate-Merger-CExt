//----------------------------------------------------------------
//      NOTE: ONLY EDIT CODE IN /public/* - NOT IN /build/*
//----------------------------------------------------------------

// ===============================================================
//                           CONSTANTS
// ===============================================================
const MESSAGE_SOURCE = RIPS_PAGE_KEYS.ADVANCED_SEARCH;

// ===============================================================
//                          PORT CONNECT
// ===============================================================
const port = chrome.runtime.connect({ name: PCs.PORTNAME_CS_ADVANCED_SEARCH });

// ===============================================================
//                         MAIN FUNCTIONS
// ===============================================================
const runClientNumSearch = (clientNum) => {
    // FIRST, handle potential popups like '0'-'100' results found!
    Utils_WaitForCondition( Utils_OnPopupNotThrown, {
        alertSelector: '.sweet-alert',
        alertVisibleClass: 'visible'
    }, 1000, 1)
    .then(() => {
        // popup doesn't exist, so this should be the first time
        // -> through - search for client!
        Utils_Log(MESSAGE_SOURCE, `Search for client! num:`, clientNum);
        
        // 1) make sure field translator exists
        if (!FIELD_IDS_ADVANCED_SEARCH) {
            let errMsg = 'Advanced Search Field IDs not found';
            Utils_Error(MESSAGE_SOURCE, errMsg);
            Utils_KillAll(port, MESSAGE_SOURCE, errMsg);
            return;
        }
        
        // 2) put stars # into stars # field
        const searchFieldSelector = FIELD_IDS_ADVANCED_SEARCH[SEARCH_CLIENT_NUMBER];
        if (!searchFieldSelector) {
            let errMsg = 'search field selector not found :(';
            Utils_Error(MESSAGE_SOURCE, errMsg);
            Utils_KillAll(port, MESSAGE_SOURCE, errMsg);
        }
        let searchFieldElem = Utils_QueryDoc(searchFieldSelector);
        searchFieldElem.value = clientNum;

        // 3) click 'search' button
        const searchButtonSelector = FIELD_IDS_ADVANCED_SEARCH[SEARCH_BUTTON];
        if (!searchFieldSelector) {
            let errMsg = 'search button selector not found :(';
            Utils_Error(MESSAGE_SOURCE, errMsg);
            Utils_KillAll(port, MESSAGE_SOURCE, errMsg);
        }
        let clickSuccess =
            Utils_ClickElem(Utils_QueryDoc(searchButtonSelector));
        if (!clickSuccess) {
            let errMsg = 'search button click failed :(';
            Utils_Error(MESSAGE_SOURCE, errMsg);
            Utils_KillAll(port, MESSAGE_SOURCE, errMsg);
        }

        // end -> results analyzed in AdvancedSearchResults/Ctrl.js
    })
    .catch((errMsg) => {
        // popup exists! cancel import 'n stuff since the
        // -> search number was eff'd up!
        let err = 'Popup shown in advanced search! something must' + 
            ' have gone wrong...';
        Utils_Error(MESSAGE_SOURCE, err, errMsg);
        Utils_KillAll(port, MESSAGE_SOURCE, err);
    });
}

// ===============================================================
//                     MESSAGE POSTING FUNCTIONS
// ===============================================================
// Note: port codes come from "../js/portCodes.js"


// ===============================================================
//                          PORT LISTENERS
// ===============================================================

port.onMessage.addListener(function(msg) {
    const {
        autoImport, autoMerge, autoArchive,
        code, clientNum,
    } = msg;

    Utils_Log(MESSAGE_SOURCE, 'port msg received', msg);

    switch(code) {
        case PCs.BKG_CS_START_IMPORT:
        case PCs.BKG_CS_START_MERGE:
            runClientNumSearch( clientNum );
            break;
        
        case PCs.BKG_CS_INIT_PORT:
            Utils_Log(MESSAGE_SOURCE, `Successfully connected to background.js`);
            
            // count how many 'auto...' flags are true
            const autoStartFlags = [autoMerge, autoImport, autoArchive];
            const countAutoStarts = autoStartFlags
                .reduce((count, flag) => count + (flag ? 1 : 0), 0);

            // fail if multiple automatic triggers are true
            // -> (can't do > 1 thing at same time)
            if (countAutoStarts > 1) {
                Utils_Error(
                    MESSAGE_SOURCE,
                    'Too many "auto start" flags are true!',
                    '[autoMerge, autoImport, autoArchive]:',
                    autoStartFlags
                );
                Utils_KillAll(
					port, MESSAGE_SOURCE,
					'Too many "auto start" flags are true!'
				);
                return;
            }
            
            // if any flag is true, start automatically searching for client!
            if (autoImport || autoMerge) {
                runClientNumSearch( clientNum );
            }
            // -> for autoArchive, add extra logic before doing the same
            else if (autoArchive) {
                // if no client number we're done! just log warning note
                if (!clientNum) {
                    Utils_Warn(MESSAGE_SOURCE, 'Duplicate merge process complete!');
                }
                // else, num exists so archive it!
                else {
                    runClientNumSearch( clientNum );
                }
            }
            else {} // do nothing if no automatic process set
            break;

        default: // code not recognized - send error back
			Utils_SendPortCodeError(port, code, PCs.PORTNAME_CS_ADVANCED_SEARCH);
    }
});