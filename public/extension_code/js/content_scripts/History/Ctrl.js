//----------------------------------------------------------------
//      NOTE: ONLY EDIT CODE IN /public/* - NOT IN /build/*
//----------------------------------------------------------------

// ===============================================================
//                           CONSTANTS
// ===============================================================
const MESSAGE_SOURCE = 'CtrlHistory';

// ===============================================================
//                          PORT CONNECT
// ===============================================================
const port = chrome.runtime.connect({ name: PCs.PORTNAME_CS_HISTORY });

// ===============================================================
//                         MAIN FUNCTIONS
// ===============================================================
const startImport = () => {
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
    const historyData = [];
    const tableBodyRowsSelector =
        FIELD_IDS_HISTORY[ACTION_TABLE_BODY_ROWS];
    document.querySelectorAll(tableBodyRowsSelector)
    .forEach(row => {
        // make new objects for each row
        const historyRowData = {};

        // get history data from specific row
        const tableBodyCellsFromRowsSelector =
            FIELD_IDS_HISTORY[ACTION_TABLE_BODY_CELLS_FROM_ROWS];
        row.querySelectorAll(tableBodyCellsFromRowsSelector)
        .forEach((cell, colIndex) => {
            // if there's no column name, skip this cell's data
            if (columnNames[colIndex] == '') {
                // do nothing - not a useful column
            }
            // add cell data (cell.innerText) to row object
            else {
                const cellData = cell.innerText;
                const cellMapName = columnNames[colIndex];
                // map data to columnNameMap in row data obj
                historyRowData[cellMapName] = cellData;
            }
        });
        
        // push row data onto historyData array
        historyData.push(historyRowData);
	});
	
	// data gathered, now send it back to background.js to store
    Utils_SendDataToBkg(port, MESSAGE_SOURCE, historyData);

	// Tell bkg to start import on next client!
	sendClientImportDone();
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

// ================================================================
//                          PORT LISTENERS
// ================================================================
port.onMessage.addListener(msg => {
    Utils_Log(MESSAGE_SOURCE, 'port msg received', msg);

    switch ( msg.code ) {
        case PCs.BKG_CS_INIT_PORT:
            Utils_Log(MESSAGE_SOURCE, `Successfully connected to background.js`);
            // if autoStart flag is true, start automatically!
            if (msg.autoStart) {
                startImport();
            }
            break;

        case PCs.BKG_CS_START_IMPORT:
			Utils_SendRedirectCode(port, 'SearchClientDetails/AdvancedSearch');
            break;

        default: // code not recognized - send error back
			Utils_SendPortCodeError(port, msg.code, PCs.PORTNAME_CS_HISTORY);
    }
});