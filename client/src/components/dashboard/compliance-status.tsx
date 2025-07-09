import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";
import useTranslation from "@/lib/i18n";

export default function ComplianceStatus() {
  const { t } = useTranslation();

  const { data: complianceScore } = useQuery({
    queryKey: ["/api/compliance/score"],
    retry: false,
  });

  const { data: reports = [] } = useQuery({
    queryKey: ["/api/compliance/reports"],
    retry: false,
  });

  const complianceItems = [
    {
      name: t("compliance.gdpr"),
      score: complianceScore?.gdpr || 0,
      color: "bg-green-500",
      textColor: "text-green-600",
    },
    {
      name: t("compliance.iso27001"),
      score: complianceScore?.iso27001 || 0,
      color: "bg-yellow-500",
      textColor: "text-yellow-600",
    },
    {
      name: t("compliance.data_retention"),
      score: complianceScore?.dataRetention || 0,
      color: "bg-green-500",
      textColor: "text-green-600",
    },
    {
      name: t("compliance.security"),
      score: complianceScore?.security || 0,
      color: "bg-green-500",
      textColor: "text-green-600",
    },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 75) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getScoreTextColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  const getRecommendations = () => {
    const overall = complianceScore?.overall || 0;
    if (overall < 50) {
      return [
        t("compliance.rec_urgent_privacy"),
        t("compliance.rec_data_impact"),
        t("compliance.rec_review_processing"),
      ];
    }
    if (overall < 80) {
      return [
        t("compliance.rec_cookie_consent"),
        t("compliance.rec_retention_policy"),
        t("compliance.rec_regular_audits"),
      ];
    }
    return [
      t("compliance.rec_maintain_standards"),
      t("compliance.rec_advanced_security"),
      t("compliance.rec_regular_monitoring"),
    ];
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
          <Shield className="h-5 w-5 mr-2 text-green-600" />
          {t("compliance.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {complianceItems.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {item.name}
              </span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getScoreColor(item.score)}`}
                    style={{ width: `${item.score}%` }}
                  />
                </div>
                <span className={`text-sm font-medium ${getScoreTextColor(item.score)}`}>
                  {item.score}%
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Overall Score */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {t("compliance.overall_score")}
            </span>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-lg font-bold text-gray-800">
                {complianceScore?.overall || 0}%
              </span>
            </div>
          </div>
          <Progress value={complianceScore?.overall || 0} className="h-3" />
        </div>

        {/* Recommendations */}
        <div className="mt-6">
          <div className="flex items-center space-x-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">
              {t("compliance.recommendations")}
            </span>
          </div>
          <div className="space-y-2">
            {getRecommendations().map((rec, index) => (
              <div key={index} className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">{rec}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <Button className="w-full bg-green-600 hover:bg-green-700">
            <Shield className="h-4 w-4 mr-2" />
            {t("compliance.run_full_check")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
