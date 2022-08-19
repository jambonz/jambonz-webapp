import React, { useState } from "react";
import { P, Button } from "jambonz-ui";

import { toastSuccess, toastError } from "src/store";
import { useApiData, postApiKey, deleteApiKey } from "src/api";
import {
  Modal,
  ModalClose,
  Obscure,
  ClipBoard,
  Section,
  Grid,
  GridRow,
} from "src/components";
import { getHumanDateTime } from "src/utils";

import type { ApiKey, TokenResponse } from "src/api/types";

type ApiKeyProps = {
  path: string;
  post: {
    account_sid?: string;
    service_provider_sid?: string;
  };
  label: string;
};

export const ApiKeys = ({ path, post, label }: ApiKeyProps) => {
  const [apiKeys, apiKeysRefetcher] = useApiData<ApiKey[]>(path);
  const [deleteKey, setDeleteKey] = useState<ApiKey | null>(null);
  const [addedKey, setAddedKey] = useState<TokenResponse | null>(null);

  const handleCancel = () => {
    setDeleteKey(null);
  };

  const handleDelete = () => {
    if (deleteKey) {
      deleteApiKey(deleteKey.api_key_sid)
        .then(() => {
          setDeleteKey(null);
          apiKeysRefetcher();
          toastSuccess("API key deleted");
        })
        .catch((error) => {
          toastError(error.msg);
        });
    }
  };

  const handleAdd = () => {
    postApiKey(post)
      .then(({ json }) => {
        setAddedKey(json);
        apiKeysRefetcher();
        toastSuccess("API key created");
      })
      .catch((error) => {
        toastError(error.msg);
      });
  };

  return (
    <>
      <Section slim>
        <Grid col3>
          <GridRow header>
            <div>{label} API keys</div>
            <div>Last used</div>
            <div>&nbsp;</div>
          </GridRow>
          {apiKeys && apiKeys.length > 0 ? (
            apiKeys.map((apiKey) => {
              return (
                <GridRow key={apiKey.api_key_sid}>
                  <div>
                    <Obscure text={apiKey.token} />
                  </div>
                  <div>
                    {apiKey.last_used
                      ? getHumanDateTime(apiKey.last_used)
                      : "Never used"}
                  </div>
                  <div>
                    <Button
                      small
                      subStyle="grey"
                      onClick={() => setDeleteKey(apiKey)}
                    >
                      Delete
                    </Button>
                  </div>
                </GridRow>
              );
            })
          ) : (
            <GridRow empty>
              <div>No API keys yet.</div>
            </GridRow>
          )}
        </Grid>
      </Section>
      <Section clean>
        <Button small onClick={handleAdd}>
          Add key
        </Button>
      </Section>
      {deleteKey && (
        <Modal handleSubmit={handleDelete} handleCancel={handleCancel}>
          <P>Are you sure you want to delete the following API key?</P>
          <Obscure text={deleteKey.token} />
        </Modal>
      )}
      {addedKey && (
        <ModalClose handleClose={() => setAddedKey(null)}>
          <P>Here is your new API key</P>
          <ClipBoard text={addedKey.token} />
        </ModalClose>
      )}
    </>
  );
};
