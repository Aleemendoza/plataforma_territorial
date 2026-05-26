import { fetchOperationalDataset } from "@/lib/server-api";
import { AlertsQueueView } from "@/components/alerts-queue-view";

export default async function AlertsPage() {
  const initialData = await fetchOperationalDataset();
  return <AlertsQueueView initialData={initialData} />;
}
