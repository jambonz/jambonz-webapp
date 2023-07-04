import React from "react";
import { getGithubOauthUrl, getGoogleOauthUrl } from "./utils";
import { v4 as uuid } from "uuid";
import { setLocationBeforeOauth, setOauthState } from "src/store/localStore";
import { Icons } from "src/components";
import { Button, H1 } from "@jambonz/ui-kit";
import { PRIVACY_POLICY, TERMS_OF_SERVICE } from "src/api/constants";
import { Checkzone } from "src/components/forms";
import { Link } from "react-router-dom";
import { ROUTE_REGISTER_EMAIL } from "src/router/routes";

export const Register = () => {
  const state = uuid();
  setOauthState(state);
  setLocationBeforeOauth("/register");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };
  return (
    <>
      <H1 className="h2">Register</H1>

      <form className="form form--login" onSubmit={handleSubmit}>
        <Checkzone
          hidden
          name="is_accepted"
          label=""
          labelNode={
            <div>
              I accept the
              <a href={TERMS_OF_SERVICE}>
                <span> Terms of Service </span>
              </a>
              and have read the
              <a href={PRIVACY_POLICY}>
                <span> Privacy Policy</span>
              </a>
            </div>
          }
          initialCheck={false}
        >
          <Button as={Link} to={ROUTE_REGISTER_EMAIL} mainStyle="hollow">
            Sign Up with Email
          </Button>
          <a href={getGoogleOauthUrl(state)} className="btn btn--hollow">
            <div className="mast">
              <Icons.Youtube />
              <span>Sign Up With Google</span>
            </div>
          </a>
          <a href={getGithubOauthUrl(state)} className="btn btn--hollow">
            <div className="mast">
              <Icons.GitHub />
              <span>Sign Up With Github</span>
            </div>
          </a>
        </Checkzone>
      </form>
    </>
  );
};

export default Register;
