import Dbc from './dbc/dbc'

const dbc = new Dbc('/Users/headquarters/Documents/Code/can-dbc/src/__tests__/testFiles/SimpleDBC.dbc');
dbc.load().then(x => {
    console.log(x)
})
