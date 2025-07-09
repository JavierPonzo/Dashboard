import { storage } from "../storage";
import { runComplianceCheck } from "./openai";
import type { InsertComplianceReport } from "@shared/schema";

export interface ComplianceMetrics {
  gdpr: number;
  iso27001: number;
  dataRetention: number;
  security: number;
  overall: number;
}

export async function calculateComplianceScore(
  userId: string,
  documentContent?: string
): Promise<ComplianceMetrics> {
  try {
    const reports = await storage.getComplianceReports(userId);
    
    // Get latest scores for each compliance type
    const gdprReport = reports.find(r => r.reportType === "gdpr");
    const iso27001Report = reports.find(r => r.reportType === "iso27001");
    const dataRetentionReport = reports.find(r => r.reportType === "data_retention");
    const securityReport = reports.find(r => r.reportType === "security");
    
    const gdpr = gdprReport ? parseFloat(gdprReport.score || "0") : 0;
    const iso27001 = iso27001Report ? parseFloat(iso27001Report.score || "0") : 0;
    const dataRetention = dataRetentionReport ? parseFloat(dataRetentionReport.score || "0") : 100; // Default high for data retention
    const security = securityReport ? parseFloat(securityReport.score || "0") : 0;
    
    // If we have document content, run a fresh compliance check
    if (documentContent) {
      const gdprCheck = await runComplianceCheck(documentContent, "gdpr");
      
      // Update GDPR report
      const gdprReportData: InsertComplianceReport = {
        userId,
        reportType: "gdpr",
        score: gdprCheck.score.toString(),
        findings: {
          issues: gdprCheck.issues,
          recommendations: gdprCheck.recommendations,
          timestamp: new Date().toISOString(),
        },
        recommendations: gdprCheck.recommendations,
      };
      
      await storage.createComplianceReport(gdprReportData);
      
      return {
        gdpr: gdprCheck.score,
        iso27001,
        dataRetention,
        security,
        overall: Math.round((gdprCheck.score + iso27001 + dataRetention + security) / 4),
      };
    }
    
    const overall = Math.round((gdpr + iso27001 + dataRetention + security) / 4);
    
    return {
      gdpr,
      iso27001,
      dataRetention,
      security,
      overall,
    };
  } catch (error) {
    console.error("Error calculating compliance score:", error);
    // Return default scores if calculation fails
    return {
      gdpr: 0,
      iso27001: 0,
      dataRetention: 100,
      security: 0,
      overall: 25,
    };
  }
}

export async function generateComplianceReport(
  userId: string,
  reportType: string = "gdpr"
): Promise<void> {
  try {
    // Get user's documents for analysis
    const documents = await storage.getDocuments(userId, 50);
    
    if (documents.length === 0) {
      // Create a basic report for users with no documents
      const reportData: InsertComplianceReport = {
        userId,
        reportType,
        score: "0",
        findings: {
          message: "No documents found for compliance analysis",
          timestamp: new Date().toISOString(),
        },
        recommendations: ["Upload documents to begin compliance analysis"],
      };
      
      await storage.createComplianceReport(reportData);
      return;
    }
    
    // Analyze recent documents
    const recentDocs = documents.slice(0, 10);
    let totalScore = 0;
    const allIssues: string[] = [];
    const allRecommendations: string[] = [];
    
    for (const doc of recentDocs) {
      if (doc.analysisResult) {
        const analysis = doc.analysisResult as any;
        if (analysis.complianceScore) {
          totalScore += analysis.complianceScore;
        }
        if (analysis.gdprCompliance?.issues) {
          allIssues.push(...analysis.gdprCompliance.issues);
        }
        if (analysis.recommendations) {
          allRecommendations.push(...analysis.recommendations);
        }
      }
    }
    
    const averageScore = recentDocs.length > 0 ? totalScore / recentDocs.length : 0;
    
    // Create compliance report
    const reportData: InsertComplianceReport = {
      userId,
      reportType,
      score: averageScore.toString(),
      findings: {
        analyzedDocuments: recentDocs.length,
        issues: [...new Set(allIssues)], // Remove duplicates
        timestamp: new Date().toISOString(),
      },
      recommendations: [...new Set(allRecommendations)], // Remove duplicates
    };
    
    await storage.createComplianceReport(reportData);
  } catch (error) {
    console.error("Error generating compliance report:", error);
    throw new Error("Failed to generate compliance report");
  }
}

export function getComplianceRecommendations(score: number): string[] {
  const recommendations: string[] = [];
  
  if (score < 50) {
    recommendations.push("Urgent: Review and update your privacy policy");
    recommendations.push("Implement data protection impact assessments");
    recommendations.push("Review data processing activities");
  } else if (score < 80) {
    recommendations.push("Update cookie consent mechanisms");
    recommendations.push("Review data retention policies");
    recommendations.push("Implement regular compliance audits");
  } else {
    recommendations.push("Maintain current compliance standards");
    recommendations.push("Consider advanced security measures");
    recommendations.push("Regular monitoring and updates");
  }
  
  return recommendations;
}
