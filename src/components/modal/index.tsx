import React from "react";
import { Button, ButtonGroup } from "jambonz-ui";

import "./styles.scss";

type ModalProps = {
  disabled?: boolean;
  children: React.ReactNode;
  handleSubmit: (e: React.FormEvent) => void;
  handleCancel: (e: React.FormEvent) => void;
};

type CloseProps = {
  children: React.ReactNode;
  handleClose: () => void;
};

export const Modal = ({
  disabled,
  children,
  handleSubmit,
  handleCancel,
}: ModalProps) => {
  return (
    <div className="modal">
      <div className="modal__box">
        <div className="modal__stuff">{children}</div>
        <ButtonGroup right>
          <Button
            type="button"
            small
            subStyle="grey"
            onClick={handleCancel}
            disabled={disabled}
          >
            Cancel
          </Button>
          <Button
            type="button"
            small
            onClick={handleSubmit}
            disabled={disabled}
          >
            Confirm
          </Button>
        </ButtonGroup>
      </div>
    </div>
  );
};

export const ModalForm = ({
  disabled,
  children,
  handleSubmit,
  handleCancel,
}: ModalProps) => {
  return (
    <div className="modal">
      <form
        className="modal__box"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(e);
        }}
      >
        <div className="modal__stuff">{children}</div>
        <ButtonGroup right>
          <Button
            small
            subStyle="grey"
            onClick={handleCancel}
            disabled={disabled}
          >
            Cancel
          </Button>
          <Button type="submit" small disabled={disabled}>
            Save
          </Button>
        </ButtonGroup>
      </form>
    </div>
  );
};

export const ModalClose = ({ children, handleClose }: CloseProps) => {
  return (
    <div className="modal">
      <div className="modal__box">
        <div className="modal__stuff">{children}</div>
        <ButtonGroup right>
          <Button type="button" small subStyle="grey" onClick={handleClose}>
            Close
          </Button>
        </ButtonGroup>
      </div>
    </div>
  );
};
