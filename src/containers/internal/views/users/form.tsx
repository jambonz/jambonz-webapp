import React, { useState, useEffect } from "react";
import { Button, ButtonGroup, MS } from "@jambonz/ui-kit";
import { Link, useNavigate } from "react-router-dom";

import { useSelectState } from "src/store";
import {
  deleteUser,
  postFetch,
  putUser,
  useApiData,
  useServiceProviderData,
} from "src/api";
import { ROUTE_INTERNAL_USERS } from "src/router/routes";
import { useAuth } from "src/router/auth";

import { ClipBoard, Section, ScopedAccess } from "src/components";
import { AccountSelect, Passwd, Selector } from "src/components/forms";
import { DeleteUser } from "./delete";
import { MSG_REQUIRED_FIELDS } from "src/constants";
import {
  API_USERS,
  DEFAULT_PSWD_SETTINGS,
  USER_SCOPE_SELECTION,
  USER_ACCOUNT,
  USER_ADMIN,
  USER_SP,
} from "src/api/constants";
import { isValidPasswd, getUserScope, hasLength } from "src/utils";
import { Scope } from "src/store/types";

import type {
  UserSidResponse,
  User,
  PasswordSettings,
  UserScopes,
  UseApiDataMap,
  Account,
} from "src/api/types";
import type { IMessage } from "src/store/types";
import { setAccountFilter, setLocation } from "src/store/localStore";
import { useToast } from "src/components/toast/toast-provider";

type UserFormProps = {
  user?: UseApiDataMap<User>;
};

export const UserForm = ({ user }: UserFormProps) => {
  const { toastSuccess, toastError } = useToast();
  const { signout } = useAuth();
  const navigate = useNavigate();
  const currentUser = useSelectState("user");
  const currentServiceProvider = useSelectState("currentServiceProvider");
  const [pwdSettings] =
    useApiData<PasswordSettings>("PasswordSettings") || DEFAULT_PSWD_SETTINGS;
  const [accounts] = useServiceProviderData<Account[]>("Accounts");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [initialPassword, setInitialPassword] = useState("");
  const [scope, setScope] = useState<UserScopes | null>(
    currentUser?.scope || null,
  );
  const [isActive, setIsActive] = useState(true);
  const [forceChange, setForceChange] = useState(true);
  const [modal, setModal] = useState(false);
  const [accountSid, setAccountSid] = useState("");
  const [isViewOnly, setIsViewOnly] = useState(false);

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
            </>,
          );
          handleSelfDetete();
        })
        .catch((error) => {
          toastError(error.msg);
        });
    }
  };

  const passwdCheck = () => {
    if (pwdSettings && !isValidPasswd(initialPassword, pwdSettings)) {
      toastError("Invalid password.");
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (scope === USER_ACCOUNT && !accounts?.length) {
      toastError("Cannot create an account. Service Provider has no accounts.");
      return;
    }

    if (!user) {
      if (!passwdCheck()) return;

      postFetch<UserSidResponse, Partial<User>>(API_USERS, {
        name: name,
        email: email,
        initial_password: initialPassword,
        force_change: forceChange,
        is_active: isActive,
        is_view_only: isViewOnly,
        service_provider_sid:
          scope === USER_ADMIN && currentUser?.scope === USER_ADMIN
            ? null
            : currentServiceProvider?.service_provider_sid,
        account_sid:
          scope !== USER_ACCOUNT && currentUser?.scope !== USER_ACCOUNT
            ? null
            : accountSid || currentUser?.account_sid,
      })
        .then(() => {
          toastSuccess("User created successfully");
          navigate(ROUTE_INTERNAL_USERS);
          setAccountFilter(accountSid);
        })
        .catch((error: { msg: IMessage }) => {
          toastError(error.msg);
        });
    }

    if (user && user.data) {
      if (initialPassword && !passwdCheck()) {
        return;
      }

      putUser(user.data.user_sid, {
        name: name,
        email: email,
        initial_password: initialPassword || null,
        force_change: forceChange,
        is_active: isActive,
        is_view_only: isViewOnly,
        service_provider_sid:
          scope === USER_ADMIN && currentUser?.scope === USER_ADMIN
            ? null
            : currentServiceProvider?.service_provider_sid,
        account_sid:
          scope !== USER_ACCOUNT && currentUser?.scope !== USER_ACCOUNT
            ? null
            : accountSid || currentUser?.account_sid,
      })
        .then(() => {
          user.refetch();
          toastSuccess("User updated successfully");
          navigate(`${ROUTE_INTERNAL_USERS}/${user.data?.user_sid}/edit`);
        })
        .catch((error: { msg: IMessage }) => {
          toastError(error.msg);
        });
    }
  };

  /** Set current user data values if applicable -- e.g. "edit mode" */
  useEffect(() => {
    setLocation();
    if (user && user.data) {
      setName(user.data.name);
      setForceChange(!!user.data.force_change);
      setIsActive(!!user.data.is_active);
      setIsViewOnly(!!user.data.is_view_only);
      setEmail(user.data.email);
      setScope(getUserScope(user.data));
      if (user.data.account_sid) {
        setAccountSid(user.data.account_sid);
      }
    }
  }, [user]);

  return (
    <>
      <Section slim>
        <form
          className={`form form--internal ${
            !user?.data && user?.refetch ? "form--blur" : ""
          }`}
          onSubmit={handleSubmit}
        >
          <fieldset>
            <MS>{MSG_REQUIRED_FIELDS}</MS>
          </fieldset>
          <ScopedAccess user={currentUser} scope={Scope.service_provider}>
            <fieldset>
              <label htmlFor="scope">Scope:</label>
              <Selector
                id="scope"
                name="scope"
                value={scope || currentUser?.scope}
                options={
                  currentUser?.scope === USER_SP
                    ? USER_SCOPE_SELECTION.filter(
                        (opt) =>
                          opt.value !== USER_ADMIN && opt.value !== "all",
                      )
                    : USER_SCOPE_SELECTION.filter((e) => e.value !== "all")
                }
                onChange={(e) => setScope(e.target.value as UserScopes)}
              />

              {hasLength(accounts) && scope === USER_ACCOUNT && (
                <>
                  <AccountSelect
                    accounts={accounts}
                    account={[accountSid, setAccountSid]}
                  />
                </>
              )}
              {scope === USER_ACCOUNT && !hasLength(accounts) && (
                <>
                  <label htmlFor="account">
                    Account:<span>*</span>
                  </label>
                  <input
                    id="account"
                    required
                    type="text"
                    disabled
                    name="account"
                    value="No accounts."
                  />
                </>
              )}
            </fieldset>
          </ScopedAccess>
          {user && user.data && (
            <fieldset>
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
              <label htmlFor="is_view_only" className="chk">
                <input
                  id="is_view_only"
                  name="is_view_only"
                  type="checkbox"
                  checked={isViewOnly}
                  onChange={(e) => setIsViewOnly(e.target.checked)}
                />
                <div>View-only User</div>
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
          {!user && (
            <fieldset>
              <label htmlFor="is_view_only" className="chk">
                <input
                  id="is_view_only"
                  name="is_view_only"
                  type="checkbox"
                  checked={isViewOnly}
                  onChange={(e) => setIsViewOnly(e.target.checked)}
                />
                <div>View-only User</div>
              </label>
            </fieldset>
          )}
          <fieldset>
            <label htmlFor="initial_password">
              Temporary password
              {!user && <span>*</span>}
            </label>
            <Passwd
              id="initial_password"
              required={!user}
              name="initial_password"
              value={initialPassword}
              placeholder="Temporary password"
              setValue={setInitialPassword}
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
            <ButtonGroup left className={user && "btns--spaced"}>
              <Button small subStyle="grey" as={Link} to={ROUTE_INTERNAL_USERS}>
                Cancel
              </Button>
              <Button type="submit" small>
                Save
              </Button>
              {user && user.data && (
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
