//--------------------------------------------------------------
//     NOTE: ONLY EDIT CODE IN /public/* - NOT IN /build/*
//--------------------------------------------------------------

// ==============================================================================
//                         GLOBAL VARS & PORT HOLDERS
// ==============================================================================
let CSPort = null; // content script port (only 1 allowed)
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

const PORTNAME_HOLDER = [
    // container for portnames
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
    PCs.PORTNAME_CS_PRE_LOGIN,
    PCs.PORTNAME_CS_REDIRECT,
    PCs.PORTNAME_CS_RELATIVES,
    PCs.PORTNAME_CS_SERVICES,
    PCs.PORTNAME_CS_VIEW_ACTIONS,
];

const MISSING_PORT_ERROR_MSG =
    "Background port not found! Make " +
    "sure there's no other errors, or race condition didn't happen.";

// ==============================================================================
//                               MAIN FUNCTIONS
// ==============================================================================
const storeClientData = (source, data) => {
    // initialize source container
    if (!CLIENT_DATA_CONTAINER[source]) CLIENT_DATA_CONTAINER[source] = {};

    // loop through data, adding everything that's non-empty
    // -> to CLIENT_DATA_CONTAINER
    // -> fieldName are page keys like 'Files', 'Notes', 'action1',
    // -> 'action2', ... etc
    for (let [fieldName, value] of Object.entries(data)) {
        // initialize field array
        if (!CLIENT_DATA_CONTAINER[source][fieldName]) {
            // create blank array of length equal to # of clients
            let blankArr = new Array(CLIENT_NUMS.length);
            // populate field with blank array
            CLIENT_DATA_CONTAINER[source][fieldName] = blankArr;
        }

        // add field value to container at current client index location
        CLIENT_DATA_CONTAINER[source][fieldName][CLIENT_INDEX] = value;
    }

    // log update, just for info
    Utils_Log("BKG", "New clnt data container:", CLIENT_DATA_CONTAINER);
};

const redirectTab = (tabId, urlPart) => {
    Utils_Log("BKG", "Redirecting user to " + urlPart);

    // add url part to basic RIPS url
    const url = "https://rips.247lib.com/Stars/" + urlPart;

    POST_SAVE_REDIRECT_FLAG = false;
    POST_ARCHIVE_REDIRECT_FLAG = false;
    MERGED_DATA_INDEX = 0;

    // update given tab's url
    chrome.tabs.update(tabId, { url: url });
};

const highlightTab = (sourcePort, callback) => {
    if (!callback) {
        callback = (param) => {
            console.warn("redirect to tab index #" + tabIndex, param);
        };
    }

    if (!sourcePort) {
        callback("No source port available! Bad news...");
        return;
    }

    // highlight tab / make specified tab index focused / visible
    // -> (basically, open a specified tab for the user)
    // first get Tab object from id
    chrome.tabs.get(sourcePort.sender.tab.id, (Tab) => {
        // next highlight the desired tab, by the Tab's id
        chrome.tabs.highlight(
            {
                tabs: Tab.index,
            },
            callback
        );
    });
};

// ==============================================================================
//                          MESSAGE POSTING FUNCTIONS
// ==============================================================================
const sendPortInit = (port, code) => {
    if (!port) Utils_Error("BKG", MISSING_PORT_ERROR_MSG);
    port.postMessage({
        code: code,
        autoArchive: ARCHIVE_IN_PROGRESS, // archiving should auto start (if true)
        autoImport: IMPORT_IN_PROGRESS, // import should auto start (if true)
        autoMerge: MERGE_IN_PROGRESS, // merge should auto start (if true)
        clientNum:
            IMPORT_IN_PROGRESS || MERGE_IN_PROGRESS || ARCHIVE_IN_PROGRESS
                ? CLIENT_NUMS[CLIENT_INDEX]
                : null,
        mergeData: MERGE_IN_PROGRESS ? MERGED_DATA_CONTAINER : null,
        mergeHistoryData: MERGE_HISTORY_DATA ? MERGE_HISTORY_DATA : null,
        postArchiveRedirectFlag: POST_ARCHIVE_REDIRECT_FLAG,
        postSaveRedirectFlag: POST_SAVE_REDIRECT_FLAG,
        mergeDataIndex: MERGE_IN_PROGRESS ? MERGED_DATA_INDEX : null,
        mergeHistoryIndex: MERGE_HISTORY_INDEX,
        serviceToCreate: SERVICE_TO_CREATE,
        actionToCreate: ACTION_TO_CREATE,
    });
};

// Note: CLIENT_INDEX out of bounds (import complete) handled in
// -> CSPort listener -> PCs.CS_BKG_CLIENT_IMPORT_DONE
const sendStartImport = (port) => {
    if (!port) Utils_Error("BKG", MISSING_PORT_ERROR_MSG);
    port.postMessage({
        code: PCs.BKG_CS_START_IMPORT,
        clientNum: CLIENT_NUMS[CLIENT_INDEX],
    });
};

const sendStartMerge = (port) => {
    if (!port) Utils_Error("BKG", MISSING_PORT_ERROR_MSG);
    port.postMessage({
        code: PCs.BKG_CS_START_MERGE,
        clientNum: CLIENT_NUMS[CLIENT_INDEX],
    });
};

const sendImportDone = (port, clientData) => {
    if (!port) Utils_Error("BKG", MISSING_PORT_ERROR_MSG);
    port.postMessage({
        code: PCs.BKG_RA_IMPORT_DONE,
        data: clientData,
    });
};

const sendArchiveDone = (port) => {
    if (!port) Utils_Error("BKG", MISSING_PORT_ERROR_MSG);
    port.postMessage({
        code: PCs.BKG_RA_ARCHIVE_DONE,
    });
};

const sendKillAll = (port, source, error) => {
    if (!port) Utils_Error("BKG", MISSING_PORT_ERROR_MSG);
    port.postMessage({
        code: PCs.BKG_RA_KILL_ALL,
        source: source,
        error: error,
    });
};

const sendNoRIPSTabs = (port) => {
    if (!port) Utils_Error("BKG", MISSING_PORT_ERROR_MSG);
    port.postMessage({
        code: PCs.BKG_RA_NO_RIPS_TABS,
    });
};

const sendRALoginReminder = (port) => {
    if (!port) Utils_Error("BKG", MISSING_PORT_ERROR_MSG);
    port.postMessage({
        code: PCs.BKG_RA_LOGIN_REMINDER,
    });
};

// ==============================================================================
//                           PORT MESSAGE LISTENERS
// ==============================================================================
const initContentScriptPort = (port) => {
    // If content script port already has been initialized,
    // -> skip setting new listener
    if (CSPort) {
        console.warn(
            "Tried initializing CSPort, even though already exists. Skipping"
        );
        return;
    }

    // send init message to either port
    sendPortInit(port, PCs.BKG_CS_INIT_PORT);

    // set global content script port container
    CSPort = port;

    port.onMessage.addListener(function(msg, MessageSender) {
        console.log("<background.js> content script port msg received", msg);

        switch (msg.code) {
            case PCs.CS_BKG_ADD_NEXT_ACTION:
                ACTION_TO_CREATE = msg.data;
                redirectTab(
                    MessageSender.sender.tab.id,
                    "MatterAction/CreateNewAction"
                );
                // increment history index so next time in View Actions,
                // -> next action will be sent back here
                MERGE_HISTORY_INDEX++;
                break;

            case PCs.CS_BKG_ADD_MERGE_HISTORY_AND_REDIRECT:
                MERGE_HISTORY_DATA = msg.data;
                redirectTab(MessageSender.sender.tab.id, msg.urlPart);
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
                MERGE_HISTORY_INDEX = 0;
                SERVICE_TO_CREATE = null;
                ACTION_TO_CREATE = null;

                // 4) redirect to advanced search to start archiving
                redirectTab(
                    MessageSender.sender.tab.id,
                    "SearchClientDetails/AdvancedSearch"
                );
                break;

            case PCs.CS_BKG_ARCHIVE_NEXT_CLIENT:
                CLIENT_INDEX++;
                // if client index out of bounds (no more clients left to archive)
                // -> stop the archiving and highlight the options page
                if (CLIENT_INDEX >= CLIENT_NUMS.length) {
                    ARCHIVE_IN_PROGRESS = false;
                    // send a note back up!
                    sendArchiveDone(RAPort);
                    // highlight options page
                    highlightTab(RAPort);
                }
                break;

            case PCs.CS_BKG_PAGE_REDIRECT:
                redirectTab(MessageSender.sender.tab.id, msg.urlPart);
                break;

            case PCs.CS_BKG_DATA_RECEIVED:
                storeClientData(msg.source, msg.data);
                break;

            case PCs.CS_BKG_CLIENT_IMPORT_DONE:
                // check if import should keep going
                if (CLIENT_NUMS && CLIENT_INDEX + 1 < CLIENT_NUMS.length) {
                    // increment client index
                    CLIENT_INDEX++;
                    sendStartImport(CSPort);
                }
                // else, import should stop & analysis should be done
                else {
                    IMPORT_IN_PROGRESS = false;
                    sendImportDone(RAPort, CLIENT_DATA_CONTAINER);
                    // open / focus options page since import is done
                    highlightTab(RAPort);
                }
                break;

            case PCs.CS_BKG_KILL_ALL:
                IMPORT_IN_PROGRESS = false;
                MERGE_IN_PROGRESS = false;
                ARCHIVE_IN_PROGRESS = false;

                sendKillAll(RAPort, msg.source, msg.error);
                // open / focus options page since error occurred
                highlightTab(RAPort);
                break;

            case PCs.CS_BKG_POST_SAVE_REDIRECT:
                POST_SAVE_REDIRECT_FLAG = true;
                break;

            case PCs.CS_BKG_POST_ARCHIVE_REDIRECT:
                POST_ARCHIVE_REDIRECT_FLAG = true;
                break;

            case PCs.CS_BKG_INCREMENT_MERGE_DATA_INDEX:
                MERGED_DATA_INDEX++;
                Utils_Log(
                    "BKG",
                    "Incrementing merge data index!",
                    MERGED_DATA_INDEX
                );
                break;

            case PCs.CS_BKG_ADD_MISSING_SERVICES:
                SERVICE_TO_CREATE = msg.data;
                break;

            case PCs.CS_BKG_ERROR_CODE_NOT_RECOGNIZED:
                // console.error(`${msg.source} - ${msg.data}`);
                IMPORT_IN_PROGRESS = false;
                // TODO: stop everything?
                // TODO: highlight react app?
                break;

            case PCs.CS_BKG_LOGIN_REMINDER:
                IMPORT_IN_PROGRESS = false;
                MERGE_IN_PROGRESS = false;
                sendRALoginReminder(RAPort);
                highlightTab(RAPort);
                break;

            default:
                // code not recognized - send error back
                IMPORT_IN_PROGRESS = false;
                Utils_SendPortCodeError(port, msg.code, PCs.PORTNAME_REACT_APP);
                highlightTab(RAPort);
        }
    });

    port.onDisconnect.addListener((removedPort) => {
        console.log(`Port <${removedPort.name}> disconnected`);
        CSPort = null;
    });
};

const initReactAppPort = (port) => {
    // If react app port already has been initialized, skip setting new listener
    if (RAPort) {
        console.warn(
            "Tried initializing RAPort, even though already exists. Skipping"
        );
        return;
    }

    // TODO: send pre-existing errors to react on port init!
    // TODO: also send client data? just in case options page closes?
    // send init message to either port
    sendPortInit(port, PCs.BKG_RA_INIT_PORT);

    // set global react app port holder
    RAPort = port;

    port.onMessage.addListener(function(msg) {
        console.log("<background.js> react app port msg received", msg);

        switch (msg.code) {
            case PCs.RA_BKG_START_IMPORT:
                IMPORT_IN_PROGRESS = true;
                MERGE_IN_PROGRESS = false;
                ARCHIVE_IN_PROGRESS = false;
                // set global clientnums arr - remove empty strings
                CLIENT_NUMS = msg.clientNums.filter((n) => n.trim() !== "");
                CLIENT_INDEX = 0;
                // open RIPS & begin import, if available
                if (CSPort) {
                    // open client script tab
                    highlightTab(CSPort);
                    sendStartImport(CSPort);
                }
                // RIPS not open, so send error back to React
                else sendNoRIPSTabs(RAPort);
                break;

            case PCs.RA_BKG_START_MERGE:
                const { data: mergeData, clientNums } = msg;
                // 1) set merge in progress to true
                MERGE_IN_PROGRESS = true;
                IMPORT_IN_PROGRESS = false;
                ARCHIVE_IN_PROGRESS = false;
                // 2) store merge data to global
                MERGED_DATA_CONTAINER = mergeData;
                // 3) set client index global
                // CLIENT_NUMS = clientNums.filter(n => n.trim() !== '');
                CLIENT_INDEX = 0;
                // 4) highlight / open advanced search page
                highlightTab(CSPort);
                // 5) navigate to advanced search to begin the merge
                sendStartMerge(CSPort);
                break;

            case PCs.RA_BKG_ERROR_BKG_CODE_NOT_RECOGNIZED:
                IMPORT_IN_PROGRESS = false;
                MERGE_IN_PROGRESS = false;
                ARCHIVE_IN_PROGRESS = false;
                // popup handled in react app
                Utils_Warn(
                    "BKG",
                    `Code sent to React <${msg.errCode}> not recognized`
                );
                // highlight options page / react app
                highlightTab(RAPort);
                break;

            case PCs.RA_BKG_CLEAR_ALL_DATA:
                // clear 'auto's
                IMPORT_IN_PROGRESS = false;
                MERGE_IN_PROGRESS = false;
                ARCHIVE_IN_PROGRESS = false;
                // clear data vars
                CLIENT_NUMS = null;
                CLIENT_INDEX = 0;
                MERGED_DATA_INDEX = 0;
                MERGE_HISTORY_INDEX = 0;
                CLIENT_DATA_CONTAINER = {};
                MERGED_DATA_CONTAINER = {};
                Utils_Warn("BKG", "All client data cleared");
                break;

            default:
                // code not recognized - send error back
                IMPORT_IN_PROGRESS = false;
                Utils_SendPortCodeError(port, msg.code, PCs.PORTNAME_REACT_APP);
        }
    });

    port.onDisconnect.addListener((removedPort) => {
        console.log(`Port <${removedPort.name}> disconnected`);
        RAPort = null;

        IMPORT_IN_PROGRESS = false;
    });
};

// ==============================================================================
//                          PORT CONNECTION LISTENER
// ==============================================================================
chrome.runtime.onConnect.addListener((port) => {
    console.assert(PORTNAME_HOLDER.includes(port.name));
    Utils_Log("BKG", `Port <${port.name}> connected!`);

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
        case PCs.PORTNAME_CS_PRE_LOGIN:
        case PCs.PORTNAME_CS_REDIRECT:
        case PCs.PORTNAME_CS_RELATIVES:
        case PCs.PORTNAME_CS_SERVICES:
        case PCs.PORTNAME_CS_VIEW_ACTIONS:
            // init content script port listener
            initContentScriptPort(port);
            break;

        case PCs.PORTNAME_REACT_APP:
            // init react app port listener
            initReactAppPort(port);
            break;

        default:
            IMPORT_IN_PROGRESS = false;
            Utils_Log(
                "BKG",
                "ERR: somehow connecting port isn't recognized, but we said assert!",
                port
            );
    }
});
