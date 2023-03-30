import React from "react";
import {Auth} from "aws-amplify";
import {Route, Redirect} from "react-router-dom";

interface Props {
    component: React.FC;
}

const ProtectedRoute: React.FC<Props> = ({component}) => {
    const [isAuthenticated, setLoggedIn] = React.useState(true);
    React.useEffect(() => {
        (async () => {
            let user = null;

            try {
                console.log('We are inside hook...');

                user = await Auth.currentAuthenticatedUser();
                if (user && user.signInUserSession.idToken.jwtToken) {
                    setLoggedIn(true);
                } else {
                    setLoggedIn(false);
                }
            } catch (e) {
                console.error('Encountered error: ', e);
                setLoggedIn(false);
            }
        })();
    });

    return (
        <Route
            render={(props) =>
                isAuthenticated ? (
                    React.createElement(component)
                ) : (
                    <Redirect to="/signin"/>
                )
            }
        />
    );
};

export default ProtectedRoute;