import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  History, 
  FileText, 
  Bot, 
  Shield, 
  User, 
  Settings,
  Circle
} from "lucide-react";
import useTranslation from "@/lib/i18n";

export default function AuditLog() {
  const { t } = useTranslation();

  const { data: auditLogs = [], isLoading } = useQuery({
    queryKey: ["/api/audit-logs"],
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
    return <Circle className="h-4 w-4 text-gray-500" />;
  };

  const getStatusColor = (action: string) => {
    if (action.includes("delete") || action.includes("failed")) {
      return "bg-red-500";
    }
    if (action.includes("update") || action.includes("change")) {
      return "bg-yellow-500";
    }
    return "bg-green-500";
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return t("audit.just_now");
    if (diffMinutes < 60) return t("audit.minutes_ago", { minutes: diffMinutes });
    if (diffMinutes < 1440) return t("audit.hours_ago", { hours: Math.floor(diffMinutes / 60) });
    return date.toLocaleDateString();
  };

  const formatAction = (action: string) => {
    return action.split('.').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getActionDescription = (log: any) => {
    const action = log.action;
    const resource = log.resource;
    const resourceId = log.resourceId;
    
    if (action.includes("upload")) {
      return t("audit.action_upload", { resource: resourceId });
    }
    if (action.includes("analyze")) {
      return t("audit.action_analyze", { resource: resourceId });
    }
    if (action.includes("chat")) {
      return t("audit.action_chat");
    }
    if (action.includes("compliance")) {
      return t("audit.action_compliance");
    }
    
    return `${formatAction(action)} ${resource}${resourceId ? ` (${resourceId})` : ''}`;
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
            <History className="h-5 w-5 mr-2 text-gray-600" />
            {t("audit.title")}
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
            {t("audit.view_full_log")}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-80">
          <div className="p-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">{t("audit.loading")}</p>
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <History className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>{t("audit.no_logs")}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {auditLogs.slice(0, 10).map((log: any) => (
                  <div key={log.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 mt-1">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(log.action)}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        {getActionIcon(log.action)}
                        <span className="text-sm font-medium text-gray-800 truncate">
                          {getActionDescription(log)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(log.timestamp)}
                        </span>
                        {log.details && (
                          <Badge variant="outline" className="text-xs">
                            {Object.keys(log.details).length} details
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
