import React from "react";
import ReactDOM from "react-dom";
import { Button, ButtonGroup } from "@jambonz/ui-kit";

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

const portal: Element = document.getElementById("modal")!;

export const Modal = ({
  disabled,
  children,
  handleSubmit,
  handleCancel,
}: ModalProps) => {
  return ReactDOM.createPortal(
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
    </div>,
    portal
  );
};

export const ModalForm = ({
  disabled,
  children,
  handleSubmit,
  handleCancel,
}: ModalProps) => {
  return ReactDOM.createPortal(
    <div className="modal">
      <form
        className="form modal__box"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(e);
        }}
      >
        <div className="modal__stuff">{children}</div>
        <ButtonGroup right>
          <Button
            small
            type="button"
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
    </div>,
    portal
  );
};

export const ModalClose = ({ children, handleClose }: CloseProps) => {
  return ReactDOM.createPortal(
    <div className="modal" role="presentation" onClick={handleClose}>
      <div
        className="modal__box"
        role="presentation"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="modal__stuff"
          role="presentation"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
        <ButtonGroup right>
          <Button type="button" small subStyle="grey" onClick={handleClose}>
            Close
          </Button>
        </ButtonGroup>
      </div>
    </div>,
    portal
  );
};
