import React, { useContext } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { NotificationStateContext } from './contexts/NotificationContext';

import Login from './components/pages/Login';
import CreatePassword from './components/pages/setup/CreatePassword';
import ConfigureAccount from './components/pages/setup/ConfigureAccount';
import CreateApplication from './components/pages/setup/CreateApplication';
import ConfigureSipTrunk from './components/pages/setup/ConfigureSipTrunk';
import SetupComplete from './components/pages/setup/SetupComplete';
import AccountsList from './components/pages/internal/AccountsList';
import ApplicationsList from './components/pages/internal/ApplicationsList';
import SipTrunksList from './components/pages/internal/SipTrunksList';
import PhoneNumbersList from './components/pages/internal/PhoneNumbersList';
import MsTeamsTenantsList from './components/pages/internal/MsTeamsTenantsList';
import AccountsAddEdit from './components/pages/internal/AccountsAddEdit';
import ApplicationsAddEdit from './components/pages/internal/ApplicationsAddEdit';
import SipTrunksAddEdit from './components/pages/internal/SipTrunksAddEdit';
import PhoneNumbersAddEdit from './components/pages/internal/PhoneNumbersAddEdit';
import MsTeamsTenantsAddEdit from './components/pages/internal/MsTeamsTenantsAddEdit';
import Settings from './components/pages/internal/Settings';
import RecentCallsList from './components/pages/internal/RecentCallsList';
import AlertsList from './components/pages/internal/AlertsList';
import InvalidRoute from './components/pages/InvalidRoute';
import SpeechServicesList from './components/pages/internal/SpeechServicesList';

import Notification from './components/blocks/Notification';
import Nav from './components/blocks/Nav';
import SideMenu from './components/blocks/SideMenu';

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

        <Route path="/internal">
          <div style={{ display: "flex" }}>
            <SideMenu />
            <Route exact path="/internal/accounts"><AccountsList /></Route>
            <Route exact path="/internal/applications"><ApplicationsList /></Route>
            <Route exact path="/internal/sip-trunks"><SipTrunksList /></Route>
            <Route exact path="/internal/speech-services"><SpeechServicesList /></Route>
            <Route exact path="/internal/phone-numbers"><PhoneNumbersList /></Route>
            <Route exact path="/internal/ms-teams-tenants"><MsTeamsTenantsList /></Route>

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
              "/internal/speech-services/add",
              "/internal/speech-services/:speech_service_sid/edit"
            ]}>
              <SpeechServicesAddEdit />
            </Route>

            <Route exact path={[
              "/internal/phone-numbers/add",
              "/internal/phone-numbers/:phone_number_sid/edit"
            ]}>
              <PhoneNumbersAddEdit />
            </Route>

            <Route exact path={[
              "/internal/ms-teams-tenants/add",
              "/internal/ms-teams-tenants/:ms_teams_tenant_sid/edit"
            ]}>
              <MsTeamsTenantsAddEdit />
            </Route>

            <Route exact path="/internal/settings"><Settings /></Route>

            <Route exact path="/internal/recent-calls"><RecentCallsList /></Route>
            <Route exact path="/internal/alerts"><AlertsList /></Route>
          </div>
        </Route>

        <Route><InvalidRoute /></Route>
      </Switch>
    </Router>
  );
}

export default App;
