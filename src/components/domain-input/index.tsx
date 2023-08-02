import React from "react";
import { Icons } from "../icons";
import "./styles.scss";

type DomainInputProbs = {
  id?: string;
  name?: string;
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  root_domain: string;
  placeholder?: string;
  is_valid: boolean;
};

export const DomainInput = ({
  id,
  name,
  value,
  setValue,
  root_domain,
  is_valid,
  placeholder,
}: DomainInputProbs) => {
  return (
    <>
      <div className="clipboard clipboard-domain">
        <div className="input-container">
          <input
            id={id}
            name={name}
            type="text"
            value={value}
            placeholder={placeholder}
            onChange={(e) => setValue(e.target.value)}
          />
          <div className={`input-icon txt--${is_valid ? "teal" : "red"}`}>
            {is_valid ? <Icons.CheckCircle /> : <Icons.XCircle />}
          </div>
        </div>
        <div className="root-domain">
          <p>{root_domain}</p>
        </div>
      </div>
    </>
  );
};

export default DomainInput;
