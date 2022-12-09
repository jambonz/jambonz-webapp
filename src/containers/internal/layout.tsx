import React, { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { Button, Icon, classNames } from "jambonz-ui";

import { Navi } from "./navi";
import { Icons } from "src/components";
import { toastSuccess, useSelectState } from "src/store";
import { useAuth } from "src/router/auth";
import { useMobileMedia } from "src/utils";
import { MSG_LOGGED_OUT } from "src/constants";

import "./styles.scss";
import { ROUTE_INTERNAL_USERS } from "src/router/routes";
import { useApiData } from "src/api";
import { CurrentUserData } from "src/api/types";

export const Layout = () => {
  const user = useSelectState("user");
  const [userData] = useApiData<CurrentUserData>("Users/me");
  const [active, setActive] = useState(false);
  const { signout } = useAuth();
  const mobile = useMobileMedia();

  const handleLogout = () => {
    signout();
    toastSuccess(MSG_LOGGED_OUT);
  };

  const handleMenu = () => {
    setActive(!active);
  };

  /** Close mobile navi if matchMedia is false */
  if (!mobile && active) {
    setActive(false);
  }

  return (
    <div className="internal">
      <Navi
        mobile={mobile}
        className={classNames({ navi: true, active, mobile })}
        handleMenu={handleMenu}
        handleLogout={handleLogout}
      />
      <main>
        <header>
          <Icon subStyle="dark" onClick={handleMenu}>
            <Icons.Menu />
          </Icon>
          <div className="user">
            <Icons.User className="user--icon" />
            <div className="item__info">
              <div className="user--txt">
                <Link
                  to={`${ROUTE_INTERNAL_USERS}/${user?.user_sid}/edit`}
                  title="Edit user"
                >
                  <strong>{userData?.user.name}</strong>
                </Link>
              </div>
              <div>
                <strong>Scope:</strong> <code>{user?.scope}</code>
              </div>
            </div>
          </div>
          <Button
            small
            mainStyle="hollow"
            subStyle="dark"
            onClick={handleLogout}
          >
            Sign out
          </Button>
        </header>
        <article>
          <Outlet />
        </article>
      </main>
    </div>
  );
};

export default Layout;
