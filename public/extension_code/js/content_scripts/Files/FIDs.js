// destructure field keys
const {
    // just field names (no selectors used / needed)
    FILE_NAME, FILE_DATE_MODIFIED,
    // selectors needed for table elements
    FILE_LINK
} = RIPS_FIELD_KEYS;

const FIELD_IDS_FILES = {
    [FILE_LINK]: 'a[href^="http://rips.247lib.com/filesDownload"]',
}