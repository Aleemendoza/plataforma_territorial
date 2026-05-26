import { fetchIncidentEvent, fetchOperationalDataset } from "@/lib/server-api";
import { IncidentModeView } from "@/components/incident-mode-view";

export default async function IncidentPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [initialData, incidentEvent] = await Promise.all([
    fetchOperationalDataset(),
    fetchIncidentEvent(id),
  ]);
  return <IncidentModeView incidentId={id} initialData={initialData} incidentEvent={incidentEvent} />;
}
