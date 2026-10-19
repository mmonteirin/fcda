import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminMobileNavigation, AdminSidebar } from "@/components/admin/AdminSidebar";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <div className="flex min-h-[calc(100vh-73px)] bg-[radial-gradient(ellipse_at_top_left,rgba(0,127,95,0.06),transparent_35%),linear-gradient(135deg,#f8fafc,#f1f5f9)] dark:bg-[radial-gradient(ellipse_at_top_left,rgba(0,127,95,0.14),transparent_35%),linear-gradient(135deg,#0f172a,#111827)]">
      <AdminSidebar />
      <main className="min-w-0 flex-1">
        <AdminMobileNavigation />
        <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8 xl:p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
