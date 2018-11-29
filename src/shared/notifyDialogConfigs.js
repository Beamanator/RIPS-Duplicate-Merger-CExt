const DEFAULT_BUTTON_CLOSE_TEXT = 'Exit';

export const archiveDone = () => ({
    title: 'Merge Complete!',
    showActionButton: false,
    buttonCloseText: DEFAULT_BUTTON_CLOSE_TEXT,
    dialogContent: 'Merge process has completed! Please check ' +
        'client records to make sure merge was successful! If you ' +
        'find anything suspicious, please talk to Alex, the "RIPS ' +
        'Guy" immediately! Or send an email to rips@stars-egypt.org.' +
        ' Thanks!',
});

// config used to notify user that data import has finished
export const importDone = () => ({
    title: 'Import Complete!',
    showActionButton: false, // TODO: keep this? default this??
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