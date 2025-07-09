import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || ""
});

export interface DocumentAnalysisResult {
  summary: string;
  complianceScore: number;
  keyFindings: string[];
  recommendations: string[];
  risks: Array<{
    type: string;
    severity: "low" | "medium" | "high";
    description: string;
  }>;
  gdprCompliance: {
    score: number;
    issues: string[];
    recommendations: string[];
  };
}

export interface ChatResponse {
  message: string;
  suggestions: string[];
  relatedDocuments: string[];
}

export async function analyzeDocument(
  fileName: string,
  content: string,
  documentType: string = "legal"
): Promise<DocumentAnalysisResult> {
  const prompt = `
    Analyze the following legal document for compliance and legal risks.
    Document: ${fileName}
    Type: ${documentType}
    
    Content:
    ${content}
    
    Provide a comprehensive analysis including:
    1. Document summary
    2. Compliance score (0-100)
    3. Key findings
    4. Recommendations for improvement
    5. Risk assessment
    6. GDPR compliance analysis
    
    Respond in JSON format with the following structure:
    {
      "summary": "Brief summary of the document",
      "complianceScore": 85,
      "keyFindings": ["Finding 1", "Finding 2"],
      "recommendations": ["Recommendation 1", "Recommendation 2"],
      "risks": [
        {
          "type": "Data Protection",
          "severity": "medium",
          "description": "Risk description"
        }
      ],
      "gdprCompliance": {
        "score": 78,
        "issues": ["Issue 1", "Issue 2"],
        "recommendations": ["GDPR Recommendation 1"]
      }
    }
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a legal compliance expert specializing in GDPR, data protection, and contract analysis. Provide detailed, actionable insights."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result as DocumentAnalysisResult;
  } catch (error) {
    console.error("OpenAI document analysis error:", error);
    throw new Error("Failed to analyze document with AI");
  }
}

export async function generateChatResponse(
  userMessage: string,
  context: string = "",
  userRole: string = "user"
): Promise<ChatResponse> {
  const prompt = `
    You are an AI legal assistant specializing in compliance and legal automation.
    User role: ${userRole}
    Context: ${context}
    
    User message: ${userMessage}
    
    Provide a helpful response with:
    1. Main response to the user's question
    2. Relevant suggestions for next steps
    3. Related documents or resources they might need
    
    Respond in JSON format:
    {
      "message": "Your helpful response here",
      "suggestions": ["Suggestion 1", "Suggestion 2"],
      "relatedDocuments": ["Document 1", "Document 2"]
    }
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional legal AI assistant. Provide accurate, helpful information about legal compliance, GDPR, data protection, and contract management."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result as ChatResponse;
  } catch (error) {
    console.error("OpenAI chat error:", error);
    throw new Error("Failed to generate AI response");
  }
}

export async function generateContract(
  contractType: string,
  requirements: string,
  jurisdiction: string = "Germany"
): Promise<string> {
  const prompt = `
    Generate a professional ${contractType} contract template for ${jurisdiction}.
    
    Requirements:
    ${requirements}
    
    The contract should be:
    1. Legally sound and compliant with local laws
    2. Professional and clear
    3. Include all necessary clauses
    4. Be ready for customization
    
    Format as a complete contract document with proper sections and clauses.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a legal contract specialist for ${jurisdiction}. Generate professional, legally compliant contract templates.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2,
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("OpenAI contract generation error:", error);
    throw new Error("Failed to generate contract");
  }
}

export async function runComplianceCheck(
  documentContent: string,
  complianceType: string = "gdpr"
): Promise<{
  score: number;
  issues: string[];
  recommendations: string[];
}> {
  const prompt = `
    Perform a ${complianceType.toUpperCase()} compliance check on the following document:
    
    ${documentContent}
    
    Analyze for:
    1. Compliance score (0-100)
    2. Specific issues found
    3. Actionable recommendations
    
    Respond in JSON format:
    {
      "score": 85,
      "issues": ["Issue 1", "Issue 2"],
      "recommendations": ["Recommendation 1", "Recommendation 2"]
    }
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a ${complianceType.toUpperCase()} compliance expert. Provide detailed compliance analysis.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result;
  } catch (error) {
    console.error("OpenAI compliance check error:", error);
    throw new Error("Failed to run compliance check");
  }
}
