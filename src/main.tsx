import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

async function deferRender() {
  if (import.meta.env.DEV) {
    const { worker } = await import("./test/mocks/browser");
    return worker.start({
      onUnhandledRequest: "bypass",
    });
  }
}

deferRender().then(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});
