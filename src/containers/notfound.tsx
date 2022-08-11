import React from "react";
import { H1, Button } from "jambonz-ui";
import { Link } from "react-router-dom";

import { useAuth } from "src/router/auth";
import { ROUTE_LOGIN } from "src/router/routes";

export const NotFound = () => {
  const { authorized } = useAuth();

  return (
    <div className="notfound">
      <H1>That page doesn&apos;t exist.</H1>
      {!authorized && (
        <Button as={Link} to={ROUTE_LOGIN} mainStyle="hollow" subStyle="white">
          Log in
        </Button>
      )}
    </div>
  );
};

export default NotFound;
