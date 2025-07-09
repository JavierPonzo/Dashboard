import { storage } from "../storage";
import type { InsertAuditLog } from "@shared/schema";

export interface AuditContext {
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  additionalData?: Record<string, any>;
}

export async function logAuditEvent(
  action: string,
  resource: string,
  resourceId?: string,
  context?: AuditContext,
  details?: Record<string, any>
): Promise<void> {
  try {
    const auditLog: InsertAuditLog = {
      userId: context?.userId,
      action,
      resource,
      resourceId,
      details: {
        ...details,
        sessionId: context?.sessionId,
        ...context?.additionalData,
      },
      ipAddress: context?.ipAddress,
      userAgent: context?.userAgent,
    };

    await storage.createAuditLog(auditLog);
  } catch (error) {
    console.error("Failed to log audit event:", error);
    // Don't throw error to avoid disrupting main functionality
  }
}

// Predefined audit actions
export const AuditActions = {
  // Authentication
  LOGIN: "user.login",
  LOGOUT: "user.logout",
  LOGIN_FAILED: "user.login.failed",
  
  // Document management
  DOCUMENT_UPLOAD: "document.upload",
  DOCUMENT_DOWNLOAD: "document.download",
  DOCUMENT_DELETE: "document.delete",
  DOCUMENT_ANALYZE: "document.analyze",
  
  // AI interactions
  AI_CHAT: "ai.chat",
  AI_ANALYSIS: "ai.analysis",
  CONTRACT_GENERATE: "ai.contract.generate",
  
  // Compliance
  COMPLIANCE_CHECK: "compliance.check",
  COMPLIANCE_REPORT: "compliance.report.generate",
  
  // User management
  USER_CREATE: "user.create",
  USER_UPDATE: "user.update",
  USER_DELETE: "user.delete",
  ROLE_CHANGE: "user.role.change",
  
  // Settings
  SETTINGS_UPDATE: "settings.update",
  PLAN_CHANGE: "user.plan.change",
  
  // Data access
  DATA_EXPORT: "data.export",
  DATA_VIEW: "data.view",
  
  // System
  SYSTEM_ERROR: "system.error",
  SYSTEM_BACKUP: "system.backup",
} as const;

export const AuditResources = {
  USER: "user",
  DOCUMENT: "document",
  AI_ANALYSIS: "ai_analysis",
  COMPLIANCE_REPORT: "compliance_report",
  CHAT_MESSAGE: "chat_message",
  SYSTEM: "system",
  SETTINGS: "settings",
} as const;

// Helper functions for common audit scenarios
export async function logDocumentAction(
  action: string,
  documentId: string,
  userId: string,
  context: AuditContext,
  details?: Record<string, any>
): Promise<void> {
  await logAuditEvent(
    action,
    AuditResources.DOCUMENT,
    documentId,
    { ...context, userId },
    details
  );
}

export async function logUserAction(
  action: string,
  targetUserId: string,
  performedBy: string,
  context: AuditContext,
  details?: Record<string, any>
): Promise<void> {
  await logAuditEvent(
    action,
    AuditResources.USER,
    targetUserId,
    { ...context, userId: performedBy },
    details
  );
}

export async function logAIAction(
  action: string,
  userId: string,
  context: AuditContext,
  details?: Record<string, any>
): Promise<void> {
  await logAuditEvent(
    action,
    AuditResources.AI_ANALYSIS,
    undefined,
    { ...context, userId },
    details
  );
}

export async function logComplianceAction(
  action: string,
  userId: string,
  context: AuditContext,
  details?: Record<string, any>
): Promise<void> {
  await logAuditEvent(
    action,
    AuditResources.COMPLIANCE_REPORT,
    undefined,
    { ...context, userId },
    details
  );
}

export async function logSystemAction(
  action: string,
  context: AuditContext,
  details?: Record<string, any>
): Promise<void> {
  await logAuditEvent(
    action,
    AuditResources.SYSTEM,
    undefined,
    context,
    details
  );
}

// Audit log formatter for display
export function formatAuditLog(log: any): string {
  const timestamp = new Date(log.timestamp).toLocaleString();
  const user = log.userId || "System";
  const action = log.action;
  const resource = log.resource;
  const resourceId = log.resourceId ? ` (${log.resourceId})` : "";
  
  return `[${timestamp}] ${user} performed ${action} on ${resource}${resourceId}`;
}

// Get audit statistics
export async function getAuditStatistics(userId: string): Promise<{
  totalActions: number;
  recentActions: number;
  topActions: Array<{ action: string; count: number }>;
}> {
  try {
    const logs = await storage.getAuditLogs(userId, 100);
    
    const totalActions = logs.length;
    const recentActions = logs.filter(log => {
      const logDate = new Date(log.timestamp!);
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return logDate > oneDayAgo;
    }).length;
    
    // Count actions
    const actionCounts: Record<string, number> = {};
    logs.forEach(log => {
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
    });
    
    const topActions = Object.entries(actionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([action, count]) => ({ action, count }));
    
    return {
      totalActions,
      recentActions,
      topActions,
    };
  } catch (error) {
    console.error("Error getting audit statistics:", error);
    return {
      totalActions: 0,
      recentActions: 0,
      topActions: [],
    };
  }
}
