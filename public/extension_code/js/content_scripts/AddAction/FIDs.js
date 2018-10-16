// destructure field keys
const {
    // save button
    ADD_ACTION_SAVE_BUTTON,
    // data fields
    ADD_ACTION_SERVICE, ADD_ACTION_NAME,
    ADD_ACTION_DATE, ADD_ACTION_CASEWORKER,
    ADD_ACTION_NOTES,
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
    // crazy action note field
    [ADD_ACTION_NOTES]: 
        (notes) => {
            // get action note iframe
            document.querySelector('iframe')
            // get inner document's body tag
            .contentDocument.querySelector('body')
            // insert new paragraph at end of body, with new notes
            .insertAdjacentHTML('beforeend',`<p>${notes}</p>`)
        },
}