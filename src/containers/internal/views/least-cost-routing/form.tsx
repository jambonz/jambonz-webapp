import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, ButtonGroup, Icon, MS } from "@jambonz/ui-kit";
import { Icons, Section } from "src/components";
import { toastError, toastSuccess, useSelectState } from "src/store";
import { MSG_REQUIRED_FIELDS } from "src/constants";
import { setLocation } from "src/store/localStore";
import { AccountSelect, Message, Selector } from "src/components/forms";
import type {
  Account,
  Carrier,
  Lcr,
  LcrCarrierSetEntry,
  LcrRoute,
  UseApiDataMap,
} from "src/api/types";
import { ROUTE_INTERNAL_LEST_COST_ROUTING } from "src/router/routes";
import {
  deleteLcrRoute,
  postLcrCarrierSetEntry,
  putLcrCarrierSetEntries,
  putLcrRoutes,
  putLcrs,
  useApiData,
  useServiceProviderData,
} from "src/api";
import { USER_ACCOUNT, USER_ADMIN, USER_SP } from "src/api/constants";
import { hasLength } from "src/utils";
import { postLcr, getLcrCarrierSetEtries } from "src/api";
import { postLcrRoute } from "src/api";

type LcrFormProps = {
  lcrDataMap?: UseApiDataMap<Lcr>;
  lcrRouteDataMap?: UseApiDataMap<LcrRoute[]>;
};

const DEFAULT_LCR_ROUTE: LcrRoute = {
  regex: "",
  lcr_sid: "",
  lcr_carrier_set_entries: [
    {
      lcr_route_sid: "",
      voip_carrier_sid: "",
      priority: 0,
    },
  ],
  priority: 0,
};

export const LcrForm = ({ lcrDataMap, lcrRouteDataMap }: LcrFormProps) => {
  const MAX_ROUTES = 5;
  const navigate = useNavigate();

  const [lcrName, setLcrName] = useState("");
  const [defaultCarrier, setDefaultCarrier] = useState("");
  const [apiUrl, setApiUrl] = useState("");
  const [accountSid, setAccountSid] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [lcrRoutes, setLcrRoutes] = useState<LcrRoute[]>([DEFAULT_LCR_ROUTE]);
  const [accounts] = useServiceProviderData<Account[]>("Accounts");

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

  useEffect(() => {
    SetLcrState();
  }, [lcrDataMap, lcrRouteDataMap]);

  const carriersFiltered = useMemo(() => {
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

  const sortSetLcrRoutes = (routes: LcrRoute[]) => {
    let sorted = [...routes];
    sorted = sorted.sort((p1, p2) =>
      p1.priority > p2.priority ? 1 : p1.priority < p2.priority ? -1 : 0
    );
    return sorted;
  };

  const addLcrRoutes = () => {
    setLcrRoutes((curr) => [
      ...curr,
      {
        ...DEFAULT_LCR_ROUTE,
        priority: lcrRoutes.length,
      },
    ]);
  };

  const updateLcrRoute = (
    index: number,
    key: string,
    value: typeof lcrRoutes[number][keyof LcrRoute]
  ) => {
    const sorted = sortSetLcrRoutes(
      lcrRoutes.map((lr, i) => (i === index ? { ...lr, [key]: value } : lr))
    );
    setLcrRoutes(sorted);
  };

  const updateLcrCarrierSetEntries = (
    index1: number,
    index2: number,
    key: string,
    value: unknown
  ) => {
    setLcrRoutes(
      lcrRoutes.map((lr, i) =>
        i === index1
          ? {
              ...lr,
              lcr_carrier_set_entries: lr.lcr_carrier_set_entries?.map(
                (entry, j) =>
                  j === index2
                    ? {
                        ...entry,
                        [key]: value,
                      }
                    : entry
              ),
            }
          : lr
      )
    );
  };

  const moveLcrRoute = (from: number, to: number) => {
    lcrRoutes[from].priority = to;
    lcrRoutes[to].priority = from;
    setLcrRoutes(sortSetLcrRoutes(lcrRoutes));
  };

  const SetLcrState = async () => {
    if (lcrDataMap && lcrDataMap.data) {
      setLcrName(lcrDataMap.data.name || "");
      setIsActive(lcrDataMap.data.is_active);
    }

    if (lcrRouteDataMap && lcrRouteDataMap.data) {
      for (const route of lcrRouteDataMap.data) {
        const { json } = await getLcrCarrierSetEtries(
          route.lcr_route_sid || ""
        );
        if (json) {
          route.lcr_carrier_set_entries = json;
        }
      }
      const sorted = sortSetLcrRoutes(lcrRouteDataMap.data);
      setLcrRoutes(sorted);
    }
  };

  const handleRouteDelete = (r: LcrRoute | undefined) => {
    if (r && r.lcr_route_sid) {
      deleteLcrRoute(r.lcr_route_sid)
        .then(() => {
          toastSuccess("Least cost routing rule successfully deleted");
          lcrRouteDataMap?.refetch();
        })
        .catch((error) => {
          toastError(error);
        });
    }
  };

  const submitNewLcr = () => {
    // Add new LCR
    const lcrPayload: Lcr = {
      name: lcrName,
      is_active: isActive,
      account_sid: accountSid,
      service_provider_sid:
        currentServiceProvider?.service_provider_sid || null,
    };
    postLcr(lcrPayload)
      .then(({ json }) => {
        // add new lcr route
        lcrRoutes.forEach((route) => {
          submitNewLcrRoute(json.sid, route);
        });
      })
      .catch(({ msg }) => {
        toastError(msg);
      });
  };

  const submitNewLcrRoute = (lcr_sid: string, route: LcrRoute) => {
    const lcrRoutePayload: LcrRoute = {
      lcr_sid,
      regex: route.regex,
      priority: route.priority,
    };
    postLcrRoute(lcrRoutePayload)
      .then(({ json }) => {
        if (route.lcr_carrier_set_entries) {
          Promise.all(
            route.lcr_carrier_set_entries.map((entry) => {
              submitNewLcrCarrierSetEntry(json.sid, entry);
            })
          )
            .then(() => {
              if (lcrDataMap) {
                toastSuccess("Least cost routing successfully updated");
                lcrRouteDataMap?.refetch();
              } else {
                toastSuccess("Least cost routing successfully created");
                navigate(ROUTE_INTERNAL_LEST_COST_ROUTING);
              }
            })
            .catch((error) => {
              toastError(error);
            });
        }
      })
      .catch((error) => {
        toastError(error);
      });
  };

  const submitNewLcrCarrierSetEntry = (
    lcr_route_sid: string,
    entry: LcrCarrierSetEntry
  ) => {
    const lcrCarrierSetEntryPayload: LcrCarrierSetEntry = {
      ...entry,
      lcr_route_sid,
    };

    return postLcrCarrierSetEntry(lcrCarrierSetEntryPayload);
  };

  const submitUpdateLcr = () => {
    if (lcrDataMap && lcrDataMap.data && lcrDataMap.data.lcr_sid) {
      // update LCR
      const lcrPayload: Lcr = {
        name: lcrName,
        is_active: isActive,
        account_sid: user?.account_sid || null,
        service_provider_sid:
          currentServiceProvider?.service_provider_sid || null,
      };
      putLcrs(lcrDataMap.data.lcr_sid, lcrPayload).then(() => {
        // update lcr route
        lcrRoutes.forEach((route) => {
          if (route.lcr_route_sid) {
            submitUpdateLcrRoute(
              lcrDataMap.data?.lcr_sid || "",
              route.lcr_route_sid,
              route
            );
          } else {
            submitNewLcrRoute(lcrDataMap.data?.lcr_sid || "", route);
          }
        });
      });
    }

    const submitUpdateLcrRoute = (
      lcr_sid: string,
      lcr_route_sid: string,
      route: LcrRoute
    ) => {
      const lcrRoutePayload: LcrRoute = {
        lcr_sid,
        regex: route.regex,
        priority: route.priority,
      };

      putLcrRoutes(lcr_route_sid, lcrRoutePayload).then(() => {
        if (
          route.lcr_carrier_set_entries &&
          route.lcr_carrier_set_entries.length > 0
        ) {
          Promise.all(
            route.lcr_carrier_set_entries.map((entry) => {
              if (entry.lcr_carrier_set_entry_sid) {
                return submitUpdateLcrCarrierEntry(
                  entry.lcr_route_sid || lcr_route_sid,
                  entry.lcr_carrier_set_entry_sid,
                  entry
                );
              } else {
                return submitNewLcrCarrierSetEntry(lcr_route_sid, entry);
              }
            })
          )
            .then(() => {
              toastSuccess("Least cost routing rule successfully updated");
            })
            .catch((error) => {
              toastError(error);
            });
        }
      });
    };

    const submitUpdateLcrCarrierEntry = (
      lcr_route_sid: string,
      lcr_carrier_set_entry_sid: string,
      entry: LcrCarrierSetEntry
    ) => {
      const lcrCarrierSetEntryPayload: LcrCarrierSetEntry = {
        lcr_route_sid,
        workload: entry.workload,
        voip_carrier_sid: entry.voip_carrier_sid,
        priority: entry.priority,
      };
      return putLcrCarrierSetEntries(
        lcr_carrier_set_entry_sid,
        lcrCarrierSetEntryPayload
      );
    };

    // update lcr route
    // update lcr carrier set entries
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lcrDataMap) {
      submitUpdateLcr();
    } else {
      submitNewLcr();
    }
  };

  return (
    <Section slim>
      <form className="form form--internal" onSubmit={handleSubmit}>
        <fieldset>
          <MS>{MSG_REQUIRED_FIELDS}</MS>
          {!carriers ||
            (carriers.length === 0 && (
              <Message message={"There is no available Carriers"} />
            ))}
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
              required
              onChange={(e) => setDefaultCarrier(e.target.value)}
            />
          </div>
        </fieldset>
        <fieldset>
          <AccountSelect
            accounts={
              user?.scope === USER_ACCOUNT
                ? accounts?.filter(
                    (acct) => user.account_sid === acct.account_sid
                  )
                : accounts
            }
            account={[accountSid, setAccountSid]}
            label="Used by"
            required={false}
            defaultOption={
              user?.scope === USER_ADMIN || user?.scope === USER_SP
            }
            disabled={user?.scope !== USER_ADMIN}
          />
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
                      value={lr.regex || ""}
                      onChange={(e) => {
                        updateLcrRoute(i, "regex", e.target.value);
                      }}
                    />
                  </div>
                  <div>
                    <Selector
                      id={`lcr_carrier_set_entry_carrier_${i}`}
                      name={`lcr_carrier_set_entry_carrier_${i}`}
                      placeholder="Carrier"
                      value={
                        lr.lcr_carrier_set_entries &&
                        lr.lcr_carrier_set_entries.length > 0
                          ? lr.lcr_carrier_set_entries[0].voip_carrier_sid
                            ? lr.lcr_carrier_set_entries[0].voip_carrier_sid
                            : ""
                          : ""
                      }
                      required
                      options={carrierSelectorOptions}
                      onChange={(e) => {
                        updateLcrCarrierSetEntries(
                          i,
                          0,
                          "voip_carrier_sid",
                          e.target.value
                        );
                      }}
                    />
                  </div>
                </div>
                <button
                  className="btnty btn__delete"
                  title="Delete route"
                  type="button"
                  onClick={() => {
                    handleRouteDelete(lcrRoutes.find((g2, i2) => i2 === i));
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
            <Button
              type="submit"
              small
              disabled={!carriers || carriers.length === 0}
            >
              Save
            </Button>
          </ButtonGroup>
        </fieldset>
      </form>
    </Section>
  );
};

export default LcrForm;
