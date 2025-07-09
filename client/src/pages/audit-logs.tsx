import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  History, 
  Search, 
  Filter, 
  Download,
  Shield,
  FileText,
  Bot,
  User,
  Settings,
  AlertTriangle
} from "lucide-react";
import useTranslation from "@/lib/i18n";

export default function AuditLogs() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState("all");

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

  const { data: auditLogs = [], isLoading: logsLoading } = useQuery({
    queryKey: ["/api/audit-logs"],
    enabled: isAuthenticated,
    retry: false,
  });

  const getActionIcon = (action: string) => {
    if (action.includes("document")) {
      return <FileText className="h-4 w-4 text-blue-500" />;
    }
    if (action.includes("ai")) {
      return <Bot className="h-4 w-4 text-purple-500" />;
    }
    if (action.includes("compliance")) {
      return <Shield className="h-4 w-4 text-green-500" />;
    }
    if (action.includes("user")) {
      return <User className="h-4 w-4 text-orange-500" />;
    }
    if (action.includes("settings")) {
      return <Settings className="h-4 w-4 text-gray-500" />;
    }
    return <History className="h-4 w-4 text-gray-500" />;
  };

  const getActionBadge = (action: string) => {
    if (action.includes("delete") || action.includes("failed")) {
      return <Badge variant="destructive">High</Badge>;
    }
    if (action.includes("update") || action.includes("change")) {
      return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Medium</Badge>;
    }
    return <Badge variant="secondary">Low</Badge>;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatAction = (action: string) => {
    return action.split('.').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const filteredLogs = auditLogs.filter((log: any) => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.resource.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterAction === "all" || log.action.includes(filterAction);
    return matchesSearch && matchesFilter;
  });

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
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("nav.audit_logs")}</h1>
                <p className="text-gray-600">{t("audit.subtitle")}</p>
              </div>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                {t("audit.export")}
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="flex flex-1 gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={t("audit.search_placeholder")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <select
                    value={filterAction}
                    onChange={(e) => setFilterAction(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Actions</option>
                    <option value="document">Document</option>
                    <option value="ai">AI</option>
                    <option value="compliance">Compliance</option>
                    <option value="user">User</option>
                    <option value="settings">Settings</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Audit Logs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <History className="h-5 w-5 mr-2" />
                {t("audit.recent_activity")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">{t("audit.loading")}</p>
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm || filterAction !== "all" ? t("audit.no_results") : t("audit.no_logs")}
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm || filterAction !== "all" ? t("audit.try_different_filter") : t("audit.no_activity")}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredLogs.map((log: any) => (
                    <div key={log.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 mt-1">
                        {getActionIcon(log.action)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-gray-900">
                              {formatAction(log.action)}
                            </span>
                            {getActionBadge(log.action)}
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(log.timestamp)}
                          </span>
                        </div>
                        <div className="mt-1">
                          <p className="text-sm text-gray-700">
                            Resource: <span className="font-medium">{log.resource}</span>
                            {log.resourceId && (
                              <span className="text-gray-500"> (ID: {log.resourceId})</span>
                            )}
                          </p>
                          {log.details && (
                            <div className="mt-2 text-xs text-gray-600 bg-white p-2 rounded border">
                              <pre className="whitespace-pre-wrap font-mono">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          {log.ipAddress && (
                            <span>IP: {log.ipAddress}</span>
                          )}
                          {log.userAgent && (
                            <span>User Agent: {log.userAgent.substring(0, 50)}...</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
