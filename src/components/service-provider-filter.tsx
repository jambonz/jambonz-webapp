import React, { useEffect, useState } from "react";
import { classNames } from "jambonz-ui";

import { Icons } from "src/components/icons";

import type { ServiceProvider } from "src/api/types";
import { hasLength, sortLocaleName } from "src/utils";

export type ServiceProviderFilterProps = {
  label?: string;
  serviceProvider: [string, React.Dispatch<React.SetStateAction<string>>];
  serviceProviders?: ServiceProvider[];
  defaultOption?: boolean;
};

/** This will apply the selected service_provider SID so you can filter local data */
/** Currently used by: Users view */
export const ServiceProviderFilter = ({
  label = "Service Provider",
  serviceProvider: [serviceProviderSid, setServiceProviderSid],
  serviceProviders,
  defaultOption,
}: ServiceProviderFilterProps) => {
  const [focus, setFocus] = useState(false);
  const classes = {
    smsel: true,
    "smsel--filter": true,
    "service-provider-filter": true,
    focused: focus,
  };

  useEffect(() => {
    if (hasLength(serviceProviders) && !defaultOption) {
      setServiceProviderSid(serviceProviders[0].service_provider_sid);
    }
  }, [serviceProviders, defaultOption, setServiceProviderSid]);

  return (
    <div className={classNames(classes)}>
      <label htmlFor="service-provider-filter">{label}:</label>
      <div>
        <select
          id="service-provider-filter"
          name="service-provider-filter"
          value={serviceProviderSid}
          onChange={(e) => setServiceProviderSid(e.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
        >
          {defaultOption ? (
            <option value="">All Service Providers</option>
          ) : (
            serviceProviders &&
            !serviceProviders.length && (
              <option value="">No Service Providers</option>
            )
          )}
          {hasLength(serviceProviders) &&
            serviceProviders.sort(sortLocaleName).map((acct) => {
              return (
                <option
                  key={acct.service_provider_sid}
                  value={acct.service_provider_sid}
                >
                  {acct.name}
                </option>
              );
            })}
        </select>
        <span>
          <Icons.ChevronUp />
          <Icons.ChevronDown />
        </span>
      </div>
    </div>
  );
};
