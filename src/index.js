import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';

import {BrowserRouter} from 'react-router-dom';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';


const theme = createMuiTheme({
  palette: {
     primary: {
        light: '#01e464',
        main: '#01b750',
        dark: '#017f37'
     },
     secondary: {
       main: '#f44336',
     },
  },
  typography: { 
     useNextVariants: true
  },
  overrides: {
   MuiButton: {
     root: {
       padding: '5px 24px',
       textTransform: 'none'
     },
     label: {
      fontSize: 15
     },
     containedPrimary: {
       color: 'white'
     }
   },
   MuiPaper: {
     rounded: {
       borderRadius: 8
     }
   },
   MuiDialogTitle: {
      root: {
         padding: '12px 20px'
      }
   },
   MuiIcon: {
     root: {
      verticalAlign: 'middle'
     }
   },
   MuiAppBar: {
     colorPrimary: {
      color: 'white',
      fontStyle: 'italic'
     }
    }
 },
 props: {
   MuiButton: {
     disableRipple: true,
     disableElevation: true, 
   },
 }
});


const app = (
   <BrowserRouter>
      <MuiThemeProvider theme = { theme }>
         <App />
      </MuiThemeProvider>
   </BrowserRouter>
 )

ReactDOM.render(app, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
