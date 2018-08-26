//----------------------------------------------------------------
//      NOTE: ONLY EDIT CODE IN /public/* - NOT IN /build/*
//----------------------------------------------------------------

// ===============================================================
//                           CONSTANTS
// ===============================================================
const MESSAGE_SOURCE = 'CtrlAddresses';

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
        'Current?': '',
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
    const addressData = [];
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
        
        // push row data onto addressData array
        addressData.push(addressRowData);
    });

    // data gathered, now send it back to background.js to store
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
			Utils_SendPortCodeError(port, msg.code, PCs.PORTNAME_CS_ADDRESSES);
    }
});