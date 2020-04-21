import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { ModalStateContext } from '../../contexts/ModalContext';
import { NotificationDispatchContext } from '../../contexts/NotificationContext';
import Table from '../elements/Table.js';
import Button from '../elements/Button.js';
import TableMenu from '../blocks/TableMenu.js';
import Loader from '../blocks/Loader.js';
import Modal from '../blocks/Modal.js';

const Td = styled.td`
  padding: 0.5rem 0;
  &:first-child {
    font-weight: 500;
    padding-right: 1.5rem;
    vertical-align: top;
  }
  & ul {
    margin: 0;
    padding-left: 1.25rem;
  }
`;

const TableContent = props => {

  const dispatch = useContext(NotificationDispatchContext);

  const modalOpen = useContext(ModalStateContext);
  const [ showTableLoader, setShowTableLoader ] = useState(true);
  const [ showModalLoader, setShowModalLoader ] = useState(false);
  const [ content,         setContent         ] = useState([]);
  const [ contentToDelete, setContentToDelete ] = useState({});

  //=============================================================================
  // Get and sort content
  //=============================================================================
  const [ sort, setSort ] = useState({
    column: props.columns[0].key,
    order: 'asc',
  });
  const sortTableContent = ({ newContent, column }) => {
    const newSortOrder = sort.column === column
      ? sort.order === 'asc'
        ? 'desc'
        : 'asc'
      : 'asc';
    column = column || sort.column;
    newContent = newContent || content;
    const sortedContent = [...newContent];
    sortedContent.sort((a, b) => {
      let valA = (a[column] && a[column].toLowerCase()) || '';
      let valB = (b[column] && b[column].toLowerCase()) || '';
      if (newSortOrder === 'asc') {
        return valA > valB ? 1 : valA < valB ? -1 : 0;
      } else {
        return valA < valB ? 1 : valA > valB ? -1 : 0;
      }
    });
    setContent(sortedContent);
    setSort({
      column,
      order: newSortOrder
    });
  };
  useEffect(() => {
    const getNewContent = async () => {
      const newContent = await props.getContent();
      sortTableContent({ newContent });
      setShowTableLoader(false);
    };
    getNewContent();
    // eslint-disable-next-line
  }, []);

  //=============================================================================
  // Handle Table Menu (i.e. clicking the 3 dots on right)
  //=============================================================================
  const [ menuOpen, setMenuOpen ] = useState(null);
  useEffect(() => {
    const hideMenu = () => setMenuOpen(null);
    window.addEventListener('click', hideMenu);
    return () => window.removeEventListener('click', hideMenu);
  }, []);
  const handleMenuOpen = sid => {
    if (menuOpen === sid) {
      setMenuOpen(null);
    } else {
      setMenuOpen(sid);
    }
  };

  //=============================================================================
  // Handle Deleting content
  //=============================================================================
  const deleteContent = async () => {
    setShowModalLoader(true);
    const success = await props.deleteContent(contentToDelete);
    if (success) {
      setShowTableLoader(true);
      const newContent = await props.getContent();
      sortTableContent({ newContent });
      setShowTableLoader(false);
      setContentToDelete({});
      dispatch({
        type: 'ADD',
        level: 'success',
        message: `${props.name.charAt(0).toUpperCase()}${props.name.slice(1)} deleted successfully`,
      });
    }
    setShowModalLoader(false);
  };

  //=============================================================================
  // Render
  //=============================================================================
  return (
    <React.Fragment>
      {contentToDelete && (contentToDelete.name || contentToDelete.number) && (
        <Modal
          title={`Are you sure you want to delete the following ${props.name}?`}
          content={
            showModalLoader
              ? <Loader />
              : <table>
                  <tbody>
                    {props.formatContentToDelete(contentToDelete).map((d, i) => (
                      <tr key={i}>
                        <Td>{d.name}</Td>
                        <Td>
                          {typeof d.content === 'string'
                            ? d.content
                            : <ul>
                                {d.content.map((c, i) => (
                                  <li key={i}>{c}</li>
                                ))}
                              </ul>
                          }
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
          }
          handleCancel={() => setContentToDelete({})}
          handleSubmit={deleteContent}
          actionText="Delete"
        />
      )}
      <Table>
        <thead>
          <tr>
            {props.columns.map(c => (
              <th key={c.key}>
                <Button
                  text
                  gray
                  tableHeaderLink
                  onClick={() => sortTableContent({ column: c.key })}
                >
                  {c.header}
                  {sort.column === c.key
                    ? sort.order === 'asc'
                      ? <span>&#9652;</span>
                      : <span>&#9662;</span>
                    : null
                  }
                </Button>
              </th>
            ))}
            <th></th>
          </tr>
        </thead>
        <tbody>
          {showTableLoader ? (
            <tr>
              <td colSpan="3">
                <Loader height={'71px'} />
              </td>
            </tr>
          ) : (
            !content || !content.length ? (
              <tr>
                <td colSpan={props.columns.length} style={{ textAlign: 'center' }}>
                  No {props.name}s
                </td>
              </tr>
            ) : (
              content.map(a => (
                <tr key={a.sid}>
                  {props.columns.map((c, i) => (
                    <td key={c.key}>
                      {i === 0
                        ? <Link
                            to={`/internal/${props.urlParam}/${a.sid}/edit`}
                            tabIndex={modalOpen ? '-1' : ''}
                          >
                            <span tabIndex="-1" title={a[c.key]}>
                              {a[c.key]}
                            </span>
                          </Link>
                        : <span title={a[c.key]}>{a[c.key]}</span>
                      }
                    </td>
                  ))}
                  <td>
                    <TableMenu
                      sid={a.sid}
                      open={menuOpen === a.sid}
                      handleMenuOpen={handleMenuOpen}
                      disabled={modalOpen}
                      menuItems={[
                        {
                          name: 'Edit',
                          type: 'link',
                          url: `/internal/${props.urlParam}/${a.sid}/edit`,
                        },
                        {
                          name: 'Delete',
                          type: 'button',
                          action: () => setContentToDelete(a),
                        },
                      ]}
                    />
                  </td>
                </tr>
              ))
            )
          )}
        </tbody>
      </Table>
    </React.Fragment>
  );
};

export default TableContent;
