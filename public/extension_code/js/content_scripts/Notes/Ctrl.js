//----------------------------------------------------------------
//      NOTE: ONLY EDIT CODE IN /public/* - NOT IN /build/*
//----------------------------------------------------------------

// ===============================================================
//                           CONSTANTS
// ===============================================================
const MESSAGE_SOURCE = 'CtrlNotes';

// ===============================================================
//                          PORT CONNECT
// ===============================================================
const port = chrome.runtime.connect({ name: PCs.PORTNAME_CS_NOTES });

// ===============================================================
//                         MAIN FUNCTIONS
// ===============================================================
const startImport = () => {
    // get notes from html
    const notesSelector = FIELD_IDS_NOTES[NOTES];
    const notesElem = document.querySelector(notesSelector);
    const notesData = {
        [NOTES]: notesElem.value
    };

    // data gathered, now send it back to background.js to store
    Utils_SendDataToBkg(port, MESSAGE_SOURCE, notesData);

    // redirect to next page (Relatives - skipping Aliases)
    Utils_SendRedirectCode(port, 'Relatives/Relatives');
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
            // if autoImport flag is true, start automatically!
            if (msg.autoImport) {
                startImport();
            }
            break;

        case PCs.BKG_CS_START_IMPORT:
			Utils_SendRedirectCode(port, 'SearchClientDetails/AdvancedSearch');
            break;

        default: // code not recognized - send error back
			Utils_SendPortCodeError(port, msg.code, PCs.PORTNAME_CS_NOTES);
    }
});