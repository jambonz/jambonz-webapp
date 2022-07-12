import React from "react";
import { classNames } from "jambonz-ui";

import "./styles.scss";

type SectionProps = {
  slim?: boolean;
  clean?: boolean;
  children: React.ReactNode;
};

export const Section = ({
  children,
  slim = false,
  clean = false,
}: SectionProps) => {
  const classes = classNames({
    sec: true,
    "sec--slim": slim,
    "sec--clean": clean,
  });

  return <section className={classes}>{children}</section>;
};
