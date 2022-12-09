import React from "react";
import { Link } from "react-router-dom";

import { Icons } from "src/components";
import { ROUTE_INTERNAL_USERS } from "src/router/routes";
import { useApiData } from "src/api";
import { useSelectState } from "src/store";

import type { CurrentUserData } from "src/api/types";

export const UserMe = () => {
  const user = useSelectState("user");
  const [userData] = useApiData<CurrentUserData>("Users/me");

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
