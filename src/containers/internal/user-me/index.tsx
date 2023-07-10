import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Icons } from "src/components";
import {
  ROUTE_INTERNAL_USERS,
  ROUTE_REGISTER_SUB_DOMAIN,
} from "src/router/routes";
import { useApiData } from "src/api";
import { useSelectState } from "src/store";

import type { CurrentUserData } from "src/api/types";

import "./styles.scss";
import { ENABLE_ClOUD_PLATFORM } from "src/api/constants";

export const UserMe = () => {
  const user = useSelectState("user");
  const [userData] = useApiData<CurrentUserData>("Users/me");
  const navigate = useNavigate();

  useEffect(() => {
    // If hosted platform is enabled, the account should have sip realm
    if (ENABLE_ClOUD_PLATFORM && !userData?.account?.sip_realm) {
      navigate(ROUTE_REGISTER_SUB_DOMAIN);
    }
  }, [userData]);

  return (
    <div className="user">
      <Icons.User className="user__icon" />
      <div className="user__info">
        <Link
          to={`${ROUTE_INTERNAL_USERS}/${user?.user_sid}/edit`}
          title="Edit user"
          className="user__name"
        >
          <strong>{userData?.user.name}</strong>
        </Link>
        <div className="user__scope">
          <strong>Scope:</strong> {user?.scope}
        </div>
      </div>
    </div>
  );
};
