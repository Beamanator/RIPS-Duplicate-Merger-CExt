//----------------------------------------------------------------
//      NOTE: ONLY EDIT CODE IN /public/* - NOT IN /build/*
//----------------------------------------------------------------

// ===============================================================
//                           CONSTANTS
// ===============================================================
const MESSAGE_SOURCE = RIPS_PAGE_KEYS.HISTORY;

// ===============================================================
//                          PORT CONNECT
// ===============================================================
const port = chrome.runtime.connect({ name: PCs.PORTNAME_CS_HISTORY });

// ===============================================================
//                         MAIN FUNCTIONS
// ===============================================================
const getPageDataContainer = () => {
	const columnNames = [];
    const columnNameMap = {
        'Date/Time of Action': ACTION_DATE,
        'Action': ACTION_NAME,
        'Service': ACTION_SERVICE,
        'Caseworker': ACTION_CASEWORKER,
		'Attendance Note': ACTION_NOTES,
		'Note?': '',
		'Created By': '',
		'Entered By': '',
		'Team': '',
		'Major Action?': '',
        '': ''
    }
    
    const actionsToSkip = [
        'Service closed',
        'Service was closed - reopened at the later date'
    ]
	
	// populate column names array
    const tableHeaderCellsSelector =
        FIELD_IDS_HISTORY[ACTION_TABLE_HEADER_CELLS];
    document.querySelectorAll(tableHeaderCellsSelector)
    .forEach(cell => {
        const cellName = cell.innerText.trim();
        
        // push all mapped column names to columnNames array
        const mappedName = columnNameMap[cellName];

        if (mappedName === undefined) {
            // TODO: throw error, stop the import - mapping failed
            const err = `Cell "${cellName}" failed to map!`;
            Utils_Error(MESSAGE_SOURCE, err);
        } else {
            columnNames.push(mappedName);
        }
	});
	
	// search through history data and send to bkg
    const historyData = {};
    const tableBodyRowsSelector =
        FIELD_IDS_HISTORY[ACTION_TABLE_BODY_ROWS];
    document.querySelectorAll(tableBodyRowsSelector)
    .forEach(row => {
        // make new objects for each row
        const historyRowData = {};
        
        // store actionName for each row
        let actionName = '';

        // get history data from specific row
        const tableBodyCellsFromRowsSelector =
            FIELD_IDS_HISTORY[ACTION_TABLE_BODY_CELLS_FROM_ROWS];
        row.querySelectorAll(tableBodyCellsFromRowsSelector)
        .forEach((cell, colIndex) => {
            // if there's no column name, skip this cell's data
            if (columnNames[colIndex] == '') {
                // do nothing - not a useful column
            }
            // add cell data to row object
            else {
                const cellData = cell.innerText.trim();
                const cellMapName = columnNames[colIndex];
                // map data to columnNameMap in row data obj
                historyRowData[cellMapName] = cellData;

                // if cellMapName == ACTION_NAME, store action name
                if (cellMapName === ACTION_NAME) {
                    actionName = cellData;
                }
            }
        });

        // throw error if actionName wasn't found
        if (actionName == '') {
            // ERROR - somehow there wasn't anything listed in 
            // -> the ACTION_NAME column??
            let err = `Error! No Action Name found in row among` +
                ` rowData:`;
            Utils_Error(MESSAGE_SOURCE, err, historyRowData);
        }
        // throw warning if action name is not useful (and skip adding):
        // -> Service closed [6],
        // -> Service was closed - reopened at the later date [333]
        else if (actionsToSkip.includes(actionName) ) {
            let warn = `Warning: Found action ${actionName} which` +
                ` cannot be merged! Skipping :)`;
            Utils_Warn(MESSAGE_SOURCE, warn);
            return;
        }
        
        // add actionName to historyData if not present yet
        if (!historyData[actionName]) historyData[actionName] = [];
        // push row data onto history array
        historyData[actionName].push(historyRowData);
    });

    // return gathered actions!
    return historyData;
}

const startImport = () => {
    // first, get page data
    const historyData = getPageDataContainer();
	
	// data gathered, now send it back to background.js to store
    Utils_SendDataToBkg(port, MESSAGE_SOURCE, historyData);

	// Tell bkg to start import on next client!
	sendClientImportDone();
}

const startMerge = ( mData ) => {
    // first, get page data
    const currentHistoryData = getPageDataContainer();
    // pull out merge history data
    const mHistoryData = mData[MESSAGE_SOURCE];

    // create obj to hold missing history data
    const missingHistoryDataArr = [];

    // loop through current + merge data to find "missing" data
    mHistoryData.forEach(mActionObj => {	
        const actionName = mActionObj[ACTION_NAME];
    
        // check if there are currently actions with the same name
        const currentActionsSameName =
            currentHistoryData[actionName] || [];

        // -> assume no matches by default
        let anyActionMatch = false;

        // loop through current actions, looking for match to mActionObj
        currentActionsSameName.forEach(cActionObj => {
            // quit early if possible
            if (anyActionMatch) return;

            // assume match by default
            let actionMatch = true;

            // loop through keys of current action object
            Object.entries(cActionObj).forEach(([cKey, cVal]) => {
                // check if key / value pair does NOT match exactly
                // -> from mActionObj
                const mVal = mActionObj[cKey];
                // technically '' and undefined will not match,
                // -> but are falsy (empty) so I want to treat
                // -> them as the same 
                if (!mVal && !cVal) {
                    // do nothing (keep actionMatch = true)
                }
                // now any mismatch means actions are different!
                else if (mVal !== cVal) {
                    actionMatch = false;
                }
            });

            // if actionMatch is true, set anyActionMatch to true
            if (actionMatch) anyActionMatch = true;
        });

        // if no match, action doesn't exist yet so add to arr!
        if (!anyActionMatch) {
            missingHistoryDataArr.push(mActionObj);
        }
    });

    // if there are actions that are missing, add them!
    if (missingHistoryDataArr.length > 0) {
        // tell bkg we're ready to merge & send actions to merge
        sendHistoryDataToAddAndRedirect(missingHistoryDataArr);
    }
    // otherwise, we don't need to add an actions! woot! archive time!
    else {
        sendStartArchiveProcess();
    }
}

// ================================================================
//                     MESSAGE POSTING FUNCTIONS
// ================================================================
// Note: port codes come from "../js/portCodes.js"
const sendClientImportDone = () => {
	port.postMessage({
		code: PCs.CS_BKG_CLIENT_IMPORT_DONE
	});
}
const sendHistoryDataToAddAndRedirect = ( data ) => {
    port.postMessage({
        code: PCs.CS_BKG_ADD_MERGE_HISTORY_AND_REDIRECT,
        urlPart: 'ClientDetails/ClientServicesList',
        data: data
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
        code, mergeData, // mergeDataIndex,
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

            // if any auto flag is true, start automatically!
            if (autoImport) { startImport(); }
            if (autoMerge) { startMerge( mergeData ); }
            break;

        case PCs.BKG_CS_START_IMPORT:
        case PCs.BKG_CS_START_MERGE:
			Utils_SendRedirectCode(port, 'SearchClientDetails/AdvancedSearch');
            break;

        default: // code not recognized - send error back
			Utils_SendPortCodeError(port, code, PCs.PORTNAME_CS_HISTORY);
    }
});