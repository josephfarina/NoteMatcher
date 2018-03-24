import { createReducer } from '.';

const initialState: StateNotifications = [];

const DELETE_NOTIFICATION = 'state::notifications::deleteNotifications';
const ADD_NOTIFICATION = 'state::notifications::addNotifications';

export default createReducer<StateNotifications>(initialState, {
  [DELETE_NOTIFICATION](state, action) {
    return state.filter(x => x !== action.payload);
  },

  [ADD_NOTIFICATION](state, action) {
    return [...state, action.payload];
  }
});

export const getNotifications = (state: StateRoot) => state.notifications;

export function addNotification(payload: NotificationI) {
  return {
    type: ADD_NOTIFICATION,
    payload
  };
}

export function removeNotification(payload: NotificationI) {
  return {
    type: DELETE_NOTIFICATION,
    payload
  };
}
