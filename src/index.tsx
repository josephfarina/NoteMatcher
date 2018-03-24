import * as React from "react";
import * as ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import registerServiceWorker from "./registerServiceWorker";

if (process.env.NODE_ENV !== "production") {
  // const {whyDidYouUpdate} = require('why-did-you-update')
  // whyDidYouUpdate(React)
}

ReactDOM.render(<App />, document.getElementById("root"));
registerServiceWorker();
