import React, { useEffect, useState } from "react";

import { ButtonGroup, Button } from "jambonz-ui";
import { useApiData, postPasswordSettings } from "src/api";
import { PasswordSettings } from "src/api/types";
import { toastError, toastSuccess } from "src/store";
import { Selector } from "src/components/forms";
import { hasValue } from "src/utils";

export const AdminSettings = () => {
  const [passwordSettings, passwordSettingsFetcher] =
    useApiData<PasswordSettings>("PasswordSettings");
  // Min value is 8
  const [minPasswordLength, setMinPasswordLength] = useState(8);
  const [requireDigit, setRequireDigit] = useState(false);
  const [requireSpecialCharacter, setRequireSpecialCharacter] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Partial<PasswordSettings> = {
      min_password_length: minPasswordLength,
      require_digit: requireDigit ? 1 : 0,
      require_special_character: requireSpecialCharacter ? 1 : 0,
    };
    postPasswordSettings(payload)
      .then(() => {
        passwordSettingsFetcher();
        toastSuccess("Password settings was successfully updated");
      })
      .catch((error) => {
        toastError(error.msg);
      });
  };

  useEffect(() => {
    setRequireDigit(
      hasValue(passwordSettings) && passwordSettings.require_digit > 0
        ? true
        : false
    );
    setRequireSpecialCharacter(
      hasValue(passwordSettings) &&
        passwordSettings.require_special_character > 0
        ? true
        : false
    );
    if (passwordSettings?.min_password_length) {
      setMinPasswordLength(passwordSettings.min_password_length);
    }
  }, [passwordSettings]);

  return (
    <>
      <fieldset>
        <label htmlFor="min_password_length">Min Password Length</label>
        <Selector
          id="min_password_length"
          name="min_password_length"
          value={minPasswordLength}
          options={Array(13)
            .fill(8)
            .map((i, j) => ({
              name: (i + j).toString(),
              value: (i + j).toString(),
            }))}
          onChange={(e) => setMinPasswordLength(Number(e.target.value))}
        />
        <label htmlFor="require_digit" className="chk">
          <input
            id="require_digit"
            name="require_digit"
            type="checkbox"
            checked={requireDigit}
            onChange={(e) => {
              setRequireDigit(e.target.checked);
            }}
          />
          <div>Password Require Digit</div>
        </label>

        <label htmlFor="require_special_character" className="chk">
          <input
            id="require_special_character"
            name="require_special_character"
            type="checkbox"
            checked={requireSpecialCharacter}
            onChange={(e) => {
              setRequireSpecialCharacter(e.target.checked);
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
