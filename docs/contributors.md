<p align="center">
  <a href="https://jambonz.org">
    <img src="../public/icon192.png" height="128">
    <h1 align="center">jambonz</h1>
  </a>
</p>

<p align="center">
  <a aria-label="GitHub CI" href="https://github.com/jambonz/jambonz-webapp/actions/workflows/main.yml">
    <img alt="" src="https://github.com/jambonz/jambonz-webapp/actions/workflows/main.yml/badge.svg">
  </a>
</p>

> Contributing to the web app source code

## :rocket: Getting started

In order to run the web app you'll need your local environment setup which you can do
following instructions in our [environment readme](./environment.md).

Once your environment is setup you can fork or clone this repo. To start the web app
just run `npm install` and then `npm start`.

## :pancakes: Dev stack

We're using [vite](https://vitejs.dev/) for development and
the main application is [react](https://reactjs.org/docs/getting-started.html)
with [typescript](https://www.typescriptlang.org/),
[prettier](https://prettier.io/), [eslint](https://eslint.org/),
[husky](https://typicode.github.io/husky/#/)
and [lint-staged](https://www.npmjs.com/package/lint-staged).
For testing we're using [cypress](https://docs.cypress.io/guides/component-testing/writing-your-first-component-test).

## :lock: Auth middleware

We have auth middleware that was initially based on this [useAuth](https://usehooks.com/useAuth/)
example but has been typed and modified to include a `RequireAuth` component for wrapping internal Routes.
The main hook you'll use here is `useAuth`. This hook provides the following:

- `token`
- `signin(user, pass)`
- `signout()`
- `authorized`

### A note on our ACL implementation

We have some simple ACL utilities for managing access to UI/routes based on conditions.
There is a basic `AccessControl` component and a handy `withAccessControl`
HOC for route containers with redirect. There is also a `useAccessControl` hook for
use at the component-level.

## :joystick: Application state

The state for the application has two parts: the local state and the remote server state.
The server state is the source of truth. We keep only the minimal amount of local state
necessary: the current logged in user, the list of service providers and the actively selected
current service provider. We also use local state for a basic permissions matrix and for the
toast notifications.

- `useSelectState(key)`: returns just the piece of state desired
- `useDispatch()`: returns global dispatch method
- `useAccessControl(acl)`: returns true/false for select ACL permissions
- `useFeatureFlag(flag)`: returns true/false for available feature flags
- `withSelectState([...keys])(Component)`: like redux connect it maps state to props
- `toastError(msg)`: helper for dispatching error toasts
- `toastSuccess(msg)`: helper for dispatching success toasts

## :wales: API implementation

We have a centralized API implementation that uses our normalized `fetchTransport` method
under the hood. We have `use` hooks for general `GET` fetching that return the `data` fetched,
a `refetcher` function that, when called, will update the data in the hook and therefore your
component will render the new data, and a possible `error` if the fetch failed. The general
consensus on when to use the hooks vs using a `getFetch` directly are dictated by whether the
API response data needs to be refetched locally based on some user action, such as deleting
an item from a list. In that case use the hooks, otherwise a `getFetch` pattern should work.

The hooks are:

- `useApiData(path)`: returns `[data, refetcher, error]`
- `useServiceProviderData(path)`: returns `[data, refetcher, error]`

All API requests are piped through the `fetchTransport` method which receives a generic type
and returns it as the type of response data resolved. Any `POST`, `PUT` or `DELETE` calls should
have a wrapper method that calls our more generic methods under the hood, which are:

- `getFetch(url)`
- `postFetch(url, payload)`
- `putFetch(url, payload)`
- `deleteFetch(url)`
- `getBlob(url)`

Example of wrapper API methods to `:POST` and `:PUT` for the `Account` type:

```ts
export const postAccount = (payload: Partial<Account>) => {
  return postFetch<SidResponse, Partial<Account>>(API_ACCOUNTS, payload);
};

export const putAccount = (sid: string, payload: Partial<Account>) => {
  return putFetch<EmptyResponse, Partial<Account>>(
    `${API_ACCOUNTS}/${sid}`,
    payload
  );
};
```

### Local dev mock API server

There are two views that rely on call detail records (CDRs) that don't exist in the local
developer db when running the docker stack. For these views we have a local node express
server that replicates functional parity of the backend APIs in question so you can work
on the UI. The views are `Recent Calls` and `Alerts`. They are simple table views with
filter and pagination functionalities. You can view the implementation at `server/dev.server.ts`.
The approach is to replicate the pattern of how test data is seeded for the API server and
add the filtering on top of it with simple JavaScript functions. To run the dev server:

```shell
npm run dev:server
```

## :file_folder: Vendor data modules

Large data modules are used for menu options on the Applications and Speech Services
forms. These modules are loaded lazily and set to local state in the context in which
they are used. You can find the data modules and their type definitions in the `src/vendor`
directory.

## :sunrise: Component composition

All components that are used as Route elements are considered `containers`.
Containers are organized by `login` and `internal`, the latter of which requires
the user to be authorized via our auth middleware layer. Reusable components are
small with specific pieces of functionality and their own local state. We have
plenty of examples including `toast`, `modal` and so forth. You should review some
of each category of component to get an idea of how the patterns are put into practice.

## :art: UI and styling

We have a UI design system called [@jambonz/ui-kit](https://github.com/jambonz/jambonz-ui).
It's public on `npm` and is being used for this project. It's still small and simple
but provides the foundational package content for building jambonz UIs. You can view
the storybook for it [here](https://jambonz-ui.vercel.app/) as well as view the docs
for it [here](https://www.jambonz.org/docs/@jambonz/ui-kit/).

### A note on styles

While we use [sass](https://sass-lang.com/) with `scss` syntax it should be stated that the
primary objective is to simply write generally pure `css`. We take advantage of a few nice
features of `sass` like nesting for [BEM](http://getbem.com/naming/) module style etc. We
also take advantage of loading the source `sass` from the UI library. Here's an example of
the `BEM` style we use:

```scss
.example {
  // This is the block

  &--modifier {
    // This is a modifier of the block
  }

  &__item {
    // This is an element

    &--modifer {
      // This a modifer of the element
    }
  }
}
```

## :robot: Testing

We're using [cypress](https://docs.cypress.io/guides/component-testing/writing-your-first-component-test)
for component testing. Cypress is already configured and we're actively working on backfilling complete
test coverage of the application. There are some issues open for this so you may refer to those to check
out the progress.

All new components should have tests written alongside them. For example, if you component is called
`my-component.tsx` then you would also have a `my-component.cy.tsx` test file to go with it. You can
refer to existing tests for some common patterns we use to write tests.

## :heart: Contributing

If you would like to contribute to this project please follow these simple guidelines:

- Be excellent to each other!
- Follow the best practices and coding standards outlined here.
- Clone or fork this repo, write code and open a PR :+1:
- All code must pass the `pr-checks` and be reviewed by a code owner.

That's it!

## :beetle: Bugs?

If you find a bug please file an issue on this repository with as much information as
possible regarding replication etc :pray:.
