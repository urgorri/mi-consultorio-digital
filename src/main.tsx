async function deferRender() {
  if (import.meta.env.DEV) {
    const { worker } = await import("./test/mocks/browser");
    return worker.start({
      onUnhandledRequest: "bypass",
    });
  }
}

import { deferRender().then(() => {
  createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

});