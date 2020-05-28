import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { ModalStateContext } from '../../contexts/ModalContext';
import { NotificationDispatchContext } from '../../contexts/NotificationContext';
import Table from '../elements/Table.js';
import Button from '../elements/Button.js';
import Checkbox from '../elements/Checkbox.js';
import TableMenu from '../blocks/TableMenu.js';
import Loader from '../blocks/Loader.js';
import Modal from '../blocks/Modal.js';
import FormError from '../blocks/FormError.js';

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
  // Handle checkboxes
  //=============================================================================
  const [ selected, setSelected ] = useState([]);
  const checkboxesToggleAll = e => {
    if (content.length === selected.length) {
      setSelected([]);
    } else {
      setSelected(content.map(c => c.sid));
    }
  };
  const checkboxesToggleOne = e => {
    const sid = e.target.value;
    setSelected(prev => {
      if (prev.includes(sid)) {
        return prev.filter(p => p !== sid);
      } else {
        return [...prev, sid];
      }
    });
  };

  const handleBulkAction = async (selected, i) => {
    setShowTableLoader(true);
    const success = await props.bulkAction(selected, i);
    if (success) {
      const newContent = await props.getContent();
      sortTableContent({ newContent });
      setSelected([]);
      dispatch({
        type: 'ADD',
        level: 'success',
        message: 'Number routing updated',
      });
    }
    setShowTableLoader(false);
  };

  //=============================================================================
  // Handle Open Menus (i.e. bulk action menu or 3 dots on right of each row)
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
  const [ errorMessage, setErrorMessage ] = useState('');
  const deleteContent = async () => {
    setShowModalLoader(true);
    const result = await props.deleteContent(contentToDelete);
    if (result === 'success') {
      const newContent = await props.getContent();
      sortTableContent({ newContent });
      setContentToDelete({});
      dispatch({
        type: 'ADD',
        level: 'success',
        message: `${props.name.charAt(0).toUpperCase()}${props.name.slice(1)} deleted successfully`,
      });
    } else {
      setErrorMessage(result);
    }
    setSelected([]);
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
          loader={showModalLoader}
          content={
            <div>
              <table>
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
              {errorMessage && (
                <FormError message={errorMessage} />
              )}
            </div>
          }
          handleCancel={() => {
            setContentToDelete({});
            setErrorMessage('');
          }}
          handleSubmit={deleteContent}
          actionText="Delete"
        />
      )}
      <Table withCheckboxes={props.withCheckboxes}>
        {/* colgroup is used to set the width of the last column because the
        last two <th> are combined in a colSpan="2", preventing the columns from
        being given an expicit width (`table-layout: fixed;` requires setting
        column width in the first row) */}
        <colgroup>
          <col
            span={
              props.withCheckboxes
                ? props.columns.length + 1
                : props.columns.length
            }
          />
          <col style={{ width: '4rem' }}></col>
        </colgroup>
        <thead>
          <tr>
            {props.withCheckboxes && (
              <th>
                <Button
                  checkbox={
                    !selected.length
                      ? 'none'
                      : content.length === selected.length
                        ? 'all'
                        : 'partial'
                  }
                  onClick={checkboxesToggleAll}
                />
              </th>
            )}
            {props.columns.map((c, i) => (
              <th
                key={c.key}
                colSpan={i === props.columns.length - 1 ? '2' : null}
              >
                {selected.length && i === props.columns.length - 1 ? (
                  <div
                    style={{
                      position: 'relative',
                      display: 'inline-block',
                      marginLeft: '-1rem',
                    }}
                  >
                    <TableMenu
                      bulkEditMenu
                      buttonText="Choose Application"
                      sid="bulk-menu"
                      open={menuOpen === 'bulk-menu'}
                      handleMenuOpen={handleMenuOpen}
                      disabled={modalOpen}
                      menuItems={
                        props.bulkMenuItems.map(i => ({
                          name: i.name,
                          type: 'button',
                          action: () => handleBulkAction(selected, i),
                        }))
                      }
                    />
                  </div>
                ) : (
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
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {showTableLoader ? (
            <tr>
              <td colSpan={props.withCheckboxes ? props.columns.length + 1 : props.columns.length}>
                <Loader height={'71px'} />
              </td>
            </tr>
          ) : (
            !content || !content.length ? (
              <tr>
                <td
                  colSpan={props.withCheckboxes ? props.columns.length + 1 : props.columns.length}
                  style={{ textAlign: 'center' }}
                >
                  No {props.name}s
                </td>
              </tr>
            ) : (
              content.map(a => (
                <tr key={a.sid}>
                  {props.withCheckboxes && (
                    <td>
                      <Checkbox
                        noLeftMargin
                        id={a.sid}
                        value={a.sid}
                        onChange={checkboxesToggleOne}
                        checked={selected.includes(a.sid)}
                      />
                    </td>
                  )}
                  {props.columns.map((c, i) => (
                    <td key={c.key}>
                      {i === 0
                        ? <span>
                            <Link
                              to={`/internal/${props.urlParam}/${a.sid}/edit`}
                              tabIndex={modalOpen ? '-1' : ''}
                            >
                              <span tabIndex="-1" title={a[c.key]}>
                                {a[c.key]}
                              </span>
                            </Link>
                          </span>
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
