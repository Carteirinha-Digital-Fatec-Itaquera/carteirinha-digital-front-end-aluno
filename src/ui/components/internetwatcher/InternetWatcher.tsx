import { useEffect, useState } from "react";
import styles from "./internetWatcher.module.css";
import { CloudOff } from "lucide-react";

export function InternetWatcher() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleStatusChange = () => setIsOffline(!navigator.onLine);

    window.addEventListener("offline", handleStatusChange);
    window.addEventListener("online", handleStatusChange);

    return () => {
      window.removeEventListener("offline", handleStatusChange);
      window.removeEventListener("online", handleStatusChange);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className={styles.banner}>
      <CloudOff size={16} />
      <span>Você está usando o modo offline</span>
    </div>
  );
}


// import { useEffect, useState } from "react";
// import { ErrorModalComp } from "../ErrorModal/ErrorModalComp";

// export function InternetWatcher() {
//   const [offline, setOffline] = useState(!navigator.onLine);

//   useEffect(() => {
//     const handleOffline = () => setOffline(true);
//     const handleOnline = () => setOffline(false);

//     window.addEventListener("offline", handleOffline);
//     window.addEventListener("online", handleOnline);

//     return () => {
//       window.removeEventListener("offline", handleOffline);
//       window.removeEventListener("online", handleOnline);
//     };
//   }, []);

//   return (
//     <ErrorModalComp
//       visible={offline}
//       error="Você está sem internet!"
//       buttonText="Tentar novamente"
//       onClose={() => {
//         if (navigator.onLine) {
//           setOffline(false);
//         }
//       }}
//     />
//   );
// }