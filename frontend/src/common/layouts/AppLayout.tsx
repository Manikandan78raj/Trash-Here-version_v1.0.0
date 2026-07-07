import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/ui/Navbar';
import { Sidebar } from '@/components/ui/Sidebar';
import { socketService } from '@/features/hub/services/socket.service';

interface AppLayoutProps {
  children?: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    socketService.connect(queryClient);
    return () => {
      socketService.disconnect();
    };
  }, [queryClient]);

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      {/* Desktop & Mobile Responsive Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navigation Header */}
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Main Application Workspace */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto max-w-7xl">{children ? children : <Outlet />}</div>
        </main>
      </div>
    </div>
  );
};
