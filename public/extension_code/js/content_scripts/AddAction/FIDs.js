// destructure field keys
const {
    // fields for pulling data out of action obj
    ACTION_SERVICE, ACTION_NAME,
    ACTION_DATE, ACTION_CASEWORKER, ACTION_NOTES,

    // save button
    ADD_ACTION_SAVE_BUTTON,

    // data fields
    ADD_ACTION_SERVICE, ADD_ACTION_NAME,
    ADD_ACTION_DATE, ADD_ACTION_CASEWORKER,
    ADD_ACTION_NOTES,

    // holder for selector function
    ADD_ACTION_NOTES_FINDER,

} = RIPS_FIELD_KEYS;

// loosely based off RIPS Auto Import CExt
const FIELD_IDS_ADD_ACTION = {
    // save button
    [ADD_ACTION_SAVE_BUTTON]: 'input[value="Save"]',

    // input / select fields
    [ADD_ACTION_SERVICE]: 'select#ddlServices',
    [ADD_ACTION_NAME]: 'select#ddlActions',
    [ADD_ACTION_DATE]: 'input#DATE_OF_ACT',
    [ADD_ACTION_CASEWORKER]: 'select#CASEWORKERID',
    [ADD_ACTION_NOTES_FINDER]: () => {
        // get action note iframe
        const notesFrame = Utils_QueryDoc('#cke_notes iframe');

        // return true if iframe has document & has inner 'body'
        // -> elem
        if (notesFrame && notesFrame.contentDocument &&
            notesFrame.contentDocument.hasChildNodes('body'))
            return true;

        else return false;
    },

    // crazy action note field
    [ADD_ACTION_NOTES]: 
        (notes) => {
            // get action note iframe
            const noteElem = Utils_QueryDoc('#cke_notes iframe')
            // get inner document's body tag
            .contentDocument.querySelector('body');
            
            // fail = return false
            if (!noteElem) {
                return false;
            } else {
                // insert new paragraph at end of body, with new notes
                noteElem.insertAdjacentHTML(
                    'beforeend',
                    `<p>${notes}</p>`
                );
            }
        },
}