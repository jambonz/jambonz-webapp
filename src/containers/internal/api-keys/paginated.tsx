import React, { useEffect, useState } from "react";
import { P, Button, ButtonGroup } from "@jambonz/ui-kit";

import { toastSuccess, toastError } from "src/store";
import { postApiKey, deleteApiKey, listApiKeysPaginated } from "src/api";
import {
  Modal,
  ModalClose,
  Obscure,
  ClipBoard,
  Section,
  Pagination,
  SelectFilter,
} from "src/components";
import { getHumanDateTime, hasLength } from "src/utils";

import type { ApiKey, CallQuery, TokenResponse } from "src/api/types";
import { PER_PAGE_SELECTION } from "src/api/constants";

type ApiKeyProps = {
  path: string;
  post: {
    account_sid?: string;
    service_provider_sid?: string;
  };
  label: string;
};

export const ApiKeysPaginated = ({ path, post, label }: ApiKeyProps) => {
  const [deleteKey, setDeleteKey] = useState<ApiKey | null>(null);
  const [addedKey, setAddedKey] = useState<TokenResponse | null>(null);

  const [pageNumber, setPageNumber] = useState(1);
  const [perPageFilter, setPerPageFilter] = useState("25");
  const [apiKeys, setApiKeys] = useState<ApiKey[]>();
  const [, setApiKeysTotalItems] = useState(0);
  const [apiKeysTotalPages, setApiKeysTotalPages] = useState(1);

  const handleDelete = () => {
    if (deleteKey) {
      deleteApiKey(deleteKey.api_key_sid)
        .then(() => {
          setDeleteKey(null);
          handleFilterChange();
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
        handleFilterChange();
        toastSuccess("API key created");
      })
      .catch((error) => {
        toastError(error.msg);
      });
  };

  const handleFilterChange = () => {
    const query: Partial<CallQuery> = {
      page: pageNumber,
      limit: Number(perPageFilter),
    };

    listApiKeysPaginated(path, query)
      .then(({ json }) => {
        setApiKeys(json.data);
        setApiKeysTotalItems(json.total_items);
        setApiKeysTotalPages(json.total_pages);
      })
      .catch((error) => {
        toastError(error.msg);
        setApiKeys([]);
      });
  };

  useEffect(() => {
    handleFilterChange();
    setPageNumber(1);
  }, []);

  return (
    <>
      <Section slim>
        <div className="grid grid--col3">
          <div className="grid__row grid__th">
            <div>{label} API keys</div>
            <div>Last used</div>
            <div>&nbsp;</div>
          </div>
          {hasLength(apiKeys) ? (
            apiKeys.map((apiKey) => {
              return (
                <div className="grid__row" key={apiKey.api_key_sid}>
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
                </div>
              );
            })
          ) : (
            <div className="grid__row grid__empty">
              <div>No API keys yet.</div>
            </div>
          )}
        </div>
      </Section>
      <footer>
        <ButtonGroup>
          <Pagination
            pageNumber={pageNumber}
            setPageNumber={setPageNumber}
            maxPageNumber={apiKeysTotalPages}
          />
          <SelectFilter
            id="page_filter"
            filter={[perPageFilter, setPerPageFilter]}
            options={PER_PAGE_SELECTION}
          />
        </ButtonGroup>
      </footer>
      <Section clean>
        <Button small onClick={handleAdd}>
          Add key
        </Button>
      </Section>
      {deleteKey && (
        <Modal
          handleSubmit={handleDelete}
          handleCancel={() => setDeleteKey(null)}
        >
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
