import { useEffect, useState } from "react";
import { ErrorModalComp } from "../ErrorModal/ErrorModalComp";

export function InternetWatcher() {
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOffline = () => setOffline(true);
    const handleOnline = () => setOffline(false);

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  return (
    <ErrorModalComp
      visible={offline}
      error="Você está sem internet!"
      buttonText="Tentar novamente"
      onClose={() => {
        if (navigator.onLine) {
          setOffline(false);
        }
      }}
    />
  );
}