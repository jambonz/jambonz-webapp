import React, { useEffect, useState } from "react";
import { H1, P } from "jambonz-ui";

import { Section } from "src/components";
import { Selector } from "src/components/forms";
import { vendors, VENDOR_AWS } from "src/vendor";

import type { RegionVendors } from "src/vendor/types";

export const SpeechServices = () => {
  const [regions, setRegions] = useState<RegionVendors | null>(null);
  const [vendor, setVendor] = useState("");
  const [region, setRegion] = useState("");

  /** Lazy-load large data schemas -- e.g. code-splitting */
  /** This code should be moved into the add/edit form handling */
  useEffect(() => {
    let ignore = false;

    Promise.all([
      import("src/vendor/regions/aws-regions"),
      import("src/vendor/regions/ms-azure-regions"),
    ]).then(([{ default: awsRegions }, { default: msRegions }]) => {
      if (!ignore) {
        setRegions({
          aws: awsRegions,
          microsoft: msRegions,
        });
      }
    });

    return function cleanup() {
      ignore = true;
    };
  }, []);

  return (
    <>
      <H1>Speech Services</H1>
      <Section>
        <form className="form">
          <P>Example of lazy loading region data files for add/edit form.</P>
          <P>
            This also shows how to implement the region selector logic for
            aws/microsoft.
          </P>
          <P>
            Selected vendor: <strong>{vendor || "undefined"}</strong>.
          </P>
          <P>
            Selected region: <strong>{region || "undefined"}</strong>.
          </P>
          <fieldset>
            <label htmlFor="vendor">Vendor</label>
            <Selector
              id="vendor"
              name="vendor"
              value={vendor}
              options={[
                {
                  name: "Select a vendor",
                  value: "",
                },
              ].concat(vendors)}
              onChange={(e) => {
                setVendor(e.target.value);
                setRegion("");
              }}
            />
          </fieldset>
          {regions && regions[vendor as keyof RegionVendors] && (
            <fieldset>
              <label htmlFor="region">Region</label>
              <Selector
                id="region"
                name="region"
                value={region}
                options={[
                  {
                    name:
                      vendor === VENDOR_AWS ? "Select a region" : "All regions",
                    value: "",
                  },
                ].concat(regions[vendor as keyof RegionVendors])}
                onChange={(e) => setRegion(e.target.value)}
              />
            </fieldset>
          )}
        </form>
      </Section>
    </>
  );
};

export default SpeechServices;
