import React from "react";
import styled from "styled-components/macro";
import PropTypes from "prop-types";

import Loader from "../../components/blocks/Loader";

import Table from "antd/lib/table";

const StyledTable = styled(Table)`
  width: 100%;
  margin-top: 1rem !important;

  table {
    border-top: 1px solid #e0e0e0;

    tr,
    th,
    td {
      border-bottom: 1px solid #e0e0e0;
      font-size: 16px;
    }

    th,
    td {
      padding: 0.5rem 2rem;
    }
  }

  .ant-pagination {
    height: 32px;

    .ant-pagination-simple-pager {
      height: 32px;
    }
  }

  .ant-pagination-item {
    border: none;
  }
`;

const StyledLoader = styled.div`
  height: 100%;
  width: 100%;
  position: relative !important;
  top: 0 !important;
  left: 0 !important;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AntdTable = ({ dataSource, columns, loading, ...rest }) => {
  let props = {
    ...rest,
    dataSource,
    columns,
  };

  if (loading) {
    props = {
      ...props,
      loading: {
        spinning: true,
        indicator: (
          <StyledLoader>
            <Loader />
          </StyledLoader>
        ),
      },
    };
  }

  return <StyledTable {...props} />;
};

AntdTable.propTypes = {
  dataSource: PropTypes.array,
  loading: PropTypes.bool,
  columns: PropTypes.array,
};

AntdTable.defaultProps = {
  dataSource: [],
  loading: false,
  columns: [],
};

export default AntdTable;
