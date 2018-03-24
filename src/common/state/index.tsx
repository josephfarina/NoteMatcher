import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import { createLogger } from 'redux-logger';
import thunk from 'redux-thunk';
import { createSelector } from 'reselect';
import {
  responsiveStateReducer,
  responsiveStoreEnhancer
} from 'redux-responsive';

export function createReducer<S>(
  initialState: S,
  handlers: { [type: string]: (state: S, action: Action<any>) => S }
) {
  return function reducer(state = initialState, action: Action<any>): S {
    if (handlers.hasOwnProperty(action.type)) {
      return handlers[action.type](state, action);
    } else {
      return state;
    }
  };
}

import pitchDataReducer from './pitchData';
import * as pitchData from './pitchData';

import audioControlReducer from './audioControl';
import * as audioControl from './audioControl';

import notificationsReducer from './notifications';
import * as notifications from './notifications';

import browserCompatibilityReducer from './browserCompatibility';
import * as browserCompatibility from './browserCompatibility';

const reducer = combineReducers({
  pitchData: pitchDataReducer,
  audioControl: audioControlReducer,
  notifications: notificationsReducer,
  browserCompatibility: browserCompatibilityReducer,
  browser: responsiveStateReducer
});

const getStringifiedState: (state: StateRoot) => string = createSelector(
  state => state.audioControl,
  audioControl => {
    return encodeURIComponent(
      JSON.stringify({
        audioControl: {
          ...audioControl,
          gotPermissionForAudio: false,
          editMode: null,
          lastNoteRecorded: null,
          currentBeat: 0,
          audioURL: null,
          recording: false,
          playing: false
        }
      })
    );
  }
);

const SITE_URL = window.location.href.split('?')[0];
export function getStringifiedStateUrl(state: StateRoot) {
  return `${SITE_URL}?state=${getStringifiedState(state)}`;
}

export function updateUrlToReflectState(state: StateRoot) {
  if (window.history && window.history.replaceState) {
    window.history.replaceState(
      null,
      null as any,
      getStringifiedStateUrl(state)
    );
  }
}

let initialState: StateRoot = {} as any;
try {
  initialState = (window as any).__APP_INITIAL_STATE__;
  if (!initialState) {
    initialState = {} as any;
  }
} catch (e) {}

const middleWare: any[] = [thunk];
if (process.env.NODE_ENV !== 'production') {
  middleWare.push(createLogger());
}

const store = createStore(
  reducer,
  initialState,
  compose(responsiveStoreEnhancer, applyMiddleware(...middleWare))
);

export default store;
export { pitchData, audioControl, notifications, browserCompatibility };
