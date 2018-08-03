// TODO: add global chrome here
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';

import CustomTable from './components/CustomTable';

// rips page and field keys
import {
    RIPS_PAGE_KEYS as P_KEYS,
    RIPS_FIELD_KEYS as F_KEYS
} from './shared/rips/ripsFieldKeys';

// material-ui core components
import {
    Button,
    Grid,
    Paper,
    TextField
} from '@material-ui/core';

// redux store actions
import * as actions from './store/actions/index';

// TODO: get data from RIPS...
// TODO: move this initialized data to redux store?
/**
 * Function creates empty arrays next to each field name to make table populating
 * easy.
 * Example: Takes data like this:
 * ['FIRST_NAME', 'LAST_NAME', ...]
 * and turns it into something like this:
 * {
 *  'FIRST_NAME': ['', '', ''],
 *  'LAST_NAME': ['', '', ''], ...
 * }
 *
 * @param {object} fieldArr - array of RIPS fields
 * @param {number} numEmpty - number of empty slots to add next to each field
 * @returns converted array (see function description)
 */
const createEmptyData = (fieldArr, numEmpty) => {
    let container = {};

    // build array of empty strings, with length numEmpty
    let emptyStrArr = [...Array(numEmpty)]
        .map(_ => '');

    // map empty string arrays to each data category
    fieldArr.forEach(category => {
        container[category] = emptyStrArr
    });

    return container;
}

// destructure keys from F_KEYS so we don't have to do F_KEYS.FIRST_NAME, ...
const {
    // client basic information
    FIRST_NAME, LAST_NAME, PHONE_NUMBER, ADDRESS1, ADDRESS2, OTHER_PHONE_NUMBER,
    EMAIL_ADDRESS, UNHCR_NUMBER, DATE_OF_BIRTH, GENDER, NATIONALITY, COUNTRY_OF_ORIGIN,
    ETHNIC_ORIGIN, MAIN_LANGUAGE, SECOND_LANGUAGE, MARITAL_STATUS,
    // addresses (dynamic - TODO)
    // notes
    NOTES

} = F_KEYS;
// create empty, initial data
const data = {
    // client basic information
    [P_KEYS.CLIENT_BASIC_INFORMATION]: createEmptyData([
        FIRST_NAME, LAST_NAME, PHONE_NUMBER, ADDRESS1, ADDRESS2, OTHER_PHONE_NUMBER,
        EMAIL_ADDRESS, UNHCR_NUMBER, DATE_OF_BIRTH, GENDER, NATIONALITY, COUNTRY_OF_ORIGIN,
        ETHNIC_ORIGIN, MAIN_LANGUAGE, SECOND_LANGUAGE, MARITAL_STATUS
    ], 3),

    // Addresses (dynamic - TODO)
    // [P_KEYS.ADDRESSES]: createEmptyData([ ... ]),

    // Notes
    [P_KEYS.NOTES]: createEmptyData([
        // NOTES
    ]),
};

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
            // TODO: get rid of test action
            this.props.onBackgroundPortInit();
        }
        // Check if port exists. Set one up if not!
        else if (!this.props.bkgPort) {
            // begin port init
            // TODO: pass 'chrome' into port init
            this.props.onBackgroundPortInit();
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
    }

    handleClear = () => {
        console.log('clicked Clear');
    }

    handleError = (msg) => {
        console.error(msg)
    }

    render() {
        const { classes } = this.props;

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
                                    label="Client #1"
                                    className={classes.textField}
                                    value={this.state.client1}
                                    onChange={this.handleInputChange('client1')}
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <TextField
                                    id="client2"
                                    label="Client #2"
                                    className={classes.textField}
                                    value={this.state.client2}
                                    onChange={this.handleInputChange('client2')}
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <TextField
                                    id="client3"
                                    label="Client #3"
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
                        rawData={data[P_KEYS.CLIENT_BASIC_INFORMATION]}
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
                        rawData={data[P_KEYS.NOTES]}
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
        // default table data
        bkgPort: state.port.port,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        onBackgroundPortInit: () => dispatch(actions.backgroundPortInit())
    };
};

// Option 2: use package 'recompose' to export withstyles & connect
// https://github.com/acdlite/recompose
// https://stackoverflow.com/questions/45704681/react-material-ui-export-multiple-higher-order-components
export default connect(mapStateToProps, mapDispatchToProps)
    (withStyles(styles)(App));
