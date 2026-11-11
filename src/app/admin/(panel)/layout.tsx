import AdminShell from "@/components/admin/AdminShell";

export const metadata = { title: "IVAN Admin" };

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
