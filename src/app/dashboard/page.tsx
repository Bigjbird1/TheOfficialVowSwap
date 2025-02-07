import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import DashboardLayout from "../components/dashboard/DashboardLayout";

export default async function DashboardPage() {
  const session = await getServerSession();
  
  if (!session) {
    redirect("/auth/signin");
  }

  return <DashboardLayout />;
}
