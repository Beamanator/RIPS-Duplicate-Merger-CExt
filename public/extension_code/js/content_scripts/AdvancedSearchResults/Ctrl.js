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
const port = chrome.runtime.connect({ name: PCs.PORTNAME_CS_ADVANCED_SEARCH_RESULTS });

// ===============================================================
//                         MAIN FUNCTIONS
// ===============================================================
const analyzeSearchResult = ( clientNum ) => {
    Utils_Log(MESSAGE_SOURCE, 'Analyzing client num: ', clientNum);

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
        Utils_KillAll(
            port,
            MESSAGE_SOURCE,
            `Found ${resultRows.length} records, which shouldn't be possible. Investigate`
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
        Utils_Error(MESSAGE_SOURCE, 'Search Results ERROR:', errMsg);
        alert(
            'Warning: Your internet connection ' +
            'may be a little bit slow. Please refresh the page now.' +
            '\n\nIf this message shows up multiple times, please ' +
            'contact the developer (the RIPS guy). Thanks!' +
            '\n\nNote for the developer:\nError message: ' + errMsg
        );
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

    // Utils_Log(MESSAGE_SOURCE, 'port msg received', msg);

    switch(code) {
        case PCs.BKG_CS_INIT_PORT:
            // Utils_Log(MESSAGE_SOURCE, `Successfully connected to background.js`);
            
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
                    `Somehow program is confused which step to do next.\n\n` +
                    `autoImport: ${autoImport}\nautoMerge: ${autoMerge}\n` +
                    `autoArchive: ${autoArchive}\n\nOnly one should be true.`
                );
                return;
            }
            
            // if any flag is true, start automatically analyzing results!
            if (autoImport || autoMerge || autoArchive) {
                analyzeSearchResult( clientNum );
            }
            else {} // do nothing if no automatic process set
            break;

        case PCs.BKG_CS_START_IMPORT:
        case PCs.BKG_CS_START_MERGE:
            Utils_SendRedirectCode(port, 'SearchClientDetails/AdvancedSearch');
            break;
            
        default: // code not recognized - send error back
			Utils_SendPortCodeError(port, code, PCs.PORTNAME_CS_ADVANCED_SEARCH_RESULTS);
    }
});
