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
            Utils_Error(MESSAGE_SOURCE, 'Advanced Search Field IDs not found');
            // TODO: send error message back to bkg, then to React
            return;
        }
        
        // 2) put stars # into stars # field
        const searchFieldSelector = FIELD_IDS_ADVANCED_SEARCH[SEARCH_CLIENT_NUMBER];
        // TODO: handle possibly missing element
        let searchFieldElem = document.querySelector(searchFieldSelector);
        searchFieldElem.value = clientNum;

        // 3) click 'search' button
        const searchButtonSelector = FIELD_IDS_ADVANCED_SEARCH[SEARCH_BUTTON];
        // TODO: handle possibly missing element
        const searchButtonElem = document.querySelector(searchButtonSelector);
        searchButtonElem.click();

        // end -> results analyzed in AdvancedSearchResults/Ctrl.js
    })
    .catch((errMsg) => {
        // TODO: popup exists! cancel import 'n stuff since the
        // -> search number was eff'd up!
        Utils_Error(MESSAGE_SOURCE, 'Popup shown in advanced search! ',
            'something must have gone wrong...', errMsg);
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
                return;
            }
            debugger;
            // if any flag is true, start automatically searching for client!
            if (autoImport || autoMerge || autoArchive) {
                runClientNumSearch( clientNum );
            }
            else {} // do nothing if no automatic process set
            break;

        default: // code not recognized - send error back
			Utils_SendPortCodeError(port, code, PCs.PORTNAME_CS_ADVANCED_SEARCH);
    }
});