// config used to notify user that data import has finished
export const dialogConfigImportDone = () => ({
    title: 'Import Complete!',
    showActionButton: true, // TODO: remove?
    buttonActionText: 'Accept? Who knows?', // TODO: remove?
    buttonCloseText: 'Next',
    dialogContent: 'Import has finished. Next, select ' +
        'data that should be merged into 1 final client record.',
});

export const dialogConfigRAInvalidPortCode = (code) => ({
    title: 'Error in React App Port Message Code',
    showActionButton: false,
    // buttonActionText: 'not needed',
    buttonCloseText: 'Exit',
    dialogContent: `REACT MSG CODE <${msgcode}> NOT VALID`
})