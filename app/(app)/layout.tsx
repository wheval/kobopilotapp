import { AppProviders } from "@/components/app/app-providers";
import { AppSidebar, AppTopBar } from "@/components/app/app-shell";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppProviders>
      <div className="flex min-h-screen overflow-x-hidden bg-canvas">
        <AppSidebar />
        <div className="flex min-h-screen min-w-0 flex-1 flex-col md:pt-0">
          <AppTopBar />
          <main className="app-main-mobile min-w-0 flex-1 overflow-x-hidden p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </AppProviders>
  );
}
