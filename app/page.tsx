import { Dashboard } from "@/app/components/layout/Dashboard";
import { dashboardConfig } from "@/app/config";

export default function Home() {
  return <Dashboard config={dashboardConfig} />;
}
