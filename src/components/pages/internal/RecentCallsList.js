import React, { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import styled from "styled-components/macro";
import { NotificationDispatchContext } from "../../../contexts/NotificationContext";
import InternalTemplate from "../../templates/InternalTemplate";
import AntdTable from "../../../components/blocks/AntdTable";
import phoneNumberFormat from "../../../helpers/phoneNumberFormat";
import timeFormat from "../../../helpers/timeFormat";
import Label from "../../../components/elements/Label";
import Button from "../../../components/elements/Button";
import InputGroup from "../../../components/elements/InputGroup";
import Select from "../../../components/elements/Select";
import handleErrors from "../../../helpers/handleErrors";

const FilterLabel = styled.span`
  color: #231f20;
  text-align: right;
  font-size: 14px;
  margin-left: 1rem;
  margin-right: 0.5rem;
`;

const ExpandedSection = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  grid-gap: 0.5rem;
  width: 100%;
  padding: 1rem;
`;

const StyledButton = styled(Button)`
  & > span {
    height: 2rem;
  }
`;

const StyledInputGroup = styled(InputGroup)`
  padding: 1rem 1rem 0;

  @media (max-width: 767.98px) {
    display: grid;
    grid-template-columns: auto 1fr auto 1fr;
    grid-row-gap: 1rem;
  }

  @media (max-width: 575.98px) {
    display: grid;
    grid-template-columns: auto 1fr;
    grid-row-gap: 1rem;
  }
`;

const RecentCallsIndex = () => {
  let history = useHistory();
  const dispatch = useContext(NotificationDispatchContext);
  const jwt = localStorage.getItem("token");
  const user_sid = localStorage.getItem("user_sid");

  // Table props
  const [recentCallsData, setRecentCallsData] = useState([]);
  const [rawData, setRawData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowCount, setRowCount] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);

  // Filter values
  const [attemptedAt, setAttemptedAt] = useState("today");
  const [dirFilter, setDirFilter] = useState("io");
  const [answered, setAnswered] = useState("all");
  // width
  const { height } = window.screen;

  //=============================================================================
  // Define Table props
  //=============================================================================
  const Columns = [
    {
      title: "Date",
      dataIndex: "attempted_at",
      key: "attempted_at",
      width: 250,
    },
    {
      title: "Direction",
      dataIndex: "direction",
      key: "direction",
      width: 150,
    },
    {
      title: "From",
      dataIndex: "from",
      key: "from",
      width: 200,
    },
    {
      title: "To",
      dataIndex: "to",
      key: "to",
      width: 200,
    },
    {
      title: "Trunk",
      dataIndex: "trunk",
      key: "trunk",
      width: 150,
    },
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
      width: 150,
    },
  ];

  //=============================================================================
  // Get recent calls
  //=============================================================================
  const handleFilterChange = () => {
    let filter = {
      page: currentPage,
      count: rowCount,
    };
    if (attemptedAt) {
      switch (attemptedAt) {
        case "today":
          filter.start = moment().startOf("date").toISOString();
          break;
        case "7d":
          filter.days = 7;
          break;
        case "14d":
          filter.days = 14;
          break;
        case "30d":
          filter.days = 30;
          break;
        default:
      }
    }

    if (dirFilter === "inbound") {
      filter.direction = "inbound";
    } else if (dirFilter === "outbound") {
      filter.direction = "outbound";
    }

    if (answered && answered !== "all") {
      filter.answered = answered === "answered" ? "true" : "false";
    }

    getRecentCallsData(filter);
  };

  const getRecentCallsData = async (filter = {}) => {
    let isMounted = true;

    try {
      setLoading(true);
      const result = await axios({
        method: "get",
        baseURL: process.env.REACT_APP_API_BASE_URL,
        url: `/Accounts/${user_sid}/RecentCalls`,
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
        params: {
          ...filter,
        },
      });

      if (isMounted) {
        const { total, data } = result.data;

        setRawData([...data]);

        const recentCalls = data.map((item, index) => ({
          key: index,
          ...item,
          attempted_at: item.attempted_at
            ? moment(item.attempted_at).format("YYYY MM.DD hh:mm a")
            : "",
          from: phoneNumberFormat(item.from),
          to: phoneNumberFormat(item.to),
          status: item.answered ? "answered" : item.termination_reason,
          duration: timeFormat(item.duration),
        }));

        setRecentCallsData(recentCalls);
        setTotalCount(total);
        setExpandedRowKeys([]);
      }
    } catch (err) {
      handleErrors({ err, history, dispatch });
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  };

  const renderExpandedRow = (data) => {
    const fields = [
      "direction",
      "attempted_at",
      "answered_at",
      "terminated_at",
      "duration",
      "answered",
      "from",
      "to",
      "termination_reason",
      "call_sid",
      "sip_callid",
      "host",
      "remote_host",
      "sip_status",
      "trunk",
    ];

    return (
      <ExpandedSection>
        {fields.map((field, index) => {
          if (!rawData || !rawData[data.key]) {
            return null;
          }
          let label = rawData[data.key][field];

          if (typeof label === "boolean") {
            label = label ? "true" : "false";
          }
          return (
            <React.Fragment key={index}>
              <Label>{`${field}:`}</Label>
              <Label>{label}</Label>
            </React.Fragment>
          );
        })}
      </ExpandedSection>
    );
  };

  const renderPagination = (page, type, originElement) => {
    let node = originElement;

    switch (type) {
      case "page":
        node = <StyledButton gray={currentPage !== page}>{page}</StyledButton>;
        break;
      case "prev":
        node = <StyledButton>{`<`}</StyledButton>;
        break;
      case "next":
        node = <StyledButton>{`>`}</StyledButton>;
        break;
      default:
    }

    return node;
  };

  const handleExpandChange = (expanded, record) => {
    if (expanded) {
      setExpandedRowKeys((prev) => [...prev, record.key]);
    } else {
      setExpandedRowKeys((prev) => [
        ...prev.filter((item) => item !== record.key),
      ]);
    }
  };

  useEffect(() => {
    if (currentPage === 1) {
      handleFilterChange();
    } else {
      setCurrentPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptedAt, dirFilter, answered]);

  useEffect(() => {
    handleFilterChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, rowCount]);

  //=============================================================================
  // Render
  //=============================================================================
  return (
      <InternalTemplate title="Recent Calls">
        <StyledInputGroup flexEnd space>
          <FilterLabel htmlFor="daterange">Date:</FilterLabel>
          <Select
            name="daterange"
            id="daterange"
            value={attemptedAt}
            onChange={(e) => setAttemptedAt(e.target.value)}
          >
            <option value="today">today</option>
            <option value="7d">last 7d</option>
            <option value="14d">last 14d</option>
            <option value="30d">last 30d</option>
          </Select>
          <FilterLabel htmlFor="direction">Direction:</FilterLabel>
          <Select
            name="direction"
            id="direction"
            value={dirFilter}
            onChange={(e) => setDirFilter(e.target.value)}
          >
            <option value="io">either</option>
            <option value="inbound">inbound only</option>
            <option value="outbound">outbound only</option>
          </Select>
          <FilterLabel htmlFor="status">Status:</FilterLabel>
          <Select
            name="status"
            id="status"
            value={answered}
            onChange={(e) => setAnswered(e.target.value)}
          >
            <option value="all">all</option>
            <option value="answered">answered</option>
            <option value="not-answered">not answered</option>
          </Select>
        </StyledInputGroup>
        <AntdTable
          dataSource={recentCallsData}
          columns={Columns}
          rowKey="key"
          loading={loading}
          pagination={{
            position: ["bottomCenter"],
            onChange: (page, size) => {
              setCurrentPage(page);
              setRowCount(size);
            },
            showTotal: (total) => `Total: ${total} records`,
            current: currentPage,
            total: totalCount,
            pageSize: rowCount,
            pageSizeOptions: [25, 50, 100],
            showSizeChanger: true,
            itemRender: renderPagination,
            showLessItems: true,
          }}
          scroll={{ y: Math.max(height - 580, 200) }}
          expandable={{
            expandedRowRender: renderExpandedRow,
          }}
          expandedRowKeys={expandedRowKeys}
          onExpand={handleExpandChange}
        />
      </InternalTemplate>
  );
};

export default RecentCallsIndex;
