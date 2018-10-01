// loosely based off RIPS Auto Import CExt

// field keys on each page
const RIPS_FIELD_KEYS = {
    // ================== CLIENT BASIC INFORMATION: ==================
    STARS_NUMBER:   'StARS Number',
    // ------ CURRENT CONTACT DETAILS: ------
    FIRST_NAME:     'First Name',
    LAST_NAME:      'Surname',
    PHONE_NUMBER:   'Phone Number',
    ADDRESS1:       'Address (line 1)',
    ADDRESS2:       'Address (line 2)',
    OTHER_PHONE_NUMBER: 'Other Phone Number',
    EMAIL_ADDRESS:  'Email Address',
    
    // ------ BACKGROUND: ------
    UNHCR_NUMBER:   'UNHCR Number', 
    DATE_OF_BIRTH:  'Date of Birth',
    GENDER:         'Gender',			
    NATIONALITY:    'Nationality',
    COUNTRY_OF_ORIGIN: 'Country of Origin',	
    ETHNIC_ORIGIN:  'Ethnic Origin',
    MAIN_LANGUAGE:  'Main Language',
    SECOND_LANGUAGE: 'Second Language',
    MARITAL_STATUS: 'Marital Status',

    // ------ IMPORTANT INFORMATION: ------
    IMPORTANT_INFORMATION: 'Important Information',

    // ------ URGENT NOTES: ------
    URGENT_NOTES:   'Urgent Notes',

    // ------ OTHER INFORMATION: ------
    APPOINTMENT_SLIP_NUMBER: 'Appointment Slip Number',
    CARITAS_NUMBER: 'Caritas Number',
    CRS_NUMBER:     'CRS Number',
    IOM_NUMBER:     'IOM Number',
    MSF_NUMBER:     'MSF Number',
    STARS_STUDENT_NUMBER: 'StARS Student Number',
    RELIGION:       'Religion',
    UNHCR_STATUS:   'UNHCR Status',
    SOURCE_OF_REFERRAL: 'Source of Referral',
    CITY_OR_VILLAGE_OF_ORIGIN: 'City / Village of Origin',
    EMPLOYMENT_STATUS: 'Employment Status',
    NEIGHBORHOOD:   'Neighborhood',
    HIGHEST_EDUCATION: 'Highest Education',
    CARE:       'CARE?',
    CRS:        'CRS?',
    EFRRA_OR_ACSFT: 'EFRRA/ACSFT?',
    IOM:        'IOM?',
    MSF:        'MSF?',
    PSTIC:      'PSTIC?',
    REFUGE_EGYPT: 'Refuge Egypt?',
    SAVE_THE_CHILDREN: 'Save the Children?',
    UNICEF_OR_TDH: 'UNICEF/TDH?',
    OTHER_SERVICE_PROVIDER: 'Other Service Provider',
    DATE_OF_ARRIVAL_IN_EGYPT: 'Date of Arrival in Egypt',
    DATE_OF_UNHCR_REGISTRATION: 'Date of UNHCR Registration',
    RSD_DATE:   'RSD Date',
    LAST_RSD_UPDATE: 'Last RSD Update',

    // ------ VULNERABILITIES: ------
    // TODO: dynamic checkboxes
    VULNERABILITY_NOTES: 'Vulnerability Notes',

    // ------ DEPENDENTS: ------
    FAMILY_SIZE: 'Family Sized',
    UNHCR_CASE_SIZE: 'UNHCR Case Size',
    DIRECT_BENEFICIARIES: 'Direct Beneficiaries',
    INDIRECT_BENEFICIARIES: 'Indirect Beneficiaries',

    // ====================== ADDRESSES: ======================
    ADDRESSES: 'ADDRESSES',
    ADDRESS_NEW_BUTTON: 'ADDRESS_NEW_BUTTON',
    
    // ------ new address form fields ------
    ADDRESS_NEW_LINE1: 'ADDRESS_NEW_LINE1',
    ADDRESS_NEW_PHONE: 'ADDRESS_NEW_PHONE',
    ADDRESS_NEW_DATE_FROM: 'ADDRESS_NEW_DATE_FROM',
    ADDRESS_NEW_DATE_TO: 'ADDRESS_NEW_DATE_TO',
    ADDRESS_NEW_SAVE_BUTTON: 'ADDRESS_NEW_SAVE_BUTTON',

    // ------ table column names ------
    FIRST_ADDRESS_LINE: 'First Address Line',
    ADDRESS_TELEPHONE: 'Address Telephone',
    ADDRESS_DATE_FROM: 'Lived here "from"',
    ADDRESS_DATE_TO: 'Lived here "to"',

    // ------ dynamic fields for html table ------
    ADDRESS_TABLE_HEADER_CELL: 'ADDRESS_TABLE_HEADER_CELLS',
    ADDRESS_TABLE_BODY_ROWS: 'ADDRESS_TABLE_BODY_ROWS',
    ADDRESS_TABLE_BODY_CELLS_FROM_ROWS: 'ADDRESS_TABLE_BODY_CELLS_FROM_ROWS',
    
    // ======================== NOTES: ========================
    NOTES: 'Notes',
    NOTES_SAVE_BUTTON: 'NOTES_SAVE_BUTTON',
    
    // ====================== RELATIVES: ======================
    RELATIVES: 'RELATIVES',
    RELATIVE_NEW_BUTTON: 'RELATIVE_NEW_BUTTON',

    // ------ new relative form fields ------
    REL_NEW_FIRST_NAME: 'REL_NEW_FIRST_NAME',
    REL_NEW_LAST_NAME: 'REL_NEW_LAST_NAME',
    REL_NEW_RELATIONSHIP: 'REL_NEW_RELATIONSHIP',
    REL_NEW_DOB: 'REL_NEW_DOB',
    REL_NEW_STARS_NUMBER: 'REL_NEW_STARS_NUMBER',
    REL_NEW_SAVE_BUTTON: 'REL_NEW_SAVE_BUTTON',

    // ------ table column names ------
    REL_FIRST_NAME: 'First Name (Relative)',
    REL_SURNAME: 'Surname (Relative)',
    REL_RELATIONSHIP: 'Relationship to client',
    REL_DOB: 'Date of Birth',
    REL_STARS_NUMBER: 'StARS Number',

    // ------ dynamic fields for html table ------
    // TODO: combine with similar keys above (addresses)
    REL_TABLE_HEADER_CELL: 'REL_TABLE_HEADER_CELLS',
    REL_TABLE_BODY_ROWS: 'REL_TABLE_BODY_ROWS',
    REL_TABLE_BODY_CELLS_FROM_ROWS: 'REL_TABLE_BODY_CELLS_FROM_ROWS',
    
    // ======================= CONTACTS: ======================
    CONTACTS: 'CONTACTS',
    // ------ table column names ------
    CONTACT_FIRST_NAME: 'First Name (Contact)',
    CONTACT_SURNAME: 'Surname (Contact)',
    CONTACT_TYPE: 'Contact Type',
    // CONTACT_STARS_NUMBER: 'StARS Number',
    
    // ------ dynamic fields for html table ------
    // TODO: combine with similar keys above (addresses)
    CONTACT_TABLE_HEADER_CELL: 'CONTACT_TABLE_HEADER_CELLS',
    CONTACT_TABLE_BODY_ROWS: 'CONTACT_TABLE_BODY_ROWS',
    CONTACT_TABLE_BODY_CELLS_FROM_ROWS: 'CONTACT_TABLE_BODY_CELLS_FROM_ROWS',
    
    // ======================== FILES: ========================
    FILES: 'FILES',
    // ------ table column names ------
    FILE_NAME: 'Filename',
    FILE_DATE_MODIFIED: 'Date Modified',
    
    // ------ dynamic fields for selectors ------
    FILE_LINK: 'FILE_TABLE_FILENAME',
    
    // =================== ADVANCED SEARCH: ===================
    SEARCH_CLIENT_NUMBER: 'SEARCH_CLIENT_NUMBER',
    SEARCH_BUTTON: 'SEARCH_BUTTON',
    
    // =============== ADVANCED SEARCH RESULTS: ===============
    SEARCH_RESULTS: 'SEARCH_RESULTS',
    ACTIVE_CLIENT: 'ACTIVE_CLIENT',
    TAB_CLIENT_BASIC_INFORMATION: 'TAB_CLIENT_BASIC_INFORMATION',
    
    // ======================= HISTORY: =======================
    // ------ table column names ------
    ACTION_DATE: 'Action Date',
    ACTION_NAME: 'Action Name',
    ACTION_SERVICE: 'Associated Service',
    ACTION_CASEWORKER: 'Caseworker',
    ACTION_NOTES: 'Attendance Notes',

    // ------ dynamic fields for selectors ------
    // TODO: combine with similar keys above (addresses)
    ACTION_TABLE_HEADER_CELLS: 'ACTION_TABLE_HEADER_CELLS',
    ACTION_TABLE_BODY_ROWS: 'ACTION_TABLE_BODY_ROWS',
    ACTION_TABLE_BODY_CELLS_FROM_ROWS: 'ACTION_TABLE_BODY_CELLS_FROM_ROWS',

    // ======================= GENERAL: =======================
    // TODO: add the generic "fields" / elements here
    // ------ buttons ------
    SAVE_BUTTON_CBI: 'SAVE_BUTTON_CBI',
}