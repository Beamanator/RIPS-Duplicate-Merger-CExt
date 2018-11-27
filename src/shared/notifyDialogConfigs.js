// config used to notify user that data import has finished
export const importDone = () => ({
    title: 'Import Complete!',
    showActionButton: true, // TODO: remove?
    buttonActionText: 'Accept? Who knows?', // TODO: remove?
    buttonCloseText: 'Next',
    dialogContent: 'Import has finished. Next, select ' +
        'data that should be merged into 1 final client record.',
});

export const RAPortError = (content) => ({
    title: 'React App Port Error',
    showActionButton: false,
    // buttonActionText: 'not needed',
    buttonCloseText: 'Exit',
    dialogContent: content,
});

export const importError = (content) => ({
    title: 'Error Occurred During Import',
    showActionButton: false,
    buttonCloseText: 'Exit',
    dialogContent: content,
});