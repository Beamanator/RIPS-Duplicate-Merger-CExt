import { RIPS_KEYS as R_KEYS } from '../../shared/ripsKeys';
import { tableConfigs } from '../../shared/ripsTableConfigHolder';
import { formatRawData } from '../../shared/ripsFormatRawData';

let initialData = {};

// only change to sample data IFF we're in development mode
if (process.env.NODE_ENV === 'development') {
    let rawData = {
        [R_KEYS.ADDRESSES]: {
            ADDRESSES: [
                [
                    {'first line': '', 'phone number': ''},
                    {'first line': 'should hide', 'phone number': '999'}, // should hide
                    {'first line': 'street?', 'phone number': '456'},
                    {'first line': 'NOT empty', 'phone number': '1234'}
                ],
                [
                    {'first line': 'NOT empty', 'phone number': '1234'},
                    {'first line': 'should hide', 'phone number': '999'} // should hide
                ],
                [
                    {'first line': 'should hide', 'phone number': '999'}, // should hide
                    {'first line': '', 'phone number': ''}
                ]
            ]
        },
        [R_KEYS.CLIENT_BASIC_INFORMATION]: {
            'First Name': ["Alex", "Joe", "Bill"],
            'Date of Birth': ["The Man", "Schmoe", "Sacket"],
            'Check1?': [false, true, true],
            'Check2?': [true, false, false],
            'Check3?': [true, true, true],      // should hide
            'Check4?': [false, false, false],   // should hide
            'Check5?': [true, false, true],
            'Empty1': ["", "", ""],     // should hide
            'Middle': ["", 'Here!', ""],
            'First': ["Here!", "", ""],
            'End': ["", "", "Here!"],
            'Crazy text': ['oh\nbaby!', 'next oneis long', 'OIWENFAOIWNEF AINWEFO NIAWEOI FNAOIWENF AOIWNEF OAIN'],
        },
        [R_KEYS.VULNERABILITIES]: {
            'Someone has a Child': [false, true, false],
            'Addiction (Frisbee)': [true, false, true],
            'Too old': [true, true, false],
            'At risk of stuff': [false, false, false], // should hide
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
                    {date: '2-3-1', name: 'action3'},
                    {date: '2-3-2', name: 'action3'},
                    {date: '2-3-3', name: 'action3'}
                ],
                undefined
            ],
            hide1: [
                [
                    {date: 'hid-1', name: 'show'},
                    {date: 'hid-2', name: 'hide'}, // should hide
                    {date: 'hid-4', name: 'show 1'}
                ],
                [
                    {date: 'hid-2', name: 'hide'} // should hide
                ],
                [
                    {date: 'hid-3', name: 'show 2'},
                    {date: 'hid-2', name: 'hide'} // should hide
                ]
            ],
            longNotes: [
                [
                    {
                        date: 'longnote-1',
                        note: 'something something this is a super ' +
                            'long note just to hopefully simulate what could ' +
                            'happen with super long action notes in the system. ' +
                            'sometimes entire email chains are pasted in, so they ' +
                            'get pretty freaking big!'
                    }
                ],
                undefined,
                undefined
            ]
        },
        [R_KEYS.NOTES]: {
            Notes: [
                'oofda this is a long ish note. just seeing what happens when we go big (we can go bigger)',
                ' note with \ttabs and\nnewlines ;)',
                ''
            ]
        },
        [R_KEYS.RELATIVES]: {
            RELATIVES: [
                [
                    {name: 'isaiah', relation: 'nephew'}, // should hide
                    {name: 'bill', relation: 'bro'},
                    {name: 'jane', relation: 'mom'}
                ],
                [
                    {name: 'isaiah', relation: 'nephew'}, // should hide
                ],
                [
                    {name: 'isaiah', relation: 'nephew'}, // should hide
                ]
            ]
        }
    }

    // now format the data
    let formattedData = {};
    tableConfigs.forEach(({ key: tableKey, type }) => {
        formattedData[tableKey] = 
            formatRawData(rawData[tableKey], tableKey, type);
    })
    initialData = formattedData;
}
// else {} // -> do nothing
export default initialData;