import React, { useState, forwardRef } from "react";
import { classNames } from "@jambonz/ui-kit";

import { Icons } from "src/components/icons";

import "./styles.scss";

type FileProps = JSX.IntrinsicElements["input"] & {
  handleFile: (file: File) => void;
};

type FileRef = HTMLInputElement;

/** The forwarded ref is so forms can still focus() this input if necessary... */
/** Disabling the cosmetic text input seems the best way to remove it from the field... */
/** Worth noting that tabIndex -1 with readOnly works as well, but disabled nukes it! */
/** Passing rest props for things like `required` etc for form handling / validation */
export const FileUpload = forwardRef<FileRef, FileProps>(
  (
    {
      id,
      name,
      handleFile,
      placeholder = "No file chosen",
      disabled,
      ...restProps
    }: FileProps,
    ref,
  ) => {
    const [fileName, setFileName] = useState("");
    const [focus, setFocus] = useState(false);
    const classes = {
      "file-upload": true,
      focused: focus,
      disabled: disabled ? true : false,
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length) {
        setFileName(e.target.files[0].name);
        handleFile(e.target.files[0]);
      }
    };

    return (
      <div className={classNames(classes)}>
        <div className="file-upload__wrap inpbtn">
          <input
            ref={ref}
            id={id}
            name={name}
            type="file"
            onChange={handleChange}
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
            disabled={disabled}
            {...restProps}
          />
          <input
            type="text"
            value={fileName}
            placeholder={placeholder}
            disabled
          />
          <button
            className="btnty"
            type="button"
            title={placeholder}
            disabled={disabled}
          >
            <Icons.FilePlus />
          </button>
        </div>
      </div>
    );
  },
);

FileUpload.displayName = "FileUpload";
