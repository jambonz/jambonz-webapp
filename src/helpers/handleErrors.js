
const handleErrors = ({ err, history, dispatch, redirect, setErrorMessage, fallbackMessage, preferFallback }) => {

  const errorMessage = (err.response && err.response.data && err.response.data.msg)
    || (preferFallback && fallbackMessage)
    || err.message
    || fallbackMessage
    || 'Something went wrong, please try again.';

  if (err.response && err.response.status === 401) {
    localStorage.clear();
    sessionStorage.clear();
    history.push('/');
    dispatch({
      type: 'ADD',
      level: 'error',
      message: 'Your session has expired. Please sign in and try again.',
    });
    return;
  }

  if (setErrorMessage) {
    setErrorMessage(errorMessage);
  } else {
    dispatch({
      type: 'ADD',
      level: 'error',
      message: errorMessage,
    });
  }

  if (process.env.NODE_ENV === 'development') {
    console.error(err.response || err);
  }

  if (redirect) {
    history.push(redirect);
  }
};

export default handleErrors;
