import Dbc from './dbc/dbc'

const dbc = new Dbc('/Users/headquarters/Documents/Code/can-dbc/src/__tests__/testFiles/DBC_template.dbc');
dbc.load().then(x => {
    console.log(x)
})
