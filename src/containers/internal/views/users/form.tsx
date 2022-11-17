import React, { useState, useEffect } from "react";
import { Button, ButtonGroup, MS } from "jambonz-ui";
import { Link, useNavigate } from "react-router-dom";

import { toastError, toastSuccess, useSelectState } from "src/store";
import { deleteUser, postFetch, putUser, useApiData } from "src/api";
import { ROUTE_INTERNAL_USERS } from "src/router/routes";
import { useAuth } from "src/router/auth";

import { ClipBoard, Section } from "src/components";
import { DeleteUser } from "./delete";
import { MSG_REQUIRED_FIELDS } from "src/constants";
import { API_USERS, DEFAULT_PSWD_SETTINGS } from "src/api/constants";
import { isValidPasswd, getUserScope } from "src/utils";

import type {
  UserSidResponse,
  User,
  PasswordSettings,
  UserScopes,
  UseApiDataMap,
} from "src/api/types";
import type { IMessage } from "src/store/types";

type UserFormProps = {
  user?: UseApiDataMap<User>;
};

export const UserForm = ({ user }: UserFormProps) => {
  const { signout } = useAuth();
  const navigate = useNavigate();
  const currentUser = useSelectState("user");
  const [pwdSettings] =
    useApiData<PasswordSettings>("PasswordSettings") || DEFAULT_PSWD_SETTINGS;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [initialPassword, setInitialPassword] = useState("");
  const [scope, setScope] = useState<UserScopes>();
  const [isActive, setIsActive] = useState(true);
  const [forceChange, setForceChange] = useState(true);
  const [modal, setModal] = useState(false);

  const handleCancel = () => {
    setModal(false);
  };

  const handleSelfDetete = () => {
    if (user?.data?.user_sid === currentUser?.user_sid) {
      signout();
    }
  };

  const handleDelete = () => {
    if (user && user.data) {
      deleteUser(user.data.user_sid)
        .then(() => {
          navigate(ROUTE_INTERNAL_USERS);
          toastSuccess(
            <>
              Deleted user <strong>{user?.data?.name}</strong>
            </>
          );
          handleSelfDetete();
        })
        .catch((error) => {
          toastError(error.msg);
        });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (pwdSettings && !isValidPasswd(initialPassword, pwdSettings)) {
      toastError("Invalid password.");
      return;
    }

    if (!user) {
      postFetch<UserSidResponse, Partial<User>>(API_USERS, {
        name: name,
        email: email,
        initial_password: initialPassword,
        force_change: forceChange,
        is_active: isActive,
      })
        .then(({ json }) => {
          toastSuccess("User created successfully");
          navigate(`${ROUTE_INTERNAL_USERS}/${json.user_sid}/edit`);
        })
        .catch((error: { msg: IMessage }) => {
          toastError(error.msg);
        });
    }

    if (user && user.data) {
      putUser(user.data.user_sid, {
        name: name || user.data.name,
        email: email || user.data.email,
        initial_password: initialPassword || null,
        force_change: forceChange || !!user.data.force_change,
        is_active: isActive || !!user.data.is_active,
      })
        .then(() => {
          user.refetch();
          toastSuccess("User updated successfully");
          navigate(ROUTE_INTERNAL_USERS);
        })
        .catch((error: { msg: IMessage }) => {
          toastError(error.msg);
        });
    }
  };

  /** Set current user data values if applicable -- e.g. "edit mode" */
  useEffect(() => {
    if (user && user.data) {
      setName(user.data.name);
      setForceChange(!!user.data.force_change);
      setIsActive(!!user.data.is_active);
      setEmail(user.data.email);
      setScope(getUserScope(user.data));
    }
  }, [user]);

  return (
    <>
      <Section slim>
        <form className="form form--internal" onSubmit={handleSubmit}>
          <fieldset>
            <MS>{MSG_REQUIRED_FIELDS}</MS>
          </fieldset>
          {user && user.data && (
            <fieldset>
              <div className="item__sid">
                {user && (
                  <strong>
                    {" "}
                    Scope: <code>{scope}</code>
                  </strong>
                )}
              </div>
              <label htmlFor="user_sid">User SID</label>
              <ClipBoard
                id="user_sid"
                name="user_sid"
                text={user.data.user_sid}
              />
              <label htmlFor="is_active" className="chk">
                <input
                  id="is_active"
                  name="is_active"
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                <div>User is active</div>
              </label>
            </fieldset>
          )}
          <fieldset>
            <label htmlFor="name">
              User name<span>*</span>
            </label>
            <input
              id="name"
              required
              type="text"
              name="name"
              placeholder="User Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </fieldset>
          <fieldset>
            <label htmlFor="email">
              User email<span>*</span>
            </label>
            <input
              id="email"
              required
              type="email"
              name="email"
              placeholder="User Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </fieldset>
          <fieldset>
            <label htmlFor="initial_password">
              Temporary password
              {!user && <span>*</span>}
            </label>
            <input
              id="initial_password"
              type="text"
              name="initial_password"
              placeholder="Temporary password"
              value={initialPassword}
              required={!user}
              onChange={(e) => setInitialPassword(e.target.value)}
            />
            <label htmlFor="force_change" className="chk">
              <input
                id="force_change"
                name="force_change"
                type="checkbox"
                checked={forceChange}
                onChange={(e) => setForceChange(e.target.checked)}
              />
              <div>Force change of password</div>
            </label>
          </fieldset>
          <fieldset>
            <ButtonGroup left className="btns--spaced">
              <Button small subStyle="grey" as={Link} to={ROUTE_INTERNAL_USERS}>
                Cancel
              </Button>
              <Button type="submit" small>
                Save
              </Button>
              {user && (
                <Button
                  small
                  type="button"
                  subStyle="grey"
                  onClick={() => setModal(true)}
                >
                  Delete User
                </Button>
              )}
            </ButtonGroup>
          </fieldset>
        </form>
      </Section>
      {user && user.data && modal && (
        <DeleteUser
          user={user.data}
          handleCancel={handleCancel}
          handleSubmit={handleDelete}
        />
      )}
    </>
  );
};
