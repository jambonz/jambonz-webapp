import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, ButtonGroup, Icon, MS } from "@jambonz/ui-kit";
import { Icons, Section } from "src/components";
import {
  toastError,
  toastSuccess,
  useDispatch,
  useSelectState,
} from "src/store";
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
  deleteLcr,
  deleteLcrRoute,
  postLcrCarrierSetEntry,
  putLcrCarrierSetEntries,
  putLcrRoutes,
  putLcr,
  useApiData,
  useServiceProviderData,
  getLcrRoute,
  getLcr,
} from "src/api";
import { USER_ACCOUNT, USER_ADMIN } from "src/api/constants";
import { hasLength } from "src/utils";
import { postLcr } from "src/api";
import { postLcrRoute } from "src/api";
import DeleteLcr from "./delete";
import { Scope } from "src/store/types";

type LcrFormProps = {
  lcrDataMap?: UseApiDataMap<Lcr>;
  lcrRouteDataMap?: UseApiDataMap<LcrRoute[]>;
};

export const LcrForm = ({ lcrDataMap, lcrRouteDataMap }: LcrFormProps) => {
  const MAX_ROUTES = 5;
  const LCR_ROUTE_TEMPLATE: LcrRoute = {
    regex: "",
    lcr_sid: "",
    priority: 0,
    lcr_carrier_set_entries: [
      {
        lcr_route_sid: "",
        voip_carrier_sid: "",
        priority: 0,
      },
    ],
  };

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [lcrName, setLcrName] = useState("");
  const [defaultLcrCarrier, setDefaultLcrCarrier] = useState("");
  const [defaultLcrCarrierSetEntrySid, setDefaultLcrCarrierSetEntrySid] =
    useState<string | null>();
  const [defaultLcrRouteSid, setDefaultLcrRouteSid] = useState("");
  const [defaultCarrier, setDefaultCarrier] = useState("");
  const [apiUrl, setApiUrl] = useState("");
  const [accountSid, setAccountSid] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [lcrRoutes, setLcrRoutes] = useState<LcrRoute[]>([LCR_ROUTE_TEMPLATE]);
  const [previousLcrRoutes, setPreviousLcrRoutes] = useState<LcrRoute[]>([
    LCR_ROUTE_TEMPLATE,
  ]);
  const [previouseLcr, setPreviousLcr] = useState<Lcr | null>();
  const [accounts] = useServiceProviderData<Account[]>("Accounts");
  const [lcrForDelete, setLcrForDelete] = useState<Lcr | null>();

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
    if (user?.account_sid && user?.scope === USER_ACCOUNT) {
      setAccountSid(user?.account_sid);
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
    return carriersFiltered
      ? carriersFiltered.map((c: Carrier, i) => {
          if (i === 0) {
            setDefaultCarrier(c.voip_carrier_sid);
          }
          return {
            name: c.name,
            value: c.voip_carrier_sid,
          };
        })
      : [];
  }, [carriersFiltered]);

  const sortSetLcrRoutes = (routes: LcrRoute[]) => {
    let sorted = [...routes];
    sorted = sorted.sort((p1, p2) =>
      p1.priority > p2.priority ? 1 : p1.priority < p2.priority ? -1 : 0
    );
    return sorted;
  };

  if (lcrDataMap && lcrDataMap.data && lcrDataMap.data !== previouseLcr) {
    setLcrName(lcrDataMap.data.name || "");
    setIsActive(lcrDataMap.data.is_active);
    setPreviousLcr(lcrDataMap.data);
  }

  if (
    lcrRouteDataMap &&
    lcrRouteDataMap.data &&
    lcrRouteDataMap.data !== previousLcrRoutes
  ) {
    setPreviousLcrRoutes(lcrRouteDataMap.data);
    // Find default carrier
    lcrRouteDataMap.data.forEach((lr) => {
      lr.lcr_carrier_set_entries?.forEach((entry) => {
        if (
          entry.lcr_carrier_set_entry_sid ===
          lcrDataMap?.data?.default_carrier_set_entry_sid
        ) {
          setDefaultLcrCarrier(entry.voip_carrier_sid || defaultCarrier);
          setDefaultLcrCarrierSetEntrySid(
            entry.lcr_carrier_set_entry_sid || null
          );
          setDefaultLcrRouteSid(entry.lcr_route_sid || "");
        }
      });
    });
  }

  useEffect(() => {
    if (lcrRouteDataMap && lcrRouteDataMap.data)
      setLcrRoutes(
        lcrRouteDataMap.data.filter(
          (route) => route.lcr_route_sid !== defaultLcrRouteSid
        )
      );
  }, [defaultLcrRouteSid]);

  const addLcrRoutes = () => {
    const ls = [
      ...lcrRoutes,
      {
        ...LCR_ROUTE_TEMPLATE,
        priority: lcrRoutes.length,
      },
    ];
    setLcrRoutes(ls);
  };

  const updateLcrRoute = (
    index: number,
    key: string,
    value: typeof lcrRoutes[number][keyof LcrRoute]
  ) => {
    setLcrRoutes(
      lcrRoutes.map((lr, i) => (i === index ? { ...lr, [key]: value } : lr))
    );
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

  const handleRouteDelete = (r: LcrRoute | undefined) => {
    if (r && r.lcr_route_sid) {
      deleteLcrRoute(r.lcr_route_sid)
        .then(() => {
          toastSuccess("Least cost routing rule successfully deleted");
        })
        .catch((error) => {
          toastError(error);
        });
    }
  };

  const getLcrPayload = (): Lcr => {
    return {
      name: lcrName,
      is_active: isActive,
      account_sid: accountSid,
      service_provider_sid:
        currentServiceProvider?.service_provider_sid || null,
      default_carrier_set_entry_sid: defaultLcrCarrierSetEntrySid,
    };
  };

  const handleLcrPost = () => {
    const lcrPayload: Lcr = getLcrPayload();
    postLcr(lcrPayload)
      .then(({ json }) => {
        Promise.all(
          lcrRoutes.map((route, i) => handleLcrRoutePost(json.sid, route, i))
        )
          .then(() => {
            handleLcrDefaultCarrierPost(json.sid);
          })
          .catch(({ msg }) => {
            toastError(msg);
          });
      })
      .catch(({ msg }) => {
        toastError(msg);
      });
  };

  const handleLcrDefaultCarrierPost = (lcr_sid: string) => {
    const defaultRoute = {
      lcr_sid: lcr_sid,
      regex: ".*",
      desciption: "System Default Route",
      priority: 9999,
      lcr_carrier_set_entries: [
        {
          lcr_route_sid: "",
          voip_carrier_sid: defaultLcrCarrier,
          priority: 0,
        },
      ],
    };

    handleLcrRoutePost(lcr_sid, defaultRoute, 9999).then((lcr_route_sid) => {
      getLcrRoute(lcr_route_sid).then(({ json }) => {
        if (json.lcr_carrier_set_entries?.length) {
          const lcr_carrier_set_entry_sid =
            json.lcr_carrier_set_entries[0].lcr_carrier_set_entry_sid;
          getLcr(lcr_sid).then(({ json }) => {
            json.default_carrier_set_entry_sid = lcr_carrier_set_entry_sid;
            delete json.lcr_sid;
            putLcr(lcr_sid, json)
              .then(() => {
                if (lcrDataMap) {
                  toastSuccess("Least cost routing successfully updated");
                } else {
                  toastSuccess("Least cost routing successfully created");
                  if (user?.access === Scope.admin) {
                    navigate(ROUTE_INTERNAL_LEST_COST_ROUTING);
                  } else {
                    navigate(
                      `${ROUTE_INTERNAL_LEST_COST_ROUTING}/${lcr_sid}/edit`
                    );
                  }
                  // Update global state
                  dispatch({ type: "lcr" });
                }
              })
              .catch((error) => {
                toastError(error);
              });
          });
        }
      });
    });
  };

  const handleLcrRoutePost = (
    lcr_sid: string,
    route: LcrRoute,
    priority: number
  ): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      const lcrRoutePayload: LcrRoute = {
        lcr_sid,
        regex: route.regex,
        priority,
      };
      postLcrRoute(lcrRoutePayload)
        .then(({ json }) => {
          if (route.lcr_carrier_set_entries) {
            Promise.all(
              route.lcr_carrier_set_entries.map((entry) => {
                handleLcrCarrierSetEntryPost(json.sid, entry);
              })
            )
              .then(() => resolve(json.sid))
              .catch((error) => {
                reject(error);
              });
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  };

  const handleLcrCarrierSetEntryPost = (
    lcr_route_sid: string,
    entry: LcrCarrierSetEntry
  ) => {
    const lcrCarrierSetEntryPayload: LcrCarrierSetEntry = {
      ...entry,
      voip_carrier_sid: entry.voip_carrier_sid || defaultCarrier,
      lcr_route_sid,
    };

    return postLcrCarrierSetEntry(lcrCarrierSetEntryPayload);
  };

  const handleLcrPut = () => {
    if (lcrDataMap && lcrDataMap.data && lcrDataMap.data.lcr_sid) {
      // update LCR
      const lcrPayload: Lcr = getLcrPayload();
      putLcr(lcrDataMap.data.lcr_sid, lcrPayload).then(() => {
        Promise.all(
          lcrRoutes.map((route, i) => {
            if (route.lcr_route_sid) {
              handleLcrRoutePut(
                lcrDataMap.data?.lcr_sid || "",
                route.lcr_route_sid,
                route,
                i
              );
            } else {
              handleLcrRoutePost(lcrDataMap.data?.lcr_sid || "", route, i);
            }
          })
        )
          .then(() => {
            if (defaultLcrCarrierSetEntrySid) {
              const defaultEntry: LcrCarrierSetEntry = {
                lcr_route_sid: defaultLcrRouteSid,
                voip_carrier_sid: defaultLcrCarrier,
                priority: 0,
              };

              handleLcrCarrierEntryPut(
                defaultLcrRouteSid,
                defaultLcrCarrierSetEntrySid,
                defaultEntry
              ).then(() => {
                toastSuccess("Least cost routing rule successfully updated");
              });
            }
          })
          .catch((error) => toastError(error));
      });
    }

    const handleLcrRoutePut = (
      lcr_sid: string,
      lcr_route_sid: string,
      route: LcrRoute,
      priority: number
    ): Promise<string> => {
      return new Promise(async (resolve, reject) => {
        const lcrRoutePayload: LcrRoute = {
          lcr_sid,
          regex: route.regex,
          priority,
        };
        putLcrRoutes(lcr_route_sid, lcrRoutePayload).then(() => {
          if (
            route.lcr_carrier_set_entries &&
            route.lcr_carrier_set_entries.length > 0
          ) {
            Promise.all(
              route.lcr_carrier_set_entries.map((entry) => {
                if (entry.lcr_carrier_set_entry_sid) {
                  return handleLcrCarrierEntryPut(
                    entry.lcr_route_sid || lcr_route_sid,
                    entry.lcr_carrier_set_entry_sid,
                    entry
                  );
                } else {
                  return handleLcrCarrierSetEntryPost(lcr_route_sid, entry);
                }
              })
            )
              .then(() => {
                resolve("Least cost routing rule successfully updated");
              })
              .catch((error) => {
                reject(error);
              });
          }
        });
      });
    };

    const handleLcrCarrierEntryPut = (
      lcr_route_sid: string,
      lcr_carrier_set_entry_sid: string,
      entry: LcrCarrierSetEntry
    ) => {
      const lcrCarrierSetEntryPayload: LcrCarrierSetEntry = {
        lcr_route_sid,
        workload: entry.workload,
        voip_carrier_sid: entry.voip_carrier_sid || defaultCarrier,
        priority: entry.priority,
      };
      return putLcrCarrierSetEntries(
        lcr_carrier_set_entry_sid,
        lcrCarrierSetEntryPayload
      );
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lcrDataMap) {
      handleLcrPut();
    } else {
      handleLcrPost();
    }
  };

  const handleDelete = () => {
    if (lcrForDelete) {
      deleteLcr(lcrForDelete.lcr_sid || "")
        .then(() => {
          toastSuccess(
            <>
              Deleted least cost routing <strong>{lcrForDelete?.name}</strong>
            </>
          );
          setLcrForDelete(null);
          if (user?.access === Scope.admin) {
            navigate(ROUTE_INTERNAL_LEST_COST_ROUTING);
          } else {
            navigate(`${ROUTE_INTERNAL_LEST_COST_ROUTING}/add`);
          }
          dispatch({ type: "lcr" });
        })
        .catch((error) => {
          toastError(error.msg);
        });
    }
  };

  return (
    <>
      <Section slim>
        <form className="form form--internal" onSubmit={handleSubmit}>
          <fieldset>
            <MS>{MSG_REQUIRED_FIELDS}</MS>
            {!carrierSelectorOptions ||
              (carrierSelectorOptions.length === 0 && (
                <Message message={"There are no available Carriers"} />
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
                value={defaultLcrCarrier}
                options={carrierSelectorOptions}
                required
                onChange={(e) => {
                  setDefaultLcrCarrier(e.target.value);
                }}
              />
            </div>
          </fieldset>
          {user?.scope === USER_ADMIN && (
            <fieldset>
              <AccountSelect
                accounts={accounts}
                account={[accountSid, setAccountSid]}
                label="Used by"
                required={false}
                defaultOption={true}
                disabled={lcrDataMap !== undefined}
              />
            </fieldset>
          )}
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
                      setLcrRoutes(lcrRoutes.filter((g2, i2) => i2 !== i));
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
            <div className="grid grid--col3">
              <div className="grid__row">
                <div>
                  <ButtonGroup left>
                    {user?.access === Scope.admin && (
                      <Button
                        small
                        subStyle="grey"
                        as={Link}
                        to={ROUTE_INTERNAL_LEST_COST_ROUTING}
                      >
                        Cancel
                      </Button>
                    )}
                    <Button
                      type="submit"
                      small
                      disabled={
                        !carrierSelectorOptions ||
                        carrierSelectorOptions.length === 0
                      }
                    >
                      Save
                    </Button>
                  </ButtonGroup>
                </div>
                <div />
                <div>
                  {user?.scope !== USER_ADMIN &&
                    lcrDataMap &&
                    lcrDataMap.data &&
                    lcrDataMap.data.lcr_sid && (
                      <ButtonGroup right>
                        <Button
                          type="button"
                          small
                          subStyle="grey"
                          onClick={() => {
                            setLcrForDelete(lcrDataMap.data);
                          }}
                        >
                          Delete
                        </Button>
                      </ButtonGroup>
                    )}
                </div>
              </div>
            </div>
          </fieldset>
        </form>
      </Section>
      {lcrForDelete && (
        <DeleteLcr
          lcr={lcrForDelete}
          handleCancel={() => setLcrForDelete(null)}
          handleSubmit={handleDelete}
        />
      )}
    </>
  );
};

export default LcrForm;
