//--------------------------------------------------------------
//     NOTE: ONLY EDIT CODE IN /public/* - NOT IN /build/*
//--------------------------------------------------------------

// ==============================================================================
//                         GLOBAL VARS & PORT HOLDERS
// ==============================================================================
let CSPort = null; // content script port
let RAPort = null; // react app port
let importInProgress = false;


// ==============================================================================
//                          MESSAGE POSTING FUNCTIONS
// ==============================================================================


// ==============================================================================
//                           PORT MESSAGE LISTENERS
// ==============================================================================


// ==============================================================================
//                          PORT CONNECTION LISTENER
// ==============================================================================
chrome.runtime.onConnect.addListener(port => {
    console.assert(port.name == CONTENT_SCRIPT_PORT || port.name == REACT_APP_PORT);
    
    console.log(`Port <${port.name}> connected!`);

    // send init message
    sendPortInit(port, importInProgress);
    
    switch (port.name) {
        case CONTENT_SCRIPT_PORT:
            // init port
            initContentScriptPort( port );
            break;

        case REACT_APP_PORT:
            // init port
            initReactAppPort( port );
            break;
        
        default:
            importInProgress = false;
            console.error(
                "ERR: somehow connecting port isn't recognized, but we said assert!",
                port
            );
    }
});