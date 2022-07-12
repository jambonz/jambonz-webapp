import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Button, Icon, classNames } from "jambonz-ui";

import { Navi } from "./navi";
import { Icons } from "src/components";
import { useDispatch, toastSuccess } from "src/store";
import { useAuth } from "src/router/auth";
import { useMobileMedia } from "src/utils";
import { MSG_LOGGED_OUT } from "src/constants";

import "./styles.scss";

export const Layout = () => {
  const [active, setActive] = useState(false);
  const { signout } = useAuth();
  const dispatch = useDispatch();
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

  /** Fetch service providers */
  useEffect(() => {
    dispatch({ type: "serviceProviders" });
  }, []);

  return (
    <div className="internal">
      <Navi
        mobile={mobile}
        className={classNames({ navi: true, active, mobile })}
        handleMenu={handleMenu}
      />
      <main>
        <header className="wrap">
          <Icon subStyle="dark" onClick={handleMenu}>
            <Icons.Menu />
          </Icon>
          <Button small mainStyle="hollow" onClick={handleLogout}>
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
