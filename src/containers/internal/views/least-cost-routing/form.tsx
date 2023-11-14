import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, ButtonGroup, Icon, MS, MXS } from "@jambonz/ui-kit";
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
  LcrRoute,
  UseApiDataMap,
} from "src/api/types";
import { ROUTE_INTERNAL_LEST_COST_ROUTING } from "src/router/routes";
import {
  deleteLcr,
  putLcr,
  postLcrCreateRoutes,
  putLcrUpdateRoutes,
  useApiData,
  useServiceProviderData,
} from "src/api";
import { USER_ACCOUNT, USER_ADMIN } from "src/api/constants";
import { postLcr } from "src/api";
import DeleteLcr from "./delete";
import { Scope } from "src/store/types";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Container from "./container";
import { hasValue } from "src/utils";

type LcrFormProps = {
  lcrDataMap?: UseApiDataMap<Lcr>;
  lcrRouteDataMap?: UseApiDataMap<LcrRoute[]>;
};

export const LcrForm = ({ lcrDataMap, lcrRouteDataMap }: LcrFormProps) => {
  const LCR_ROUTE_TEMPLATE: LcrRoute = {
    lcr_route_sid: "",
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

  const [errorMessage, setErrorMessage] = useState("");
  const [lcrName, setLcrName] = useState("");
  const [defaultLcrCarrier, setDefaultLcrCarrier] = useState("");
  const [defaultLcrCarrierSetEntrySid, setDefaultLcrCarrierSetEntrySid] =
    useState<string | null>();
  const [defaultLcrRoute, setDefaultLcrRoute] = useState<LcrRoute | null>(null);
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

  const carrierSelectorOptions = useMemo(() => {
    if (user?.account_sid && user?.scope === USER_ACCOUNT) {
      setAccountSid(user?.account_sid);
    }

    const carriersFiltered = carriers
      ? carriers.filter((carrier) =>
          accountSid
            ? carrier.account_sid === accountSid
            : carrier.account_sid === null
        )
      : [];

    const ret = carriersFiltered
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
    if (carriers && ret.length === 0) {
      setErrorMessage(
        accountSid
          ? "There are no available carriers defined for this account"
          : "There are no available carriers"
      );
    } else {
      setErrorMessage("");
    }
    return ret;
  }, [accountSid, carriers]);

  if (lcrDataMap && lcrDataMap.data && lcrDataMap.data !== previouseLcr) {
    setLcrName(lcrDataMap.data.name || "");
    setIsActive(lcrDataMap.data.is_active);
    setPreviousLcr(lcrDataMap.data);
  }

  useMemo(() => {
    let default_lcr_route_sid = "";
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
            default_lcr_route_sid = entry.lcr_route_sid || "";
            setDefaultLcrRoute(lr);
          }
        });
      });
    }

    if (lcrRouteDataMap && lcrRouteDataMap.data)
      setLcrRoutes(
        lcrRouteDataMap.data.filter(
          (route) => route.lcr_route_sid !== default_lcr_route_sid
        )
      );
  }, [lcrRouteDataMap?.data]);

  const addLcrRoutes = () => {
    const newLcrRoute = LCR_ROUTE_TEMPLATE;
    const ls = [
      ...lcrRoutes,
      {
        ...newLcrRoute,
        priority: lcrRoutes.length,
        lcr_carrier_set_entries: newLcrRoute.lcr_carrier_set_entries?.map(
          (r) => ({
            ...r,
            voip_carrier_sid: defaultCarrier || carrierSelectorOptions[0].value,
          })
        ),
      },
    ];
    setLcrRoutes(ls);
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
        const lcrsPayload = lcrRoutes.map((l, i) => ({
          ...l,
          lcr_carrier_set_entries: l.lcr_carrier_set_entries?.map((e) => ({
            ...e,
            voip_carrier_sid:
              e.voip_carrier_sid ||
              defaultCarrier ||
              carrierSelectorOptions[0]?.value,
          })),
          lcr_sid: json.sid,
          priority: i,
        }));
        lcrsPayload.push({
          lcr_sid: json.sid,
          regex: ".*",
          description: "System Default Route",
          priority: 9999,
          lcr_carrier_set_entries: [
            {
              lcr_route_sid: "",
              voip_carrier_sid:
                defaultLcrCarrier || carrierSelectorOptions[0]?.value,
              priority: 0,
            },
          ],
        });
        postLcrCreateRoutes(json.sid, lcrsPayload)
          .then(() => {
            if (lcrDataMap) {
              toastSuccess("Least cost routing successfully updated");
            } else {
              toastSuccess("Least cost routing successfully created");
              if (user?.access === Scope.admin) {
                navigate(ROUTE_INTERNAL_LEST_COST_ROUTING);
              } else {
                navigate(
                  `${ROUTE_INTERNAL_LEST_COST_ROUTING}/${json.sid}/edit`
                );
              }
              // Update global state
              dispatch({ type: "lcr" });
            }
          })
          .catch(({ msg }) => {
            toastError(msg);
          });
      })
      .catch(({ msg }) => {
        toastError(msg);
      });
  };

  const handleLcrPut = () => {
    if (lcrDataMap && lcrDataMap.data && lcrDataMap.data.lcr_sid) {
      // update LCR
      const lcrPayload: Lcr = getLcrPayload();
      putLcr(lcrDataMap.data.lcr_sid, lcrPayload).then(() => {
        putLcrUpdateRoutes(lcrDataMap.data?.lcr_sid || "", [
          ...lcrRoutes.map((r, i) => ({
            ...r,
            priority: i,
          })),
          ...(hasValue(defaultLcrRoute)
            ? [
                {
                  ...defaultLcrRoute,
                  lcr_carrier_set_entries:
                    defaultLcrRoute.lcr_carrier_set_entries?.map((r) => ({
                      ...r,
                      voip_carrier_sid:
                        defaultLcrCarrier ||
                        r.voip_carrier_sid ||
                        carrierSelectorOptions[0].value,
                    })),
                },
              ]
            : []),
        ])
          .then(() => {
            toastSuccess("Least cost routing rule successfully updated");
          })
          .catch((error) => toastError(error));
      });
    }
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
        <form
          className={`form form--internal ${
            !lcrDataMap?.data && lcrDataMap?.refetch ? "form--blur" : ""
          }`}
          onSubmit={handleSubmit}
        >
          <fieldset>
            <MS>{MSG_REQUIRED_FIELDS}</MS>
            {errorMessage && <Message message={errorMessage} />}
          </fieldset>
          <fieldset>
            <div className="multi">
              <div className="inp">
                <label htmlFor="lcr_name">Name</label>
                <input
                  id="lcr_name"
                  name="lcr_name"
                  type="text"
                  placeholder="name"
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
            <MXS>
              <em>Drag and drop to rearrange the order.</em>
            </MXS>
            <label htmlFor="sip_gateways">Digit pattern / Carrier</label>
            <DndProvider backend={HTML5Backend}>
              <Container
                lcrRoute={[lcrRoutes, setLcrRoutes]}
                carrierSelectorOptions={carrierSelectorOptions}
              />
            </DndProvider>
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
                      disabled={carrierSelectorOptions.length === 0}
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
