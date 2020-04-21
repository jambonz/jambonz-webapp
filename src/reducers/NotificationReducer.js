
const NotificationReducer = (state, action) => {
  switch (action.type) {
    case 'ADD':
      return [
        {
          id: action.id,
          level: action.level,
          message: action.message,
        },
        ...state,
      ];
    case 'REMOVE':
      return state.filter(s => s.id !== action.id);
    default:
      return state;
  }
};

export default NotificationReducer;
