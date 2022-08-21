import React from "react";
import { Routes, Route } from "react-router-dom";

import { RequireAuth, Toast } from "src/components";
import { withSuspense } from "src/utils";
import { useSelectState } from "src/store";
import { Login, Layout as LoginLayout } from "src/containers/login";
import { Layout as InternalLayout } from "src/containers/internal";
import { NotFound } from "src/containers/notfound";

/** Login */
const LazyCreatePassword = withSuspense(
  React.lazy(() => import("src/containers/login/create-password"))
);

/** Top navi */
const LazySettings = withSuspense(
  React.lazy(() => import("src/containers/internal/views/settings"))
);
const LazyAccounts = withSuspense(
  React.lazy(() => import("src/containers/internal/views/accounts"))
);
const LazyAccountAdd = withSuspense(
  React.lazy(() => import("src/containers/internal/views/accounts/add"))
);
const LazyAccountEdit = withSuspense(
  React.lazy(() => import("src/containers/internal/views/accounts/edit"))
);
const LazyApplications = withSuspense(
  React.lazy(() => import("src/containers/internal/views/applications"))
);
const LazyApplicationsAdd = withSuspense(
  React.lazy(() => import("src/containers/internal/views/applications/add"))
);
const LazyApplicationsEdit = withSuspense(
  React.lazy(() => import("src/containers/internal/views/applications/edit"))
);
const LazyRecentCalls = withSuspense(
  React.lazy(() => import("src/containers/internal/views/recent-calls"))
);
const LazyAlerts = withSuspense(
  React.lazy(() => import("src/containers/internal/views/alerts"))
);

/** BYO navi */
const LazyCarriers = withSuspense(
  React.lazy(() => import("src/containers/internal/views/carriers"))
);
const LazySpeechServices = withSuspense(
  React.lazy(() => import("src/containers/internal/views/speech-services"))
);
const LazySpeechServicesAdd = withSuspense(
  React.lazy(() => import("src/containers/internal/views/speech-services/add"))
);
const LazySpeechServicesEdit = withSuspense(
  React.lazy(() => import("src/containers/internal/views/speech-services/edit"))
);
const LazyPhoneNumbers = withSuspense(
  React.lazy(() => import("src/containers/internal/views/phone-numbers"))
);
const LazyPhoneNumbersAdd = withSuspense(
  React.lazy(() => import("src/containers/internal/views/phone-numbers/add"))
);
const LazyTeams = withSuspense(
  React.lazy(() => import("src/containers/internal/views/ms-teams-tenants"))
);
const LazyTeamsAdd = withSuspense(
  React.lazy(() => import("src/containers/internal/views/ms-teams-tenants/add"))
);
const LazyTeamsEdit = withSuspense(
  React.lazy(
    () => import("src/containers/internal/views/ms-teams-tenants/edit")
  )
);

export const Router = () => {
  const toast = useSelectState("toast");

  return (
    <>
      {toast && <Toast type={toast.type} message={toast.message} />}
      <Routes>
        {/* Login */}
        <Route path="/" element={<LoginLayout />}>
          <Route index element={<Login />} />
          <Route
            path="create-password"
            element={
              <RequireAuth>
                <LazyCreatePassword />
              </RequireAuth>
            }
          />

          {/* 404 page not found */}
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Internal */}
        <Route
          path="/internal/*"
          element={
            <RequireAuth>
              <Routes>
                <Route path="*" element={<InternalLayout />}>
                  {/* Top navi */}
                  <Route path="settings" element={<LazySettings />} />
                  <Route path="accounts" element={<LazyAccounts />} />
                  <Route path="accounts/add" element={<LazyAccountAdd />} />
                  <Route
                    path="accounts/:account_sid/edit"
                    element={<LazyAccountEdit />}
                  />
                  <Route path="applications" element={<LazyApplications />} />
                  <Route
                    path="applications/add"
                    element={<LazyApplicationsAdd />}
                  />
                  <Route
                    path="applications/:application_sid/edit"
                    element={<LazyApplicationsEdit />}
                  />

                  <Route path="recent-calls" element={<LazyRecentCalls />} />
                  <Route path="alerts" element={<LazyAlerts />} />

                  {/* BYO navi */}
                  <Route path="carriers" element={<LazyCarriers />} />
                  <Route
                    path="speech-services"
                    element={<LazySpeechServices />}
                  />
                  <Route
                    path="speech-services/add"
                    element={<LazySpeechServicesAdd />}
                  />
                  <Route
                    path="speech-services/:speech_credential_sid/edit"
                    element={<LazySpeechServicesEdit />}
                  />
                  <Route path="phone-numbers" element={<LazyPhoneNumbers />} />
                  <Route
                    path="phone-numbers/add"
                    element={<LazyPhoneNumbersAdd />}
                  />
                  <Route path="ms-teams-tenants" element={<LazyTeams />} />
                  <Route
                    path="ms-teams-tenants/add"
                    element={<LazyTeamsAdd />}
                  />
                  <Route
                    path="ms-teams-tenants/:ms_teams_tenant_sid/edit"
                    element={<LazyTeamsEdit />}
                  />

                  {/* 404 page not found */}
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </RequireAuth>
          }
        />
      </Routes>
    </>
  );
};
