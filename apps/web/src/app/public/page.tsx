import { fetchOperationalDataset } from "@/lib/server-api";
import { PublicRiskView } from "@/components/public-risk-view";

export default async function PublicPage() {
  const initialData = await fetchOperationalDataset();
  return <PublicRiskView initialData={initialData} />;
}
