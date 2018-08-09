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
import * as actions from './store/actions/index';

// rips page and field keys
import {
    RIPS_PAGE_KEYS as P_KEYS
} from './shared/rips/ripsFieldKeys';

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

class App extends Component {
    state = {
        client1: '',
        client2: '',
        client3: ''
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

    handleInputChange = name => event => {
        this.setState({
            [name]: event.target.value
        });
    }

    handleImport = () => {
        console.log('clicked Import');
        // call action to start fetching data from rips
        this.props.onRipsFetchData(this.props.bkgPort);
    }

    handleClear = () => {
        console.log('clicked Clear');
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
                                    value={this.state.client1}
                                    onChange={this.handleInputChange('client1')}
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <TextField
                                    id="client2"
                                    label="Client StARS #2"
                                    className={classes.textField}
                                    value={this.state.client2}
                                    onChange={this.handleInputChange('client2')}
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <TextField
                                    id="client3"
                                    label="Client StARS #3"
                                    className={classes.textField}
                                    value={this.state.client3}
                                    onChange={this.handleInputChange('client3')}
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
                                disabled={!bkgPort}
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
        onRipsFetchData: (bkgPort) => dispatch(actions.ripsFetchData(bkgPort))
    };
};

// Option 2: use package 'recompose' to export withstyles & connect
// https://github.com/acdlite/recompose
// https://stackoverflow.com/questions/45704681/react-material-ui-export-multiple-higher-order-components
export default connect(
    mapStateToProps, mapDispatchToProps
)(withStyles(styles)(App));
