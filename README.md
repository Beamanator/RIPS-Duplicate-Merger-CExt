# RIPS-Duplicate-Merger-CExt
RIPS duplicate client merger - Chrome Extension

## The Purpose
Input a list of StARS numbers and this extension will show the user any mis-matching data, the user will select which data is correct, then all of the correct data will be merged into the oldest client. Finally, the newer client(s) will be archived.

## Common errors:
1. Error with `service-worker`:
    - Found in `background.js`
    - Error: `service-worker.js:1 Uncaught (in promise) TypeError: Request 'chrome-extension' is unsupported at service-worker.js:1`
    - Resolution: Make the following changes to `index.js`:
        1. comment out `import registerServiceWorker...`
        1. comment out `registerServiceWorker();`
        1. delete `registerServiceWorker.js`
1. `chrome` not available:
    - Found in `App.js`
    - Resolution: Remember to add `/*global chrome*/` to the top of the js file.

## To "exclude" url matches from chrome extension manifest:
https://developer.chrome.com/extensions/content_scripts#matchAndGlob