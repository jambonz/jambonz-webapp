import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button, ButtonGroup, Icon, MS } from "@jambonz/ui-kit";
import { Icons, Section } from "src/components";
import { useSelectState } from "src/store";
import { MSG_REQUIRED_FIELDS } from "src/constants";
import { getAccountFilter, setLocation } from "src/store/localStore";
import { Selector } from "src/components/forms";
import type {
  Carrier,
  Lcr,
  LcrCarrierSetEntry,
  LcrRoute,
  UseApiDataMap,
} from "src/api/types";
import { ROUTE_INTERNAL_LEST_COST_ROUTING } from "src/router/routes";
import { postLcrCarrierSetEntry, useApiData } from "src/api";
import { USER_ACCOUNT } from "src/api/constants";
import { hasLength } from "src/utils";
import { postLcr } from "src/api";
import { postLcrRoute } from "src/api";

type LcrRouteData = {
  pattern: string;
  voip_carrier_sid: string;
};

type LcrFormProps = {
  lcr?: UseApiDataMap<Lcr>;
};

const DEFAULT_LCR_ROUTE: LcrRouteData = {
  pattern: "",
  voip_carrier_sid: "",
};

export const LcrForm = ({ lcr }: LcrFormProps) => {
  const MAX_ROUTES = 5;

  const [lcrName, setLcrName] = useState("");
  const [defaultCarrier, setDefaultCarrier] = useState("");
  const [apiUrl, setApiUrl] = useState("");
  const [accountSid, setAccountSid] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [lcrRoutes, setLcrRoutes] = useState<LcrRouteData[]>([
    DEFAULT_LCR_ROUTE,
  ]);

  const user = useSelectState("user");
  const currentServiceProvider = useSelectState("currentServiceProvider");
  const [carriers] = useApiData<Carrier[]>(apiUrl);

  useEffect(() => {
    setLocation();
    if (currentServiceProvider) {
      setApiUrl(
        `ServiceProviders/${currentServiceProvider.service_provider_sid}/VoipCarriers`
      );
    }
  }, [user, currentServiceProvider, accountSid]);

  const carriersFiltered = useMemo(() => {
    setAccountSid(getAccountFilter());
    if (user?.account_sid && user?.scope === USER_ACCOUNT) {
      setAccountSid(user?.account_sid);
      return carriers;
    }

    return carriers
      ? carriers.filter((carrier) =>
          accountSid
            ? carrier.account_sid === accountSid
            : carrier.account_sid === null
        )
      : [];
  }, [accountSid, carriers]);

  const carrierSelectorOptions = useMemo(() => {
    return [
      {
        name: "None",
        value: "",
      },
    ].concat(
      carriersFiltered
        ? carriersFiltered.map((c: Carrier) => ({
            name: c.name,
            value: c.voip_carrier_sid,
          }))
        : []
    );
  }, [carriersFiltered]);

  const addLcrRoutes = () => {
    setLcrRoutes((curr) => [...curr, DEFAULT_LCR_ROUTE]);
  };

  const updateLcrRoute = (
    index: number,
    key: string,
    value: typeof lcrRoutes[number][keyof LcrRouteData]
  ) => {
    setLcrRoutes(
      lcrRoutes.map((lr, i) => (i === index ? { ...lr, [key]: value } : lr))
    );
  };

  const moveLcrRoute = (from: number, to: number) => {
    const e = lcrRoutes[from];
    lcrRoutes.splice(from, 1);
    lcrRoutes.splice(to, 0, e);
    setLcrRoutes([...lcrRoutes]);
  };

  const submitNewLcr = () => {
    // Add new LCR
    const lcrPayload: Lcr = {
      name: lcrName,
      is_active: true,
      account_sid: user?.account_sid || null,
      service_provider_sid:
        currentServiceProvider?.service_provider_sid || null,
    };
    postLcr(
      currentServiceProvider?.service_provider_sid || "",
      lcrPayload
    ).then(({ json }) => {
      // add new lcr route
      lcrRoutes.forEach((data, i) => {
        const lcrRoutePayload: LcrRoute = {
          lcr_sid: json.sid,
          regex: data.pattern,
          priority: i,
        };
        postLcrRoute(lcrRoutePayload).then(({ json }) => {
          // add new lcr carrier set entries
          const lcrCarrierSetEntryPayload: LcrCarrierSetEntry = {
            lcr_route_sid: json.sid,
            voip_carrier_sid: data.voip_carrier_sid,
            priority: 0,
          };
          postLcrCarrierSetEntry(lcrCarrierSetEntryPayload).then(({ json }) => {
            console.log(json.sid);
          });
        });
      });
    });
  };

  // const submitUpdateLcr = () => {
  //   // update LCR
  //   // update lcr route
  //   // update lcr carrier set entries
  // }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lcr) {
    } else {
      submitNewLcr();
    }
  };

  return (
    <Section slim>
      <form className="form form--internal" onSubmit={handleSubmit}>
        <fieldset>
          <MS>{MSG_REQUIRED_FIELDS}</MS>
        </fieldset>
        <fieldset>
          <div className="multi">
            <div className="inp">
              <label htmlFor="lcr_name">
                Least cost routing name<span>*</span>
              </label>
              <input
                id="lcr_name"
                name="lcr_name"
                type="text"
                required
                placeholder="Least cost routing name"
                value={lcrName}
                onChange={(e) => setLcrName(e.target.value)}
              />
            </div>
          </div>
          <label htmlFor="is_active" className="chk">
            <input
              id="is_active"
              name="is_active"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            <div>Active</div>
          </label>
          <div className="sel sel--preset">
            <label htmlFor="predefined_select">
              Select a default outbound carrier<span>*</span>
            </label>
            <Selector
              id="defailt_carrier"
              name="defailt_carrier"
              value={defaultCarrier}
              options={carrierSelectorOptions}
              onChange={(e) => setDefaultCarrier(e.target.value)}
            />
          </div>
        </fieldset>
        <fieldset>
          <label htmlFor="lcr_route">
            Route based on first match<span>*</span>
          </label>
          <label htmlFor="sip_gateways">Digit pattern / Carrier</label>
          {hasLength(lcrRoutes) &&
            lcrRoutes.map((lr, i) => (
              <div key={`lcr_route_${i}`} className="lcr lcr--route">
                <div>
                  <div>
                    <input
                      id={`lcr_route_regex_${i}`}
                      name={`lcr_route_regex_${i}`}
                      type="text"
                      placeholder="Digit prefix or regex"
                      required
                      value={lr.pattern || ""}
                      onChange={(e) => {
                        updateLcrRoute(i, "pattern", e.target.value);
                      }}
                    />
                  </div>
                  <div>
                    <Selector
                      id={`lcr_carrier_set_entry_carrier_${i}`}
                      name={`lcr_carrier_set_entry_carrier_${i}`}
                      placeholder="Carrier"
                      value={lr.voip_carrier_sid || ""}
                      options={carrierSelectorOptions}
                      onChange={(e) => {
                        updateLcrRoute(i, "voip_carrier_sid", e.target.value);
                      }}
                    />
                  </div>
                </div>
                <button
                  className="btnty btn__delete"
                  title="Delete route"
                  type="button"
                  onClick={() => {
                    setLcrRoutes(lcrRoutes.filter((l, i2) => i2 !== i));
                  }}
                >
                  <Icon>
                    <Icons.Trash2 />
                  </Icon>
                </button>
                {i !== 0 && (
                  <button
                    className="btnty btn__up_level"
                    title="Move route up"
                    type="button"
                    onClick={() => {
                      moveLcrRoute(i, i - 1);
                    }}
                  >
                    <Icon subStyle="teal">
                      <Icons.ArrowUp />
                    </Icon>
                  </button>
                )}
              </div>
            ))}
          {lcrRoutes.length < MAX_ROUTES && (
            <ButtonGroup left>
              <button
                className="btnty"
                type="button"
                title="Add route"
                onClick={() => {
                  addLcrRoutes();
                }}
              >
                <Icon subStyle="teal">
                  <Icons.Plus />
                </Icon>
              </button>
            </ButtonGroup>
          )}
        </fieldset>
        <fieldset>
          <ButtonGroup left>
            <Button
              small
              subStyle="grey"
              as={Link}
              to={ROUTE_INTERNAL_LEST_COST_ROUTING}
            >
              Cancel
            </Button>
            <Button type="submit" small onClick={handleSubmit}>
              Save
            </Button>
          </ButtonGroup>
        </fieldset>
      </form>
    </Section>
  );
};

export default LcrForm;
