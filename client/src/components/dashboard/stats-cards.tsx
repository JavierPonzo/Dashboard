import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { 
  FileText, 
  Bot, 
  Shield, 
  Users,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import useTranslation from "@/lib/i18n";

export default function StatsCards() {
  const { t } = useTranslation();
  
  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
    retry: false,
  });

  const { data: complianceScore } = useQuery({
    queryKey: ["/api/compliance/score"],
    retry: false,
  });

  const statsData = [
    {
      title: t("stats.documents"),
      value: stats?.documentsCount || 0,
      icon: FileText,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-100",
      trend: "+12%",
      trendUp: true,
    },
    {
      title: t("stats.ai_analyses"),
      value: stats?.aiAnalysesCount || 0,
      icon: Bot,
      iconColor: "text-cyan-600",
      bgColor: "bg-cyan-100",
      trend: "+24%",
      trendUp: true,
    },
    {
      title: t("stats.compliance_score"),
      value: `${Math.round(complianceScore?.overall || 0)}%`,
      icon: Shield,
      iconColor: "text-green-600",
      bgColor: "bg-green-100",
      trend: "+2%",
      trendUp: true,
    },
    {
      title: t("stats.active_users"),
      value: stats?.activeUsersCount || 0,
      icon: Users,
      iconColor: "text-purple-600",
      bgColor: "bg-purple-100",
      trend: "+3",
      trendUp: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <div className="flex items-center">
                  {stat.trendUp ? (
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.trend}
                  </span>
                </div>
                <span className="text-sm text-gray-500 ml-2">
                  {t("stats.from_last_month")}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
