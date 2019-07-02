export default (state = {}, action) => {
  if (action.type == "SHOW_MESSAGE") {
    return { message: action.message, category: action.category };
  }
  return state;
};
