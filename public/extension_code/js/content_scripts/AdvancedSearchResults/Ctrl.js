//----------------------------------------------------------------
//      NOTE: ONLY EDIT CODE IN /public/* - NOT IN /build/*
//----------------------------------------------------------------

// ===============================================================
//                           CONSTANTS
// ===============================================================
const MESSAGE_SOURCE = 'CtrlAdvancedSearchResults';

// ===============================================================
//                          PORT CONNECT
// ===============================================================
const port = chrome.runtime.connect({ name: PCs.PORTNAME_CS_ADVANCED_SEARCH });

// ===============================================================
//                         MAIN FUNCTIONS
// ===============================================================
const analyzeSearchResult = ( clientNum ) => {
    Utils_Log(MESSAGE_SOURCE, 'Analyzing client num: ', clientNum);
    // TODO: complete this function
    debugger;

    // TODO: think about waiting 1 - 4 seconds to wait for results
    // -> to load (like Auto Import)

    // 1) get all search result rows
    const resultsSelector = FIELD_IDS_ADVANCED_SEARCH_RESULTS[SEARCH_RESULTS].selector;
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
    const activeClientFieldID = FIELD_IDS_ADVANCED_SEARCH_RESULTS[ACTIVE_CLIENT];
    
    // 4) wait for "Active Client" to match StARS #!
    // -> try to find clientNum inside activeClientElem.value
    Utils_WaitForCondition(
        Utils_OnActiveClientMatches, {
            activeClientSelector: '#' + activeClientFieldID,
            clientNum: clientNum
        }, 500, 6
    )
    .then(() => {
        // 5) navigate to client's CBI page
        const cbiTabSelector = FIELD_IDS_ADVANCED_SEARCH_RESULTS[TAB_CLIENT_BASIC_INFORMATION].selector;
        const cbiTabElem = document.querySelector(cbiTabSelector);
        cbiTabElem.click();
    })
    .catch(errMsg => {
        // TODO: stop import w/ error message!
        Utils_Error(MESSAGE_SOURCE, 'Search Results ERROR:', errMsg);
        debugger;
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
    Utils_Log(MESSAGE_SOURCE, 'port msg received', msg);

    switch(msg.code) {
        case PCs.BKG_CS_INIT_PORT:
            Utils_Log(MESSAGE_SOURCE, `Successfully connected to background.js`);
            // if autoStart flag is true, start automatically importing!
            if (msg.autoStart) {
                // analyze data on search results page
                analyzeSearchResult( msg.clientNum );
            }
            // if not auto starting, wait for manual start
            // -> PCs.BKG_CS_START_IMPORT
            break;

        case PCs.BKG_CS_START_IMPORT:
            Utils_SendRedirectCode(port, 'SearchClientDetails/AdvancedSearch');
            break;

        default: // code not recognized - send error back
			Utils_SendPortCodeError(port, msg.code, PCs.PORTNAME_CS_ADVANCED_SEARCH);
    }
});
