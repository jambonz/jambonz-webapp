import React, { createContext, useState } from 'react';

export const ModalStateContext = createContext();
export const ModalDispatchContext = createContext();

// This context keeps track of when a modal is open. Other
// elements (buttons, links, inputs) are set to disabled
// when a modal is open
export function ModalProvider(props) {
  const [ modalOpen, setModalOpen ] = useState(false);
  return (
    <ModalStateContext.Provider value={modalOpen}>
      <ModalDispatchContext.Provider value={setModalOpen}>
        {props.children}
      </ModalDispatchContext.Provider>
    </ModalStateContext.Provider>
  );
};
