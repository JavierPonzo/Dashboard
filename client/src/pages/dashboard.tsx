import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import StatsCards from "@/components/dashboard/stats-cards";
import DocumentUpload from "@/components/dashboard/document-upload";
import AiChat from "@/components/dashboard/ai-chat";
import ComplianceStatus from "@/components/dashboard/compliance-status";
import AuditLog from "@/components/dashboard/audit-log";
import QuickActions from "@/components/dashboard/quick-actions";
import useTranslation from "@/lib/i18n";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const { t } = useTranslation();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: t("auth.unauthorized"),
        description: t("auth.logging_in"),
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast, t]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {/* Stats Cards */}
          <StatsCards />
          
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Document Management */}
            <div className="lg:col-span-2">
              <DocumentUpload />
            </div>

            {/* AI Assistant & Quick Actions */}
            <div className="space-y-6">
              <AiChat />
              <QuickActions />
            </div>
          </div>

          {/* Compliance Status & Audit Log */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <ComplianceStatus />
            <AuditLog />
          </div>
        </main>
      </div>
    </div>
  );
}
