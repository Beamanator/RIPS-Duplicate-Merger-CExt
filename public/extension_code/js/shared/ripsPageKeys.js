// standardize keys for each page
const RIPS_PAGE_KEYS = {
    // pages with client data
    CLIENT_BASIC_INFORMATION: 'CtrlClientBasicInformation',
    CLIENT_VULNERABILITIES: 'CtrlVulnerabilities', // vulns only on cbi
    ADDRESSES:   'CtrlAddresses',
    NOTES:       'CtrlNotes',
    RELATIVES:   'CtrlRelatives',
    CONTACTS:    'CtrlContacts',
    FILES:       'CtrlFiles',
    HISTORY:     'CtrlHistory',
    // pages only for merging - only for adding new data
    SERVICES:    'CtrlServices',
    NEW_SERVICE: 'CtrlNewService',
    ADD_ACTIONS: 'CtrlAddActions',
    VIEW_ACTIONS: 'CtrlViewActions',

    // no client data
    ADVANCED_SEARCH: 'CtrlAdvancedSearch',
    ADVANCED_SEARCH_RESULTS: 'CtrlAdvancedSearchResults',
    REDIRECT: 'CtrlRedirect'
}