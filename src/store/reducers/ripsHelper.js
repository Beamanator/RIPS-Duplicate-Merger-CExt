// TODO: comment out this file for production
let initialData = {}

if (process.env.NODE_ENV === 'development') {
    initialData = {
        CtrlAddresses: {
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
        CtrlClientBasicInformation: {
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
        CtrlContacts: {
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
        CtrlFiles: {
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
        CtrlHistory: {
            action1: [
                undefined,
                [
                    {date: 'yesterday', name: 'action1'}
                ],
                undefined   
            ],
            action2: [
                [
                    {date: '1-2', name: 'action2', 3: 'three'},
                    {date: '1-3', name: 'action2'},
                    {date: '1-4', name: 'action2'}
                ],
                undefined,
                [
                    {date: '2-1', name: 'action2'},
                    {date: '2-2', name: 'action2'}
                ]
            ],
            action3: [
                [
                    {date: '3333', name: 'action3'}
                ],
                undefined,
                undefined
            ]
        },
        CtrlNotes: {
            Notes: [
                'oofda this is a long ish note. just seeing what happens when we go big',
                'note with \ttabs and\nnewlines ;)',
                ''
            ]
        },
        CtrlRelatives: {
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
}
// else {} // -> do nothing
export default initialData;