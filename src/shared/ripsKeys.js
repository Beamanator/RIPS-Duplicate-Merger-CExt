// loosely based off RIPS Auto Import CExt

// page names
export const RIPS_PAGE_KEYS = {
    // client details
    CLIENT_BASIC_INFORMATION: 'CLIENT_BASIC_INFORMATION',
    ADDRESSES: 'ADDRESSES',
    NOTES: 'NOTES',
    ALIASES: 'ALIASES',
    RELATIVES: 'RELATIVES',
    CONTACTS: 'CONTACTS',
    FILES: 'FILES',
    PRIVATE_FILES: 'PRIVATE_FILES',
    // case notes
    HISTORY:    'HISTORY',
    // maybe services
    ADVANCED_SEARCH: 'ADVANCED_SEARCH'
}

// field keys on each page
export const RIPS_FIELD_KEYS = {
    // ================== CLIENT BASIC INFORMATION: ==================
    // ------ CURRENT CONTACT DETAILS: ------
    FIRST_NAME: 'First Name',
    LAST_NAME: 'Surname',
    PHONE_NUMBER: 'Phone Number',
    ADDRESS1: 'Address1',
    ADDRESS2: 'Address2',
    OTHER_PHONE_NUMBER: 'Other Phone Number',
    EMAIL_ADDRESS: 'Email Address',
    
    // ------ BACKGROUND: ------
    UNHCR_NUMBER: 'UNHCR Number', 
    DATE_OF_BIRTH: 'Date of Birth',
    GENDER: 'Gender',			
    NATIONALITY: 'Nationality',
    COUNTRY_OF_ORIGIN: 'Country of Origin',	
    ETHNIC_ORIGIN: 'Ethnic Origin',
    MAIN_LANGUAGE: 'Main Language',
    SECOND_LANGUAGE: 'Second Language',
    MARITAL_STATUS: 'Marital Status',

    // ------ IMPORTANT INFORMATION: ------
    IMPORTANT_INFORMATION: 'Important Information',

    // ------ URGENT NOTES: ------
    URGENT_NOTES: 'Urgent Notes',

    // ------ OTHER INFORMATION: ------
    CARITAS_NUMBER: 'Caritas Number',
    CRS_NUMBER: 'CRS Number',
    IOM_NUMBER: 'IOM Number',
    MSF_NUMBER: 'MSF Number',
    STARS_STUDENT_NUMBER: 'StARS Student Number',
    RELIGION: 'Religion',
    UNHCR_STATUS: 'UNHCR Status',
    SOURCE_OF_REFERRAL: 'Source of Referral',
    CITY_OR_VILLAGE_OF_ORIGIN: 'City / Village of Origin',
    EMPLOYMENT_STATUS: 'Employment Status',
    NEIGHBORHOOD: 'Neighborhood',
    HIGHEST_EDUCATION: 'Highest Education',
    CARE: 'CARE?',
    CRS: 'CRS?',
    EFRRA_OR_ACSFT: 'EFRRA/ACSFT?',
    IOM: 'IOM?',
    MSF: 'MSF?',
    PSTIC: 'PSTIC?',
    REFUGE_EGYPT: 'Refuge Egypt?',
    SAVE_THE_CHILDREN: 'Save the Children?',
    UNICEF_OR_TDH: 'UNICEF/TDH?',
    OTHER_SERVICE_PROVIDER: 'Other Service Provider',
    DATE_OF_ARRIVAL_IN_EGYPT: 'Date of Arrival in Egypt',
    DATE_OF_UNHCR_REGISTRATION: 'Date of UNHCR Registration',
    RSD_DATE: 'RSD Date',
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
    // TODO: dynamic from table

    // ======================== NOTES: ========================
    NOTES: 'Notes',

    // =================== ADVANCED SEARCH: ===================
    SEARCH_CLIENT_NUMBER: 'SEARCH_CLIENT_NUMBER',

    // ======================= HISTORY: =======================
    ACTION_DATE: 'Action Date',
    ACTION_NAME: 'Action Name',
    ACTION_CASEWORKER: 'Action Caseworker',
    ACTION_NOTES: 'Action Notes',

    // ====================== ... ======================
    // TODO: add the rest here
}