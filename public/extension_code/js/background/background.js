//--------------------------------------------------------------
//     NOTE: ONLY EDIT CODE IN /public/* - NOT IN /build/*
//--------------------------------------------------------------

// ==============================================================================
//                         GLOBAL VARS & PORT HOLDERS
// ==============================================================================
let CSPort = null; // content script port
let RAPort = null; // react app port
let IMPORT_IN_PROGRESS = false; // data collect 'in progress' flag
let MERGE_IN_PROGRESS = false; // client merge 'in progress' flag
let ARCHIVE_IN_PROGRESS = false; // archiving final clients 'in progress' flag
let CLIENT_NUMS = null;
let CLIENT_INDEX = 0;
let CLIENT_DATA_CONTAINER = {};
let MERGED_DATA_CONTAINER = {};
let ERRORS = [];

const PORTNAME_HOLDER = [ // container for portnames
    PCs.PORTNAME_REACT_APP,
    PCs.PORTNAME_CS_ADVANCED_SEARCH,
    PCs.PORTNAME_CS_CLIENT_BASIC_INFORMATION,
    PCs.PORTNAME_CS_ADDRESSES,
    PCs.PORTNAME_CS_NOTES,
    PCs.PORTNAME_CS_RELATIVES,
    PCs.PORTNAME_CS_CONTACTS,
    PCs.PORTNAME_CS_FILES,
    PCs.PORTNAME_CS_HISTORY,
    PCs.PORTNAME_CS_REDIRECT
];

// ==============================================================================
//                               MAIN FUNCTIONS
// ==============================================================================
const storeClientData = (source, data) => {
    // initialize source container
    if (!CLIENT_DATA_CONTAINER[source])
        CLIENT_DATA_CONTAINER[source] = {};
    
    // loop through data, adding everything that's non-empty
    // -> to CLIENT_DATA_CONTAINER
    for (let [fieldName, value] of Object.entries(data)) {
        // initialize field array
        if (!CLIENT_DATA_CONTAINER[source][fieldName])
            CLIENT_DATA_CONTAINER[source][fieldName] = [];
        
        // add field value to container
        // CLIENT_DATA_CONTAINER[source][fieldName].push(value);
        CLIENT_DATA_CONTAINER[source][fieldName]
            [CLIENT_INDEX] = value;
    }
    
    // log update, just for info
    Utils_Log('BKG', 'New clnt data container:', CLIENT_DATA_CONTAINER);
}

// ==============================================================================
//                          MESSAGE POSTING FUNCTIONS
// ==============================================================================
// TODO: wrap post sending functions with port-not-found error messages
const sendPortInit = (port, code) => {
    // port should always exist, so don't handle other case
    port.postMessage({
        code: code,
        autoImport: IMPORT_IN_PROGRESS, // import should auto start (if true)
        autoMerge: MERGE_IN_PROGRESS, // merge should auto start (if true)
        clientNum: (IMPORT_IN_PROGRESS || MERGE_IN_PROGRESS)
            ? CLIENT_NUMS[CLIENT_INDEX] : null,
        mergeData: MERGE_IN_PROGRESS ? MERGED_DATA_CONTAINER : null
    });
}

const sendStartImport = (port) => {
    // TODO: handle invalid / unknown port
    // CLIENT_INDEX out of bounds (import complete) handled in
    // -> CSPort listener -> PCs.CS_BKG_CLIENT_IMPORT_DONE
    port.postMessage({
        code: PCs.BKG_CS_START_IMPORT,
        clientNum: CLIENT_NUMS[CLIENT_INDEX]
    });
}

const sendStartMerge = (port) => {
    // TODO: handle invalid / unknown port
    port.postMessage({
        code: PCs.BKG_CS_START_MERGE,
        clientNum: CLIENT_NUMS[CLIENT_INDEX]
    });
}

const sendImportErrorToReactApp = (port, message) => {
    // TODO: handle invalid / unknown port
    // TODO: maybe send error array (ERRORS) to React
    port.postMessage({
        code: PCs.BKG_RA_STOP_IMPORT_WITH_ERROR,
        message: message
    });
}

const sendImportDone = (port, clientData) => {
    // TODO: handle invalid / unknown port
    port.postMessage({
        code: PCs.BKG_RA_IMPORT_DONE,
        data: clientData
    });
}

// ==============================================================================
//                           PORT MESSAGE LISTENERS
// ==============================================================================
const initContentScriptPort = (port) => {
    // If content script port already has been initialized, skip setting new listener
    if (CSPort) {
        console.warn('Tried initializing CSPort, even though already exists. Skipping');
        return;
    }

    // send init message to either port
    sendPortInit(
        port, PCs.BKG_CS_INIT_PORT,
        IMPORT_IN_PROGRESS, MERGE_IN_PROGRESS
    );

    // set global content script port holder
    CSPort = port;

    port.onMessage.addListener(function(msg, MessageSender) {
        console.log('<background.js> content script port msg received', msg);

        switch(msg.code) {
            case PCs.CS_BKG_STOP_IMPORT:
                IMPORT_IN_PROGRESS = false;
                sendImportErrorToReactApp(RAPort, msg.message);
                break;

            case PCs.CS_BKG_PAGE_REDIRECT:
                const msgTabId = MessageSender.sender.tab.id;
                const url = 'http://rips.247lib.com/Stars/' + msg.urlPart
                chrome.tabs.update(msgTabId, { url: url });
                break;

            case PCs.CS_BKG_DATA_RECEIVED:
                storeClientData(msg.source, msg.data);
                break;

            case PCs.CS_BKG_CLIENT_IMPORT_DONE:
                // check if import should keep going
                if (CLIENT_NUMS && CLIENT_INDEX+1 < CLIENT_NUMS.length) {
                    // increment client index
                    CLIENT_INDEX++;
                    IMPORT_IN_PROGRESS = true; // no change
                    sendStartImport(CSPort);
                }
                // else, import should stop & analysis should be done
                else {
                    IMPORT_IN_PROGRESS = false;
                    sendImportDone(RAPort, CLIENT_DATA_CONTAINER);
                    // console.warn('TMP - ALL ALL DONE??', CLIENT_DATA_CONTAINER);
                }
                break;

            case PCs.CS_BKG_ERROR_CODE_NOT_RECOGNIZED:
                // console.error(`${msg.source} - ${msg.data}`);
                // IMPORT_IN_PROGRESS = false;
                break;

            // case CS_BKG_ERROR_HOW_TO_CONTINUE:
                // console.error(`Too many '>' elems found on rips page!`);
                // IMPORT_IN_PROGRESS = false;
                // break;
            
            default: // code not recognized - send error back
                IMPORT_IN_PROGRESS = false;
                Utils_SendPortCodeError(port, msg.code, PCs.PORTNAME_REACT_APP);
        }
    });

    port.onDisconnect.addListener(removedPort => {
        console.log(`Port <${removedPort.name}> disconnected`);
        CSPort = null;
    });
}

const initReactAppPort = (port) => {
    // If react app port already has been initialized, skip setting new listener
    if (RAPort) {
        console.warn('Tried initializing RAPort, even though already exists. Skipping');
        return;
    }

    // TODO: send pre-existing errors to react on port init!
    // TODO: also send client data? just in case options page closes?
    // send init message to either port
    sendPortInit(port, PCs.BKG_RA_INIT_PORT);

    // set global react app port holder
    RAPort = port;

    port.onMessage.addListener(function(msg) {
        console.log('<background.js> react app port msg received', msg);

        switch(msg.code) {
            case PCs.RA_BKG_START_IMPORT:
                IMPORT_IN_PROGRESS = true;
                CLIENT_NUMS = msg.clientNums.filter(n => n.trim() !== '');
                CLIENT_INDEX = 0;
                sendStartImport(CSPort);
                break;

            case PCs.RA_BKG_START_MERGE:
                const {
                    data: mergeData, clientNums
                } = msg;
                // 1) set merge in progress to true
                MERGE_IN_PROGRESS = true;
                IMPORT_IN_PROGRESS = false;
                // 2) store merge data to global
                MERGED_DATA_CONTAINER = mergeData;
                // 3) set client globals (nums arr & index)
                CLIENT_NUMS = msg.clientNums.filter(n => n.trim() !== '');
                CLIENT_INDEX = 0;
                // 4) navigate to advanced search to begin the merge
                sendStartMerge(CSPort);
                break;

            case PCs.RA_BKG_ERROR_BKG_CODE_NOT_RECOGNIZED:
                IMPORT_IN_PROGRESS = false;
                // console.error(`Code sent to React <${msg.errCode}> not recognized`);
                break;

            default: // code not recognized - send error back
                IMPORT_IN_PROGRESS = false;
                Utils_SendPortCodeError(port, msg.code, PCs.PORTNAME_REACT_APP);
        }
    });

    port.onDisconnect.addListener(removedPort => {
        console.log(`Port <${removedPort.name}> disconnected`);
        RAPort = null;

        IMPORT_IN_PROGRESS = false;
    });
}

// ==============================================================================
//                          PORT CONNECTION LISTENER
// ==============================================================================
chrome.runtime.onConnect.addListener(port => {
    console.assert( PORTNAME_HOLDER.includes(port.name) );
    Utils_Log('BKG',`Port <${port.name}> connected!`);
    
    switch (port.name) {
        case PCs.PORTNAME_CS_ADVANCED_SEARCH:
        case PCs.PORTNAME_CS_CLIENT_BASIC_INFORMATION:
        case PCs.PORTNAME_CS_ADDRESSES:
        case PCs.PORTNAME_CS_NOTES:
        case PCs.PORTNAME_CS_RELATIVES:
        case PCs.PORTNAME_CS_CONTACTS:
        case PCs.PORTNAME_CS_FILES:
        case PCs.PORTNAME_CS_HISTORY:
        case PCs.PORTNAME_CS_REDIRECT:
            // init content script port listener
            initContentScriptPort( port );
            break;

        case PCs.PORTNAME_REACT_APP:
            // init react app port listener
            initReactAppPort( port );
            break;
        
        default:
            IMPORT_IN_PROGRESS = false;
            Utils_Log(
                'BKG',
                "ERR: somehow connecting port isn't recognized, but we said assert!",
                port
            );
    }
});