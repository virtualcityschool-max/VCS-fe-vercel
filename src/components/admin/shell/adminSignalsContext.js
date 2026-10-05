import { createContext, useContext } from "react";

export const AdminSignalsContext = createContext(null);

// Live admin counts (approvals, fees ending, live classes...). Null outside
// the admin shell.
export const useAdminSignals = () => useContext(AdminSignalsContext);
