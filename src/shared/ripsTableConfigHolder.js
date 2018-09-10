import { RIPS_KEYS as R_KEYS } from './ripsKeys';

export const tableConfigs = [{
    title: 'Client Basic Information',
    key: R_KEYS.CLIENT_BASIC_INFORMATION,
}, {
    title: 'Addresses',
    key: R_KEYS.ADDRESSES,
    type: 'lists',
    multiSelect: true,
}, {
    title: 'Basic Notes',
    key: R_KEYS.NOTES,
}, {
    title: 'Relatives',
    key: R_KEYS.RELATIVES,
    type: 'lists',
    multiSelect: true
}, {
    title: 'Contacts',
    key: R_KEYS.CONTACTS,
    type: 'lists',
    multiSelect: true
}, {
    title: 'Files',
    key: R_KEYS.FILES,
    type: 'lists',
    multiSelect: true
}, {
    title: 'Action History',
    key: R_KEYS.HISTORY,
    type: 'lists',
    multiSelect: true
}];