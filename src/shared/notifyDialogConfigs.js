const DEFAULT_BUTTON_CLOSE_TEXT = 'Exit';

// config used to notify user that data import has finished
export const importDone = () => ({
    title: 'Import Complete!',
    showActionButton: true, // TODO: remove?
    buttonActionText: 'Accept? Who knows?', // TODO: remove?
    buttonCloseText: 'Next',
    dialogContent: 'Import has finished. Next, select ' +
        'data that should be merged into 1 final client record.',
});

// config used for any error occurring during import
export const importError = (content) => ({
    title: 'Error Occurred During Import',
    showActionButton: false,
    buttonCloseText: DEFAULT_BUTTON_CLOSE_TEXT,
    dialogContent: content,
});

// config used for errors between bkg and RA port
export const RABkgPortError = (content) => ({
    title: 'React App / Bkg Port Error',
    showActionButton: false,
    buttonCloseText: DEFAULT_BUTTON_CLOSE_TEXT,
    dialogContent: content,
});