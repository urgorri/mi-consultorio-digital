import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

if (typeof window !== "undefined") {
  (window as any).mswReady = false;
}

const deferRender = async () => {
  // Use a cleaner check for MSW activation - enabled by default unless explicitly disabled
  if (typeof window !== "undefined") {
    try {
      const { worker } = await import("./test/mocks/browser");
      await worker.start({
        onUnhandledRequest: "bypass",
      });
      (window as any).mswReady = true;
      return;
    } catch (error) {
      console.error("MSW failed to start:", error);
    }
  }
};

deferRender().finally(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});
