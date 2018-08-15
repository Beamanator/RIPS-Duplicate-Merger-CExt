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
    TextField
} from '@material-ui/core';

// redux store actions
import * as actions from './store/actions';

// rips page and field keys
import {
    RIPS_PAGE_KEYS as P_KEYS
} from './shared/ripsKeys';

class App extends Component {
    state = {
        client1: '', client1Valid: false,
        client2: '', client2Valid: false,
        client3: '', client3Valid: true, // valid cuz client3 can be empty
        importInProgress: false,
        nodeEnv: process.env.NODE_ENV
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

        // uncomment if values aren't what you'd expect!
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
        console.log('clicked Clear');

        // enable import button
        this.setState({ importInProgress: false });
    }

    handleError = (msg) => {
        console.error(msg)
    }

    render() {
        const {
            classes, // styles
            bkgPort, // port to background page
            sampleData, // test data
        } = this.props;

        const {
            client1, client2, client3,
            client1Valid, client2Valid, client3Valid,
            importInProgress, nodeEnv
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
                                    id="client1"
                                    label="Client StARS #1"
                                    className={classes.textField}
                                    value={client1}
                                    onChange={(event) => this.handleInputChange('client1', event)}
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <TextField
                                    id="client2"
                                    label="Client StARS #2"
                                    className={classes.textField}
                                    value={client2}
                                    onChange={(event) => this.handleInputChange('client2', event)}
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <TextField
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
                        Example: If the Date of Birth field is shown below,
                        that means the clients entered have different Date of
                        Birth saved in their RIPS record. Select the
                        correct Date of Birth that will be saved in the
                        merged record.
                    </h4>
                </Grid>

                {/* <Client Basic Information> Table */}
                <Grid item xs={12} className={classes.textCenter}>
                    <CustomTable
                        title="Client Basic Information"
                        rawData={sampleData[P_KEYS.CLIENT_BASIC_INFORMATION]}
                        errorHandler={this.handleError}
                    />
                </Grid>

                {/* TODO: <Addresses> Table */}
                <Grid item xs={12} className={classes.textCenter}>
                    Addresses
                </Grid>
                
                {/* <Notes> Table */}
                <Grid item xs={12} className={classes.textCenter}>
                    <CustomTable
                        title="Notes"
                        rawData={sampleData[P_KEYS.NOTES]}
                        errorHandler={this.handleError}
                    />
                </Grid>
                
                {/* TODO: <Aliases> Table */}
                <Grid item xs={12} className={classes.textCenter}>
                    Aliases
                </Grid>

                {/* TODO: <Relatives> Table */}
                <Grid item xs={12} className={classes.textCenter}>
                    Relatives
                </Grid>

                {/* TODO: <Contacts> Table */}
                <Grid item xs={12} className={classes.textCenter}>
                    Contacts
                </Grid>

                {/* TODO: <Files (normal and private)> Table */}
                <Grid item xs={12} className={classes.textCenter}>
                    Files (normal and pivate)
                </Grid>

                {/* TODO: <Actions / services> Table */}
                <Grid item xs={12} className={classes.textCenter}>
                    Actions / Services
                </Grid>
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
});

const mapStateToProps = state => {
    return {
        // isAuthenticated...
        sampleData: state.rips.data,
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
