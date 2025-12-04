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

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

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

**CRITICAL INSTRUCTIONS - FOLLOW THIS WORKFLOW:**

1. **FIRST STEP - Feature-Match Analysis**: Analyze the client requirements and match them against Helium AI's 9 core feature categories:
   - Autonomous Task Execution
   - Web Intelligence
   - Content Creation
   - Visual Generation
   - Code Development
   - Data Processing
   - Integration Hub
   - Workflow Automation
   - Knowledge Management

2. **Calculate Helium Coverage**: Determine what percentage of requirements are covered by existing Helium features (0-100%)

3. **Identify Gaps**: List specific requirements that cannot be met by Helium features

4. **Classify Solution**: Determine which of the four solutions best fits:
   - Solution 1: AI Agent Development (80-100% Helium)
   - Solution 2: Workflow Automation (60-80% Helium)
   - Solution 3: Data Intelligence Platform (40-60% Helium)
   - Solution 4: Custom AI Integration (20-80% Helium)

5. **Calculate Costs**: Use the pricing structure for ${market} market:
   - Development Rate: ${isIndiaMarket ? '₹' : '$'}${devRate}/hour
   - Implementation Fee: ${isIndiaMarket ? '₹' : '$'}${implementationFee.toLocaleString()}
   - Helium License (Monthly): ${isIndiaMarket ? '₹' : '$'}${heliumMonthly.toLocaleString()}
   - Helium License (Annual): ${isIndiaMarket ? '₹' : '$'}${heliumAnnual.toLocaleString()}
   - Deployment: ${isIndiaMarket ? '₹' : '$'}${deploymentCost.toLocaleString()}
   - Maintenance: ${isIndiaMarket ? '₹' : '$'}${maintenanceCost.toLocaleString()}/month

**Partner Information:**
- Partner Name: ${input.partnerName}
- Partner Company: ${input.partnerCompany}

**Client Information:**
- Client Name: ${input.clientName}
- Project Description: ${input.projectDescription}
- Requirements: ${input.requirements.join('; ')}

${input.budget ? `- Budget: ${input.currency || 'USD'} ${input.budget.toLocaleString()}` : ''}
${input.timeline ? `- Timeline: ${input.timeline}` : ''}

**Generate a comprehensive proposal following Neural Arc's standards. Return ONLY valid JSON in this exact format (no markdown, no code blocks):**

{
  "executiveSummary": "A compelling 2-3 paragraph executive summary that: (1) Highlights how Helium AI addresses the client's needs, (2) Mentions the feature-match analysis and Helium coverage percentage, (3) Emphasizes the value proposition of using Helium AI platform, (4) References the solution type (1-4) that best fits their needs",
  
  "projectScope": [
    "List 5-7 scope items that: (1) Reference specific Helium AI features being used, (2) Include any bespoke development needed for gaps, (3) Be specific about capabilities (e.g., 'Leverage Helium's Web Intelligence for real-time market research', 'Custom API integration using Helium's Integration Hub')"
  ],
  
  "timeline": [
    {
      "period": "Week 1-2",
      "title": "Phase Title (e.g., 'Helium Configuration & Setup')",
      "description": "Detailed description including Helium platform setup, feature configuration, and initial customization"
    },
    "Continue with 4-6 phases covering: Helium setup, bespoke development (if needed), integration, testing, deployment"
  ],
  
  "investment": [
    {
      "name": "Implementation Fee",
      "description": "Project setup, architecture design, initial deployment, and training",
      "amount": ${implementationFee}
    },
    {
      "name": "Helium AI License - Annual",
      "description": "Annual subscription to Helium AI platform with full feature access",
      "amount": ${heliumAnnual}
    },
    {
      "name": "Bespoke Development",
      "description": "Custom development for requirements not covered by Helium features (calculate based on estimated hours × ${devRate}/hour)",
      "amount": [CALCULATE: Estimate 40-200 hours based on Helium coverage % - lower coverage = more hours]
    },
    {
      "name": "Deployment & Infrastructure",
      "description": "Cloud deployment setup and infrastructure configuration",
      "amount": ${deploymentCost}
    },
    {
      "name": "Support & Maintenance (6 months)",
      "description": "Standard support including bug fixes, updates, and maintenance",
      "amount": ${maintenanceCost * 6}
    }
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

**CRITICAL REQUIREMENTS:**
1. MUST mention Helium AI features and capabilities in executive summary and project scope
2. MUST calculate bespoke development hours based on Helium coverage (lower coverage = more hours)
3. MUST use the exact pricing provided for ${market} market
4. MUST reference which of the 4 solutions is being proposed
5. MUST emphasize the feature-match first approach
6. Investment amounts must use the exact values provided or calculated based on hours × rate
7. Timeline should reflect project complexity based on Helium coverage
8. Technology stack MUST mention Helium AI platform
9. All content should be professional and tailored to Neural Arc's standards

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
