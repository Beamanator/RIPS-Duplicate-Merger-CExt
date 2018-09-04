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
    state = {
        client1: '201813794', client1Valid: false,
        client2: '201815032', client2Valid: false,
        client3: '201814527', client3Valid: true, // valid cuz client3 can be empty
        importInProgress: false,
        mergeInProgress: false,
        nodeEnv: process.env.NODE_ENV,
        mergeDialogOpen: false,
        tablesAllSelected: {
            [R_KEYS.CLIENT_BASIC_INFORMATION]: false,
            [R_KEYS.ADDRESSES]: false,
            [R_KEYS.NOTES]: false,
            [R_KEYS.RELATIVES]: false,
            [R_KEYS.CONTACTS]: false,
            [R_KEYS.FILES]: false,
            [R_KEYS.HISTORY]: false,
        },
        dialogNotAllSelectedContent: ''
    }

    componentWillMount() {
        // Warn user if we're in development environment
        if (process.env.NODE_ENV === 'development') {
            console.warn(
                "Not initializing ports since we're only in " +
                'dev mode (not inside a chrome extension)...'
            );
        }
        // Check if port exists. Set one up if not!
        else if (!this.props.bkgPort) {
            // begin port init
            this.props.onBackgroundPortInit(chrome);
        } else {
            console.warn('<Main> port already exists', this.props.bkgPort);
        }

        // initialize client#Valid state props
        const { client1, client2, client3 } = this.state;
        let client1Valid = this.checkClientNumValid(client1);
        let client2Valid = this.checkClientNumValid(client2);
        let client3Valid = this.checkClientNumValid(client3, true);
        this.setState({ client1Valid, client2Valid, client3Valid })
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

        // disable clicking import while import in progress
        this.setState({ importInProgress: true });
        
        // gather client nums into array
        const { client1, client2, client3 } = this.state;
        const clientNums = [ client1, client2, client3 ];

        // call action to start fetching data from rips
        this.props.onRipsFetchData(this.props.bkgPort, clientNums);
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
        const { tablesAllSelected } = this.state;
        const { classes: { dialogListStyles } } = this.props;
        
        let emptyTableNames = [];
        let emptyTablesMessage = 'Warning: The following tables do ' +
            'not have ALL rows selected, so there will be some data' +
            ' LEFT OUT of the merge:';

        // loop through state prop [tablesAllSelected] and
        // -> add a note that mentions which tables are not totally
        // -> selected. User should think about closing the modal
        // -> and selecting some more values to be 100% accurate
        Object.entries(tablesAllSelected)
        .forEach(([tableKey, isAllSelected]) => {
            if (!isAllSelected) {
                emptyTableNames.push(tableKey);
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
        // close dialog
        this.handleMergeDialogClose();
        // call action for triggering merge
        console.log('DO MERGE');
        // TODO: make table selections turn grey and not be
        // -> hoverable / clickable since these are now set
        // -> in stone!
        this.setState({
            mergeInProgress: true
        });
    }

    handleError = (msg, type='error') => {
        // TODO: display these errors / warnings somewhere?
        if (!['error','warn','info'].includes(type)) {
            console.error('[handleError] has error! shit!');
        } else {
            console[type](msg);
        }
    }
    handleCellSelected = (tableTitle, isAllSelected) => {
        const newTablesSelectedContainer = {
            ...this.state.tablesAllSelected,
            [tableTitle]: isAllSelected
        };

        this.setState({
            tablesAllSelected: newTablesSelectedContainer
        });
    }

    buildGridTable = (config, tableIndex) => {
        const {
            key, title,
            type="basic",
            multiSelect=false
        } = config;
        
        const { ripsData, classes } = this.props;
        const { client3, client3Valid, mergeInProgress } = this.state;

        // if data exists, build grid item!
        if (ripsData[key]) {
            return (
                <Grid item xs={12} className={classes.textCenter} key={title}>
                    <CustomTable
                        title={title}
                        tableKey={key}
                        rawData={ripsData[key]}
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
                {[{
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
                }].map((tableConfig, tableIndex) => {
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
                            >
                                Merge
                            </Button>
                        </Grid>
                    </Grid>
                </Grid> : null}
            </Grid>

            {/* "Merge?" dialog! */}
            {/* TODO: populate with ... my own text & stuff */}
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
        // onTableCalcUnselected: (selected) => dispatch(actions.tableCalcUnselected(selected))
        // onTableCalcUnselected: () => dispatch(actions.tableCalcUnselected())
    };
};

// Option 2: use package 'recompose' to export withstyles & connect
// https://github.com/acdlite/recompose
// https://stackoverflow.com/questions/45704681/react-material-ui-export-multiple-higher-order-components
export default connect(
    mapStateToProps, mapDispatchToProps
)(withStyles(styles)(App));
