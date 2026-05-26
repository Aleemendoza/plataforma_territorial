import { fetchOperationalDataset } from "@/lib/server-api";
import { SituationalConsole } from "@/components/situational-console";

export default async function HomePage() {
  const initialData = await fetchOperationalDataset();
  return <SituationalConsole initialData={initialData} />;
}
