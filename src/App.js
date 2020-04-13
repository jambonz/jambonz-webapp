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
      </Switch>
    </Router>
  );
}

export default App;
