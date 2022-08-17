import Blockies from "react-blockies";
import { classNames, getCssVar, M, Icon } from "jambonz-ui";
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { Icons, ModalForm, AccessControl } from "src/components";
import { naviTop, naviByo } from "./items";
import {
  useSelectState,
  useDispatch,
  toastSuccess,
  toastError,
} from "src/store";
import { postServiceProviders } from "src/api";

import type { NaviItem } from "./items";

import "./styles.scss";
import {
  ROUTE_INTERNAL_ACCOUNTS,
  ROUTE_INTERNAL_SETTINGS,
} from "src/router/routes";

type CommonProps = {
  handleMenu: () => void;
};

type NaviProps = CommonProps & {
  mobile: boolean;
  className: string;
};

type ItemProps = CommonProps & {
  item: NaviItem;
};

const Item = ({ item, handleMenu }: ItemProps) => {
  const location = useLocation();
  const active = location.pathname.includes(item.route);

  return (
    <li>
      <Link
        to={item.route}
        className={classNames({ navi__link: true, active })}
        onClick={handleMenu}
      >
        <item.icon />
        <span>{item.label}</span>
      </Link>
    </li>
  );
};

export const Navi = ({ mobile, className, handleMenu }: NaviProps) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const accessControl = useSelectState("accessControl");
  const serviceProviders = useSelectState("serviceProviders");
  const currentServiceProvider = useSelectState("currentServiceProvider");
  const [sid, setSid] = useState("");
  const [modal, setModal] = useState(false);
  const [name, setName] = useState("");

  const filterItemsAcl = (item: NaviItem) => {
    return !item.acl || (item.acl && accessControl[item.acl]);
  };

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
    if (sid) {
      const serviceProvider = serviceProviders.find(
        (sp) => sp.service_provider_sid === sid
      );

      if (serviceProvider) {
        dispatch({ type: "currentServiceProvider", payload: serviceProvider });

        /** This redirect covers the scenario in which you switch SPs from an edit view... */
        if (
          location.pathname !== ROUTE_INTERNAL_ACCOUNTS &&
          location.pathname !== ROUTE_INTERNAL_SETTINGS
        ) {
          navigate(ROUTE_INTERNAL_ACCOUNTS);
        }
      }
    }
  }, [serviceProviders, sid]);

  return (
    <>
      <nav className={className}>
        {mobile && (
          <div className="navi__top">
            <Icon subStyle="white" onClick={handleMenu}>
              <Icons.X />
            </Icon>
          </div>
        )}
        <div className="navi__sps">
          <select
            value={currentServiceProvider?.service_provider_sid}
            onChange={(e) => setSid(e.target.value)}
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
          <button
            type="button"
            onClick={() => setModal(true)}
            title="Add service provider"
            className="btn--type"
          >
            <Icons.PlusCircle />
          </button>
          <span>
            <Icons.ChevronUp />
            <Icons.ChevronDown />
          </span>
        </div>
        <div className="navi__user">
          {/* Seed should be user id but that API returns 403... */}
          <Blockies
            seed="jambonz"
            size={6}
            scale={6}
            color={getCssVar("--jambonz")}
            bgColor={getCssVar("--pink")}
            spotColor={getCssVar("--teal")}
            className="avatar"
          />
          <AccessControl acl="hasAdminAuth">
            <button
              type="button"
              className="btn--type adduser"
              title="Add user"
            >
              <Icons.PlusCircle />
            </button>
          </AccessControl>
        </div>
        <div className="navi__routes">
          <ul>
            {naviTop.filter(filterItemsAcl).map((item) => (
              <Item key={item.label} item={item} handleMenu={handleMenu} />
            ))}
          </ul>
        </div>
        <div className="navi__byo">
          <M>BYO Services:</M>
        </div>
        <div className="navi__routes">
          <ul>
            {naviByo.filter(filterItemsAcl).map((item) => (
              <Item key={item.label} item={item} handleMenu={handleMenu} />
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
          <label htmlFor="name">Add new service provider</label>
          <input
            id="name"
            required
            type="text"
            name="name"
            placeholder="service provider name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </ModalForm>
      )}
    </>
  );
};
