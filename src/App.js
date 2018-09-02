/*global chrome*/
import React, { Component } from 'react';
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
    DialogContentText, DialogTitle
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
        nodeEnv: process.env.NODE_ENV,
        mergeDialogOpen: false
    }

    componentDidMount() {
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
        let client3Valid = this.checkClientNumValid(client3);
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
        console.log('clicked Import');

        // disable clicking import while import in progress
        this.setState({ importInProgress: true });
        
        // gather client nums into array
        const { client1, client2, client3 } = this.state;
        const clientNums = [ client1, client2, client3 ];

        // call action to start fetching data from rips
        this.props.onRipsFetchData(this.props.bkgPort, clientNums);
    }

    handleClear = () => {
        // TODO: also clear client / rips data? 
        // Clear client nums, and reset client#Valid variables
        this.setState({
            client1: '', client1Valid: false,
            client2: '', client2Valid: false,
            client3: '', client3Valid: true,
            importInProgress: false
        });
    }

    handleMergeDialogOpen = () => {
        this.setState({ mergeDialogOpen: true });
    }
    handleMergeDialogClose = () => {
        this.setState({ mergeDialogOpen: false });
    }
    handleMergeDialogAgree = () => {
        // close dialog
        this.handleMergeDialogClose();
        // TODO: call action
        // TODO: throw warning for any / all sections that aren't selected?
        console.log('DO MERGE');
    }

    handleError = (msg) => {
        // TODO: display these errors / warnings somewhere?
        console.error(msg)
    }

    buildGridTable = (config) => {
        const {
            key, title,
            type="basic",
            multiSelect=false
        } = config;
        
        const { ripsData, classes } = this.props;
        const { client3, client3Valid } = this.state;
        
        // if data exists, build grid item!
        if (ripsData[key]) {
            return (
                <Grid item xs={12} className={classes.textCenter}>
                    <CustomTable
                        title={title}
                        rawData={ripsData[key]}
                        errorHandler={this.handleError}
                        type={type}
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

        return (
            <Grid
                container 
                className={classes.root}
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

                {/* <Client Basic Information> Table */}
                {this.buildGridTable({
                    key: R_KEYS.CLIENT_BASIC_INFORMATION,
                    title: 'Client Basic Information'
                })}

                {/* <Addresses> Table */}
                {this.buildGridTable({
                    key: R_KEYS.ADDRESSES,
                    title: 'Addresses',
                    type: 'lists',
                    multiSelect: true
                })}
                
                {/* <Notes> Table */}
                {this.buildGridTable({
                    key: R_KEYS.NOTES,
                    title: 'Basic Notes'
                })}

                {/* <Relatives> Table */}
                {this.buildGridTable({
                    key: R_KEYS.RELATIVES,
                    title: 'Relatives',
                    type: 'lists',
                    multiSelect: true
                })}

                {/* <Contacts> Table */}
                {this.buildGridTable({
                    key: R_KEYS.CONTACTS,
                    title: 'Contacts',
                    type: 'lists',
                    multiSelect: true
                })}

                {/* <Files (normal)> Table */}
                {this.buildGridTable({
                    key: R_KEYS.FILES,
                    title: 'Files',
                    type: 'lists',
                    multiSelect: true
                })}

                {/* <History> Table */}
                {this.buildGridTable({
                    key: R_KEYS.HISTORY,
                    title: 'Action History',
                    type: 'lists',
                    multiSelect: true
                })}

                {/* Skipping for now - <Aliases> / <Private Files> Tables */}

                {/* "Merge" button - begin RIPS merge! */}
                {ripsData && Object.keys(ripsData).length > 0 ?
                <Grid item xs={12} className={classes.textCenter}>
                    <Grid container justify="center">
                        <h4 className={classes.mergeDescriptionPadding}>
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

                {/* "Merge?" dialog! */}
                {/* TODO: populate with ... my own text & stuff */}
                <Dialog
                    open={mergeDialogOpen}
                    onClose={this.handleMergeDialogClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">{"Use Google's location service?"}</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            Let Google help apps determine location. This means sending anonymous location data to
                            Google, even when no apps are running.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleMergeDialogClose} color="primary">
                            Disagree
                        </Button>   
                        <Button onClick={this.handleMergeDialogAgree} color="primary" autoFocus>
                            Agree
                        </Button>
                    </DialogActions>
                </Dialog>
            </Grid>
        );
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
    mergeDescriptionPadding: {
        margin: '0 25%',
        padding: '20px'
    }
});

const mapStateToProps = state => {
    return {
        // isAuthenticated...
        ripsData: state.rips.data,
        bkgPort: state.port.port,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        onBackgroundPortInit: (chrome) => dispatch(actions.backgroundPortInit(chrome)),
        onRipsFetchData: (bkgPort, nums) => dispatch(actions.ripsFetchData(bkgPort, nums))
    };
};

// Option 2: use package 'recompose' to export withstyles & connect
// https://github.com/acdlite/recompose
// https://stackoverflow.com/questions/45704681/react-material-ui-export-multiple-higher-order-components
export default connect(
    mapStateToProps, mapDispatchToProps
)(withStyles(styles)(App));
