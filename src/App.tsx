import * as React from 'react';
import { Provider } from 'react-redux';

import './bulma.css';
import './App.css';

import store, { browserCompatibility } from './common/state';
import { Analyzer, NotificationCenter, Onboarding } from './containers';

function TopLevel() {
  return (
    <>
      <Analyzer />
      <NotificationCenter />
      <Onboarding />
    </>
  );
}

interface Props {}
interface State {}

export default class App extends React.Component<Props, State> {
  componentWillMount() {
    store.dispatch<any>(browserCompatibility.checkCompatibility());
  }

  render() {
    return (
      <Provider store={store}>
        <TopLevel />
      </Provider>
    );
  }
}

