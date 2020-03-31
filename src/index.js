import React from "react";
import { render } from "react-dom";
import App from "./components/App";
import registerServiceWorker from "./registerServiceWorker";

const app = <App />;

render(app, document.querySelector("#app"));
registerServiceWorker();
