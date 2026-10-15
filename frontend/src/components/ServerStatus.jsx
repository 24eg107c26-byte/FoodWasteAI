import { useEffect, useState } from "react";
import api from "../services/api";
import "../styles/serverstatus.css";

const MAX_ATTEMPTS = 24; // about 2 minutes of checking
const WAIT_MS = 5000;

function ServerStatus() {
  // waking = still starting up, ready = all good, slow = gave up waiting
  const [state, setState] = useState("waking");
  const [showBanner, setShowBanner] = useState(false);

  // Only show the banner if the check takes longer than a moment.
  useEffect(() => {
    const t = setTimeout(() => setShowBanner(true), 1500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let timer;
    let attempts = 0;

    const check = async () => {
      attempts += 1;
      let ready = false;

      try {
        const response = await api.get("/health", {
          params: { deep: true },
          timeout: 15000,
        });
        // An older backend has no "ai" field: treat that as ready.
        ready = response.data?.ai !== "WAKING";
      } catch {
        ready = false; // backend itself is still waking up
      }

      if (cancelled) return;

      if (ready) {
        setState("ready");
        return;
      }
      if (attempts >= MAX_ATTEMPTS) {
        setState("slow");
        return;
      }
      setState("waking");
      timer = setTimeout(check, WAIT_MS);
    };

    check();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  if (state === "ready" || !showBanner) return null;

  return (
    <div className="ss-banner" role="status">
      {state === "waking" ? (
        <>
          <span className="ss-spinner" />
          Waking up the servers. This can take up to a minute the first time,
          please wait...
        </>
      ) : (
        <>
          The servers are taking longer than usual. Please wait a little and
          refresh the page.
        </>
      )}
    </div>
  );
}

export default ServerStatus;