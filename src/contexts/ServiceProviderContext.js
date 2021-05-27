import React, { createContext, useState } from "react";

export const ServiceProviderValueContext = createContext();
export const ServiceProviderMethodContext = createContext();

export function ServiceProvider(props) {
  const [currentServiceProvider, setCurrentServiceProvider] = useState("");

  return (
    <ServiceProviderValueContext.Provider value={currentServiceProvider}>
      <ServiceProviderMethodContext.Provider value={setCurrentServiceProvider}>
        {props.children}
      </ServiceProviderMethodContext.Provider>
    </ServiceProviderValueContext.Provider>
  );
}
