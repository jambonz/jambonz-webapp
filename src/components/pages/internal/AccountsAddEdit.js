import React from 'react';
import { useParams } from 'react-router-dom';
import InternalTemplate from '../../templates/InternalTemplate';
import AccountForm from '../../forms/AccountForm';

const AccountsAddEdit = () => {
  let { account_sid } = useParams();
  const pageTitle = account_sid ? 'Edit Account' : 'Add Account';
  return (
    <InternalTemplate
      type="form"
      title={pageTitle}
      breadcrumbs={[
        { name: 'Accounts', url: '/internal/accounts' },
        { name: pageTitle },
      ]}
    >
      <AccountForm
        type={account_sid ? 'edit' : 'add'}
        account_sid={account_sid}
      />
    </InternalTemplate>
  );
};

export default AccountsAddEdit;
