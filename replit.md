# Legal Compliance Automation Platform

## Overview

This is a modern SaaS web application for legal compliance and automation, built with a full-stack TypeScript architecture. The platform provides document management, AI-powered analysis, compliance monitoring, and audit logging capabilities, specifically designed for European markets (initially Germany) with GDPR and ISO 27001 compliance in mind.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: TailwindCSS with Radix UI components (shadcn/ui)
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Internationalization**: Custom i18n system supporting English and German
- **UI Components**: Comprehensive component library based on Radix UI primitives

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **Session Management**: Express sessions with PostgreSQL store
- **File Storage**: Local filesystem (uploads directory)
- **Background Jobs**: Ready for integration (Sidekiq mentioned in requirements)

### Authentication & Authorization
- **Provider**: Replit Auth (OIDC-based)
- **Session Storage**: PostgreSQL-backed sessions
- **User Management**: Role-based access control (user, admin, legal_manager)
- **Plan Management**: Tiered access control (basic, professional, enterprise)

## Key Components

### Database Schema
- **Users**: Profile information, roles, plans, usage tracking
- **Documents**: File metadata, content extraction, processing status
- **AI Analyses**: Document analysis results, compliance scores
- **Compliance Reports**: GDPR, ISO 27001, security assessments
- **Audit Logs**: Complete activity tracking for compliance
- **Chat Messages**: AI assistant conversation history
- **Sessions**: Secure session management

### Document Management
- **Upload**: Multi-file upload with drag-and-drop support
- **Processing**: Text extraction and AI analysis pipeline
- **Storage**: Local file system with metadata in database
- **Validation**: File type and size restrictions
- **Security**: User-scoped access control

### AI Integration
- **Provider**: OpenAI GPT-4o for document analysis
- **Capabilities**: 
  - Document summarization and analysis
  - Compliance scoring (GDPR, ISO 27001)
  - Risk assessment
  - Contract generation
  - Interactive chat assistant
- **Features**: Conversation history, suggestions, document references

### Compliance Monitoring
- **Standards**: GDPR, ISO 27001, data retention, security
- **Scoring**: Automated compliance scoring system
- **Reporting**: Detailed compliance reports with recommendations
- **Tracking**: Historical compliance trend analysis

### Audit System
- **Comprehensive Logging**: All user actions, system events
- **Audit Context**: User, IP, session, user agent tracking
- **Categorization**: Authentication, documents, AI, compliance actions
- **Retention**: Persistent audit trail for compliance requirements

## Data Flow

### Document Processing Flow
1. User uploads documents via drag-and-drop or file picker
2. Files validated for type, size, and user limits
3. Files stored locally with metadata in database
4. Text extraction performed on uploaded files
5. AI analysis triggered for compliance assessment
6. Results stored and displayed to user
7. All actions logged in audit system

### AI Analysis Flow
1. Document content sent to OpenAI API
2. Multiple analysis types performed (summary, compliance, risks)
3. Results structured and stored in database
4. Compliance scores calculated and aggregated
5. User notified of analysis completion
6. Results integrated into dashboard and reports

### Authentication Flow
1. User redirected to Replit Auth (OIDC)
2. Authorization code exchanged for tokens
3. User profile created/updated in database
4. Session established with PostgreSQL backing
5. User permissions determined by role and plan
6. Access control enforced throughout application

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe database operations
- **openai**: AI analysis and chat functionality
- **express**: Web server framework
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: UI component primitives
- **tailwindcss**: Styling framework

### File Processing
- **multer**: File upload handling
- **text extraction libraries**: For document content processing

### Development Tools
- **vite**: Build tool and development server
- **typescript**: Type safety and development experience
- **drizzle-kit**: Database migrations and schema management

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with Express backend
- **Hot Reloading**: Full-stack development with instant updates
- **Environment Variables**: Configuration via .env files
- **Database**: Neon serverless PostgreSQL

### Production Deployment
- **Build Process**: Vite builds frontend, esbuild bundles backend
- **Static Assets**: Frontend built to dist/public directory
- **Server**: Express serves both API and static files
- **Database**: Production Neon PostgreSQL instance
- **Session Storage**: PostgreSQL-backed session management
- **File Storage**: Local filesystem (should be upgraded to cloud storage)

### Security Considerations
- **HTTPS**: Required for production deployment
- **CORS**: Configured for frontend-backend communication
- **Session Security**: Secure cookies with proper expiration
- **Input Validation**: File type, size, and content validation
- **Rate Limiting**: Should be implemented for API endpoints
- **Data Encryption**: Field-level encryption for sensitive data (planned)

### Scalability Considerations
- **Database**: Neon serverless provides automatic scaling
- **File Storage**: Local storage should be replaced with cloud solution
- **Background Processing**: Ready for Redis/Sidekiq integration
- **Caching**: Can be added for frequently accessed data
- **CDN**: Should be implemented for static asset delivery

The application is designed with European compliance requirements in mind, featuring comprehensive audit logging, data protection controls, and user consent management. The modular architecture allows for easy extension with additional compliance frameworks and AI capabilities.