import React from "react";
import { Outlet } from "react-router-dom";
import { MXS } from "jambonz-ui";

import { Icons } from "src/components";

export const Layout = () => (
  <main className="login bg--dark">
    <header>
      <img
        src="/svg/jambonz--light.svg"
        width="128"
        height="42"
        alt="jambonz"
      />
    </header>
    <Outlet />
    <footer>
      <MXS>jambonz is open source MIT on</MXS>
      <MXS>
        <a
          href="https://github.com/jambonz"
          target="_blank"
          rel="noreferrer"
          className="i"
        >
          <Icons.GitHub />
          <span>GitHub</span>
        </a>
      </MXS>
    </footer>
  </main>
);

export default Layout;
