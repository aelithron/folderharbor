import Header from "../header.module";
import AdminSidebar from "./sidebar.module";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <main>
      <Header><AdminSidebar /></Header>
      <main className="flex-1 ml-28">{children}</main>
    </main>
  )
}