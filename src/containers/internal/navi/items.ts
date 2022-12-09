import {
  ROUTE_INTERNAL_ACCOUNTS,
  ROUTE_INTERNAL_SETTINGS,
  ROUTE_INTERNAL_USERS,
  ROUTE_INTERNAL_ALERTS,
  ROUTE_INTERNAL_RECENT_CALLS,
  ROUTE_INTERNAL_APPLICATIONS,
  ROUTE_INTERNAL_CARRIERS,
  ROUTE_INTERNAL_SPEECH,
  ROUTE_INTERNAL_PHONE_NUMBERS,
  ROUTE_INTERNAL_MS_TEAMS_TENANTS,
} from "src/router/routes";
import { Icons } from "src/components";
import { Scope, UserData } from "src/store/types";

import type { Icon } from "react-feather";
import type { ACL } from "src/store/types";

export interface NaviItem {
  label: string;
  icon: Icon;
  route: (user?: UserData) => string;
  acl?: keyof ACL;
  scope?: Scope;
  restrict?: boolean;
}

export const naviTop: NaviItem[] = [
  {
    label: "Users",
    icon: Icons.UserCheck,
    route: () => ROUTE_INTERNAL_USERS,
  },
  {
    label: "Settings",
    icon: Icons.Settings,
    route: () => ROUTE_INTERNAL_SETTINGS,
    scope: Scope.service_provider,
  },
  {
    label: "Accounts",
    icon: Icons.Activity,
    route: () => ROUTE_INTERNAL_ACCOUNTS,
    scope: Scope.service_provider,
  },
  {
    label: "Account",
    icon: Icons.Activity,
    route: (user) => `${ROUTE_INTERNAL_ACCOUNTS}/${user?.account_sid}/edit`,
    scope: Scope.account,
    restrict: true,
  },
  {
    label: "Applications",
    icon: Icons.Grid,
    route: () => ROUTE_INTERNAL_APPLICATIONS,
  },
  {
    label: "Recent Calls",
    icon: Icons.List,
    route: () => ROUTE_INTERNAL_RECENT_CALLS,
  },
  {
    label: "Alerts",
    icon: Icons.AlertCircle,
    route: () => ROUTE_INTERNAL_ALERTS,
  },
];

export const naviByo: NaviItem[] = [
  {
    label: "Carriers",
    icon: Icons.Server,
    route: () => ROUTE_INTERNAL_CARRIERS,
  },
  {
    label: "Speech",
    icon: Icons.MessageCircle,
    route: () => ROUTE_INTERNAL_SPEECH,
  },
  {
    label: "Phone Numbers",
    icon: Icons.Phone,
    route: () => ROUTE_INTERNAL_PHONE_NUMBERS,
  },
  {
    label: "MS Teams Tenants",
    icon: Icons.Users,
    route: () => ROUTE_INTERNAL_MS_TEAMS_TENANTS,
    acl: "hasMSTeamsFqdn",
  },
];
