import React, { useState, useEffect } from "react";
import { Button, ButtonGroup, MS } from "jambonz-ui";
import { Link, useNavigate, useParams } from "react-router-dom";

import { toastError, toastSuccess } from "src/store";
import { deleteUser, postFetch, putUser, useApiData } from "src/api";
import { ROUTE_INTERNAL_USERS } from "src/router/routes";
import { ClipBoard, Section } from "src/components";
import { DeleteUser } from "./delete";
import { MSG_REQUIRED_FIELDS } from "src/constants";
import { API_USERS } from "src/api/constants";

import type { UserSidResponse, User } from "src/api/types";
import { IMessage } from "src/store/types";

export const UserForm = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [user, refetch] = useApiData<User>(`Users/${params.user_sid}`);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [initialPassword, setInitialPassword] = useState("");
  const [scope, setScope] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [forceChange, setForceChange] = useState(true);
  const [modal, setModal] = useState(false);

  const handleCancel = () => {
    setModal(false);
  };

  const handleDelete = () => {
    if (user) {
      deleteUser(user.user_sid)
        .then(() => {
          navigate(ROUTE_INTERNAL_USERS);
          toastSuccess(
            <>
              Deleted account <strong>{user.name}</strong>
            </>
          );
        })
        .catch((error) => {
          toastError(error.msg);
        });
    }
  };

  const getScope = (user: User) => {
    if (!user.account_sid && !user.service_provider_sid) {
      setScope("admin");
    } else if (user.service_provider_sid) {
      setScope("service_provider");
    } else {
      setScope("account");
    }
    return;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      postFetch<UserSidResponse, Partial<User>>(API_USERS, {
        name: name,
        email: email,
        initial_password: initialPassword,
        force_change: forceChange,
        is_active: isActive,
      })
        .then(({ json }) => {
          refetch();
          toastSuccess("User created successfully");
          navigate(`${ROUTE_INTERNAL_USERS}/${json.user_sid}/edit`);
        })
        .catch((error: { msg: IMessage }) => {
          toastError(error.msg);
        });
    }

    if (user && !modal) {
      putUser(user.user_sid, {
        name: name || user.name,
        email: email || user.email,
        initial_password: initialPassword || null,
        force_change: forceChange || !!user.force_change,
        is_active: isActive || !!user.is_active,
      })
        .then(() => {
          refetch();
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
    if (user) {
      setName(user.name);
      setForceChange(!!user.force_change);
      getScope(user);
      setIsActive(!!user.is_active);
      setEmail(user.email);
    }
  }, [user]);

  return (
    <>
      <Section slim>
        <form className="form form--internal" onSubmit={handleSubmit}>
          <fieldset>
            <MS>{MSG_REQUIRED_FIELDS}</MS>
          </fieldset>
          {user && (
            <fieldset>
              <div className="item__sid">
                {window.location.href.includes("/edit") && (
                  <strong>
                    {" "}
                    Scope: <code>{scope}</code>
                  </strong>
                )}
              </div>
              <label htmlFor="user_sid">User SID</label>
              <ClipBoard id="user_sid" name="user_sid" text={user.user_sid} />
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
              type="text"
              name="email"
              placeholder="User Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </fieldset>
          <fieldset>
            <label htmlFor="initialPassword">
              Temporary password
              {window.location.href.includes("/add") && <span>*</span>}
            </label>
            <input
              id="initial_password"
              type="text"
              name="initial_password"
              placeholder="Temporary password"
              value={initialPassword}
              required={window.location.href.includes("/add")}
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
            <ButtonGroup>
              <Button small subStyle="dark" onClick={() => setModal(true)}>
                {" "}
                Delete User
              </Button>
            </ButtonGroup>
            <ButtonGroup left>
              <Button small subStyle="grey" as={Link} to={ROUTE_INTERNAL_USERS}>
                Cancel
              </Button>
              <Button type="submit" small>
                Save
              </Button>
            </ButtonGroup>
          </fieldset>
        </form>
      </Section>
      {user && modal && (
        <DeleteUser
          user={user}
          handleCancel={handleCancel}
          handleSubmit={handleDelete}
        />
      )}
    </>
  );
};
