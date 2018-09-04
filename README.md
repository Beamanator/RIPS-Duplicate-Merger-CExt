# RIPS-Duplicate-Merger-CExt
RIPS duplicate client merger - Chrome Extension

# How it works

## Enter StARS Numbers
- Make sure they're in the correct format! (explain)

## Click Import
Now that you have entered all of the StARS numbers you want to merge, click "Import". You should already have opened one tab with RIPS, and logged in. The import will not work correctly if you have more than one tab opened to RIPS.

At this state, the program will reach out to RIPS and gather all of the necessary information from each client.

## How You Know Import has Finished
You will know the import has finished once you see a few tables appear, with the clients' data inside.

## Select Data to Merge
Now that you see each client's data next to each other, select the data you want to be merged into the final client's profile.

In some tables, you will only be able to select one cell per row. Examples:
- First name
- Last name
- Phone number
- Notes

In the other tables, you will be able to select multiple groups of cells per row. Examples:
- Actions (in the History table)
- Relatives
- Contacts
- Files

Any field selected (with a green background) will be added to the merged client in the end. Rows with a green cell in the far left indicate that some data has been selected for that field. If the row does not have selected data, the far left cell will be yellow, indicating the user has probably missed something.

Once you're ready to merge, move on to the next step.

## Click Merge
Click the "Merge" button at the bottom of the page!

Now you will see a popup that serves to remind you (the user) to make sure you're 100% confident that the data you selected is 100% accurate. Remember that all of the data you select will be added to a client in RIPS, and all other RIPS profiles will be archived!!

You may also see a warning, which will show a list of tables that do not have at least one field selected in each row. This isn't necessarily a bad thing, but it gives users another chance to check if the selected data is accurate. If the user wants to check everything again, they can just click "Take me back", and they will return to the page where they can select / de-select client data. If the user is 100% sure they're ready to merge the clients, they can click "Merge" and the merge process will begin!

Note: All of the first client's data will be selected be default because the program assumes this client is the "most accurate" record, a.k.a. this client record has the majority of the accurate data. You can still un-select any of this data if you know it is incorrect and needs to be changed. 

## How You Know Merge has Finished
Not sure yet :)

## The Purpose
Input a list of StARS numbers and this extension will show the user any mis-matching data, the user will select which data is correct, then all of the correct data will be merged into the oldest client. Finally, the newer client(s) will be archived.

## Getting Started
1. Run `npm install` to install the node packages in `package.json`
1. Run `npm run build` to "build" the React app
1. `chrome://extensions` in your browser, then `Load Unpacked`. Now navigate to your `build` directory that was created in the previous step. Finally, click 'ok'.

Now you should have a new, working chrome extension!

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
