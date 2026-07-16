import { HomeDashboard } from "@/components/home-dashboard";
import { getHomeData } from "@/lib/football/home-data";

export default async function Home() {
  const data = await getHomeData();
  return <HomeDashboard data={data} />;
}
