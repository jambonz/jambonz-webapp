import React, { useEffect, useState } from "react";
import { H1, P } from "jambonz-ui";

import { AccountFilter, Section } from "src/components";
import { FileUpload, Selector } from "src/components/forms";
import { vendors, VENDOR_AWS, VENDOR_GOOGLE } from "src/vendor";
import { toastError } from "src/store";

import type { RegionVendors, GoogleServiceKey } from "src/vendor/types";

export const SpeechServices = () => {
  const [regions, setRegions] = useState<RegionVendors | null>(null);
  const [vendor, setVendor] = useState("");
  const [region, setRegion] = useState("");
  const [serviceKey, setServiceKey] = useState<GoogleServiceKey | null>(null);
  const [accountSid, setAccountSid] = useState("");

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
      <section className="filters">
        <AccountFilter
          label="Used by"
          account={[accountSid, setAccountSid]}
          defaultOption
        />
      </section>
      <Section slim>
        <form>
          <fieldset>
            <P>Example of lazy loading region data files for add/edit form.</P>
            <P>
              This also shows how to implement the region selector logic for
              aws/microsoft as well as service key file upload for google.
            </P>
            <P>
              Selected account SID: <strong>{accountSid || "undefined"}</strong>
            </P>
            <P>
              Selected vendor: <strong>{vendor || "undefined"}</strong>
            </P>
            <P>
              Selected region: <strong>{region || "undefined"}</strong>
            </P>
            <div className="p">
              Selected service key:{" "}
              {serviceKey ? (
                <pre>{JSON.stringify(serviceKey, null, 2)}</pre>
              ) : (
                <strong>undefined</strong>
              )}
            </div>
          </fieldset>
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
                setServiceKey(null);
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
          {vendor && vendor === VENDOR_GOOGLE && (
            <fieldset>
              <label htmlFor="google_service_key">Service key</label>
              <FileUpload
                id="google_service_key"
                name="google_service_key"
                handleFile={(file) => {
                  const handleError = () => {
                    setServiceKey(null);
                    toastError(
                      "Invalid service key file, could not parse as JSON."
                    );
                  };

                  file
                    .text()
                    .then((text) => {
                      try {
                        const json: GoogleServiceKey = JSON.parse(text);

                        if (json.private_key && json.client_email) {
                          setServiceKey(json);
                        } else {
                          setServiceKey(null);
                          toastError("Invalid service key file, missing data.");
                        }
                      } catch (error) {
                        handleError();
                      }
                    })
                    .catch(() => {
                      handleError();
                    });
                }}
              />
            </fieldset>
          )}
        </form>
      </Section>
    </>
  );
};

export default SpeechServices;
