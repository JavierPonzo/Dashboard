import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  FileText, 
  Shield, 
  History, 
  Download,
  ChevronRight,
  Bot,
  Gavel,
  AlertCircle
} from "lucide-react";
import useTranslation from "@/lib/i18n";

export default function QuickActions() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [contractDialogOpen, setContractDialogOpen] = useState(false);
  const [contractType, setContractType] = useState("");
  const [requirements, setRequirements] = useState("");
  const [jurisdiction, setJurisdiction] = useState("Germany");

  const generateContractMutation = useMutation({
    mutationFn: async (data: { contractType: string; requirements: string; jurisdiction: string }) => {
      const response = await apiRequest("POST", "/api/contracts/generate", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: t("contracts.generated"),
        description: t("contracts.generated_success"),
      });
      // Handle the generated contract (e.g., open in new window or download)
      const blob = new Blob([data.contract], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${contractType}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      setContractDialogOpen(false);
      setContractType("");
      setRequirements("");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: t("contracts.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const runComplianceCheckMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/compliance/generate-report", {
        reportType: "gdpr"
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/compliance/score"] });
      queryClient.invalidateQueries({ queryKey: ["/api/compliance/reports"] });
      toast({
        title: t("compliance.check_complete"),
        description: t("compliance.check_complete_desc"),
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: t("compliance.check_error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleGenerateContract = () => {
    if (!contractType || !requirements) {
      toast({
        title: t("contracts.validation_error"),
        description: t("contracts.fill_all_fields"),
        variant: "destructive",
      });
      return;
    }
    
    generateContractMutation.mutate({
      contractType,
      requirements,
      jurisdiction,
    });
  };

  const actions = [
    {
      title: t("quick_actions.generate_contract"),
      description: t("quick_actions.generate_contract_desc"),
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      action: () => setContractDialogOpen(true),
    },
    {
      title: t("quick_actions.compliance_check"),
      description: t("quick_actions.compliance_check_desc"),
      icon: Shield,
      color: "text-green-600",
      bgColor: "bg-green-100",
      action: () => runComplianceCheckMutation.mutate(),
      loading: runComplianceCheckMutation.isPending,
    },
    {
      title: t("quick_actions.audit_log"),
      description: t("quick_actions.audit_log_desc"),
      icon: History,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      action: () => window.location.href = "/audit",
    },
    {
      title: t("quick_actions.export_report"),
      description: t("quick_actions.export_report_desc"),
      icon: Download,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      action: () => {
        // TODO: Implement export functionality
        toast({
          title: t("common.coming_soon"),
          description: t("quick_actions.export_coming_soon"),
        });
      },
    },
  ];

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
          <Bot className="h-5 w-5 mr-2 text-blue-600" />
          {t("quick_actions.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-3">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start p-4 h-auto hover:bg-gray-50 transition-colors"
                onClick={action.action}
                disabled={action.loading}
              >
                <div className={`w-10 h-10 ${action.bgColor} rounded-lg flex items-center justify-center mr-3`}>
                  <Icon className={`h-5 w-5 ${action.color}`} />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-800">{action.title}</div>
                  <div className="text-sm text-gray-500">{action.description}</div>
                </div>
                {action.loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            );
          })}
        </div>
      </CardContent>

      {/* Contract Generation Dialog */}
      <Dialog open={contractDialogOpen} onOpenChange={setContractDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Gavel className="h-5 w-5 mr-2 text-blue-600" />
              {t("contracts.generate_title")}
            </DialogTitle>
            <DialogDescription>
              {t("contracts.generate_description")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contract-type">{t("contracts.type")}</Label>
              <Select value={contractType} onValueChange={setContractType}>
                <SelectTrigger>
                  <SelectValue placeholder={t("contracts.select_type")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="service-agreement">{t("contracts.service_agreement")}</SelectItem>
                  <SelectItem value="employment-contract">{t("contracts.employment_contract")}</SelectItem>
                  <SelectItem value="nda">{t("contracts.nda")}</SelectItem>
                  <SelectItem value="data-processing-agreement">{t("contracts.data_processing")}</SelectItem>
                  <SelectItem value="license-agreement">{t("contracts.license_agreement")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="jurisdiction">{t("contracts.jurisdiction")}</Label>
              <Select value={jurisdiction} onValueChange={setJurisdiction}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Germany">Germany</SelectItem>
                  <SelectItem value="Austria">Austria</SelectItem>
                  <SelectItem value="Switzerland">Switzerland</SelectItem>
                  <SelectItem value="European Union">European Union</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="requirements">{t("contracts.requirements")}</Label>
              <Textarea
                id="requirements"
                placeholder={t("contracts.requirements_placeholder")}
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                rows={4}
              />
            </div>
            
            <div className="flex items-center space-x-2 p-3 bg-yellow-50 rounded-lg">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                {t("contracts.disclaimer")}
              </span>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setContractDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button 
              onClick={handleGenerateContract}
              disabled={generateContractMutation.isPending || !contractType || !requirements}
            >
              {generateContractMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t("contracts.generating")}
                </>
              ) : (
                <>
                  <Bot className="h-4 w-4 mr-2" />
                  {t("contracts.generate")}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
