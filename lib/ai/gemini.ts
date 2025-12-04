/**
 * Google Gemini 2.5 Pro Integration
 * Handles AI proposal generation using Neural Arc Knowledge Base
 */

import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = process.env.GOOGLE_GEMINI_API_KEY

if (!apiKey) {
  console.warn('GOOGLE_GEMINI_API_KEY not set. Proposal generation will not work.')
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

export interface ProposalGenerationInput {
  partnerName: string
  partnerCompany: string
  clientName: string
  projectDescription: string
  requirements: string[]
  budget?: number
  currency?: string
  timeline?: string
  industry?: 'insurance' | 'banking' | 'healthcare' | 'finance' | 'consulting'
  solutionType?: string
  complexity?: 'simple' | 'moderate' | 'complex' | 'enterprise'
  teamSize?: 'small' | 'medium' | 'large'
  licenseTier?: 'starter' | 'professional' | 'enterprise'
  minimumBudget?: number
  country?: string
  expectedTime?: string
  priceList?: {
    currency: 'USD' | 'INR' | 'EUR' | 'GBP'
    helium_license_monthly: number
    helium_license_annual: number
    development_rate_per_hour: number
    deployment_cost: number
    maintenance_cost: number
  }
}

export interface GeneratedProposal {
  executiveSummary: string
  projectScope: string[]
  timeline: Array<{
    period: string
    title: string
    description: string
  }>
  investment: Array<{
    name: string
    description: string
    amount: number
  }>
  deliverables: string[]
  technologyStack: {
    frontend: string
    backend: string
    infrastructure: string
  }
  termsAndConditions: string[]
}

/**
 * Neural Arc Knowledge Base - Helium AI Platform
 */
const KNOWLEDGE_BASE = `
# Neural Arc Proposal Generation Knowledge Base

## Helium AI - Core Product & Features

Helium AI is a unified, AI-driven platform launched by Neural Arc that consolidates multiple AI capabilities into one powerful system. It provides strategy, automation, and execution in a single, seamless platform.

### Core Value Proposition:
- One AI for Everything: Unifies analytics, reports, workflows, documents, and presentations
- Built for Real Work: Integrates with 200+ popular tools including CRMs, ERPs, analytics, and compliance platforms
- Context as a Superpower: Learns from organization's own data and knowledge base for accurate, relevant outputs
- Multi-Format Intelligence: Delivers reports, dashboards, presentations, and strategic insights from simple prompts
- Accessible for Everyone: Enterprise-ready yet designed for startups, professionals, and creators

### Comprehensive Feature Set:

1. **Autonomous Task Execution**: Linux environment access, file operations, system commands, package installation
2. **Web Intelligence**: Real-time web search, content extraction, browser automation, form filling
3. **Content Creation**: Document generation, report writing, presentation creation, data visualization
4. **Visual Generation**: Image generation and editing, video creation (8-second clips with audio)
5. **Code Development**: Full-stack development, API integration, deployment automation
6. **Data Processing**: CSV/Excel operations, data analysis, chart generation, statistical analysis
7. **Integration Hub**: MCP protocol support, 200+ tool integrations, API connectivity
8. **Workflow Automation**: Custom workflows with variables, scheduled triggers, event-based automation
9. **Knowledge Management**: Context learning, knowledge base integration, personalized outputs

### Key Differentiators:
- Contextual Intelligence: Learns from organization's data for relevant, secure outputs
- Multi-Format Output: Single prompt generates reports, dashboards, presentations, and insights
- Real-Time Capabilities: Access current information through web search and live data sources
- Enterprise Integration: Pre-built connectors for CRMs, ERPs, analytics, and compliance tools
- Autonomous Execution: Complete tasks end-to-end without constant supervision
- Adaptive Communication: Natural conversation interface with structured task execution

## Four Core Solution Offerings

1. **Solution 1: AI Agent Development** - Custom AI agents built on Helium platform (80-100% Helium integration)
   - Use cases: Customer service automation, research assistants, content generation, data analysis

2. **Solution 2: Workflow Automation** - End-to-end business process automation (60-80% Helium integration)
   - Use cases: Document processing, data entry, approval workflows, reporting, email automation

3. **Solution 3: Data Intelligence Platform** - AI-driven data analysis, visualization, and insights (40-60% Helium integration)
   - Use cases: Business intelligence, predictive analytics, market research, dashboard creation

4. **Solution 4: Custom AI Integration** - Bespoke AI solutions integrated with existing systems (20-80% Helium integration)
   - Use cases: ERP integration, CRM enhancement, legacy system modernization, API development

## CRITICAL PROPOSAL WORKFLOW: Feature-Match First Approach

MANDATORY FIRST STEP: Always begin by matching client requirements against Helium AI's existing features and capabilities. Only create bespoke proposals when Helium features do not align with requirements. This ensures optimal use of existing platform capabilities and accurate cost estimation.

### Feature-Match Analysis Process:
1. Requirement Documentation: List all client requirements in detail
2. Helium Feature Mapping: Match each requirement against Helium's 9 core feature categories
3. Coverage Assessment: Calculate percentage of requirements covered by existing Helium features
4. Gap Identification: Identify specific gaps where Helium features do not align
5. Bespoke Scope Definition: Define custom development needed only for identified gaps
6. Solution Classification: Determine which of the four solutions best fits the need
7. Cost Calculation: Compute costs based on Helium licensing + bespoke development

### Coverage Levels:
- Complete (90-100%): All requirements met by Helium → Helium Licensing Only
- High (70-90%): Most requirements met, minor customization → Helium + Light Customization
- Medium (50-70%): Core requirements met, significant custom features → Helium + Moderate Bespoke
- Low (30-50%): Some requirements met, mostly custom → Helium + Heavy Bespoke
- Minimal (0-30%): Few requirements met, fully custom solution → Fully Bespoke Solution

## Pricing Structure

### Development Rates:
- **India Clients**: ₹1,200/hour, ₹9,600/day, ₹1,92,000/month
- **International Clients** (US, UK, Australia, Singapore): $35/hour, $280/day, $5,600/month

### Implementation Costs:
- **India Clients**: ₹5,00,000 (includes project setup, architecture design, initial deployment, training)
- **International Clients**: $10,000 (includes project setup, architecture design, initial deployment, training)

### Helium AI Licensing Costs:
- **India Clients**: 
  - ₹50,000-75,000/month: Small teams (1-5 users)
  - ₹75,000-1,50,000/month: Medium teams (5-20 users)
  - ₹1,50,000-2,50,000/month: Large teams (20+ users)

- **International Clients**:
  - $500-2,000/month: Small teams (1-5 users)
  - $2,000-10,000/month: Medium teams (5-20 users)
  - $10,000-50,000/month: Large enterprises (20-100 users)
  - $50,000-150,000/month: Enterprise-wide deployment (100+ users)

### Deployment Costs:
- **Basic Cloud Deployment**: 
  - India: ₹1,50,000 - ₹2,25,000
  - International: $2,000 - $3,000

- **Standard Cloud Deployment**:
  - India: ₹3,75,000 - ₹6,00,000
  - International: $5,000 - $8,000

- **Enterprise Cloud Deployment**:
  - India: ₹11,25,000 - ₹18,75,000
  - International: $15,000 - $25,000

### Support Tiers:
- **Basic Support**: 
  - India: ₹30,000 - ₹50,000/month
  - International: $400 - $700/month

- **Standard Support**:
  - India: ₹60,000 - ₹1,00,000/month
  - International: $800 - $1,400/month

- **Premium Support**:
  - India: ₹1,50,000 - ₹2,50,000/month
  - International: $2,000 - $3,500/month

## Man-Hours Calculation

For projects with Helium integration:
- Base Hours = 40-80 hours (Helium configuration and setup)
- Bespoke Hours = (Project Complexity × Base Hours) × (100% - Helium Coverage %)
- Total Hours = Base Hours + Bespoke Hours

Complexity Factors:
- Simple: 1.0x
- Moderate: 1.5x
- Complex: 2.0x
- Highly Complex: 3.0x

## Project Timeline Guidelines

- Small Projects (80%+ Helium coverage): 2-3 weeks
- Medium Projects (50-80% Helium coverage): 6-10 weeks
- Large Projects (30-50% Helium coverage): 14-20 weeks
- Enterprise Projects (<30% Helium coverage): 24+ weeks

## Team Composition

- Senior AI Engineer: 20-30% of project hours
- AI Engineer: 30-40% of project hours
- Full-Stack Developer: 25-35% of project hours
- DevOps Engineer: 10-15% of project hours
- QA Engineer: 15-20% of project hours
- Project Manager: 10-15% of project hours

## Industry-Specific Solutions & Pricing

### Insurance Industry Solutions

1. **AI-Powered Claims Processing System**
   - Timeline: 20 weeks (5 months)
   - Development Cost: $35,000 - $45,000
   - Helium License (Annual): $5,000 - $15,000
   - Total Year 1: $40,000 - $60,000
   - Features: Intelligent document extraction (OCR + NLP), Automated fraud detection, Claims routing, Real-time status tracking, Policy management integration
   - Technologies: Computer Vision, NLP, Fraud Detection

2. **Intelligent Underwriting Assistant**
   - Timeline: 20 weeks (5 months)
   - Development Cost: $30,000 - $40,000
   - Helium License (Annual): $4,000 - $12,000
   - Total Year 1: $34,000 - $52,000
   - Features: Risk profile analysis, Policy term recommendations, Automated underwriting decisions
   - Technologies: Risk Assessment, ML Models, Compliance

3. **Customer Service AI Chatbot**
   - Timeline: 13 weeks (3 months)
   - Development Cost: $12,000 - $18,000
   - Helium License (Annual): $3,000 - $8,000
   - Total Year 1: $15,000 - $26,000
   - Features: Policy inquiries, Claim status, Premium calculations, General customer support
   - Technologies: Conversational AI, Multi-channel, Multilingual

### Banking & Finance Industry Solutions

1. **Fraud Detection & Prevention System**
   - Timeline: 28 weeks (7 months)
   - Development Cost: $50,000 - $70,000
   - Helium License (Annual): $8,000 - $20,000
   - Total Year 1: $58,000 - $90,000
   - Features: Real-time transaction monitoring, Anomaly detection, Risk scoring
   - Technologies: Real-time Monitoring, Anomaly Detection, Risk Scoring

2. **AI-Powered Loan Underwriting System**
   - Timeline: 25 weeks (6 months)
   - Development Cost: $45,000 - $60,000
   - Helium License (Annual): $7,000 - $18,000
   - Total Year 1: $52,000 - $78,000
   - Features: Automated credit assessment, Risk evaluation, Loan approval recommendations
   - Technologies: Credit Scoring, Risk Assessment, Compliance

3. **Personalized Banking Assistant**
   - Timeline: 18 weeks (4.5 months)
   - Development Cost: $28,000 - $38,000
   - Helium License (Annual): $5,000 - $12,000
   - Total Year 1: $33,000 - $50,000
   - Features: Account management, Transaction queries, Financial advice, Product recommendations
   - Technologies: Conversational AI, Personalization, Multi-channel

### Healthcare Industry Solutions

1. **Clinical Decision Support System**
   - Timeline: 33 weeks (8 months)
   - Development Cost: $60,000 - $85,000
   - Helium License (Annual): $10,000 - $25,000
   - Total Year 1: $70,000 - $110,000
   - Features: Diagnostic assistance, Treatment recommendations, Patient risk assessment
   - Technologies: Medical Imaging, Diagnostics, HIPAA Compliant

2. **Patient Engagement & Monitoring Platform**
   - Timeline: 24 weeks (6 months)
   - Development Cost: $38,000 - $52,000
   - Helium License (Annual): $6,000 - $15,000
   - Total Year 1: $44,000 - $67,000
   - Features: Patient communication, Appointment scheduling, Medication reminders, Health monitoring
   - Technologies: Patient Portal, Health Monitoring, Mobile App

3. **Medical Claims Processing Automation**
   - Timeline: 19 weeks (4.5 months)
   - Development Cost: $32,000 - $45,000
   - Helium License (Annual): $5,000 - $13,000
   - Total Year 1: $37,000 - $58,000
   - Features: Automated claim processing, Verification, Approval workflow
   - Technologies: Document OCR, Validation, Workflow Automation

### Finance & Investment Industry Solutions

1. **Algorithmic Trading & Market Analysis Platform**
   - Timeline: 31 weeks (7.5 months)
   - Development Cost: $55,000 - $75,000
   - Helium License (Annual): $9,000 - $22,000
   - Total Year 1: $64,000 - $97,000
   - Features: Market analysis, Trading signal generation, Portfolio optimization
   - Technologies: Trading Algorithms, Predictive Models, Real-time Analysis

2. **Credit Risk Assessment System**
   - Timeline: 23 weeks (5.5 months)
   - Development Cost: $42,000 - $58,000
   - Helium License (Annual): $7,000 - $16,000
   - Total Year 1: $49,000 - $74,000
   - Features: Credit scoring, Risk evaluation, Lending decision support
   - Technologies: Credit Scoring, Risk Prediction, Portfolio Analysis

3. **Financial Advisory Chatbot**
   - Timeline: 18 weeks (4.5 months)
   - Development Cost: $30,000 - $42,000
   - Helium License (Annual): $5,000 - $12,000
   - Total Year 1: $35,000 - $54,000
   - Features: Investment advice, Portfolio management, Financial planning
   - Technologies: Investment Advice, Portfolio Management, NLP

### Consulting Industry Solutions

1. **AI-Powered Business Intelligence Platform**
   - Timeline: 22 weeks (5.5 months)
   - Development Cost: $40,000 - $55,000
   - Helium License (Annual): $6,000 - $15,000
   - Total Year 1: $46,000 - $70,000
   - Features: Automated data analysis, Insight generation, Strategic recommendations
   - Technologies: Data Integration, Analytics, Visualization

2. **Document Analysis & Summarization System**
   - Timeline: 18 weeks (4.5 months)
   - Development Cost: $32,000 - $44,000
   - Helium License (Annual): $5,000 - $12,000
   - Total Year 1: $37,000 - $56,000
   - Features: Document processing, Key insight extraction, Automated summarization
   - Technologies: NLP, Document Processing, Knowledge Base

3. **Client Engagement & CRM AI Assistant**
   - Timeline: 16 weeks (4 months)
   - Development Cost: $26,000 - $36,000
   - Helium License (Annual): $4,000 - $10,000
   - Total Year 1: $30,000 - $46,000
   - Features: Client insights, Engagement recommendations, Relationship management
   - Technologies: CRM Integration, Engagement Scoring, Recommendations

### Helium License Tiers (Annual Pricing)

- **Starter**: $3,000-8,000/year (Monthly: $300-800)
  - Up to 10,000 API calls/month, Basic agent capabilities, Standard support, 2 concurrent users

- **Professional**: $8,000-15,000/year (Monthly: $800-1,500) - Most Popular
  - Up to 50,000 API calls/month, Advanced agent capabilities, Priority support, 10 concurrent users, 2 custom integrations

- **Enterprise**: $15,000-30,000/year (Monthly: $1,500-3,000)
  - Unlimited API calls, Full agent capabilities, Dedicated support, Unlimited users, Unlimited integrations, SLA guarantees, White-label options

### Complexity & Team Size Impact

- **Simple**: 1.0x multiplier, Small team (2-4 developers)
- **Moderate**: 1.5x multiplier, Medium team (5-8 developers)
- **Complex**: 2.0x multiplier, Medium-Large team (6-10 developers)
- **Enterprise**: 3.0x multiplier, Large team (9-15 developers)
`

/**
 * Generate proposal content using Google Gemini 2.5 Pro with Neural Arc Knowledge Base
 */
export async function generateProposal(
  input: ProposalGenerationInput
): Promise<GeneratedProposal> {
  if (!genAI) {
    throw new Error('Google Gemini API key not configured')
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' })

  // Determine market (India vs International) based on currency
  const isIndiaMarket = input.currency === 'INR'
  const market = isIndiaMarket ? 'India' : 'International'
  
  // Get pricing from price list or use defaults
  const devRate = input.priceList?.development_rate_per_hour || (isIndiaMarket ? 1200 : 35)
  const heliumMonthly = input.priceList?.helium_license_monthly || (isIndiaMarket ? 75000 : 2000)
  const heliumAnnual = input.priceList?.helium_license_annual || (isIndiaMarket ? 900000 : 24000)
  const deploymentCost = input.priceList?.deployment_cost || (isIndiaMarket ? 375000 : 5000)
  const maintenanceCost = input.priceList?.maintenance_cost || (isIndiaMarket ? 60000 : 800)
  const implementationFee = isIndiaMarket ? 500000 : 10000

  const prompt = `You are an expert proposal writer for Neural Arc, specializing in Helium AI solutions. You have access to the complete Neural Arc Knowledge Base.

${KNOWLEDGE_BASE}

**YOUR TASK: Analyze the ACTUAL project requirements and create a REALISTIC proposal that makes business sense.**

**CRITICAL ANALYSIS WORKFLOW - USE YOUR INTELLIGENCE:**

1. **Analyze the ACTUAL Project Requirements**:
   - Read the project description carefully: "${input.projectDescription}"
   - Understand what the client ACTUALLY needs (not what templates say)
   - Assess the REAL complexity: Is this a simple chatbot? A basic workflow? A complex enterprise system?
   - Be realistic: A simple chatbot for a company should NOT take 20 weeks or cost $50k+

2. **Feature-Match Analysis**:
   - Match client requirements against Helium AI's 9 core feature categories
   - Calculate REALISTIC Helium coverage percentage based on actual needs
   - Identify ONLY the gaps that truly need bespoke development

3. **Determine REALISTIC Timeline**:
   - Base timeline on ACTUAL project complexity, not templates
   - Simple chatbot (basic Q&A): 2-4 weeks
   - Moderate chatbot (with integrations): 4-8 weeks  
   - Complex system (multiple features, integrations): 8-16 weeks
   - Enterprise platform: 16-24+ weeks
   - ${input.industry && input.solutionType ? `Reference the ${input.industry} industry solution "${input.solutionType}" as a GUIDE, but adjust based on ACTUAL requirements. If the client needs something simpler, use a shorter timeline.` : ''}
   - Break timeline into logical phases that make sense for the actual work

4. **Calculate REALISTIC Development Costs**:
   - Estimate ACTUAL development hours needed based on real requirements
   - Simple projects: 20-60 hours
   - Moderate projects: 60-150 hours
   - Complex projects: 150-300 hours
   - Enterprise projects: 300+ hours
   - Development Rate: ${isIndiaMarket ? '₹' : '$'}${devRate}/hour
   - ${input.industry && input.solutionType ? `Use industry solution costs as REFERENCE only - adjust down for simpler needs, up for more complex needs` : ''}
   - Apply complexity multiplier: ${input.complexity === 'simple' ? '1.0x' : input.complexity === 'moderate' ? '1.5x' : input.complexity === 'complex' ? '2.0x' : '3.0x'}

5. **Determine Appropriate Costs**:
   - Implementation Fee: ${isIndiaMarket ? '₹' : '$'}${implementationFee.toLocaleString()} (only if significant setup needed)
   - Helium License: Choose appropriate tier based on ACTUAL usage needs
   - Deployment: ${isIndiaMarket ? '₹' : '$'}${deploymentCost.toLocaleString()} (adjust based on complexity)
   - Maintenance: ${isIndiaMarket ? '₹' : '$'}${maintenanceCost.toLocaleString()}/month

**Partner Information:**
- Partner Name: ${input.partnerName}
- Partner Company: ${input.partnerCompany}

**Client Information:**
- Client Name: ${input.clientName}
- Project Description: ${input.projectDescription}
- Requirements: ${input.requirements.join('; ')}
${input.industry ? `- Industry: ${input.industry.charAt(0).toUpperCase() + input.industry.slice(1)}` : ''}
${input.solutionType ? `- Solution Type: ${input.solutionType}` : ''}
${input.complexity ? `- Complexity: ${input.complexity.charAt(0).toUpperCase() + input.complexity.slice(1)}` : ''}
${input.teamSize ? `- Team Size: ${input.teamSize.charAt(0).toUpperCase() + input.teamSize.slice(1)}` : ''}
${input.licenseTier ? `- Helium License Tier: ${input.licenseTier.charAt(0).toUpperCase() + input.licenseTier.slice(1)}` : ''}
${input.country ? `- Country: ${input.country}` : ''}
${input.minimumBudget ? `- Minimum Budget: ${input.currency || 'USD'} ${input.minimumBudget.toLocaleString()}` : ''}
${input.expectedTime ? `- Expected Timeline: ${input.expectedTime}` : ''}

${input.budget ? `- Budget: ${input.currency || 'USD'} ${input.budget.toLocaleString()}` : ''}
${input.timeline ? `- Timeline: ${input.timeline}` : ''}

${input.industry && input.solutionType ? `
**Industry Context (Use as REFERENCE, not mandatory template):**
- Industry: ${input.industry}
- Solution Type: ${input.solutionType}
- The Industry-Specific Solutions section provides REFERENCE pricing and timelines for similar solutions
- However, you MUST analyze the ACTUAL requirements and adjust accordingly
- If the client needs something simpler than the template, use lower costs and shorter timelines
- If the client needs something more complex, use higher costs and longer timelines
- Complexity: ${input.complexity || 'moderate'} (${input.complexity === 'simple' ? '1.0x' : input.complexity === 'moderate' ? '1.5x' : input.complexity === 'complex' ? '2.0x' : '3.0x'} multiplier)
- Team Size: ${input.teamSize || 'medium'}
- License Tier: ${input.licenseTier || 'professional'}
` : ''}

**Generate a comprehensive proposal following Neural Arc's standards. Return ONLY valid JSON in this exact format (no markdown, no code blocks):**

{
  "executiveSummary": "A compelling 2-3 paragraph executive summary that: (1) Highlights how Helium AI addresses the client's needs${input.industry ? `, (2) References the specific ${input.industry} industry solution (${input.solutionType || 'selected solution'})` : ', (2) Mentions the feature-match analysis and Helium coverage percentage'}, (3) Emphasizes the value proposition of using Helium AI platform, (4) References the solution type (1-4) that best fits their needs",
  
  "projectScope": [
    "List 5-7 scope items that: (1) Reference specific Helium AI features being used, (2) Include any bespoke development needed for gaps, (3) Be specific about capabilities (e.g., 'Leverage Helium's Web Intelligence for real-time market research', 'Custom API integration using Helium's Integration Hub')"
  ],
  
  "timeline": [
    "Create a REALISTIC timeline based on ACTUAL project complexity. Break it into logical phases that make sense for the work required.",
    "Examples for reference (adjust based on actual needs):",
    "- Simple chatbot: 2-4 weeks (Phase 1: Setup & Configuration, Phase 2: Development & Testing, Phase 3: Deployment)",
    "- Moderate project: 4-8 weeks (add Integration and Customization phases)",
    "- Complex project: 8-16 weeks (add multiple development phases, extensive testing)",
    "- Enterprise: 16-24+ weeks (add architecture, multiple integrations, extensive testing)",
    "Each phase should have: period (e.g., 'Week 1-2'), title (descriptive), and description (what actually happens in that phase)"
  ],
  
  "investment": [
    "Calculate REALISTIC investment breakdown based on ACTUAL project needs:",
    "1. Implementation Fee: Only include if significant setup/architecture work is needed. For simple projects, this may be minimal or included in development.",
    "   - Amount: ${isIndiaMarket ? '₹' : '$'}${implementationFee.toLocaleString()} (adjust down for simple projects, full amount for complex)",
    "2. Helium AI License - Annual: Choose appropriate tier based on ACTUAL usage needs:",
    "   - Starter: $3,000-8,000/year (simple projects, low usage)",
    "   - Professional: $8,000-15,000/year (moderate projects, standard usage)",
    "   - Enterprise: $15,000-30,000/year (complex projects, high usage)",
    "   - Select realistic amount based on project scale",
    "3. Bespoke Development: Calculate based on ACTUAL hours needed × ${devRate}/hour",
    "   - Simple chatbot: 20-40 hours = ${20 * devRate} to ${40 * devRate}",
    "   - Moderate project: 60-120 hours = ${60 * devRate} to ${120 * devRate}",
    "   - Complex project: 150-250 hours = ${150 * devRate} to ${250 * devRate}",
    "   - Enterprise: 300+ hours = ${300 * devRate}+",
    "   - Apply complexity multiplier: ${input.complexity === 'simple' ? '1.0x' : input.complexity === 'moderate' ? '1.5x' : input.complexity === 'complex' ? '2.0x' : '3.0x'}",
    "4. Deployment & Infrastructure: Adjust based on complexity",
    "   - Simple: ${isIndiaMarket ? '₹' : '$'}${Math.round(deploymentCost * 0.5).toLocaleString()}",
    "   - Moderate: ${isIndiaMarket ? '₹' : '$'}${deploymentCost.toLocaleString()}",
    "   - Complex: ${isIndiaMarket ? '₹' : '$'}${Math.round(deploymentCost * 1.5).toLocaleString()}",
    "5. Support & Maintenance: Include 6 months",
    "   - Amount: ${maintenanceCost * 6}",
    "IMPORTANT: Only include items that make sense for the ACTUAL project. A simple chatbot shouldn't have enterprise-level costs!"
  ],
  
  "deliverables": [
    "Configured Helium AI platform instance with client-specific workflows",
    "Custom AI agents/workflows (if bespoke development required)",
    "Integration with client's existing systems (CRMs, ERPs, etc.)",
    "Comprehensive documentation and user guides",
    "Training sessions for client team",
    "Deployed production system",
    "6 months of support and maintenance",
    "Knowledge base setup and configuration"
  ],
  
  "technologyStack": {
    "frontend": "Helium AI platform interface (web-based, responsive design)",
    "backend": "Helium AI platform with custom integrations and APIs",
    "infrastructure": "Cloud infrastructure (AWS/Azure/GCP) with Helium AI deployment"
  },
  
  "termsAndConditions": [
    "Payment Terms: 30% upfront (implementation fee), 40% at milestone completion, 30% upon final delivery",
    "Helium License: Annual subscription, renewable with pricing adjustments",
    "Project Duration: Based on complexity and Helium coverage percentage",
    "Warranty Period: 90 days post-launch for bug fixes and issues",
    "Support: Standard support tier included for 6 months, upgradeable to premium",
    "Intellectual Property: Custom code and configurations transfer to client upon final payment",
    "Helium Platform Updates: Automatic updates included in license",
    "Change Requests: Scope changes may require additional development hours at ${isIndiaMarket ? '₹' : '$'}${devRate}/hour",
    "Data Security: All data processed through Helium AI platform with enterprise-grade security",
    "Training: Comprehensive training sessions included in implementation fee"
  ]
}

**Neural Arc Company Information:**
- Company Name: Neural Arc
- Address 1 (India): 3rd Floor, Trimurti HoneyGold, Range Hill Rd, Sinchan Nagar, Ashok Nagar, Pune, Maharashtra 411016
- Address 2 (United States): 300 Creek View Road, Suite 209, Newark, Delaware 19711

**CRITICAL REQUIREMENTS - BE REALISTIC:**
1. Analyze the ACTUAL project requirements - don't force-fit templates
2. Create REALISTIC timelines based on actual complexity (simple chatbot = 2-4 weeks, NOT 20 weeks)
3. ${input.expectedTime ? `IMPORTANT: Client expects timeline: ${input.expectedTime}. Try to align with this, but be realistic - if their expectation is too short for the complexity, explain why and propose a realistic alternative.` : ''}
4. Calculate REALISTIC costs based on actual development hours needed
5. ${input.minimumBudget ? `IMPORTANT: Client has minimum budget of ${input.currency || 'USD'} ${input.minimumBudget.toLocaleString()}. Ensure the proposal meets or exceeds this budget while being realistic.` : ''}
6. Only include investment items that make sense for the project scale
7. A simple chatbot should cost $5k-15k, NOT $50k+
8. A complex enterprise system can cost $50k-100k+
9. Timeline phases should reflect ACTUAL work being done
10. Project scope should match the ACTUAL requirements described
11. Use Helium AI features appropriately - don't over-engineer simple needs
12. All amounts must be realistic and make business sense
13. Technology stack MUST mention Helium AI platform
14. All content should be professional and tailored to Neural Arc's standards
15. ${input.country ? `Consider ${input.country} market context and pricing expectations when creating the proposal.` : ''}

Return ONLY the JSON object, nothing else.`

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Clean the response - remove markdown code blocks if present
    let cleanedText = text.trim()
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json\n?/, '').replace(/\n?```$/, '')
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```\n?/, '').replace(/\n?```$/, '')
    }

    // Parse JSON
    const proposal = JSON.parse(cleanedText) as GeneratedProposal

    // Validate structure
    if (!proposal.executiveSummary || !Array.isArray(proposal.projectScope)) {
      throw new Error('Invalid proposal structure returned from AI')
    }

    return proposal
  } catch (error) {
    console.error('Gemini API error:', error)
    if (error instanceof SyntaxError) {
      throw new Error('Failed to parse AI response. The AI may have returned invalid JSON.')
    }
    throw error
  }
}
