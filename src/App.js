/*global chrome*/
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';

import CustomTable from './components/CustomTable';

// material-ui core components
import {
    Button,
    Grid,
    Paper,
    TextField,
    Dialog, DialogActions, DialogContent,
    DialogContentText, DialogTitle,
    List, ListItem
} from '@material-ui/core';

// redux store actions
import * as actions from './store/actions';

// rips page and field keys
import {
    RIPS_KEYS as R_KEYS
} from './shared/ripsKeys';

class App extends Component {
    tableConfigHolder = [{
        title: 'Client Basic Information',
        key: R_KEYS.CLIENT_BASIC_INFORMATION,
    }, {
        title: 'Addresses',
        key: R_KEYS.ADDRESSES,
        type: 'lists',
        multiSelect: true,
    }, {
        title: 'Basic Notes',
        key: R_KEYS.NOTES,
    }, {
        title: 'Relatives',
        key: R_KEYS.RELATIVES,
        type: 'lists',
        multiSelect: true
    }, {
        title: 'Contacts',
        key: R_KEYS.CONTACTS,
        type: 'lists',
        multiSelect: true
    }, {
        title: 'Files',
        key: R_KEYS.FILES,
        type: 'lists',
        multiSelect: true
    }, {
        title: 'Action History',
        key: R_KEYS.HISTORY,
        type: 'lists',
        multiSelect: true
    }]

    state = {
        client1: '201813794', client1Valid: false,
        client2: '201815032', client2Valid: false,
        client3: '201814527', client3Valid: true, // valid cuz client3 can be empty
        importInProgress: false,
        mergeInProgress: false,
        nodeEnv: process.env.NODE_ENV,
        mergeDialogOpen: false,
        dialogNotAllSelectedContent: '',
        formattedData: null,
        /**
         * <tableKey>_AllSelected,
         * -> Boolean values describing when a table has all rows
         * -> selected.
         */
        /**
         * <tableKey>_SelectedArr,
         * -> Array of bools / integers (depending on table type)
         * -> depicting which rows are selected
         */
    }

    componentWillMount() {
        const {
            client1, client2, client3
        } = this.state;
        const {
            bkgPort, ripsData,
            onBackgroundPortInit
        } = this.props;


        // Warn user if we're in development environment
        if (process.env.NODE_ENV === 'development') {
            console.warn(
                "Not initializing ports since we're only in " +
                'dev mode (not inside a chrome extension)...'
            );
        }
        // Check if port exists. Set one up if not!
        else if (!bkgPort) {
            // begin port init
            onBackgroundPortInit(chrome);
        } else {
            console.warn('<Main> port already exists', bkgPort);
        }

        // initialize client#Valid state props
        const client1Valid = this.checkClientNumValid(client1);
        const client2Valid = this.checkClientNumValid(client2);
        const client3Valid = this.checkClientNumValid(client3, true);
        
        // convert raw data into desired format
        let formattedData = {};
        // loop through keys, adding in converted data
        this.tableConfigHolder.forEach(({ key, title, type }) => {
            formattedData[key] = this.convertRawData(
                ripsData[key], title, type
            )
        })
        
        // update any values that need updating :)
        this.setState({
            client1Valid,
            client2Valid,
            client3Valid,
            formattedData: formattedData
        })
    }

    checkClientNumValid = (numStr, emptyAllowed=false) => {
        if (emptyAllowed && numStr.length === 0)
            return true
        
        // else (empty allowed but not empty, or empty not allowed)
        return (
            // test number is 9 digits
            /^[0-9]{9}$/.test(numStr) &&
            // test that first 2 digits are 20
            /^20/.test(numStr)
        );
    }
    onlyAllowNumbers = (str) => str
        .replace(/o/gi, '0')        // o / O => 0
        .replace(/[il]/gi, '1')     // i / I / l / L => 1
        .replace(/[^0-9]/g, '');    // not 0-9 => '' (deleted)
    handleInputChange = (clientKey, event) => {
        // allow only client3 to be empty
        const allowEmpty = clientKey === 'client3' ? true : false

        // get client number from input change event
        let clientNum = event.target.value;
        // convert to numbers only
        clientNum = this.onlyAllowNumbers(clientNum);

        this.setState({
            [clientKey]: clientNum,
            [clientKey+'Valid']:
                this.checkClientNumValid(clientNum, allowEmpty)
        });
    }

    handleImportDisabled = () => {
        const { bkgPort } = this.props;
        const {
            client1Valid, client2Valid, client3Valid,
            nodeEnv, importInProgress
        } = this.state;

        const importReady = ((
                // this condition SHOULD always
                // -> evaluate to false
                nodeEnv !== 'development' &&
                !bkgPort
            ) ||
            !client1Valid ||
            !client2Valid ||
            !client3Valid ||
            importInProgress
        );

        // KEEP! uncomment if values aren't what you'd expect!
        // console.warn('import disabled?', importReady);
        // console.info(
        //     'values:', nodeEnv, bkgPort, importInProgress,
        //     client1Valid, client2Valid, client3Valid
        // );

        return importReady;
    }

    handleImport = () => {
        console.log('Begin Import');

        const { bkgPort, onRipsFetchData } = this.props;

        // disable clicking import while import in progress
        this.setState({ importInProgress: true });
        
        // gather client nums into array
        const { client1, client2, client3 } = this.state;
        const clientNums = [ client1, client2, client3 ];

        // call action to start fetching data from rips
        onRipsFetchData(bkgPort, clientNums);
    }

    handleClear = () => {
        // TODO: also clear rips data from redux store?
        // -> including from bkg.js 
        // Clear client nums, and reset client#Valid variables
        this.setState({
            client1: '', client1Valid: false,
            client2: '', client2Valid: false,
            client3: '', client3Valid: true,
            importInProgress: false,
            mergeInProgress: false
        });
    }

    handleMergeDialogOpen = () => {
        const { classes: { dialogListStyles } } = this.props;
        
        let emptyTableNames = [];
        let emptyTablesMessage = 'Warning: The following tables do ' +
            'not have ALL rows selected, so there will be some data' +
            ' LEFT OUT of the merge:';

        // loop through table keys [this.tableConfigHolder] and
        // -> add a note that mentions which tables are not totally
        // -> selected. User should think about closing the modal
        // -> and selecting some more values to be 100% accurate
        this.tableConfigHolder.forEach(tableConfig => {
            // match tableConfigs with state prop '<tableConfig.key>_AllSelected'
            if (!this.state[tableConfig.key + '_AllSelected']) {
                // state prop is false - so make sure we display
                // -> table key warning below!
                emptyTableNames.push(tableConfig.key);
            }
        });

        // create some jsx - if there are some empty tables, display
        // -> them in a list w/ description. else, null!
        const newDialogNotAllSelectedContent = (
            emptyTableNames.length > 0 ? (
                <Fragment>
                    <br />
                    <DialogContentText>
                        {emptyTablesMessage}
                    </DialogContentText>
                    <List>
                        {emptyTableNames.map(name => (
                            <ListItem
                                key={name}
                                className={dialogListStyles}
                            >
                                {name}
                            </ListItem>
                        ))}
                    </List>
                </Fragment>
            ) : null
        );
        
        this.setState({
            mergeDialogOpen: true,
            dialogNotAllSelectedContent: newDialogNotAllSelectedContent
        });
    }
    handleMergeDialogClose = () => {
        this.setState({
            mergeDialogOpen: false,
            dialogNotAllSelectedMessage: ''
        });
    }
    handleMergeDialogAgree = () => {
        const {
            onMergeBegin,
            bkgPort
        } = this.props;
        const {
            client1, client2, client3,
            formattedData,
            // [tableKey + '_SelectedArr'] extracted in loops
        } = this.state;

        // get 'mergeData' from 'formattedData' and
        // -> <tableKey>+'_SelectedArr's
        const mergeData = Object.entries(formattedData)
        .reduce((mData, [tableKey, tableArr]) => {
            // get table's associated selectedArr
            const selectedArr = this.state[tableKey + '_SelectedArr'];

            // if first element in 'selected' array is an Array, multiple
            // -> elements CAN be selected at the same time
            const multiSelect = Array.isArray(selectedArr[0]);

            // throw error if selectedArr and tableArr have different sizes
            if (selectedArr.length !== tableArr.length) {
                console.error(
                    'WHY do selectedArr & tableArr have different lengths',
                    selectedArr, tableArr
                );
                // Fail - not sure how to deal with this data
                mData.pass = false;
                return mData;
            }

            // if we're here, sizes are the same. Now loop through each row
            // -> and add the data back to mData (merged data)
            const arrToMerge = [];
            // multi-select logic
            if (multiSelect) {
                const objToMerge = {};
                tableArr.forEach(([fieldName, ...fieldData], fieldIndex) => {
                    // get array of selected fields indices from selectedArr
                    const selectedFieldIndices = selectedArr[fieldIndex];
    
                    // if none selected, skip adding this field
                    if (selectedFieldIndices.length === 0) return;
    
                    // const selectedData = {};
                    // loop through selectedFieldIndices
                    selectedFieldIndices.forEach((isSelected, selectedIndex) => {
                        if (isSelected) {
                            const fieldValue = fieldData[selectedIndex];
                            const groupIndex = fieldData[3];
                            const clientIndex = selectedIndex;

                            // create key to match up client data from different rows
                            const dataMatchKey = `${clientIndex}-${groupIndex}`;
                            if (!objToMerge[dataMatchKey]) {
                                objToMerge[dataMatchKey] = {};
                            }

                            // get rid of fieldName group #
                            // -> ex: '13. date' -> 'date'
                            const firstSpaceLoc = fieldName.indexOf(' ');
                            fieldName = fieldName.substr(firstSpaceLoc + 1);

                            // assign data to matching data key
                            objToMerge[dataMatchKey][fieldName] = fieldValue;
                        }
                        // else, not selected - do nothing
                        else {}
                    });
                });
                // add all data objects to the merge array!
                Object.entries(objToMerge).forEach(([_, dataObj]) => {
                    arrToMerge.push(dataObj);
                });
            }
            
            // single-select logic
            else {
                tableArr.forEach(([fieldName, ...fieldData], fieldIndex) => {
                    // get selectedIndex from selectedArr
                    const selectedIndex = selectedArr[fieldIndex];
                    
                    // if none selected, skip adding this field
                    if (selectedIndex === null) return;
        
                    // add selected field to array to merge
                    arrToMerge.push({
                        [fieldName]: fieldData[selectedIndex]
                    });
                });
            }

            // merge all objects in arrToMerge into mData
            arrToMerge.forEach(fieldObj => {
                // add prop (table key) if doesn't exist
                if (!mData[tableKey]) mData[tableKey] = [];

                // push data to big merge container object!
                mData[tableKey].push(fieldObj);
            })

            return mData;
        }, {pass: true});

        // close dialog
        this.handleMergeDialogClose();

        // if data merge didn't work perfectly, 
        if (!mergeData.pass) {
            console.error('error somewhere');
            return;
        }

        // pass data to action
        onMergeBegin(
            bkgPort,
            mergeData, // pass mergeData here!
            client1, // (target num)
            [client2, client3] // (other nums)
        );

        // lock tables, disable merge button
        this.setState({ mergeInProgress: true });
    }

    handleError = (msg, type='error') => {
        // TODO: display these errors / warnings somewhere?
        if (!['error','warn','info'].includes(type)) {
            console.error(`[handleError] has error! What is error` +
                ` type <${type}>`);
        } else {
            console[type](msg);
        }
    }
    handleCellSelected = (tableKey, isAllSelected, selectedArr) => {    
        this.setState({
            [tableKey + '_SelectedArr']: selectedArr,
            [tableKey + '_AllSelected']: isAllSelected
        });
    }

    /**
     * Function converts raw passed-in data to a flat array that can be easily
     * used by the component.
     * Example: Takes data like this:
     * {
     *  'FIRST_NAME': ['', '', ''],
     *  'LAST_NAME': ['', '', ''],
     *  ...
     * }
     * and turns it into something like this:
     * [
     *  ['FIRST_NAME', '', '', ''],
     *  ['LAST_NAME', '', '', ''], ...
     * ]
     *
     * @param {object} rawData - js object holding raw data
     * @param {function} errorHandler - error handler function
     * @param {string} key - data key
     */
    convertRawData = (rawData, key, type="basic") => {
        // throw error if data is empty
        if (!rawData || Object.keys(rawData).length === 0) {
            let msg = `rasData with key <${key}> is empty!`;
            this.handleError(msg);
            return [];
        }

        if (type === "basic") {
            // get array of Obj's props in raw data
            return Object.entries( rawData )
            // add raw data arrays to category / field name / key
            .map(dataCategory => {
                const key = dataCategory[0];
                let data = dataCategory[1];

                // destructure vars from final .reduce function
                const { pass: dataTypesMatch, dataType } =
                // convert data elements into their native "types"
                data.map(e => typeof(e))
                // remove undefined elements (typeof(undefined) is "undefined")
                .filter(type => type !== 'undefined')
                // pass if defined data's types are all the same!
                .reduce((container, dataType) => {
                    // if type hasn't been set, set dataType
                    if (!container.dataType) {
                        return {
                            pass: container.pass,
                            dataType: dataType
                        }
                    }
                    // dataType has ben set - only pass if current
                    // -> dataType matches old dataType
                    else {
                        return {
                            pass: dataType === container.dataType,
                            dataType: container.dataType
                        }
                    }
                }, { pass: true, dataType: '' });
                
                // If not all elements have same data type (or are undefined),
                // -> something probably went wrong. Throw error.
                if (!dataTypesMatch) {
                    let err = key + ' has mismatched data types' +
                        ' in data array! why?? fix this!';
                    console.error(err, dataCategory);
                    // add errors to output
                    return [key, ...data.map(e => 'ERROR')]
                }
                // else, all dataTypes are the same! onward!
                else {
                    // depending on the type, return different data
                    switch(dataType) {
                        case 'string': // do nothing, just display data!
                            break;
                        case 'number': // do nothing, except add "confused" warning
                            this.handleError('Huh? How is there a "number" dataType?', 'warn');
                            break;
                        case 'object':
                            // throw warning if it's an object, not array :D
                            if (Array.isArray(data[0])) {
                                console.warn(
                                    'UNSURE HOW TO HANDLE THESE OBJECTS!',
                                    'Should they be Arrays? Hmmmm...'
                                );
                            } else {
                                // arrays will be handled later - at the end
                                // -> of this handling function. So skip
                                // -> processing now
                                return dataCategory;
                            }
                            break;
                        case 'boolean':
                            // for checkboxes. turn 'true' into 'checked', false
                            // -> into 'not checked'
                            data = data.map(e => e ? 'checked' : 'not checked');
                            break;
                        case 'undefined': // all undefined - these will get
                            // -> filtered out later - don't worry now
                            break;
                        default:
                            this.handleError(
                                'How did we get here?? Data doesnt match' +
                                ' any expected values somehow...',
                                key, dataType
                            );
                    }
                    // finally, return the new array format
                    return [key, ...data]
                }
            })
            // filter -> hide row if all values are "blank"
            .filter(data => {
                // make array holding 'blank' values (0 and false are not blank
                // -> since they are valid numbers / boolean values)
                const blankTypes = [undefined, null, ''];
                
                // first elem is key (ex: 'FIRST_NAME'). Next 3 keys 
                return !(
                    blankTypes.includes(data[1]) &&
                    blankTypes.includes(data[2]) &&
                    blankTypes.includes(data[3])
                );
            });
        }
        // handle arrays of arrays
        else if (type === 'lists') {
            let runningTotal = 0;
            return Object.entries(
                // get array of Obj's props in raw data
                Object.entries(rawData)
                // don't worry about keys, process inner arrays
                .reduce((output, [_, data_container], container_index) => {
                    // for each data container array...
                    data_container.forEach((client_data_array, client_index) => {
                        // quit if data array doesn't exist (this happens often in
                        // -> history arrays
                        if (!client_data_array) return;
                        // for client's data array...
                        client_data_array.forEach((client_data, data_index) => {
                            // convert each object's props to array
                            Object.entries(client_data)
                            // for each data prob, get key and value
                            .forEach(([data_key, data_value]) => {
                                // calculate new field key name (including
                                // -> client index)
                                const data_index_key = `${runningTotal + data_index + 1}. ${data_key}`;
                                
                                // create empty array if not present yet
                                if (!output[data_index_key]) {
                                    output[data_index_key] = [];
                                }

                                // add data to correct index in output object & arrays
                                output[data_index_key][client_index] = data_value;
                                
                                // also add a 5th col value (data_index) - should
                                // -> not display, just to help selecting data
                                output[data_index_key][3] = runningTotal + data_index + 1;
                            });
                        });
                    });
                    // get max # of elements associated with each client
                    const numDataElems = Math.max(
                        data_container[0] ? data_container[0].length : 0,
                        data_container[1] ? data_container[1].length : 0,
                        data_container[2] ? data_container[2].length : 0
                    );

                    // increment running total (next data_index_key) by the
                    // -> max number of elements in the latest data container
                    runningTotal += numDataElems
                    return output
                }, {})
            )
            // change objs to correct format arr format
            .map(e => [e[0], ...e[1]])
            // filter -> hide row if all values are "blank"
            .filter(data => {
                // make array holding 'blank' values (0 and false are not blank
                // -> since they are valid numbers / boolean values)
                const blankTypes = [undefined, null, ''];
                
                // first elem is key (ex: 'FIRST_NAME'). Next 3 keys 
                return !(
                    blankTypes.includes(data[1]) &&
                    blankTypes.includes(data[2]) &&
                    blankTypes.includes(data[3])
                );
            });

        }
        // handle unknown type
        else {
            const msg = `Type <${type}> unknown?? What is this??`;
            this.handleError(msg);
            // errorHandler(msg);
            return [];
        }
    }

    buildGridTable = (config, tableIndex) => {
        const {
            key, title,
            type="basic",
            multiSelect=false
        } = config;
        
        const { ripsData, classes } = this.props;
        const {
            client3, client3Valid,
            mergeInProgress,
            formattedData
        } = this.state;

        // if data exists, build grid item!
        if (ripsData[key]) {
            return (
                <Grid item xs={12} className={classes.textCenter} key={title}>
                    <CustomTable
                        title={title}
                        tableKey={key}
                        data={formattedData[key]}
                        errorHandler={this.handleError}
                        cellSelectHandler={this.handleCellSelected}
                        type={type}
                        locked={mergeInProgress}
                        multiSelect={multiSelect}
                        numCols={client3 && client3Valid ? 3 : 2}
                    />
                </Grid>
            );
        }
        // otherwise, just return nothing
        else return null;
    }

    render() {
        const {
            classes, // styles
            // bkgPort, // port to background page
            ripsData, // data from RIPS
        } = this.props;

        const {
            client1, client2, client3,
            importInProgress,
            mergeInProgress,
            mergeDialogOpen
        } = this.state;

        return <Fragment>
            <Grid
                container 
                className={classes.root}
                // note: padding added in parent (in index.js) to make
                // -> spacing not cause issues in the Grid component
                spacing={16} 
            >
                {/* Title */}
                <Grid item xs={12} className={classes.textCenter}>
                    <h1>Welcome to "The Merger"!</h1>
                </Grid>

                {/* Input elements - StARS #s*/}
                <Grid item xs={12} className={classes.textCenter}>
                    <Paper className={classes.clientNumContainer}>
                        <h3>Enter StARS #s for each client below:</h3>
                        <Grid container justify="center" spacing={40}>
                            <Grid item xs={3}>
                                <TextField
                                    disabled={importInProgress}
                                    id="client1"
                                    label="Client StARS #1"
                                    className={classes.textField}
                                    value={client1}
                                    onChange={(event) => this.handleInputChange('client1', event)}
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <TextField
                                    disabled={importInProgress}
                                    id="client2"
                                    label="Client StARS #2"
                                    className={classes.textField}
                                    value={client2}
                                    onChange={(event) => this.handleInputChange('client2', event)}
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <TextField
                                    disabled={importInProgress}
                                    id="client3"
                                    label="Client StARS #3"
                                    className={classes.textField}
                                    value={client3}
                                    onChange={(event) => this.handleInputChange('client3', event)}
                                />
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                {/* "import" / "clear" buttons - begin collecting data or clear! */}
                <Grid item xs={12} className={classes.textCenter}>
                    <Grid container justify="center">
                        <Grid item xs={2}>
                            <Button
                                color="primary"
                                className={classes.button}
                                variant="contained"
                                size="large"
                                disabled={this.handleImportDisabled()}
                                onClick={this.handleImport}
                            >
                                Import
                            </Button>
                        </Grid>
                        <Grid item xs={2}>
                            <Button
                                color="secondary"
                                className={classes.button}
                                variant="contained"
                                size="large"
                                onClick={this.handleClear}
                            >
                                Clear
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>

                {/* Instructions */}
                <Grid item xs={12} className={classes.textCenter}>
                    <h1>Select the "correct" client data below!</h1>
                    <h4 className={classes.description}>
                        Each table below shows data that is inconsistent
                        between client records. Therefore, please select
                        a cell in each row that represents the accurate
                        data for that field.
                    </h4>
                    <h4 className={classes.description}>
                        ----------------------------------
                    </h4>
                    <h4 className={classes.description}>
                        Example: If the Date of Birth field is shown below,
                        that means the clients entered have different Date of
                        Birth saved in their RIPS record. Select the
                        correct Date of Birth that will be saved in the
                        merged record.
                    </h4>
                </Grid>

                {/* Build all data tables :) */}
                {this.tableConfigHolder.map((tableConfig, tableIndex) => {
                    return this.buildGridTable(tableConfig, tableIndex);
                })}
 
                {/* "Merge" button - begin RIPS merge! */}
                {ripsData && Object.keys(ripsData).length > 0 ?
                <Grid item xs={12} className={classes.textCenter}>
                    <Grid container justify="center">
                        <h4 className={classes.dialogDescriptionPadding}>
                            When you're ready to merge two (or 3) client records
                            in RIPS, make sure you've selected all of the data
                            you want to be saved in the final record! You'll see
                            all green boxes in the "Field Names" column when
                            there's no forgotten data! Finally, just
                            press "Merge" below!
                        </h4>

                        <Grid item xs={4}>
                            <Button
                                color="secondary"
                                className={classes.button}
                                variant="contained"
                                size="large"
                                onClick={this.handleMergeDialogOpen}
                                disabled={mergeInProgress}
                            >
                                Merge
                            </Button>
                        </Grid>
                    </Grid>
                </Grid> : null}
            </Grid>

            {/* "Merge" dialog! */}
            <Dialog
                open={mergeDialogOpen}
                onClose={this.handleMergeDialogClose}
                aria-labelledby="merge-dialog-title"
                aria-describedby="merge-dialog-description"
            >
                <DialogTitle id="merge-dialog-title">
                    {"Are you sure you're ready to merge?"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="merge-dialog-description">
                        If you're 100% sure you selected all of the correct
                        client data that should be merged into one RIPS
                        record, select "Merge". IF YOU HAVE ANY QUESTIONS
                        AT ALL, please talk to your coordinator or to
                        the RIPS guy.
                    </DialogContentText>
                    {this.state.dialogNotAllSelectedContent}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={this.handleMergeDialogClose}
                        color="primary"
                    >
                        Take me back
                    </Button>   
                    <Button
                        onClick={this.handleMergeDialogAgree}
                        color="primary" autoFocus
                    >
                        Merge
                    </Button>
                </DialogActions>
            </Dialog>
        </Fragment>
    }
}

// set up styles
const styles = theme => ({
    root: {
        flexGrow: 1
    },
    textCenter: {
        textAlign: 'center'
    },
    button: {
        margin: theme.spacing.unit
    },
    // header styles
    header: {
        padding: '1px 0px' // gives it some volume somehow
    },
    // input element styles
    clientNumContainer: {
        padding: '10px 0 20px 0'
    },
    // text-area (input) styles
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 200,
    },
    // description sections
    description: {
        margin: '0 25%'
    },
    dialogDescriptionPadding: {
        margin: '0 25%',
        padding: '20px'
    },
    dialogListStyles: {
        paddingTop: '4px',
        paddingBottom: '4px',
        color: '#e53935',
        fontWeight: 'bold'
    }
});

const mapStateToProps = state => {
    return {
        // TODO: isAuthenticated...
        bkgPort: state.port.port,
        ripsData: state.rips.data,
        // selectedRows: state.tables.selected
    };
};

const mapDispatchToProps = dispatch => {
    return {
        onBackgroundPortInit: (chrome) => dispatch(actions.backgroundPortInit(chrome)),
        onRipsFetchData: (bkgPort, nums) => dispatch(actions.ripsFetchData(bkgPort, nums)),
        onMergeBegin: (bkgPort, data) => dispatch(actions.ripsMergeClients(bkgPort, data))
    };
};

// Option 2: use package 'recompose' to export withstyles & connect
// https://github.com/acdlite/recompose
// https://stackoverflow.com/questions/45704681/react-material-ui-export-multiple-higher-order-components
export default connect(
    mapStateToProps, mapDispatchToProps
)(withStyles(styles)(App));
