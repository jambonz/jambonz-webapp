import React, { useContext } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { NotificationStateContext } from './contexts/NotificationContext';

import Login from './pages/Login';
import CreatePassword from './pages/setup/CreatePassword';
import ConfigureAccount from './pages/setup/ConfigureAccount';
import CreateApplication from './pages/setup/CreateApplication';
import ConfigureSipTrunk from './pages/setup/ConfigureSipTrunk';
import SetupComplete from './pages/setup/SetupComplete';
import AccountsList from './pages/internal/AccountsList';
import ApplicationsList from './pages/internal/ApplicationsList';
import SipTrunksList from './pages/internal/SipTrunksList';
import PhoneNumbersList from './pages/internal/PhoneNumbersList';
import AccountsAddEdit from './pages/internal/AccountsAddEdit';
import ApplicationsAddEdit from './pages/internal/ApplicationsAddEdit';
import SipTrunksAddEdit from './pages/internal/SipTrunksAddEdit';
import PhoneNumbersAddEdit from './pages/internal/PhoneNumbersAddEdit';

import Notification from './blocks/Notification';
import Nav from './blocks/Nav';

function App() {
  const notifications = useContext(NotificationStateContext);
  return (
    <Router>
      <Notification notifications={notifications} />
      <Nav />
      <Switch>
        <Route exact path="/"><Login /></Route>
        <Route exact path="/create-password"><CreatePassword /></Route>
        <Route exact path="/configure-account"><ConfigureAccount /></Route>
        <Route exact path="/create-application"><CreateApplication /></Route>
        <Route exact path="/configure-sip-trunk"><ConfigureSipTrunk /></Route>
        <Route exact path="/setup-complete"><SetupComplete /></Route>

        <Route exact path="/internal/accounts"><AccountsList /></Route>
        <Route exact path="/internal/applications"><ApplicationsList /></Route>
        <Route exact path="/internal/sip-trunks"><SipTrunksList /></Route>
        <Route exact path="/internal/phone-numbers"><PhoneNumbersList /></Route>

        <Route exact path={[
          "/internal/accounts/add",
          "/internal/accounts/:account_sid/edit"
        ]}>
          <AccountsAddEdit />
        </Route>

        <Route exact path={[
          "/internal/applications/add",
          "/internal/applications/:application_sid/edit"
        ]}>
          <ApplicationsAddEdit />
        </Route>

        <Route exact path={[
          "/internal/sip-trunks/add",
          "/internal/sip-trunks/:voip_carrier_sid/edit"
        ]}>
          <SipTrunksAddEdit />
        </Route>

        <Route exact path={[
          "/internal/phone-numbers/add",
          "/internal/phone-numbers/:phone_number_sid/edit"
        ]}>
          <PhoneNumbersAddEdit />
        </Route>

      </Switch>
    </Router>
  );
}

export default App;
