import * as React from "react";
import { Provider } from "react-redux";

import "./bulma.css";
import "./App.css";

import store, { browserCompatibility } from "./common/state";
import { Analyzer, NotificationCenter, Onboarding } from "./containers";

function TopLevel({}) {
  return (
    <div>
      <Analyzer />
      <NotificationCenter />
      <Onboarding />
    </div>
  );
}

interface Props {  }
interface State {  }

class App extends React.Component<Props, State> {
  componentWillMount() {
    store.dispatch(browserCompatibility.checkCompatibility());
  }

  render() {
    return (
      <Provider store={store}>
        <TopLevel />
      </Provider>
    );
  }
}

export default App;
