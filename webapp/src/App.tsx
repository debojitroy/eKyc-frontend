import * as React from 'react';
import {BrowserRouter as Router, Switch, Route} from "react-router-dom";
import {Amplify} from "aws-amplify";
import Card from "@mui/material/Card";
import {COGNITO} from "./configs/aws";
import ProtectedRoute from "./components/ProtectedRoute";
import EKyc from "./components/EKyc";
import Login from "./components/Login";
import SignUp from "./components/Signup";
import Confirmation from "./components/Confirmation";

Amplify.configure({
  aws_cognito_region: COGNITO.REGION,
  aws_user_pools_id: COGNITO.USER_POOL_ID,
  aws_user_pools_web_client_id: COGNITO.APP_CLIENT_ID,
});

const App: React.FC = () => {
  return (
      <Router>
        <Card style={{width: 1000, margin: "100px auto", padding: "40px"}}>
          <Switch>
            <Route path="/signin">
              <Login/>
            </Route>
            <Route path="/signup">
              <SignUp/>
            </Route>
            <Route path="/confirmation">
              <Confirmation/>
            </Route>
            <Route path="/">
              <ProtectedRoute component={EKyc}/>
            </Route>
          </Switch>
        </Card>
      </Router>
  );
};

export default App;