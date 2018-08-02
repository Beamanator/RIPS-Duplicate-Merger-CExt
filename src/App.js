import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';

import CustomTable from './components/CustomTable';

import {
    RIPS_PAGE_KEYS as P_KEYS,
    RIPS_FIELD_KEYS as F_KEYS
} from './shared/rips/ripsFieldKeys';

// import core components
import {
    Button,
    Grid,
    Paper,
    TextField
} from '@material-ui/core';


// TODO: get data from RIPS...
// TODO: move this initialized data to redux store?
/**
 * Function creates empty arrays next to each field, to make table populating
 * easy. Basically, turns something like this:
 * ['FIRST NAME', 'LAST NAME', ...]
 * into something like this:
 * [
 *  ['FIRST NAME', '', '', ''],
 *  ['LAST NAME', '', '', ''],
 *  ...
 * ]
 *
 * @param {object} fieldArr - array of RIPS fields
 * @param {number} numEmpty - number of empty slots to add next to each field
 * @returns converted array (see function description)
 */
const createEmptyData = (fieldArr, numEmpty) => {
    let container = {};

    // build array of empty strings, with length numEmpty
    let emptyStrArr = [...Array(numEmpty)]
        .map(elem => '');

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
        NOTES
    ]),
};

console.log(data);

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

                {/* TODO: <Client Basic Information> Table */}
                <Grid item xs={12} className={classes.textCenter}>
                    <Paper className={classes.header}>
                        <h3>Client Basic Information</h3>
                        {/* TODO: pass data down */}
                        <CustomTable
                            data={data[P_KEYS.CLIENT_BASIC_INFORMATION]}
                        />
                    </Paper>
                </Grid>

                {/* TODO: <Addresses> Table */}
                <Grid item xs={12} className={classes.textCenter}>
                    Addresses
                </Grid>
                
                {/* TODO: <Notes> Table */}
                <Grid item xs={12} className={classes.textCenter}>
                    Notes
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

export default withStyles(styles)(App);
