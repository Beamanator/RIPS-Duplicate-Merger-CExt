// destructure field keys
const {
    VULNERABILITY_TYPES,
    VULNERABILITY_NOTES
} = RIPS_FIELD_KEYS;

// loosely based off RIPS Auto Import CExt
const FIELD_IDS_CLIENT_VULNERABILITIES = {
    [SAVE_BUTTON_CBI]: 'input.newField', // button

    [VULNERABILITY_TYPES]: '', // checkboxes
    [VULNERABILITY_NOTES]: '#DescNotes', // textbox
};