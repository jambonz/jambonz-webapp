import React, { useState, forwardRef } from "react";

import { Icons } from "src/components/icons";

import "./styles.scss";

type FileProps = JSX.IntrinsicElements["input"] & {
  handleFile: (file: File) => void;
};

type FileRef = HTMLInputElement;

/** The forwarded ref is so forms can still focus() this select menu if necessary... */
export const FileUpload = forwardRef<FileRef, FileProps>(
  (
    { id, name, handleFile, placeholder = "No file chosen" }: FileProps,
    ref
  ) => {
    const [fileName, setFileName] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length) {
        setFileName(e.target.files[0].name);
        handleFile(e.target.files[0]);
      }
    };

    return (
      <div className="file-upload">
        <div className="file-upload__wrap inpbtn">
          <input
            ref={ref}
            id={id}
            name={name}
            type="text"
            value={fileName}
            placeholder={placeholder}
            readOnly
          />
          <input
            id={`file_${id}`}
            name={`file_${name}`}
            type="file"
            onChange={handleChange}
          />
          <button className="btn--type" type="button" title={placeholder}>
            <Icons.FilePlus />
          </button>
        </div>
      </div>
    );
  }
);

FileUpload.displayName = "FileUpload";
