//----------------------------------------------------------------
//      NOTE: ONLY EDIT CODE IN /public/* - NOT IN /build/*
//----------------------------------------------------------------

// ===============================================================
//                           CONSTANTS
// ===============================================================
const MESSAGE_SOURCE = RIPS_PAGE_KEYS.ADVANCED_SEARCH_RESULTS;

// ===============================================================
//                          PORT CONNECT
// ===============================================================
const port = chrome.runtime.connect({ name: PCs.PORTNAME_CS_ADVANCED_SEARCH });

// ===============================================================
//                         MAIN FUNCTIONS
// ===============================================================
const analyzeSearchResult = ( clientNum ) => {
    Utils_Log(MESSAGE_SOURCE, 'Analyzing client num: ', clientNum);
    // TODO: think about waiting 1 - 4 seconds to wait for results
    // -> to load (like Auto Import)

    // 1) get all search result rows
    const resultsSelector = FIELD_IDS_ADVANCED_SEARCH_RESULTS[SEARCH_RESULTS];
    const resultRows = document.querySelectorAll(resultsSelector);
    
    // if length !== 1, something went wrong!
    if (resultRows.length !== 1) {
        // TODO: stop import
        Utils_Error(
            MESSAGE_SOURCE,
            `Error - found something other than 1 result (len:${resultRows.length}):`,
            resultRows
        );
        return;
    }

    // 2) found 1 result (THE client!) - click on it
    resultRows[0].click();

    // 3) get active client element
    const activeClientFieldSelector = FIELD_IDS_ADVANCED_SEARCH_RESULTS[ACTIVE_CLIENT];
    
    // 4) wait for "Active Client" to match StARS #!
    // -> try to find clientNum inside activeClientElem.value
    Utils_WaitForCondition(
        Utils_OnActiveClientMatches, {
            activeClientSelector: activeClientFieldSelector,
            clientNum: clientNum
        }, 500, 6
    )
    .then(() => {
        // 5) navigate to client's CBI page
        const cbiTabSelector = FIELD_IDS_ADVANCED_SEARCH_RESULTS[TAB_CLIENT_BASIC_INFORMATION];
        const cbiTabElem = document.querySelector(cbiTabSelector);
        cbiTabElem.click();
    })
    .catch(errMsg => {
        // TODO: stop import w/ error message!
        Utils_Error(MESSAGE_SOURCE, 'Search Results ERROR:', errMsg);
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
    const { code, clientNum, autoImport, autoMerge } = msg;
    Utils_Log(MESSAGE_SOURCE, 'port msg received', msg);

    switch(code) {
        case PCs.BKG_CS_START_IMPORT:
        case PCs.BKG_CS_START_MERGE:
            Utils_SendRedirectCode(port, 'SearchClientDetails/AdvancedSearch');
            break;

        case PCs.BKG_CS_INIT_PORT:
            Utils_Log(MESSAGE_SOURCE, `Successfully connected to background.js`);
            
            // fail if multiple automatic triggers are true
            // -> (can't do > 1 thing at same time)
            if (autoImport && autoMerge) {
                Utils_Error(MESSAGE_SOURCE, 'Auto import / merge are both true! :(');
                return;
            }
            // if any flag is true, start automatically analyzing results!
            if (autoImport || autoMerge) {
                analyzeSearchResult( clientNum );
            }
            else {} // do nothing if no automatic process set
            break;

        default: // code not recognized - send error back
			Utils_SendPortCodeError(port, code, PCs.PORTNAME_CS_ADVANCED_SEARCH);
    }
});
