//----------------------------------------------------------------
//      NOTE: ONLY EDIT CODE IN /public/* - NOT IN /build/*
//----------------------------------------------------------------

// ===============================================================
//                           CONSTANTS
// ===============================================================
const MESSAGE_SOURCE = RIPS_PAGE_KEYS.ADDRESSES;

// ===============================================================
//                          PORT CONNECT
// ===============================================================
const port = chrome.runtime.connect({ name: PCs.PORTNAME_CS_ADDRESSES });

// ===============================================================
//                         MAIN FUNCTIONS
// ===============================================================
const startImport = () => {
    const columnNames = [];
    const columnNameMap = {
        'First Line of Address': FIRST_ADDRESS_LINE,
        'Telephone': ADDRESS_TELEPHONE,
        'From': ADDRESS_DATE_FROM,
        'Until': ADDRESS_DATE_TO,
        'Current?': '', // skip
        '': ''
    }

    // populate column names array
    const tableHeaderCellsSelector =
        FIELD_IDS_ADDRESSES[ADDRESS_TABLE_HEADER_CELLS];
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

    // search through address data and send to bkg
    const addresses = [];
    const tableBodyRowsSelector =
        FIELD_IDS_ADDRESSES[ADDRESS_TABLE_BODY_ROWS];
    document.querySelectorAll(tableBodyRowsSelector)
    .forEach(row => {
        // make new objects for each row
        const addressRowData = {};

        // get address data from specific row
        const tableBodyCellsFromRowsSelector =
            FIELD_IDS_ADDRESSES[ADDRESS_TABLE_BODY_CELLS_FROM_ROWS];
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
                addressRowData[cellMapName] = cellData;
            }
        });
        
        // push row data onto addresses array
        addresses.push(addressRowData);
    });

    // data gathered, now send it back to background.js to store
    const addressData = {
        [ADDRESSES]: addresses
    };
    Utils_SendDataToBkg(port, MESSAGE_SOURCE, addressData);

    // redirect to next page (Notes)
    Utils_SendRedirectCode(port, 'ClientDetails/ClientNotes');
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
		code, mergeData,
		autoImport, autoMerge,
		postSaveRedirectFlag
    } = msg;
    
    Utils_Log(MESSAGE_SOURCE, 'port msg received', msg);

    switch ( code ) {
        case PCs.BKG_CS_INIT_PORT:
            Utils_Log(MESSAGE_SOURCE, `Successfully connected to background.js`);
            
            // if flag is set to true, we already saved, so now we just
			// -> have to redirect the user to the next step!
			if (postSaveRedirectFlag) {
				Utils_SendRedirectCode(port, 'Addresses/Addresses');
				return;
			}

            // fail if multiple automatic triggers are true
            // -> (can't do > 1 thing at same time)
            if (autoImport && autoMerge) {
                Utils_Error(MESSAGE_SOURCE, 'Auto import / merge are both true! :(');
                return;
            }
            
            // if autoImport flag is true, start automatically!
            if (autoImport) { startImport(); }
            if (autoMerge) {
                // TODO: FIXME: here!
                console.error('WE HERE BABY');
                debugger;
            }
            break;

        case PCs.BKG_CS_START_IMPORT:
        case PCs.BKG_CS_START_MERGE:
			Utils_SendRedirectCode(port, 'SearchClientDetails/AdvancedSearch');
            break;

        default: // code not recognized - send error back
			Utils_SendPortCodeError(port, code, PCs.PORTNAME_CS_ADDRESSES);
    }
});