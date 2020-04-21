import styled from 'styled-components/macro';

const Table = styled.table`
  table-layout: fixed;
  border-collapse: collapse;
  white-space: nowrap;
  width: 100%;

  & > thead {
    background: #F7F7F7;
  }

  & tr {
    border-bottom: 1px solid #E0E0E0;
  }

  & thead tr {
    height: 4rem;
  }

  & tbody tr {
    height: 5.5rem;
  }

  & tbody tr:last-child {
    border-bottom: 0;
  }

  & th {
    text-align: left;
    font-weight: normal;
    color: #717171;
  }

  & th,
  & td {
    padding: 0 1.5rem;
  }

  & td {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  & td > a {
    outline: 0;
    text-decoration: none;
  }

  & td > a > span {
    outline: 0;
    color: #565656;
  }

  & td > a:hover > span {
    box-shadow: 0 0.125rem 0 #565656;
  }

  & td > a:focus > span {
    padding: 0.625rem;
    margin: -0.625rem;
    border-radius: 0.25rem;
    box-shadow: inset 0 0 0 0.125rem #D91C5C;
  }

  & td:first-child {
    font-weight: bold;
  }

  & th:last-child {
    width: 4rem;
  }

  & td:last-child {
    overflow: inherit;
    position: relative;
    padding: 0.5rem;
  }
`;

export default Table;
