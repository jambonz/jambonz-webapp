import React, { useEffect, useState, useMemo } from "react";
import { classNames, M, Icon, Button } from "@jambonz/ui-kit";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { Icons, ModalForm } from "src/components";
import { naviTop, naviByo } from "./items";
import { UserMe } from "../user-me";
import {
  useSelectState,
  useDispatch,
  toastSuccess,
  toastError,
} from "src/store";
import { getActiveSP, setActiveSP } from "src/store/localStore";
import { postServiceProviders } from "src/api";

import type { NaviItem } from "./items";

import "./styles.scss";
import { ScopedAccess } from "src/components/scoped-access";
import { Scope, UserData } from "src/store/types";
import { USER_ADMIN } from "src/api/constants";
import { ROUTE_LOGIN } from "src/router/routes";
import { Lcr } from "src/api/types";

type CommonProps = {
  handleMenu: () => void;
};

type NaviProps = CommonProps & {
  mobile: boolean;
  className: string;
  handleLogout: () => void;
};

type ItemProps = CommonProps & {
  item: NaviItem;
  user?: UserData;
  lcr?: Lcr;
};

const Item = ({ item, user, lcr, handleMenu }: ItemProps) => {
  const location = useLocation();
  const active = location.pathname.includes(item.route(user));

  return (
    <li>
      <Link
        to={item.route(user, lcr)}
        className={classNames({ navi__link: true, "txt--jean": true, active })}
        onClick={handleMenu}
      >
        <item.icon />
        <span>{item.label}</span>
      </Link>
    </li>
  );
};

export const Navi = ({
  mobile,
  className,
  handleMenu,
  handleLogout,
}: NaviProps) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelectState("user");
  const lcr = useSelectState("lcr");
  const accessControl = useSelectState("accessControl");
  const serviceProviders = useSelectState("serviceProviders");
  const currentServiceProvider = useSelectState("currentServiceProvider");
  const [sid, setSid] = useState("");
  const [modal, setModal] = useState(false);
  const [name, setName] = useState("");

  const naviByoFiltered = useMemo(() => {
    return naviByo.filter(
      (item) => !item.acl || (item.acl && accessControl[item.acl])
    );
  }, [accessControl, currentServiceProvider]);

  const naviTopFiltered = useMemo(() => {
    return naviTop.filter((item) => {
      if (item.scope === undefined) {
        return true;
      } else if (user) {
        if (item.restrict) {
          return user.access === item.scope;
        }

        return user.access >= item.scope;
      }
    });
  }, [user]);

  const handleSubmit = () => {
    postServiceProviders({ name })
      .then(({ json }) => {
        toastSuccess(
          <>
            Added new service provider <strong>{name}</strong>
          </>
        );
        dispatch({ type: "serviceProviders" });
        setSid(json.sid);
        setActiveSP(json.sid);
        setName("");
        setModal(false);
      })
      .catch((error) => {
        toastError(error.msg);
      });
  };

  const handleCancel = () => {
    setName("");
    setModal(false);
  };

  /** Subscribe to change events on the service provider <select> */
  useEffect(() => {
    setSid(getActiveSP());
    if (sid) {
      const serviceProvider = serviceProviders.find(
        (sp) => sp.service_provider_sid === sid
      );

      if (serviceProvider) {
        dispatch({ type: "currentServiceProvider", payload: serviceProvider });
      }
    }
  }, [serviceProviders, sid]);

  /** Fetch service providers */
  useEffect(() => {
    dispatch({ type: "user" });
    dispatch({ type: "serviceProviders" });
    dispatch({ type: "lcr" });
  }, []);

  return (
    <>
      <nav className={className}>
        {mobile && (
          <div className="navi__top">
            <Icon subStyle="white" onClick={handleMenu}>
              <Icons.X />
            </Icon>
            <UserMe />
            <Button
              small
              mainStyle="hollow"
              subStyle="white"
              onClick={handleLogout}
            >
              Sign out
            </Button>
          </div>
        )}
        <div className="navi__sps">
          <div className="smsel smsel--navi">
            <div>
              <select
                value={sid || currentServiceProvider?.service_provider_sid}
                onChange={(e) => {
                  setSid(e.target.value);
                  setActiveSP(e.target.value);
                  navigate(ROUTE_LOGIN);
                }}
                disabled={user?.scope !== USER_ADMIN}
              >
                {currentServiceProvider ? (
                  serviceProviders.map((serviceProvider) => {
                    return (
                      <option
                        value={serviceProvider.service_provider_sid}
                        key={serviceProvider.service_provider_sid}
                      >
                        {serviceProvider.name}
                      </option>
                    );
                  })
                ) : (
                  <option>&nbsp;</option>
                )}
              </select>
              <span>
                <Icons.ChevronUp />
                <Icons.ChevronDown />
              </span>
            </div>
          </div>
          <ScopedAccess scope={Scope.admin} user={user}>
            <button
              type="button"
              onClick={() => setModal(true)}
              title="Add service provider"
              className="btnty"
            >
              <Icons.PlusCircle />
            </button>
          </ScopedAccess>
        </div>
        <div className="navi__routes">
          <ul>
            {naviTopFiltered.map((item) => {
              return (
                <Item
                  key={item.label}
                  user={user}
                  item={item}
                  handleMenu={handleMenu}
                />
              );
            })}
          </ul>
        </div>
        <div className="navi__byo">
          <M>BYO Services:</M>
        </div>
        <div className="navi__routes">
          <ul>
            {naviByoFiltered.map((item) => (
              <Item
                key={item.label}
                user={user}
                lcr={lcr}
                item={item}
                handleMenu={handleMenu}
              />
            ))}
          </ul>
        </div>
        <div className="navi__logo">
          <img
            src="/svg/jambonz--light.svg"
            width="128"
            height="42"
            alt="jambonz"
          />
        </div>
      </nav>
      {modal && (
        <ModalForm handleSubmit={handleSubmit} handleCancel={handleCancel}>
          <fieldset>
            <label htmlFor="name">Add new service provider</label>
            <input
              id="name"
              required
              type="text"
              name="name"
              placeholder="Service provider name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </fieldset>
        </ModalForm>
      )}
    </>
  );
};
