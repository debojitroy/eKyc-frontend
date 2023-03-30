import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@emotion/react';
import { CssBaseline } from '@mui/material';
import {ReactNotifications} from "react-notifications-component";
import "react-notifications-component/dist/theme.css";
import theme from './theme';
import App from './App';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <ReactNotifications />
            <CssBaseline />
            <App />
        </ThemeProvider>
    </React.StrictMode>,
);
