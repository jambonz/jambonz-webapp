import { useState, useEffect } from "react";
import { getCssVar } from "jambonz-ui";

export const useMobileMedia = () => {
  const [mobile, setMobile] = useState(false);

  const handleMedia = (e: MediaQueryListEvent) => {
    setMobile(e.matches);
  };

  useEffect(() => {
    const mql = window.matchMedia(
      `(max-width: ${getCssVar("--mobile-media")})`
    );

    mql.addEventListener("change", handleMedia);

    setMobile(mql.matches);

    return function cleanup() {
      mql.removeEventListener("change", handleMedia);
    };
  }, []);

  return mobile;
};
