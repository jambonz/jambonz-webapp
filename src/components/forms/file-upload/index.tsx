import React, { useState } from "react";

import { Icons } from "src/components/icons";

import "./styles.scss";

type FileProps = {
  id: string;
  name: string;
  onChange: (file: File) => void;
  placeholder?: string;
};

export const FileUpload = ({
  id,
  name,
  onChange,
  placeholder = "Choose a file",
}: FileProps) => {
  const [fileName, setFileName] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length) {
      setFileName(e.target.files[0].name);
      onChange(e.target.files[0]);
    }
  };

  return (
    <div className="file-upload">
      <div className="file-upload__wrap inpbtn">
        <input
          id={id}
          name={name}
          type="text"
          value={fileName}
          placeholder={placeholder}
          readOnly
        />
        <input
          id={`file-upload-${id}`}
          name={`file-upload-${name}`}
          type="file"
          onChange={handleFileChange}
        />
        <button className="btn--type" type="button" title="Choose a file">
          <Icons.FilePlus />
        </button>
      </div>
    </div>
  );
};
