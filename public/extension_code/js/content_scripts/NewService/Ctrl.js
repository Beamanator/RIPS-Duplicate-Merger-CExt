//----------------------------------------------------------------
//      NOTE: ONLY EDIT CODE IN /public/* - NOT IN /build/*
//----------------------------------------------------------------

// ===============================================================
//                           CONSTANTS
// ===============================================================
const MESSAGE_SOURCE = RIPS_PAGE_KEYS.NEW_SERVICE;

// ===============================================================
//                          PORT CONNECT
// ===============================================================
const port = chrome.runtime.connect({ name: PCs.PORTNAME_CS_NEW_SERVICE });

// ===============================================================
//                         MAIN FUNCTIONS
// ===============================================================
const queryDoc = (selector) => document.querySelector(selector);
const queryDocA = (selector) => document.querySelectorAll(selector);

const setSelectElem = (Elem, valToMatch) => {
    // TODO: throw error if Elem isn't 'select-one'?
    let success = false;
    // throw error if either param doesn't exist :(
    if (!Elem || !valToMatch) {
        const errMsg = `Warning! no Elem <${Elem}> or val to match` +
            ` <${valToMatch}>`;
        Utils_Error(MESSAGE_SOURCE, errMsg);
        return false;
    }

    // loop through Select elem's entries
    Object.entries(Elem.options).forEach(([value, optElem]) => {
        // quit looping early if possible
        if (success) return;
        // once an option's text matches the value we're
        // -> looking for, that's our match!
        if (optElem.innerText.trim() === valToMatch) {
            Elem.options[value].selected = 'selected';
            success = true;
        }
    });

    return success;
}

const setInputElem = (Elem, valToSet) => {
    // TODO: throw error if Elem isn't an 'input'
    // throw error if either param doesn't exist :(
    if (!Elem || !valToSet) {
        const errMsg = `Warning! no Elem <${Elem}> or val to set` +
            ` <${valToMatch}>`;
        Utils_Error(MESSAGE_SOURCE, errMsg);
        return false;
    }

    // loop through Input elem's entries
    Elem.value = valToSet;

    return true;
}

const clickElem = (Elem) => {
    // throw error if either param doesn't exist :(
    if (!Elem) {
        const errMsg = `Warning! no Elem <${Elem}> to click!`;
        Utils_Error(MESSAGE_SOURCE, errMsg);
        return false;
    }

    // click the element now :)
    Elem.click();

    return true;
}

const startMerge = ( servicesToCreate, newServiceIndex ) => {
    console.log(servicesToCreate)
    debugger;
    
    // get data to add
    const serviceData = servicesToCreate[newServiceIndex];

    // set service description
    const serviceDescSelector = FIELD_IDS_NEW_SERVICE[NEW_SERVICE_DESCRIPTION];
    
    // set service start date box
    const serviceStartSelector = FIELD_IDS_NEW_SERVICE[NEW_SERVICE_START_DATE];
    
    // set caseworker box
    const serviceCwSelector = FIELD_IDS_NEW_SERVICE[NEW_SERVICE_CASEWORKER];
    
    // input data & get successes
    const elemSetSuccesses = [
        setSelectElem(
            queryDoc(serviceDescSelector),
            serviceData[ACTION_SERVICE]
        ),
        setInputElem(
            queryDoc(serviceStartSelector),
            serviceData[ACTION_DATE]
        ),
        setSelectElem(
            queryDoc(serviceCwSelector),
            serviceData[ACTION_CASEWORKER]
        )
    ];
    
    // TODO: MAYBE check action box is populated
    
    // if any inserts failed, throw error
    if (elemSetSuccesses.includes(false)) {
        let errMsg = `Some errors found in [service, date, cw] inserts`;
        Utils_Error(MESSAGE_SOURCE, errMsg, elemSetSuccesses);
        return;
    }
    // else, no errors so click save!
    else {
        const saveBtnSelector = FIELD_IDS_NEW_SERVICE[NEW_SERVICE_SAVE_BUTTON];
        const clickSuccess = clickElem(
            queryDoc(saveBtnSelector)
        );
        if (!clickSuccess) {
            let errMsg = `Couldn't click save somehow! ` +
                `<${saveBtnSelector}>`;
            Utils_Error(MESSAGE_SOURCE, errMsg);
        }
    }
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
        code,
        servicesToCreate,
        autoImport, autoMerge,
        // postSaveRedirectFlag
    } = msg;

    Utils_Log(MESSAGE_SOURCE, 'port msg received', msg);

    switch ( code ) {
        case PCs.BKG_CS_INIT_PORT:
            Utils_Log(MESSAGE_SOURCE, `Successfully connected to background.js`);
            // auto import should never be true here...
            if (autoImport) {
                const errMsg = 'Somehow got here & auto import is set?' +
                    ' How?!? Shouldn\t happen!!';
                Utils_Error(MESSAGE_SOURCE, errMsg);
            }
            // if merge flag is true, start automatically!
            else if (autoMerge) { startMerge( servicesToCreate ); }
            break;

        case PCs.BKG_CS_START_IMPORT:
        case PCs.BKG_CS_START_MERGE:
			Utils_SendRedirectCode(port, 'SearchClientDetails/AdvancedSearch');
            break;

        default: // code not recognized - send error back
			Utils_SendPortCodeError(port, code, PCs.PORTNAME_CS_NEW_SERVICE);
    }
});