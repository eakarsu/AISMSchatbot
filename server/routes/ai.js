const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const https = require('https');
const { sequelize } = require('../models');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

// ─── Helpers ────────────────────────────────────────────────────────────────

function parseAIJson(raw) {
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (_) {}
  // Strip markdown fences
  const stripped = raw.replace(/```(?:json)?/gi, '').trim();
  try { return JSON.parse(stripped); } catch (_) {}
  // Find first { to last }
  const start = stripped.indexOf('{');
  const end = stripped.lastIndexOf('}');
  if (start !== -1 && end !== -1) {
    try { return JSON.parse(stripped.slice(start, end + 1)); } catch (_) {}
  }
  return null;
}

async function persistAIResult(userId, endpoint, inputData, result) {
  try {
    await sequelize.query(
      `INSERT INTO ai_results (user_id, endpoint, input_data, result, created_at)
       VALUES (:userId, :endpoint, :inputData, :result, NOW())`,
      {
        replacements: {
          userId: userId || null,
          endpoint,
          inputData: JSON.stringify(inputData),
          result: JSON.stringify(result),
        },
      }
    );
  } catch (e) {
    console.error('Failed to persist AI result:', e.message);
  }
}

function callOpenRouter(messages) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022',
      messages,
      max_tokens: 2000,
      temperature: 0.7,
    });

    const options = {
      hostname: 'openrouter.ai',
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:3000',
        'X-Title': 'SNAP Benefits Admin',
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch (e) { reject(new Error('Failed to parse AI response')); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function validate(rules) {
  return [...rules, (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
    next();
  }];
}

// ─── Routes ─────────────────────────────────────────────────────────────────

// AI Eligibility Analysis
router.post('/eligibility-check', auth, aiRateLimiter, validate([
  body('householdSize').isInt({ min: 1 }).withMessage('householdSize must be a positive integer'),
  body('monthlyIncome').isFloat({ min: 0 }).withMessage('monthlyIncome must be a non-negative number'),
]), async (req, res) => {
  try {
    const { householdSize, monthlyIncome, assets, state, programType, employmentStatus, dependents } = req.body;
    const messages = [
      {
        role: 'system',
        content: 'You are an expert benefits eligibility analyst for US government assistance programs. Provide detailed, structured analysis with clear recommendations. Format your response with sections: ELIGIBILITY ASSESSMENT, KEY FACTORS, RECOMMENDED BENEFITS, ESTIMATED MONTHLY BENEFIT, and NEXT STEPS. Be specific with dollar amounts and program details.',
      },
      {
        role: 'user',
        content: `Analyze eligibility for the following applicant:\n- Program: ${programType || 'SNAP'}\n- Household Size: ${householdSize}\n- Monthly Income: $${monthlyIncome}\n- Total Assets: $${assets || 'Not provided'}\n- State: ${state || 'Not provided'}\n- Employment Status: ${employmentStatus || 'Not provided'}\n- Dependents: ${dependents || 'Not provided'}\n\nProvide a comprehensive eligibility assessment including estimated benefit amounts based on current federal poverty guidelines.`,
      },
    ];
    const result = await callOpenRouter(messages);
    const responseData = {
      analysis: result.choices?.[0]?.message?.content || 'Unable to generate analysis',
      model: result.model,
      usage: result.usage,
    };
    await persistAIResult(req.user?.id, 'eligibility-check', req.body, responseData);
    res.json(responseData);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI Application Assistant
router.post('/application-help', auth, aiRateLimiter, validate([
  body('question').notEmpty().withMessage('question is required'),
]), async (req, res) => {
  try {
    const { question, context } = req.body;
    const messages = [
      {
        role: 'system',
        content: 'You are a helpful assistant for a government benefits application system. Help caseworkers and applicants understand the application process, required documents, eligibility criteria, and program details for SNAP, TANF, WIC, Medicaid, Housing Assistance, LIHEAP, and Child Care Assistance programs. Provide clear, empathetic, and actionable guidance. Format responses with clear sections and bullet points.',
      },
      {
        role: 'user',
        content: `Context: ${context || 'General inquiry'}\n\nQuestion: ${question}`,
      },
    ];
    const result = await callOpenRouter(messages);
    const responseData = {
      response: result.choices?.[0]?.message?.content || 'Unable to generate response',
      model: result.model,
      usage: result.usage,
    };
    await persistAIResult(req.user?.id, 'application-help', req.body, responseData);
    res.json(responseData);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI Case Summary
router.post('/case-summary', auth, aiRateLimiter, validate([
  body('caseDetails').notEmpty().withMessage('caseDetails is required'),
]), async (req, res) => {
  try {
    const { caseDetails, applicantInfo, documents, history } = req.body;
    const messages = [
      {
        role: 'system',
        content: 'You are a case management analyst. Generate comprehensive case summaries with clear sections: CASE OVERVIEW, APPLICANT PROFILE, DOCUMENT STATUS, RISK ASSESSMENT, RECOMMENDED ACTIONS, and TIMELINE. Be thorough but concise.',
      },
      {
        role: 'user',
        content: `Generate a detailed case summary:\n\nCase Details: ${JSON.stringify(caseDetails)}\nApplicant Info: ${JSON.stringify(applicantInfo)}\nDocuments: ${JSON.stringify(documents || [])}\nHistory: ${JSON.stringify(history || [])}`,
      },
    ];
    const result = await callOpenRouter(messages);
    const responseData = {
      summary: result.choices?.[0]?.message?.content || 'Unable to generate summary',
      model: result.model,
      usage: result.usage,
    };
    await persistAIResult(req.user?.id, 'case-summary', req.body, responseData);
    res.json(responseData);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI Document Review
router.post('/document-review', auth, aiRateLimiter, validate([
  body('documentType').notEmpty().withMessage('documentType is required'),
]), async (req, res) => {
  try {
    const { documentType, applicantInfo, programType } = req.body;
    const messages = [
      {
        role: 'system',
        content: 'You are a document verification specialist for government benefits programs. Analyze document requirements and provide guidance on what documents are needed, common issues to watch for, and verification procedures. Format with sections: REQUIRED DOCUMENTS, VERIFICATION CHECKLIST, COMMON ISSUES, and RECOMMENDATIONS.',
      },
      {
        role: 'user',
        content: `Review document requirements for:\n- Document Type: ${documentType}\n- Program: ${programType || 'SNAP'}\n- Applicant Info: ${JSON.stringify(applicantInfo || {})}\n\nProvide detailed document verification guidance.`,
      },
    ];
    const result = await callOpenRouter(messages);
    const responseData = {
      review: result.choices?.[0]?.message?.content || 'Unable to generate review',
      model: result.model,
      usage: result.usage,
    };
    await persistAIResult(req.user?.id, 'document-review', req.body, responseData);
    res.json(responseData);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI Benefits Calculator
router.post('/benefits-calculator', auth, aiRateLimiter, validate([
  body('householdSize').isInt({ min: 1 }).withMessage('householdSize must be a positive integer'),
  body('monthlyIncome').isFloat({ min: 0 }).withMessage('monthlyIncome must be a non-negative number'),
]), async (req, res) => {
  try {
    const { householdSize, monthlyIncome, rent, utilities, medicalExpenses, childCare, state } = req.body;
    const messages = [
      {
        role: 'system',
        content: 'You are a benefits calculation expert. Calculate estimated benefit amounts for various programs based on household information. Provide detailed breakdowns with sections: INCOME ANALYSIS, DEDUCTIONS, NET INCOME CALCULATION, BENEFIT ESTIMATION by program (SNAP, TANF, WIC, etc.), TOTAL ESTIMATED MONTHLY BENEFITS, and IMPORTANT NOTES. Use actual 2024/2025 federal poverty guidelines and program rules.',
      },
      {
        role: 'user',
        content: `Calculate benefits for:\n- Household Size: ${householdSize}\n- Monthly Gross Income: $${monthlyIncome}\n- Monthly Rent: $${rent || 0}\n- Monthly Utilities: $${utilities || 0}\n- Monthly Medical Expenses: $${medicalExpenses || 0}\n- Monthly Child Care: $${childCare || 0}\n- State: ${state || 'National average'}\n\nProvide comprehensive benefit calculations for all eligible programs.`,
      },
    ];
    const result = await callOpenRouter(messages);
    const responseData = {
      calculation: result.choices?.[0]?.message?.content || 'Unable to calculate benefits',
      model: result.model,
      usage: result.usage,
    };
    await persistAIResult(req.user?.id, 'benefits-calculator', req.body, responseData);
    res.json(responseData);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI Chatbot
router.post('/chat', auth, aiRateLimiter, validate([
  body('message').notEmpty().withMessage('message is required'),
]), async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;
    const messages = [
      {
        role: 'system',
        content: 'You are a friendly and knowledgeable AI assistant for a government benefits administration system (SNAP, TANF, WIC, Medicaid, Housing, LIHEAP, Child Care). Help users navigate the system, answer questions about programs, explain eligibility requirements, guide through application processes, and provide general assistance. Be empathetic, clear, and helpful. Use plain language and avoid jargon. Format responses nicely with bullet points and sections where appropriate.',
      },
      ...(conversationHistory || []),
      { role: 'user', content: message },
    ];
    const result = await callOpenRouter(messages);
    const responseData = {
      response: result.choices?.[0]?.message?.content || 'I apologize, I was unable to process your request. Please try again.',
      model: result.model,
      usage: result.usage,
    };
    await persistAIResult(req.user?.id, 'chat', { message }, responseData);
    res.json(responseData);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI Report Generation
router.post('/generate-report', auth, aiRateLimiter, validate([
  body('reportType').notEmpty().withMessage('reportType is required'),
]), async (req, res) => {
  try {
    const { reportType, data, dateRange } = req.body;
    const messages = [
      {
        role: 'system',
        content: 'You are a data analyst for a government benefits agency. Generate comprehensive reports with sections: EXECUTIVE SUMMARY, KEY METRICS, DETAILED ANALYSIS, TRENDS, RECOMMENDATIONS, and ACTION ITEMS. Use specific numbers and percentages. Format professionally.',
      },
      {
        role: 'user',
        content: `Generate a ${reportType} report:\n\nData: ${JSON.stringify(data || {})}\nDate Range: ${dateRange || 'Current month'}\n\nProvide a detailed analytical report with insights and recommendations.`,
      },
    ];
    const result = await callOpenRouter(messages);
    const responseData = {
      report: result.choices?.[0]?.message?.content || 'Unable to generate report',
      model: result.model,
      usage: result.usage,
    };
    await persistAIResult(req.user?.id, 'generate-report', req.body, responseData);
    res.json(responseData);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI Benefits Navigator — find ALL benefits an applicant may qualify for
router.post('/benefits-navigator', auth, aiRateLimiter, validate([
  body('householdSize').isInt({ min: 1 }).withMessage('householdSize must be a positive integer'),
  body('monthlyIncome').isFloat({ min: 0 }).withMessage('monthlyIncome must be a non-negative number'),
]), async (req, res) => {
  try {
    const { householdSize, monthlyIncome, state, employmentStatus, dependents, medicalNeeds, housingStatus } = req.body;
    const messages = [
      {
        role: 'system',
        content: 'You are a benefits navigator. Given an applicant profile, identify ALL federal/state benefit programs they may qualify for (SNAP, TANF, WIC, Medicaid, CHIP, LIHEAP, Section 8, EITC, Lifeline, Head Start, etc.). Format with sections: PROGRAMS LIKELY ELIGIBLE, PROGRAMS POSSIBLY ELIGIBLE, NOT ELIGIBLE, RECOMMENDED ORDER OF APPLICATION, and NOTES.',
      },
      {
        role: 'user',
        content: `Applicant profile:\n- Household Size: ${householdSize}\n- Monthly Income: $${monthlyIncome}\n- State: ${state || 'Not provided'}\n- Employment: ${employmentStatus || 'Not provided'}\n- Dependents: ${dependents || 'Not provided'}\n- Medical Needs: ${medicalNeeds || 'None specified'}\n- Housing: ${housingStatus || 'Not provided'}\n\nIdentify every benefit program this applicant may qualify for and prioritize the application order.`,
      },
    ];
    const result = await callOpenRouter(messages);
    const responseData = {
      navigation: result.choices?.[0]?.message?.content || 'Unable to generate navigation',
      model: result.model,
      usage: result.usage,
    };
    await persistAIResult(req.user?.id, 'benefits-navigator', req.body, responseData);
    res.json(responseData);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI Income Verification Guide — what docs to submit to verify income
router.post('/income-verification-guide', auth, aiRateLimiter, validate([
  body('incomeType').notEmpty().withMessage('incomeType is required'),
]), async (req, res) => {
  try {
    const { incomeType, employmentStatus, programType, applicantInfo } = req.body;
    const messages = [
      {
        role: 'system',
        content: 'You are an income verification expert for government benefits. Explain exactly what documentation is needed to verify a particular income type, acceptable substitutes, common reasons documents are rejected, and how to handle missing documentation. Format with sections: REQUIRED DOCUMENTS, ACCEPTABLE ALTERNATIVES, COMMON REJECTION REASONS, and TIPS FOR SUCCESS.',
      },
      {
        role: 'user',
        content: `Provide an income verification guide for:\n- Income Type: ${incomeType}\n- Employment Status: ${employmentStatus || 'Not provided'}\n- Program: ${programType || 'SNAP'}\n- Applicant Info: ${JSON.stringify(applicantInfo || {})}`,
      },
    ];
    const result = await callOpenRouter(messages);
    const responseData = {
      guide: result.choices?.[0]?.message?.content || 'Unable to generate guide',
      model: result.model,
      usage: result.usage,
    };
    await persistAIResult(req.user?.id, 'income-verification-guide', req.body, responseData);
    res.json(responseData);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI Appeal Preparation — help draft a benefits-denial appeal
router.post('/appeal-preparation', auth, aiRateLimiter, validate([
  body('denialReason').notEmpty().withMessage('denialReason is required'),
  body('programType').notEmpty().withMessage('programType is required'),
]), async (req, res) => {
  try {
    const { denialReason, programType, applicantInfo, supportingFacts, deadline } = req.body;
    const messages = [
      {
        role: 'system',
        content: 'You are a benefits appeal preparation specialist. Help applicants prepare a strong appeal of a benefits denial. Provide: APPEAL OVERVIEW, KEY ARGUMENTS, EVIDENCE TO GATHER, DRAFT APPEAL LETTER, TIMELINE/DEADLINES, and ESCALATION PATH. Be precise about due process rights and procedural requirements. Plain language.',
      },
      {
        role: 'user',
        content: `Prepare an appeal for:\n- Program: ${programType}\n- Denial Reason: ${denialReason}\n- Deadline: ${deadline || 'Not provided'}\n- Applicant Info: ${JSON.stringify(applicantInfo || {})}\n- Supporting Facts: ${supportingFacts || 'Not provided'}`,
      },
    ];
    const result = await callOpenRouter(messages);
    const responseData = {
      appeal: result.choices?.[0]?.message?.content || 'Unable to generate appeal preparation',
      model: result.model,
      usage: result.usage,
    };
    await persistAIResult(req.user?.id, 'appeal-preparation', req.body, responseData);
    res.json(responseData);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI Service Locator — find local services (food banks, healthcare, shelters)
router.post('/service-locator', auth, aiRateLimiter, validate([
  body('serviceType').notEmpty().withMessage('serviceType is required'),
  body('location').notEmpty().withMessage('location is required'),
]), async (req, res) => {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(503).json({ error: 'OPENROUTER_API_KEY is not configured' });
    }
    const { serviceType, location, urgency, householdContext, transportation } = req.body;
    const messages = [
      {
        role: 'system',
        content: 'You are a community-services navigator. Given a service type and location, list well-known local resources (food banks, free clinics, shelters, WIC offices, legal aid, etc.) the applicant can contact. Provide concrete next-step instructions. Be honest about uncertainty. Format with sections: TOP RECOMMENDED RESOURCES, ELIGIBILITY NOTES, HOW TO CONTACT, PREPARATION CHECKLIST, BACKUP OPTIONS.',
      },
      {
        role: 'user',
        content: `Locate ${serviceType} services for an applicant.\n- Location: ${location}\n- Urgency: ${urgency || 'standard'}\n- Household context: ${householdContext || 'not provided'}\n- Transportation: ${transportation || 'not provided'}\n\nProvide a prioritized resource list with concrete contact and preparation guidance.`,
      },
    ];
    const result = await callOpenRouter(messages);
    const responseData = {
      locator: result.choices?.[0]?.message?.content || 'Unable to generate service locator output',
      model: result.model,
      usage: result.usage,
    };
    await persistAIResult(req.user?.id, 'service-locator', req.body, responseData);
    res.json(responseData);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI Income Change Advisor — guide applicants when income changes mid-cycle
router.post('/income-change-advisor', auth, aiRateLimiter, validate([
  body('changeType').notEmpty().withMessage('changeType is required'),
  body('currentProgram').notEmpty().withMessage('currentProgram is required'),
]), async (req, res) => {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(503).json({ error: 'OPENROUTER_API_KEY is not configured' });
    }
    const { changeType, currentProgram, oldMonthlyIncome, newMonthlyIncome, householdSize, state, effectiveDate } = req.body;
    const messages = [
      {
        role: 'system',
        content: 'You are a benefits compliance advisor. When an applicant\'s income changes, explain reporting obligations, expected impact on existing benefits, the deadline to report, and steps to maintain or transition benefits. Format with sections: WHAT TO REPORT, REPORTING DEADLINE, EXPECTED IMPACT ON EACH BENEFIT, RECOMMENDED ACTIONS, BACKUP RESOURCES IF BENEFITS DROP.',
      },
      {
        role: 'user',
        content: `Income change scenario:\n- Change Type: ${changeType}\n- Current Program: ${currentProgram}\n- Old Monthly Income: $${oldMonthlyIncome ?? 'unknown'}\n- New Monthly Income: $${newMonthlyIncome ?? 'unknown'}\n- Household Size: ${householdSize ?? 'unknown'}\n- State: ${state || 'unknown'}\n- Effective Date: ${effectiveDate || 'unknown'}\n\nAdvise the applicant on reporting and benefit-retention strategy.`,
      },
    ];
    const result = await callOpenRouter(messages);
    const responseData = {
      advice: result.choices?.[0]?.message?.content || 'Unable to generate income change advice',
      model: result.model,
      usage: result.usage,
    };
    await persistAIResult(req.user?.id, 'income-change-advisor', req.body, responseData);
    res.json(responseData);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET AI result history
router.get('/results', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const [results] = await sequelize.query(
      `SELECT * FROM ai_results WHERE user_id = :userId ORDER BY created_at DESC LIMIT :limit OFFSET :offset`,
      { replacements: { userId: req.user.id, limit, offset } }
    );
    const [[{ count }]] = await sequelize.query(
      `SELECT COUNT(*) as count FROM ai_results WHERE user_id = :userId`,
      { replacements: { userId: req.user.id } }
    );
    res.json({
      data: results,
      pagination: { page, limit, total: parseInt(count), totalPages: Math.ceil(count / limit) },
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
