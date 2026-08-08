import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminMobileNavigation, AdminSidebar } from "@/components/admin/AdminSidebar";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <div className="flex min-h-[calc(100vh-73px)] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <AdminSidebar />
      <main className="min-w-0 flex-1 overflow-auto">
        <AdminMobileNavigation />
        <div className="p-5 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
