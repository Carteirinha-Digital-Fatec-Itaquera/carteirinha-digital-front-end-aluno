import NetInfo from "@react-native-community/netinfo";
import { useEffect, useState } from "react";
import { ErrorModalComp } from "../ErrorModal";

export function InternetWatcher() {
  const [offline, setOffline] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const connected = state.isConnected && state.isInternetReachable;
      setOffline(!connected);
    });

    return () => unsubscribe();
  }, []);

  return (
    <ErrorModalComp
      visible={offline}
      error="Você está sem internet!"
      buttonText="Tentar novamente"
      onClose={async () => {
        setChecking(true);

        const state = await NetInfo.fetch();
        const connected = state.isConnected && state.isInternetReachable;

        setOffline(!connected);
        setChecking(false);
      }}
    />
  );
}
