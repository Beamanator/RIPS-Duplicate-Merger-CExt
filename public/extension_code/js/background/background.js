//--------------------------------------------------------------
//     NOTE: ONLY EDIT CODE IN /public/* - NOT IN /build/*
//--------------------------------------------------------------

// ==============================================================================
//                         GLOBAL VARS & PORT HOLDERS
// ==============================================================================
let CSPortContainer = {}; // content script port container
let RAPort = null; // react app port (only 1 allowed)
let ARCHIVE_IN_PROGRESS = false; // archiving final clients 'in progress' flag
let IMPORT_IN_PROGRESS = false; // data collect 'in progress' flag
let MERGE_IN_PROGRESS = false; // client merge 'in progress' flag
let POST_ARCHIVE_REDIRECT_FLAG = false; // flat: if true, archive just happened, next = redirect
let POST_SAVE_REDIRECT_FLAG = false; // flag: if true, save just happened, next = redirect
let CLIENT_NUMS = null;
let CLIENT_INDEX = 0;
let MERGED_DATA_INDEX = 0; // for arrays of addresses, contacts, NOT ACTIONS
let CLIENT_DATA_CONTAINER = {};
let MERGED_DATA_CONTAINER = {};
let MERGE_HISTORY_DATA = null;
let MERGE_HISTORY_INDEX = 0; // for ACTIONS only
let SERVICE_TO_CREATE = null;
let ACTION_TO_CREATE = null;
let ERRORS = [];

const PORTNAME_HOLDER = [ // container for portnames
    PCs.PORTNAME_REACT_APP,
    PCs.PORTNAME_CS_ADD_ACTION,
    PCs.PORTNAME_CS_ADDRESSES,
    PCs.PORTNAME_CS_ADVANCED_SEARCH,
    PCs.PORTNAME_CS_ADVANCED_SEARCH_RESULTS,
    PCs.PORTNAME_CS_CLIENT_BASIC_INFORMATION,
    PCs.PORTNAME_CS_CONTACTS,
    PCs.PORTNAME_CS_FILES,
    PCs.PORTNAME_CS_HISTORY,
    PCs.PORTNAME_CS_NEW_SERVICE,
    PCs.PORTNAME_CS_NOTES,
    PCs.PORTNAME_CS_REDIRECT,
    PCs.PORTNAME_CS_RELATIVES,
    PCs.PORTNAME_CS_SERVICES,
    PCs.PORTNAME_CS_VIEW_ACTIONS,
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

const redirectTab = ( tabId, urlPart ) => {
    Utils_Log('BKG', 'Redirecting user to ' + urlPart);

    // add url part to basic RIPS url
    const url = 'http://rips.247lib.com/Stars/' + urlPart
    
    POST_SAVE_REDIRECT_FLAG = false;
    POST_ARCHIVE_REDIRECT_FLAG = false;
    MERGED_DATA_INDEX = 0;
    
    // update given tab's url
    chrome.tabs.update(tabId, { url: url });
}

// ==============================================================================
//                          MESSAGE POSTING FUNCTIONS
// ==============================================================================
// TODO: wrap post sending functions with port-not-found error messages
const sendPortInit = (port, code) => {
    // port should always exist, so don't handle other case
    port.postMessage({
        code: code,
        autoArchive: ARCHIVE_IN_PROGRESS, // archiving should auto start (if true)
        autoImport: IMPORT_IN_PROGRESS, // import should auto start (if true)
        autoMerge: MERGE_IN_PROGRESS, // merge should auto start (if true)
        clientNum: (IMPORT_IN_PROGRESS || MERGE_IN_PROGRESS || ARCHIVE_IN_PROGRESS)
            ? CLIENT_NUMS[CLIENT_INDEX] : null,
        mergeData: MERGE_IN_PROGRESS ? MERGED_DATA_CONTAINER : null,
        mergeHistoryData: MERGE_HISTORY_DATA ? MERGE_HISTORY_DATA : null,
        postArchiveRedirectFlag: POST_ARCHIVE_REDIRECT_FLAG,
        postSaveRedirectFlag: POST_SAVE_REDIRECT_FLAG,
        mergeDataIndex: MERGE_IN_PROGRESS ? MERGED_DATA_INDEX : null,
        mergeHistoryIndex: MERGE_HISTORY_INDEX,
        serviceToCreate: SERVICE_TO_CREATE,
        actionToCreate: ACTION_TO_CREATE,
    });
}

const sendStartImport = (portname) => {
    let port = null;

    // if no portname passed, find a connected port and use it!
    if (!portname) {
        // get first port inside container
        let firstPort = Object.entries(CSPortContainer)[0];

        // error if no port exists!
        if (!firstPort) {
            // TODO: throw error back to React?
            let errMsg = 'Tried starting import, but no ports available to' +
                ' connect to! Why??';
            Utils_Error('BKG', errMsg);
        }

        // set port variable from first element in container
        port = firstPort[1];
    }
    // else, use named port from container
    else port = CSPortContainer[portname];

    // TODO: handle invalid / unknown port
    if (!port) {
        // throw error
        let errMsg = `Somehow port with name ${portname} not found :(`;
        Utils_Error('BKG', errMsg);
    } else {
        // CLIENT_INDEX out of bounds (import complete) handled in
        // -> CSPort listener -> PCs.CS_BKG_CLIENT_IMPORT_DONE
        port.postMessage({
            code: PCs.BKG_CS_START_IMPORT,
            clientNum: CLIENT_NUMS[CLIENT_INDEX]
        });
    }
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
    const portname = port.name;

    // If content script port already has been initialized, skip setting new listener
    if (CSPortContainer[portname]) {
        let errMsg = `Tried initializing CSPortContainer[${portname}]` +
            ', but it already exists! Skipping...';
        Utils_Warn('BKG', errMsg);
        return;
    }

    // send init message to either port
    sendPortInit(
        port, PCs.BKG_CS_INIT_PORT
    );

    // set global content script port container
    CSPortContainer[portname] = port;

    port.onMessage.addListener(function(msg, MessageSender) {
        console.log('<background.js> content script port msg received', msg);

        switch(msg.code) {
            case PCs.CS_BKG_ADD_NEXT_ACTION:
                ACTION_TO_CREATE = msg.data;
                redirectTab(
                    MessageSender.sender.tab.id,
                    'MatterAction/CreateNewAction'
                );
                // increment history index so next time in View Actions,
                // -> next action will be sent back here
                MERGE_HISTORY_INDEX++;
                break;

            case PCs.CS_BKG_ADD_MERGE_HISTORY_AND_REDIRECT:
                MERGE_HISTORY_DATA = msg.data;
                redirectTab(
                    MessageSender.sender.tab.id,
                    msg.urlPart
                );
                break;

            case PCs.CS_BKG_STOP_IMPORT:
                IMPORT_IN_PROGRESS = false;
                sendImportErrorToReactApp(RAPort, msg.message);
                break;

            // Note: If index is out of range of CLIENT_NUMS, the
            // -> unknown clientNum is handled in advanced search Ctrl
            case PCs.CS_BKG_ARCHIVE_NEXT_CLIENT:
                CLIENT_INDEX++;
                break;

            case PCs.CS_BKG_START_ARCHIVE:
                // 1) set client index to 1 since we'll start archiving
                //    -> with the second client (index 1 = position 2)
                CLIENT_INDEX = 1;

                // 2) set 'archive' state
                ARCHIVE_IN_PROGRESS = true;
                IMPORT_IN_PROGRESS = false; // probably not necessary...
                MERGE_IN_PROGRESS = false;

                // 3) clear all data (except #s to archive)
                CLIENT_DATA_CONTAINER = {};
                MERGED_DATA_CONTAINER = {};
                MERGE_HISTORY_DATA = null;
                SERVICE_TO_CREATE = null;
                ACTION_TO_CREATE = null;
                
                // 4) redirect to advanced search to start archiving
                redirectTab(
                    MessageSender.sender.tab.id,
                    'SearchClientDetails/AdvancedSearch'
                );
                break;

            case PCs.CS_BKG_PAGE_REDIRECT:
                redirectTab(
                    MessageSender.sender.tab.id,
                    msg.urlPart
                );
                break;

            case PCs.CS_BKG_DATA_RECEIVED:
                storeClientData(msg.source, msg.data);
                break;

            case PCs.CS_BKG_CLIENT_IMPORT_DONE:
                // check if import should keep going
                if (CLIENT_NUMS && CLIENT_INDEX+1 < CLIENT_NUMS.length) {
                    // increment client index
                    CLIENT_INDEX = 1;
                    // FIXME: why still in progress?
                    IMPORT_IN_PROGRESS = true; // no change
                    sendStartImport(portname);
                }
                // else, import should stop & analysis should be done
                else {
                    IMPORT_IN_PROGRESS = false;
                    sendImportDone(RAPort, CLIENT_DATA_CONTAINER);
                    // console.warn('TMP - ALL ALL DONE??', CLIENT_DATA_CONTAINER);
                }
                break;

            case PCs.CS_BKG_POST_SAVE_REDIRECT:
                POST_SAVE_REDIRECT_FLAG = true;
                break;

            case PCs.CS_BKG_POST_ARCHIVE_REDIRECT:
                POST_ARCHIVE_REDIRECT_FLAG = true;
                break;

            case PCs.CS_BKG_INCREMENT_MERGE_DATA_INDEX:
                MERGED_DATA_INDEX++;
                Utils_Log('BKG', 'Incrementing merge data index!', MERGED_DATA_INDEX);
                break;

            case PCs.CS_BKG_ADD_MISSING_SERVICES:
                SERVICE_TO_CREATE = msg.data;
                break;

            case PCs.CS_BKG_ERROR_CODE_NOT_RECOGNIZED:
                // console.error(`${msg.source} - ${msg.data}`);
                // IMPORT_IN_PROGRESS = false;
                break;
            
            default: // code not recognized - send error back
                IMPORT_IN_PROGRESS = false;
                Utils_SendPortCodeError(port, msg.code, PCs.PORTNAME_REACT_APP);
        }
    });

    port.onDisconnect.addListener(removedPort => {
        const portname = removedPort.name;
        console.log(`Port <${portname}> disconnected`);
        CSPortContainer[portname] = null;
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
                sendStartImport();
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
                CLIENT_NUMS = clientNums.filter(n => n.trim() !== '');
                CLIENT_INDEX = 0;
                // 4) navigate to advanced search to begin the merge
                sendStartMerge();
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
        case PCs.PORTNAME_CS_ADD_ACTION:
        case PCs.PORTNAME_CS_ADDRESSES:
        case PCs.PORTNAME_CS_ADVANCED_SEARCH:
        case PCs.PORTNAME_CS_ADVANCED_SEARCH_RESULTS:
        case PCs.PORTNAME_CS_CLIENT_BASIC_INFORMATION:
        case PCs.PORTNAME_CS_CONTACTS:
        case PCs.PORTNAME_CS_FILES:
        case PCs.PORTNAME_CS_HISTORY:
        case PCs.PORTNAME_CS_NEW_SERVICE:
        case PCs.PORTNAME_CS_NOTES:
        case PCs.PORTNAME_CS_REDIRECT:
        case PCs.PORTNAME_CS_RELATIVES:
        case PCs.PORTNAME_CS_SERVICES:
        case PCs.PORTNAME_CS_VIEW_ACTIONS:
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