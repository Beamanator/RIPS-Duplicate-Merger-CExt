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
    // TODO: get selectors from FIDs.js
    document.querySelectorAll('#gridContent table tbody tr').forEach(row => {
        // TODO: make new arrays for each row
        row.querySelectorAll('td').forEach(cell => {
            // TODO: add cells (cell.innerText) to arrays
            debugger;   
        })
    });
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