import { RIPS_KEYS as R_KEYS } from '../../shared/ripsKeys';
import { tableConfigs } from '../../shared/ripsTableConfigHolder';
import { formatRawData } from '../../shared/ripsFormatRawData';

let initialData = {};

// only change to sample data IFF we're in development mode
if (process.env.NODE_ENV === 'development') {
    initialData = {
        [R_KEYS.ADDRESSES]: {
            ADDRESSES: [
                [
                    {'first line': '', phone: ''},
                    {'first line': 'NOT empty', phone: '1234'}
                ],
                [],
                [
                    {'first line': '', phone: ''}
                ]
            ]
        },
        [R_KEYS.CLIENT_BASIC_INFORMATION]: {
            'First Name': ["Alex", "Joe", "Bill"],
            'Date of Birth': ["The Man", "Schmoe", "Sacket"],
            'Check1?': [false, true, true],
            'Check2?': [true, false, false],
            'Empty1': ["", "", ""],
            'Middle': ["", 'Here!', ""],
            'First': ["Here!", "", ""],
            'End': ["", "", "Here!"],
            'Crazy text': ['oh\nbaby!', 'next oneis long', 'OIWENFAOIWNEF AINWEFO NIAWEOI FNAOIWENF AOIWNEF OAIN'],
        },
        [R_KEYS.CONTACTS]: {
            CONTACTS: [
                [],
                [
                    {'first name': 'bill', type: 'save children'},
                    {'first name': '', type: ''}
                ],
                [
                    {'first name': 'john', type: 'eat waffles'}
                ]
            ]
        },
        [R_KEYS.FILES]: {
            FILES: [
                [],
                [
                    {filename: 'remove comments', date: 'never'},
                    {filename: 'do something', date: 'idk'}
                ],
                [
                    {filename: '', date: ''}
                ]
            ]
        },
        [R_KEYS.HISTORY]: {
            action1: [
                undefined,
                [
                    {date: 'yesterday', name: 'action1'}
                ],
                undefined   
            ],
            action2: [
                [
                    {date: '1-2-2', name: 'action2'},
                    {date: '1-2-3', name: 'action2'},
                    {date: '1-2-4', name: 'action2'},
                    {date: '1-2-5', name: 'action2'}
                ],
                undefined,
                [
                    {date: '3-2-1', name: 'action2'},
                    {date: '3-2-2', name: 'action2'}
                ]
            ],
            action3: [
                [
                    {date: '1-3-1', name: 'action3'},
                    {date: 'ut oh', name: 'action3'}
                ],
                [
                    {date: '3-3-1', name: 'action3'},
                    {date: '3-3-2', name: 'action3'},
                    {date: '3-3-3', name: 'action3'}
                ],
                undefined
            ]
        },
        [R_KEYS.NOTES]: {
            Notes: [
                'oofda this is a long ish note. just seeing what happens when we go big',
                'note with \ttabs and\nnewlines ;)',
                ''
            ]
        },
        [R_KEYS.RELATIVES]: {
            RELATIVES: [
                [
                    {name: 'bill', relation: 'bro'},
                    {name: 'jane', relation: 'mom'}
                ],
                [],
                []
            ]
        }
    }

    // now format the data
    let formattedData = {};
    tableConfigs.forEach(({ key: tableKey, type }) => {
        formattedData[tableKey] = 
            formatRawData(initialData[tableKey], tableKey, type);
    })
    initialData = formattedData;
}
// else {} // -> do nothing
export default initialData;