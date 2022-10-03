import React, { useEffect, useState } from "react";

import { ButtonGroup, Button } from "jambonz-ui";
import { useApiData, postPasswordSettings } from "src/api";
import { PasswordSettings } from "src/api/types";
import { toastError, toastSuccess } from "src/store";

export const AdminSettings = () => {
  const [localPasswordSettings, setLocalPasswordSettings] =
    useState<Partial<PasswordSettings>>();
  const [passwordSettings, passwordSettingsFetcher] =
    useApiData<Partial<PasswordSettings>>("/PasswordSettings");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localPasswordSettings) {
      postPasswordSettings(localPasswordSettings)
        .then(() => {
          passwordSettingsFetcher();
          toastSuccess("Password settings was successfully updated");
        })
        .catch((error) => {
          toastError(error.msg);
        });
    }
  };

  useEffect(() => {
    setLocalPasswordSettings(passwordSettings);
  }, [passwordSettings]);

  return (
    <>
      <fieldset>
        <label htmlFor="min_password_length">Min Password Length</label>
        <input
          id="min_password_length"
          type="number"
          min={0}
          name="min_password_length"
          placeholder="Min Password Length (0 = unlimited)"
          value={localPasswordSettings?.min_password_length || ""}
          onChange={(e) =>
            setLocalPasswordSettings({
              ...localPasswordSettings,
              min_password_length: Number(e.target.value),
            })
          }
        />

        <label htmlFor="require_digit" className="chk">
          <input
            id="require_digit"
            name="require_digit"
            type="checkbox"
            checked={
              localPasswordSettings?.require_digit &&
              localPasswordSettings?.require_digit > 0
                ? true
                : false
            }
            onChange={(e) => {
              setLocalPasswordSettings({
                ...localPasswordSettings,
                require_digit: e.target.checked ? 1 : 0,
              });
            }}
          />
          <div>Password Require Digit</div>
        </label>

        <label htmlFor="require_special_character" className="chk">
          <input
            id="require_special_character"
            name="require_special_character"
            type="checkbox"
            checked={
              localPasswordSettings?.require_special_character &&
              localPasswordSettings?.require_special_character > 0
                ? true
                : false
            }
            onChange={(e) => {
              setLocalPasswordSettings({
                ...localPasswordSettings,
                require_special_character: e.target.checked ? 1 : 0,
              });
            }}
          />
          <div>Password Require Special Character</div>
        </label>
      </fieldset>
      <fieldset>
        <ButtonGroup left>
          <Button onClick={handleSubmit} small>
            Save
          </Button>
        </ButtonGroup>
      </fieldset>
    </>
  );
};

export default AdminSettings;
