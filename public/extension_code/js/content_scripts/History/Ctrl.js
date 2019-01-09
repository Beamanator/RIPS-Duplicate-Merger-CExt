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
const getPageDataContainer = () => new Promise((RESOLVE, REJECT) => {
	const columnNames = [];
    const columnNameMap = {
        'Date/Time of Action': ACTION_DATE,
        'Action': ACTION_NAME,
        'Service': ACTION_SERVICE,
        'Caseworker': ACTION_CASEWORKER,
		'Attendance Note': ACTION_NOTES,
        // every column mapped to an empty string (below) will be skipped
        'Note?': '',
		'Created By': '',
		'Entered By': '',
		'Team': '',
		'Major Action?': '',
        '': ''
    };
    
    const actionsToSkip = [
        'Service closed', // [6]
        'Service was closed - reopened at the later date' // [333]
    ];

    let lastActionNoteData = ''; // no action notes looked at yet
    const historyData = {};
	
	// populate column names array
    const tableHeaderCellsSelector =
        FIELD_IDS_HISTORY[ACTION_TABLE_HEADER_CELLS];
    Utils_QueryDocA(tableHeaderCellsSelector)
    .forEach(cell => {
        const cellName = cell.innerText.trim();
        
        // push all mapped column names to columnNames array
        const mappedName = columnNameMap[cellName];

        // error if no map found - maybe column name changed?
        if (mappedName === undefined) {
            // throw error, stop the import - mapping failed
            const err = `Header Cell "${cellName}" not handled properly! ` +
                'Check that var columnNameMap is set up correctly.';
            REJECT(err);
            // killall handled later
        } else {
            columnNames.push(mappedName);
        }
    });

    // analyze next history row
    analyzeHistoryRows = (rows, i=0) => {
        // create array of row promises that collect data 
        let rowDataCollectPromises = [];

        const tableBodyCellsFromRowsSelector = FIELD_IDS_HISTORY[ACTION_TABLE_BODY_CELLS_FROM_ROWS];
        // collect data from row at index i
        rows[i].querySelectorAll(tableBodyCellsFromRowsSelector)
        .forEach((cell, colIndex) => {
            // add promise to cell collection ALL BECAUSE extra-long-note
            // -> click / collecting is asynchronous :(
            rowDataCollectPromises.push(new Promise((resolve, reject) => {
                // if there's no column name, skip collecting this cell's data
                if (columnNames[colIndex] == '') { resolve('SKIP') }
                // else, we want this row! add cell data to row object
                else {
                    let cellData = cell.innerText.trim();
                    const cellMapName = columnNames[colIndex];
    
                    // if current cell is in ACTION_NAME column,
                    // -> save off action name
                    if (cellMapName === ACTION_NAME) {
                        actionName = cellData;
                        
                        if (actionName == '') {
                            // ERROR - somehow there wasn't anything listed in 
                            // -> the ACTION_NAME column??
                            let err = `Error! No Action Name found in row among` +
                                ` rowData:`;
                            Utils_Error(MESSAGE_SOURCE, err, rows[i]);
                            reject(err);
                            // killall handled later
                        }
                        // else unused action? -> taken care of below
                        // else { resolve(actionName) } // taken care of below
                    }
    
                    else if (cellMapName === ACTION_NOTES) {
                        // blank out notes if they're just the default
                        // -> action notes added by this auto merger utility
                        // -> (so in future action note duplicate checking, default
                        // -> notes will act the same as empty notes)
                        if (cellData === U_DEFAULT_ACTION_NOTE) {
                            cellData = '';
                        }
    
                        // action notes exist. if they're long enough, we
                        // -> have to click on the row to fetch the entire note
                        // -> from the database
                        // Note: max chars may be around 270, but need to use
                        // -> lower # as max b/c some chars like html don't
                        // -> display so aren't counted here, even they exist
                        // -> in the database.
                        else if (cellData.length > 150) {
                            // 1) click the row / cell (long notes show up
                            // -> asynchronously)
                            cell.click();

                            // get note textarea selector
                            const noteTextareaSelector = 
                                FIELD_IDS_HISTORY[ACTION_NOTES_TEXTAREA];

                            // 2) wait for textarea with notes to show up
                            Utils_WaitForCondition(
                                Utils_OnVarChanged, {
                                    origVar: lastActionNoteData,
                                    newVarElemSelector: noteTextareaSelector,
                                }, 250, 8
                            )
                            .then(() => {
                                // 3) collect data from new textarea with ALL notes
                                const noteTextarea = Utils_QueryDoc(noteTextareaSelector);
                                let longNote = noteTextarea.innerText;

                                // 4) update last action note data in case
                                // -> there's another long on note in history
                                lastActionNoteData = '';

                                // 5) delete the note element's data (in case there's
                                // -> duplicate actions with same notes)
                                noteTextarea.innerText = '';

                                // 6) close the textarea popup
                                const closeSelector = 
                                    FIELD_IDS_HISTORY[ACTION_NOTES_TEXTAREA_CLOSE];
                                const closeElem = Utils_QueryDoc(closeSelector);
                                closeElem.click();
                            
                                // 7) resolve promise w/ long note
                                resolve({ [cellMapName]: longNote });
                            })
                            .catch(err => {
                                // custom error message
                                let errMsg = `Cannot find textarea "${noteTextareaSelector}" ` +
                                    'OR var lastActionNoteData didnt change so cannot ' +
                                    'move on! Maybe internet is bad, maybe ' +
                                    'selector should be fixed, maybe code is broken. ' +
                                    'Its ALSO possible there are duplicate actions!';
                                Utils_Error(MESSAGE_SOURCE, errMsg, cellData);
                                alert(
                                    'Warning: Your internet connection ' +
                                    'may be a little bit slow. Please refresh the page now.' +
                                    '\n\nIf this message shows up multiple times, please ' +
                                    'contact the developer (the RIPS guy). Thanks!' +
                                    '\n\nNote for the developer:\nError message: ' + errMsg
                                );
                                // no rejection and therefore no killall b/c this may
                                // -> be an internet connection issue. If killall is called,
                                // -> all import / merge progress will be killed and have to
                                // -> start over. We don't want that, so we just ask user to
                                // -> refresh the page to try & re-start the program at the
                                // -> current step.
                                // reject(err);
                            })

                            return; // avoid resolving too early
                        }
                    }

                    // just resolve basic data here
                    resolve({ [cellMapName]: cellData });
                }
            }));
        });

        // collect all data from row, and decide what to do next
        Promise.all(rowDataCollectPromises)
        .then((rowData) => {
            // object to contain all props of this action
            let historyRowData = {};

            // filter 'skipped' columns
            rowData.filter(cellData => {
                return cellData !== 'SKIP';
            })
            // spread each cells's key & prop onto history row data object
            .forEach(actionProp => {
                historyRowData = {
                    ...historyRowData, // copy in previous props
                    ...actionProp      // add new action prop
                }
            });

            // throw warning if action name is not useful (and skip adding)
            const actionName = historyRowData[ACTION_NAME];
            if (actionsToSkip.includes(actionName) ) {
                let warn = `Warning: Found action ${actionName} which` +
                    ` cannot be merged! Skipping :)`;
                Utils_Warn(MESSAGE_SOURCE, warn);
                // DON'T add to historyData obj
            }
            // otherwise, useful action - add row data to historyData
            else {
                // add blank actionName arr to historyData if not present yet
                if (!historyData[actionName]) historyData[actionName] = [];
                // push row data onto history array
                historyData[actionName].push(historyRowData);
            }

            // ============ Now decide what to do next ============

            // if index out of bounds, analysis is done. return collected data
            if (i + 1 >= rows.length) RESOLVE(historyData);
            // not done yet - analyze next row
            else analyzeHistoryRows(rows, i + 1);
        })
        .catch(err => {
            Utils_Error(MESSAGE_SOURCE, err);
            REJECT(err);
            // killall handled later
        });
    };
	
	// collect history data
    const tableBodyRowsSelector = FIELD_IDS_HISTORY[ACTION_TABLE_BODY_ROWS];
    const rawHistoryRows = Utils_QueryDocA(tableBodyRowsSelector)
    
    // kick off recursive, async analysis of rows
    analyzeHistoryRows(rawHistoryRows);
});

const startImport = () => {
    // first, get page data
    getPageDataContainer().then(historyData => {
        // data gathered, now send it back to background.js to store
        Utils_SendDataToBkg(port, MESSAGE_SOURCE, historyData);
    
        // Tell bkg to start import on next client!
        sendClientImportDone();
    })
    .catch(err => {
        Utils_Error(MESSAGE_SOURCE, err);
        Utils_KillAll(port, MESSAGE_SOURCE, err);
    });
	
}

const startMerge = ( mData ) => {
    // get history data on client we're merging data into
    getPageDataContainer().then(currentHistoryData => {
        // get data we want to merge into client record
        const mHistoryData = mData[MESSAGE_SOURCE];
    
        // create arr to hold missing history data
        const missingHistoryDataArr = [];
    
        // loop through current + merge data to find "missing" data
        mHistoryData.forEach(mActionObj => {	
            const actionName = mActionObj[ACTION_NAME];
        
            // check if there are currently actions with the same name
            const currentActionsSameName =
                currentHistoryData[actionName] || [];
    
            // -> assume no matches by default
            let anyActionMatch = false;
    
            // loop through current actions with the same name as the action
            // -> we're trying to merge, looking for exact matches to potentially
            // -> ignore merging this action to the record
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
                    // technically '' and undefined aren't exactly the same,
                    // -> but both are falsy (empty) so I want to treat
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
            sendHistoryDataToBkgAddAndRedirect(missingHistoryDataArr);
        }
        // otherwise, we don't need to add an actions! woot! archive time!
        else {
            sendStartArchiveProcess();
        }
    })
    .catch(err => {
        Utils_Error(MESSAGE_SOURCE, err);
        Utils_KillAll(port, MESSAGE_SOURCE, err);
    });;
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
const sendHistoryDataToBkgAddAndRedirect = ( data ) => {
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