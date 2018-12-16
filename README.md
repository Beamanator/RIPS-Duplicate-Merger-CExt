# RIPS-Duplicate-Merger-CExt
RIPS Duplicate Client Merger - Chrome Extension

Built in Fall 2018, for use by StARS

# How it works

## Identify Duplicate Client Records
To begin working with this program, you should have identified at least 2 RIPS client records that are for the same client - a.k.a. duplicate client records. You can be confident that the two client records are for the same person if the following data matches:
- UNHCR number
- First and last name (some spelling mistakes are ok)
- Nationality
- Gender
- Phone number
- Date of birth

![Identify Dupes](/readme_gifs/1_Identify_Duplicates.gif)

Sometimes two client records may have 3 or 4 of the above fields matching, but a few may be different. In this case, it's best to ask caseworkers of the clients if the records are for the same person. It's possible that there are mutiple people on the same UNHCR card with similar names and genders, and same nationality - so <u>**you must be 100% sure the client records are duplicates before moving to the next steps.**</u>

![Make sure you select actual duplicates](/readme_gifs/2_Identify_Duplicates.gif)

## Enter StARS Numbers
Once you have identified duplicate client records, obtain the StARS number of each client. The StARS number is a unique number that identifies each client record in RIPS. It cannot be duplicated between accounts.

![Record StARS Numbers](/readme_gifs/3_Record_STARS_Nums.gif)

Now that you have the StARS numbers for each client record, open "The Merger" and enter the StARS numbers into the appropriate fields at the top of the page.

![Open Auto-Merger & Enter StARS Nums](/readme_gifs/4_Add_Nums_To_Merger.gif)

>Note: StARS numbers must be entered 100% accurately! Each StARS number is a 9 digit number, starting with a valid year (2017, 2018, etc...). The final 5 numbers represent which order the clients were created in. You will not be able to merge clients if you do not enter the StARS numbers in the proper format. Also, you do not need to enter any number into the 3rd client StARS box, unless you have 3 RIPS client records for the same person.

## Click Import
By this time, you should have already opened RIPS (in *only one tab*), and logged in. The import will not work correctly if you haven't logged in to RIPS *or* if RIPS is open in more than one tab.

Now that you have entered all of the StARS numbers you want to merge, click "Import".

![Log in to RIPS and click 'Import'](/readme_gifs/5_Login_And_Import.gif)

The program will now reach out to RIPS and gather all of the information saved on each client profile.

## How You Know Import has Finished
You will know the import has finished once you see a popup on the import page stating that the import has finished, and that you should now select the data that should be merged into one final client record.

![Import Complete. Merge next.](/readme_imgs/6_Import_Done_Msg.JPG)

You will also see a few tables appear lower down on page with each client's data. Now move on to the next section, *Select Data to Merge*.

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

Any field selected (with a green background) will be added to the merged client in the end. Rows with a green cell in the far left indicate that some data has been selected for that field. If the row does not have selected data, the far left cell will be yellow, indicating no data from this row will be saved. It is recommended to select at least one item per row to make sure no data is missed!

Once you're ready to merge, move on to the next step.

>Note 1: Some fields (Action Name / Caseworker) *may* not be imported exactly as they appear. This is because these types of data are changing most often. Actions can be renamed or removed, and Caseworkers leave relatively often. Here is how you can deal with either of these scenarios:
- Missing Action:
    - The auto-merge utility will advise the user to check for the valid action, so the user should first open the Actions dropdown box and check if a different action with a slightly different name is appropriate at this moment. If there is no action, the user needs to re-run the auto merger (Clear data first), then make sure not to slect that action in the *merge* stage.
- Missing Caseworker:
    - There's really nothing to be done here, just let the auto-merge utility keep yourself as the caseworker for any new services / actions.

>Note 2: Some actions will not be able to be merged to new clients. These are actions related to service closed / reopened, such as: "Service closed" [6] and "Service was closed - reopened at the later date" [333]. These actions are not be mergable so *if a Service is closed, and you want to merge it AND keep it closed*, you have to manually close that service after the auto merger creates it.

## Click Merge
Click the "Merge" button at the bottom of the page!

Now you will see a popup that serves to remind you (the user) to make sure you're 100% confident that the data you selected is 100% accurate. Remember that all of the data you select will be added to a client in RIPS, and all other RIPS profiles will be archived!! So please be as accurate as possible!!

You may also see a **Warning** which shows a list of tables that do not have at least one field selected in each group. This warning doesn't necessarily require any action, but it gives users another chance to check if the selected data is accurate or if they missed something. If the user wants to check everything again, they can just click *Take me back*, and they will return to the page where they can select / de-select client data. If the user is 100% sure they're ready to merge the clients, they can click *Merge* and the merge process will begin!

One more quick note: You may also see an error starting with "ERROR: You selected at least 1 <u>**file**</u> that needs to be moved to the target client...". This merger program cannot move files from one client to another, so **if you see (and select) a file that needs to be moved from one client record to another, this must be done manually**. The merger will not allow you to begin merging until you are confident that the files have been moved already, and you do not select extra files that need to be merged.

## Which Client Gets the New Data?
This program assumes the first client StARS number (entered into the box "Client StARS #1") is the client with the most accurate information, and therefore this client will receive all new, "Merged" data.

>Note: this is also why all of this first client's data is selected by default. You can still un-select any of this data if you know it is incorrect and needs to be changed.

**The Merger will not completely delete any client data!!** If any field has data that needs to be replaced (like wrong nationality, or a misspelled name), the target client (Client StARS #1) will get the updated information. However, if there is incorrect data (like actions with the wrong notes), this data will need to be changed manually.

## How You Know Merge has Finished
Once the merge process finishes, "The Merger" will archive clients #2 and #3. Once this is all done, the process has finished and a popup will display in the main page, explaining that everything has completed successfully!

**Note:** At this stage, it is highly recommended to check the newly merged client (Client StARS #1) and make sure all of the correct data has been added here.

## That's all!
You're done! As always, let "the RIPS Guy" know if anything goes wrong or if you have any questions.

## Common Issues
If you're running into any issues while using this RIPS Duplicate Merger, check the list below for solutions to common issues! If you do not find the issue / solution you are looking for, contact the developer (`rips@stars-egypt.org`) for assistance.
- RIPS stops doing anything (infinite spinning)
    - Sometimes RIPS will stop loading, and you will be stuck watching one page infinitely load. If this happens to you, try stopping the page from loading, then click refresh.

![Stop and Refresh Page](/readme_gifs/Stop_Refresh_Page.gif)

# Developer Notes

## The Purpose
Input a list of StARS numbers and this extension will show the user any mis-matching data, the user will select which data is correct, then all of the correct data will be merged into the oldest client. Finally, the newer client(s) will be archived.

## Getting Started
1. Run `npm install` to install the node packages in `package.json`
1. Run `npm run build` to "build" the React app
1. Open `chrome://extensions` in your browser, then click `Load Unpacked`. Now navigate to your `build` directory that was created in the previous step. Finally, click 'ok'.

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
