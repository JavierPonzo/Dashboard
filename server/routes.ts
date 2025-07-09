import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
// import { setupAuth, isAuthenticated } from "./replitAuth"; // Temporarily disabled for demo
import { upload, handleUploadError, extractTextFromFile, validateFile, getFileUrl } from "./middleware/upload";
import { analyzeDocument, generateChatResponse, generateContract, runComplianceCheck } from "./services/openai";
import { calculateComplianceScore, generateComplianceReport } from "./services/compliance";
import { logAuditEvent, AuditActions, AuditResources, logDocumentAction, logAIAction, logComplianceAction } from "./services/audit";
import { insertDocumentSchema, insertChatMessageSchema, insertAiAnalysisSchema } from "@shared/schema";
import { z } from "zod";
import fs from "fs";
import path from "path";

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // TEMPORARILY DISABLED AUTH - Create demo user for testing
  const demoUser = {
    id: "demo-user-123",
    email: "demo@compliance.com",
    firstName: "Demo",
    lastName: "User",
    profileImageUrl: null,
    role: "user",
    plan: "professional",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Ensure demo user exists in database
  try {
    await storage.upsertUser(demoUser);
  } catch (error) {
    console.log("Demo user already exists or error creating:", error);
  }

  // Helper function to get audit context from request (using demo user)
  const getAuditContext = (req: any) => ({
    userId: demoUser.id,
    ipAddress: req.ip,
    userAgent: req.get("User-Agent"),
    sessionId: "demo-session",
  });

  // Auth routes (bypassed for demo)
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      const user = await storage.getUser(demoUser.id);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Document routes
  app.post('/api/documents/upload', upload.array('files', 10), handleUploadError, async (req: any, res: Response) => {
    try {
      const userId = demoUser.id;
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      const uploadedDocuments = [];
      
      for (const file of files) {
        // Validate file
        const validation = validateFile(file);
        if (!validation.valid) {
          return res.status(400).json({ error: validation.error });
        }

        // Create document record
        const documentData = insertDocumentSchema.parse({
          userId,
          fileName: file.filename,
          originalName: file.originalname,
          fileSize: file.size,
          mimeType: file.mimetype,
          fileUrl: getFileUrl(file.filename),
          status: "uploaded",
        });

        const document = await storage.createDocument(documentData);
        
        // Log audit event
        await logDocumentAction(
          AuditActions.DOCUMENT_UPLOAD,
          document.id.toString(),
          userId,
          getAuditContext(req),
          { originalName: file.originalname, fileSize: file.size }
        );

        uploadedDocuments.push(document);

        // Process document asynchronously
        processDocumentAsync(document.id, file.path, file.mimetype, userId, getAuditContext(req));
      }

      res.json({ documents: uploadedDocuments });
    } catch (error) {
      console.error("Error uploading documents:", error);
      res.status(500).json({ error: "Failed to upload documents" });
    }
  });

  app.get('/api/documents', async (req: any, res) => {
    try {
      const userId = demoUser.id;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const documents = await storage.getDocuments(userId, limit);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  app.get('/api/documents/:id', async (req: any, res) => {
    try {
      const userId = demoUser.id;
      const documentId = parseInt(req.params.id);
      
      const document = await storage.getDocument(documentId);
      
      if (!document || document.userId !== userId) {
        return res.status(404).json({ error: "Document not found" });
      }

      // Log audit event
      await logDocumentAction(
        AuditActions.DATA_VIEW,
        documentId.toString(),
        userId,
        getAuditContext(req)
      );

      res.json(document);
    } catch (error) {
      console.error("Error fetching document:", error);
      res.status(500).json({ error: "Failed to fetch document" });
    }
  });

  app.delete('/api/documents/:id', async (req: any, res) => {
    try {
      const userId = demoUser.id;
      const documentId = parseInt(req.params.id);
      
      const document = await storage.getDocument(documentId);
      
      if (!document || document.userId !== userId) {
        return res.status(404).json({ error: "Document not found" });
      }

      // Delete file from disk
      const filePath = path.join(uploadsDir, document.fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      await storage.deleteDocument(documentId);

      // Log audit event
      await logDocumentAction(
        AuditActions.DOCUMENT_DELETE,
        documentId.toString(),
        userId,
        getAuditContext(req),
        { fileName: document.originalName }
      );

      res.json({ message: "Document deleted successfully" });
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ error: "Failed to delete document" });
    }
  });

  // AI Chat routes
  app.post('/api/chat', async (req: any, res) => {
    try {
      const userId = demoUser.id;
      const { message, sessionId } = req.body;

      if (!message || !sessionId) {
        return res.status(400).json({ error: "Message and sessionId are required" });
      }

      // Save user message
      const userMessage = insertChatMessageSchema.parse({
        userId,
        message,
        sessionId,
        isFromUser: true,
      });

      await storage.createChatMessage(userMessage);

      // Generate AI response
      const user = await storage.getUser(userId);
      const aiResponse = await generateChatResponse(message, "", user?.role || "user");

      // Save AI response
      const aiMessage = insertChatMessageSchema.parse({
        userId,
        message: aiResponse.message,
        sessionId,
        isFromUser: false,
        metadata: {
          suggestions: aiResponse.suggestions,
          relatedDocuments: aiResponse.relatedDocuments,
        },
      });

      await storage.createChatMessage(aiMessage);

      // Log audit event
      await logAIAction(
        AuditActions.AI_CHAT,
        userId,
        getAuditContext(req),
        { message: message.substring(0, 100) }
      );

      res.json({
        response: aiResponse.message,
        suggestions: aiResponse.suggestions,
        relatedDocuments: aiResponse.relatedDocuments,
      });
    } catch (error) {
      console.error("Error processing chat:", error);
      res.status(500).json({ error: "Failed to process chat message" });
    }
  });

  app.get('/api/chat/:sessionId', async (req: any, res) => {
    try {
      const userId = demoUser.id;
      const sessionId = req.params.sessionId;
      const limit = parseInt(req.query.limit as string) || 20;
      
      const messages = await storage.getChatMessages(userId, sessionId, limit);
      res.json(messages.reverse()); // Reverse to get chronological order
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ error: "Failed to fetch chat messages" });
    }
  });

  // Compliance routes
  app.get('/api/compliance/score', async (req: any, res) => {
    try {
      const userId = demoUser.id;
      const score = await calculateComplianceScore(userId);
      res.json(score);
    } catch (error) {
      console.error("Error calculating compliance score:", error);
      res.status(500).json({ error: "Failed to calculate compliance score" });
    }
  });

  app.post('/api/compliance/check', async (req: any, res) => {
    try {
      const userId = demoUser.id;
      const { content, complianceType = "gdpr" } = req.body;

      if (!content) {
        return res.status(400).json({ error: "Content is required" });
      }

      const result = await runComplianceCheck(content, complianceType);

      // Log audit event
      await logComplianceAction(
        AuditActions.COMPLIANCE_CHECK,
        userId,
        getAuditContext(req),
        { complianceType, score: result.score }
      );

      res.json(result);
    } catch (error) {
      console.error("Error running compliance check:", error);
      res.status(500).json({ error: "Failed to run compliance check" });
    }
  });

  app.get('/api/compliance/reports', async (req: any, res) => {
    try {
      const userId = demoUser.id;
      const reports = await storage.getComplianceReports(userId);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching compliance reports:", error);
      res.status(500).json({ error: "Failed to fetch compliance reports" });
    }
  });

  app.post('/api/compliance/generate-report', async (req: any, res) => {
    try {
      const userId = demoUser.id;
      const { reportType = "gdpr" } = req.body;

      await generateComplianceReport(userId, reportType);

      // Log audit event
      await logComplianceAction(
        AuditActions.COMPLIANCE_REPORT,
        userId,
        getAuditContext(req),
        { reportType }
      );

      res.json({ message: "Compliance report generated successfully" });
    } catch (error) {
      console.error("Error generating compliance report:", error);
      res.status(500).json({ error: "Failed to generate compliance report" });
    }
  });

  // Contract generation route
  app.post('/api/contracts/generate', async (req: any, res) => {
    try {
      const userId = demoUser.id;
      const { contractType, requirements, jurisdiction = "Germany" } = req.body;

      if (!contractType || !requirements) {
        return res.status(400).json({ error: "Contract type and requirements are required" });
      }

      const contract = await generateContract(contractType, requirements, jurisdiction);

      // Log audit event
      await logAIAction(
        AuditActions.CONTRACT_GENERATE,
        userId,
        getAuditContext(req),
        { contractType, jurisdiction }
      );

      res.json({ contract });
    } catch (error) {
      console.error("Error generating contract:", error);
      res.status(500).json({ error: "Failed to generate contract" });
    }
  });

  // Audit log routes
  app.get('/api/audit-logs', async (req: any, res) => {
    try {
      const userId = demoUser.id;
      const limit = parseInt(req.query.limit as string) || 20;
      
      const logs = await storage.getAuditLogs(userId, limit);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ error: "Failed to fetch audit logs" });
    }
  });

  // Statistics routes
  app.get('/api/stats', async (req: any, res) => {
    try {
      const userId = demoUser.id;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });

  // Serve uploaded files
  app.get('/uploads/:filename', async (req: any, res) => {
    try {
      const filename = req.params.filename;
      const filePath = path.join(uploadsDir, filename);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "File not found" });
      }

      // Check if user has access to this file
      const documents = await storage.getDocuments(demoUser.id, 1000);
      const hasAccess = documents.some(doc => doc.fileName === filename);
      
      if (!hasAccess) {
        return res.status(403).json({ error: "Access denied" });
      }

      res.sendFile(filePath);
    } catch (error) {
      console.error("Error serving file:", error);
      res.status(500).json({ error: "Failed to serve file" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Async function to process documents
async function processDocumentAsync(
  documentId: number,
  filePath: string,
  mimeType: string,
  userId: string,
  auditContext: any
): Promise<void> {
  try {
    // Update document status to processing
    await storage.updateDocument(documentId, { status: "processing" });

    // Extract text from file
    const content = await extractTextFromFile(filePath, mimeType);
    
    // Analyze document with AI
    const document = await storage.getDocument(documentId);
    if (!document) return;

    const analysis = await analyzeDocument(document.originalName, content);
    
    // Update document with analysis results
    await storage.updateDocument(documentId, {
      status: "analyzed",
      analysisResult: analysis,
      complianceScore: analysis.complianceScore.toString(),
      tags: analysis.keyFindings,
    });

    // Create AI analysis record
    const aiAnalysis = insertAiAnalysisSchema.parse({
      documentId,
      userId,
      analysisType: "document_analysis",
      prompt: `Analyze document: ${document.originalName}`,
      response: JSON.stringify(analysis),
      metadata: {
        fileName: document.originalName,
        fileSize: document.fileSize,
        complianceScore: analysis.complianceScore,
      },
    });

    await storage.createAiAnalysis(aiAnalysis);

    // Log audit event
    await logDocumentAction(
      AuditActions.DOCUMENT_ANALYZE,
      documentId.toString(),
      userId,
      auditContext,
      { complianceScore: analysis.complianceScore }
    );

  } catch (error) {
    console.error("Error processing document:", error);
    
    // Update document status to failed
    await storage.updateDocument(documentId, { 
      status: "failed",
      analysisResult: { error: "Failed to analyze document" },
    });
  }
}
