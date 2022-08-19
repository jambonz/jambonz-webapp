import React from "react";
import { classNames } from "jambonz-ui";

import "./styles.scss";

type CommonProps = {
  children: React.ReactNode;
};

type GridProps = CommonProps & {
  col3?: boolean;
  col5?: boolean;
};

type RowProps = CommonProps & {
  empty?: boolean;
  header?: boolean;
};

export const GridRow = ({
  children,
  header = false,
  empty = false,
}: RowProps) => {
  const classes = classNames({
    grid__row: true,
    grid__th: header,
    grid__empty: empty,
  });

  return <div className={classes}>{children}</div>;
};

export const Grid = ({ children, col3 = false, col5 = false }: GridProps) => {
  const classes = classNames({
    grid: true,
    "grid--col3": col3,
    "grid--col5": col5,
  });

  return <div className={classes}>{children}</div>;
};
