import {
  users,
  documents,
  aiAnalyses,
  complianceReports,
  auditLogs,
  chatMessages,
  type User,
  type UpsertUser,
  type Document,
  type InsertDocument,
  type AiAnalysis,
  type InsertAiAnalysis,
  type ComplianceReport,
  type InsertComplianceReport,
  type AuditLog,
  type InsertAuditLog,
  type ChatMessage,
  type InsertChatMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, count } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Document operations
  createDocument(document: InsertDocument): Promise<Document>;
  getDocuments(userId: string, limit?: number): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  updateDocument(id: number, updates: Partial<Document>): Promise<Document>;
  deleteDocument(id: number): Promise<void>;
  
  // AI Analysis operations
  createAiAnalysis(analysis: InsertAiAnalysis): Promise<AiAnalysis>;
  getAiAnalyses(userId: string, limit?: number): Promise<AiAnalysis[]>;
  
  // Compliance Report operations
  createComplianceReport(report: InsertComplianceReport): Promise<ComplianceReport>;
  getComplianceReports(userId: string): Promise<ComplianceReport[]>;
  getLatestComplianceReport(userId: string, reportType: string): Promise<ComplianceReport | undefined>;
  
  // Audit Log operations
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(userId: string, limit?: number): Promise<AuditLog[]>;
  
  // Chat Message operations
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(userId: string, sessionId: string, limit?: number): Promise<ChatMessage[]>;
  
  // Statistics
  getUserStats(userId: string): Promise<{
    documentsCount: number;
    aiAnalysesCount: number;
    complianceScore: number;
    activeUsersCount: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Document operations
  async createDocument(document: InsertDocument): Promise<Document> {
    const [doc] = await db.insert(documents).values(document).returning();
    return doc;
  }

  async getDocuments(userId: string, limit = 10): Promise<Document[]> {
    return await db
      .select()
      .from(documents)
      .where(eq(documents.userId, userId))
      .orderBy(desc(documents.createdAt))
      .limit(limit);
  }

  async getDocument(id: number): Promise<Document | undefined> {
    const [doc] = await db.select().from(documents).where(eq(documents.id, id));
    return doc;
  }

  async updateDocument(id: number, updates: Partial<Document>): Promise<Document> {
    const [doc] = await db
      .update(documents)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(documents.id, id))
      .returning();
    return doc;
  }

  async deleteDocument(id: number): Promise<void> {
    await db.delete(documents).where(eq(documents.id, id));
  }

  // AI Analysis operations
  async createAiAnalysis(analysis: InsertAiAnalysis): Promise<AiAnalysis> {
    const [ai] = await db.insert(aiAnalyses).values(analysis).returning();
    return ai;
  }

  async getAiAnalyses(userId: string, limit = 10): Promise<AiAnalysis[]> {
    return await db
      .select()
      .from(aiAnalyses)
      .where(eq(aiAnalyses.userId, userId))
      .orderBy(desc(aiAnalyses.createdAt))
      .limit(limit);
  }

  // Compliance Report operations
  async createComplianceReport(report: InsertComplianceReport): Promise<ComplianceReport> {
    const [comp] = await db.insert(complianceReports).values(report).returning();
    return comp;
  }

  async getComplianceReports(userId: string): Promise<ComplianceReport[]> {
    return await db
      .select()
      .from(complianceReports)
      .where(and(eq(complianceReports.userId, userId), eq(complianceReports.status, "active")))
      .orderBy(desc(complianceReports.createdAt));
  }

  async getLatestComplianceReport(userId: string, reportType: string): Promise<ComplianceReport | undefined> {
    const [report] = await db
      .select()
      .from(complianceReports)
      .where(and(
        eq(complianceReports.userId, userId),
        eq(complianceReports.reportType, reportType),
        eq(complianceReports.status, "active")
      ))
      .orderBy(desc(complianceReports.createdAt))
      .limit(1);
    return report;
  }

  // Audit Log operations
  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const [audit] = await db.insert(auditLogs).values(log).returning();
    return audit;
  }

  async getAuditLogs(userId: string, limit = 10): Promise<AuditLog[]> {
    return await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.userId, userId))
      .orderBy(desc(auditLogs.timestamp))
      .limit(limit);
  }

  // Chat Message operations
  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [chat] = await db.insert(chatMessages).values(message).returning();
    return chat;
  }

  async getChatMessages(userId: string, sessionId: string, limit = 20): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(and(eq(chatMessages.userId, userId), eq(chatMessages.sessionId, sessionId)))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);
  }

  // Statistics
  async getUserStats(userId: string): Promise<{
    documentsCount: number;
    aiAnalysesCount: number;
    complianceScore: number;
    activeUsersCount: number;
  }> {
    const [documentsCount] = await db
      .select({ count: count() })
      .from(documents)
      .where(eq(documents.userId, userId));

    const [aiAnalysesCount] = await db
      .select({ count: count() })
      .from(aiAnalyses)
      .where(eq(aiAnalyses.userId, userId));

    const [activeUsersCount] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.isActive, true));

    // Get latest GDPR compliance score
    const latestReport = await this.getLatestComplianceReport(userId, "gdpr");
    const complianceScore = latestReport ? parseFloat(latestReport.score || "0") : 0;

    return {
      documentsCount: documentsCount.count,
      aiAnalysesCount: aiAnalysesCount.count,
      complianceScore,
      activeUsersCount: activeUsersCount.count,
    };
  }
}

export const storage = new DatabaseStorage();
