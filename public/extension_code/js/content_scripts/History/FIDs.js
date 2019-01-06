// destructure field keys
const {
    // just field names (no selectors used / needed)
    ACTION_DATE, ACTION_NAME, ACTION_SERVICE,
    ACTION_CASEWORKER, ACTION_NOTES,

    // selectors needed for table elements
    ACTION_TABLE_HEADER_CELLS, ACTION_TABLE_BODY_ROWS,
    ACTION_TABLE_BODY_CELLS_FROM_ROWS,
    ACTION_NOTES_TEXTAREA, ACTION_NOTES_TEXTAREA_CLOSE,
} = RIPS_FIELD_KEYS;

// loosely based off RIPS Auto Import CExt
const FIELD_IDS_HISTORY = {
    [ACTION_TABLE_HEADER_CELLS]: '#gridContent table thead tr th',
    [ACTION_TABLE_BODY_ROWS]: '#gridContent table tbody tr',
    [ACTION_TABLE_BODY_CELLS_FROM_ROWS]: 'td',

    [ACTION_NOTES_TEXTAREA]: 'textarea#attendenceNotes',
    [ACTION_NOTES_TEXTAREA_CLOSE]: 'button.ui-widget.ui-dialog-titlebar-close',
}