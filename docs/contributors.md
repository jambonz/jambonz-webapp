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

Before running the web app you'll need to complete your local environment setup
which you can do following instructions in our [environment readme](./environment.md).

Once your environment is setup you can fork or clone this repo. To start the web app
just run `npm i` and then `npm start`.

## :pancakes: Dev stack

We're using [vite](https://vitejs.dev/) for development. The main application is
[react](https://reactjs.org/docs/getting-started.html) aliasing [preact/compat](https://preactjs.com/guide/v10/switching-to-preact#setting-up-compat)
for `production` builds. For code sanity we're using [typescript](https://www.typescriptlang.org/),
[prettier](https://prettier.io/) and [eslint](https://eslint.org/). For code guarding we've implemented [husky](https://typicode.github.io/husky/#/)
and [lint-staged](https://www.npmjs.com/package/lint-staged) to check your changes before committing.

## :lock: Auth middleware

We have auth middleware implemented at the router level. It was initially based on this
[useAuth](https://usehooks.com/useAuth/) example but has been typed as well as modified to include
a `RequireAuth` component for wrapping internal `Routes`. The main hook you'll use here is simply `useAuth()`.
This hook provides the `AuthStateContext` which has the following:

- `token`: current auth token
- `signin(user, pass)`: function to log the user in
- `signout()`: function to log the user out
- `authorized`: boolean dictating authorized status

#### A note on internal ACL implementation

We have some simple ACL utilities for managing access to UI/routes based on criteria. There is a basic
`AccessControl` component and a handy `withAccessControl(acl)(Component)` HOC for route containers with
redirect. There is also a `useAccessControl(acl)` hook for use at the component-level.

## :joystick: Application state

We're following the model `ui = fn(state)`. The state for the application has two parts: the local
state and the remote server state. The server state is the source of truth. We keep only the minimal amount
of local state necessary: the current logged in `user`, the list of `serviceProviders` and the actively
selected `currentServiceProvider`. We also use local state for a basic `ACL` permissions matrix and for the
global `toast` notifications. That's it! Local state is easy.

Because of this limited scope for local state we're **not using a third-party state manager**. We have a
custom store implementation using vanilla React `useReducer` and `useContext` to provide the state to our
application. There are many useful functions and hooks for working with state which include the following:

- `useStateContext()`: returns the entire state object
- `useSelectState(key)`: returns just the piece of state desired
- `useDispatch()`: returns global `dispatch({ type, payload })` method
- `useAccessControl(acl)`: returns true/false for select ACL permissions
- `useFeatureFlag(flag)`: returns true/false for available feature flags
- `withSelectState([...keys])(Component)`: like redux connect it maps state to props
- `toastError(msg)`: helper for dispatching error toasts
- `toastSuccess(msg)`: helper for dispatching success toasts

#### A note on feature flags

Feature flags are managed via [Vite's environment variables](https://vitejs.dev/guide/env-and-mode.html#env-files).
They should be implemented as `VITE_FEATURE_{feature}`. They then need to be added to the `FeatureFlag` store interface
and their implementation should be added to the initial state object. See the `subspace` feature flag implementation
for an example of how to do this.

#### A note here on type-safety

Our action interface receives a generic type argument that is mapped to the type parameter for the action.
This generic type is also used for indexed access to the state interface for the action payload parameter.
We use a global dispatch middleware that also receives this type argument and passes it to the action.
With this setup our app dispatch enforces that the type of payload maps to the type parameter received.

## :wales: API implementation

We have a normalized API implementation. It should be adhered to at all times. Always use API helpers
that use `fetchTransport` under the hood and make use of our generic `use` hooks for most general fetch,
e.g. `GET`, requests. Here are a couple useful hooks for general `GET` fetching. Both methods the `data` fetched,
a `refetcher` function that, when called, will update the data in the hook and update your component with
the newly fetched data and a possible `error` if the fetch failed.

- `getFetch(url)`: returns `fetchTransport` for an `:GET` api request
- `useApiData(path)`: returns `[data, refetcher, error]`
- `useServiceProviderData(path)`: returns `[data, refetcher, error]`

#### A note here on type-safety

All API requests are piped through the `fetchTransport` method. Most `GET` requests can be done with our
normalized `use` hooks. Any `POST`, `PUT` or `DELETE` calls should have a helper method that uses `fetchTransport`
under the hood. Examples are `putUser` or `deleteApiKey` etc. The `fetchTransport` function receives a generic
type and returns it as the type of response data. This ensures type-safety when using API data at the component level.

## :file_folder: Vendor data modules

Large data modules are used for menu options on the `Applications` and `Speech Services` forms. These modules should be
loaded lazily and set to local state in the context in which they are used. This pattern should be followed for
any new data modules implemented in the application. You can find the data modules and their type definitions in
the `src/vendor` directory. A basic example of how this is done on the speech form:

```jsx
/** Assume setup code for a component... */

/** Lazy-load large data schemas -- e.g. code-splitting */
useEffect(() => {
  let ignore = false;

  Promise.all([
    import("src/vendor/regions/aws-regions"),
    import("src/vendor/regions/ms-azure-regions"),
  ]).then(([{ default: awsRegions }, { default: msRegions }]) => {
    if (!ignore) {
      setRegions({
        ms: msRegions,
        aws: awsRegions,
      });
    }
  });

  return function cleanup() {
    ignore = true;
  };
}, []);
```

## :sunrise: Component composition

All components that are used as `Route` elements are considered `containers`. You'll notice that all containers
are lazy loaded at the router level, other than the root Login container, and this practice should always be
followed.

Containers are organized by `login` and `internal`, the latter of which requires the user to be authorized via
our auth middleware layer. Reusable components are small with specific pieces of functionality and their own local
state. We have plenty of examples including `toast`, `modal` and so forth. You should review some of each category
of component to get an idea of how the models are put into practice.

## :art: UI and styling

We have a UI design system called [jambonz-ui](https://github.com/jambonz/jambonz-ui). It's public on `npm` and
is being used for this project. It's still small and simple but provides the foundational package content for
building jambonz UIs. You can see an example page of elements [here](https://www.jambonz.org/jambonz-ui/) as well
as view the docs for it [here](https://www.jambonz.org/docs/jambonz-ui/).

We're using the `scss` syntax for [sass](https://sass-lang.com/) and a [BEM](http://getbem.com/introduction/)
style of authorship. You can find the naming guidelines for our implementation [here](http://getbem.com/naming/).
An example of a module authored in this way would look like the following but you can check any of the `styles`
files in the `src` code to get more of an understanding. One thing: never use `@import`! Always use `@use` for
sass modules.

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

## :heart: Contributing

If you would like to contribute to this project please follow these simple guidelines:

- Be excellent to each other!
- Follow the best practices and coding standards outlined here.
- Clone or fork this repo, write code and open a PR :+1:

That's it. Peer review will be done by codeowners and all we ask is that you please be patient!

## :beetle: Bugs?

If you find a bug please file an issue on this repository :pray:.
