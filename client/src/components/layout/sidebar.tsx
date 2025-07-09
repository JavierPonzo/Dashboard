import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  FileText, 
  Bot, 
  Shield, 
  History, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut 
} from "lucide-react";
import useTranslation from "@/lib/i18n";

export default function Sidebar() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [location] = useLocation();

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
    retry: false,
  });

  const navigation = [
    { name: t("nav.dashboard"), href: "/", icon: LayoutDashboard },
    { name: t("nav.documents"), href: "/documents", icon: FileText, badge: stats?.documentsCount || 0 },
    { name: t("nav.ai_assistant"), href: "/ai", icon: Bot },
    { name: t("nav.compliance"), href: "/compliance", icon: Shield },
    { name: t("nav.audit_logs"), href: "/audit", icon: History },
    { name: t("nav.users"), href: "/users", icon: Users },
    { name: t("nav.analytics"), href: "/analytics", icon: BarChart3 },
    { name: t("nav.settings"), href: "/settings", icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return location === "/";
    }
    return location.startsWith(href);
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <div className="w-80 bg-white shadow-lg flex flex-col">
      {/* Logo and Brand */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">ComplianceAI</h1>
            <p className="text-sm text-gray-500">{t("sidebar.legal_automation")}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                    isActive(item.href)
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  <span className="flex-1">{item.name}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="ml-auto bg-cyan-500 text-white text-xs px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
        
        {/* Plan Information */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-700">
              {t("sidebar.plan", { plan: user?.plan || "Basic" })}
            </span>
            <span className="text-xs text-blue-600">
              {user?.planUsage || 0}%
            </span>
          </div>
          <div className="w-full bg-blue-100 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${user?.planUsage || 0}%` }}
            ></div>
          </div>
          <p className="text-xs text-blue-600 mt-2">
            {t("sidebar.plan_details", { 
              used: user?.planUsage || 0,
              total: user?.planLimit || 100
            })}
          </p>
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <img 
            src={user?.profileImageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"} 
            alt={user?.firstName || "User"}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800">
              {user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}`
                : user?.email || "User"
              }
            </p>
            <p className="text-xs text-gray-500">
              {user?.role === "admin" ? t("sidebar.admin") : t("sidebar.user")}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-gray-400 hover:text-gray-600"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
