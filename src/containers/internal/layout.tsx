import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Button, Icon, classNames } from "@jambonz/ui-kit";

import { UserMe } from "./user-me";
import { Navi } from "./navi";
import { Icons } from "src/components";
import { useAuth } from "src/router/auth";
import { useMobileMedia } from "src/utils";

import "./styles.scss";

export const Layout = () => {
  const [active, setActive] = useState(false);
  const { signout } = useAuth();
  const mobile = useMobileMedia();

  const handleLogout = () => {
    signout();
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
          <UserMe />
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
