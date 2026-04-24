const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const https = require('https');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

function callOpenRouter(messages) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5',
      messages: messages,
      max_tokens: 2000,
      temperature: 0.7
    });

    const options = {
      hostname: 'openrouter.ai',
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'SNAP Benefits Admin'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(new Error('Failed to parse AI response'));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// AI Eligibility Analysis
router.post('/eligibility-check', auth, async (req, res) => {
  try {
    const { householdSize, monthlyIncome, assets, state, programType, employmentStatus, dependents } = req.body;
    const messages = [
      {
        role: 'system',
        content: 'You are an expert benefits eligibility analyst for US government assistance programs. Provide detailed, structured analysis with clear recommendations. Format your response with sections: ELIGIBILITY ASSESSMENT, KEY FACTORS, RECOMMENDED BENEFITS, ESTIMATED MONTHLY BENEFIT, and NEXT STEPS. Be specific with dollar amounts and program details.'
      },
      {
        role: 'user',
        content: `Analyze eligibility for the following applicant:\n- Program: ${programType || 'SNAP'}\n- Household Size: ${householdSize}\n- Monthly Income: $${monthlyIncome}\n- Total Assets: $${assets || 'Not provided'}\n- State: ${state || 'Not provided'}\n- Employment Status: ${employmentStatus || 'Not provided'}\n- Dependents: ${dependents || 'Not provided'}\n\nProvide a comprehensive eligibility assessment including estimated benefit amounts based on current federal poverty guidelines.`
      }
    ];
    const result = await callOpenRouter(messages);
    res.json({ analysis: result.choices?.[0]?.message?.content || 'Unable to generate analysis', model: result.model, usage: result.usage });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI Application Assistant
router.post('/application-help', auth, async (req, res) => {
  try {
    const { question, context } = req.body;
    const messages = [
      {
        role: 'system',
        content: 'You are a helpful assistant for a government benefits application system. Help caseworkers and applicants understand the application process, required documents, eligibility criteria, and program details for SNAP, TANF, WIC, Medicaid, Housing Assistance, LIHEAP, and Child Care Assistance programs. Provide clear, empathetic, and actionable guidance. Format responses with clear sections and bullet points.'
      },
      {
        role: 'user',
        content: `Context: ${context || 'General inquiry'}\n\nQuestion: ${question}`
      }
    ];
    const result = await callOpenRouter(messages);
    res.json({ response: result.choices?.[0]?.message?.content || 'Unable to generate response', model: result.model, usage: result.usage });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI Case Summary
router.post('/case-summary', auth, async (req, res) => {
  try {
    const { caseDetails, applicantInfo, documents, history } = req.body;
    const messages = [
      {
        role: 'system',
        content: 'You are a case management analyst. Generate comprehensive case summaries with clear sections: CASE OVERVIEW, APPLICANT PROFILE, DOCUMENT STATUS, RISK ASSESSMENT, RECOMMENDED ACTIONS, and TIMELINE. Be thorough but concise.'
      },
      {
        role: 'user',
        content: `Generate a detailed case summary:\n\nCase Details: ${JSON.stringify(caseDetails)}\nApplicant Info: ${JSON.stringify(applicantInfo)}\nDocuments: ${JSON.stringify(documents || [])}\nHistory: ${JSON.stringify(history || [])}`
      }
    ];
    const result = await callOpenRouter(messages);
    res.json({ summary: result.choices?.[0]?.message?.content || 'Unable to generate summary', model: result.model, usage: result.usage });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI Document Review
router.post('/document-review', auth, async (req, res) => {
  try {
    const { documentType, applicantInfo, programType } = req.body;
    const messages = [
      {
        role: 'system',
        content: 'You are a document verification specialist for government benefits programs. Analyze document requirements and provide guidance on what documents are needed, common issues to watch for, and verification procedures. Format with sections: REQUIRED DOCUMENTS, VERIFICATION CHECKLIST, COMMON ISSUES, and RECOMMENDATIONS.'
      },
      {
        role: 'user',
        content: `Review document requirements for:\n- Document Type: ${documentType}\n- Program: ${programType || 'SNAP'}\n- Applicant Info: ${JSON.stringify(applicantInfo || {})}\n\nProvide detailed document verification guidance.`
      }
    ];
    const result = await callOpenRouter(messages);
    res.json({ review: result.choices?.[0]?.message?.content || 'Unable to generate review', model: result.model, usage: result.usage });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI Benefits Calculator
router.post('/benefits-calculator', auth, async (req, res) => {
  try {
    const { householdSize, monthlyIncome, rent, utilities, medicalExpenses, childCare, state } = req.body;
    const messages = [
      {
        role: 'system',
        content: 'You are a benefits calculation expert. Calculate estimated benefit amounts for various programs based on household information. Provide detailed breakdowns with sections: INCOME ANALYSIS, DEDUCTIONS, NET INCOME CALCULATION, BENEFIT ESTIMATION by program (SNAP, TANF, WIC, etc.), TOTAL ESTIMATED MONTHLY BENEFITS, and IMPORTANT NOTES. Use actual 2024/2025 federal poverty guidelines and program rules.'
      },
      {
        role: 'user',
        content: `Calculate benefits for:\n- Household Size: ${householdSize}\n- Monthly Gross Income: $${monthlyIncome}\n- Monthly Rent: $${rent || 0}\n- Monthly Utilities: $${utilities || 0}\n- Monthly Medical Expenses: $${medicalExpenses || 0}\n- Monthly Child Care: $${childCare || 0}\n- State: ${state || 'National average'}\n\nProvide comprehensive benefit calculations for all eligible programs.`
      }
    ];
    const result = await callOpenRouter(messages);
    res.json({ calculation: result.choices?.[0]?.message?.content || 'Unable to calculate benefits', model: result.model, usage: result.usage });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI Chatbot
router.post('/chat', auth, async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;
    const messages = [
      {
        role: 'system',
        content: 'You are a friendly and knowledgeable AI assistant for a government benefits administration system (SNAP, TANF, WIC, Medicaid, Housing, LIHEAP, Child Care). Help users navigate the system, answer questions about programs, explain eligibility requirements, guide through application processes, and provide general assistance. Be empathetic, clear, and helpful. Use plain language and avoid jargon. Format responses nicely with bullet points and sections where appropriate.'
      },
      ...(conversationHistory || []),
      { role: 'user', content: message }
    ];
    const result = await callOpenRouter(messages);
    res.json({ response: result.choices?.[0]?.message?.content || 'I apologize, I was unable to process your request. Please try again.', model: result.model, usage: result.usage });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// AI Report Generation
router.post('/generate-report', auth, async (req, res) => {
  try {
    const { reportType, data, dateRange } = req.body;
    const messages = [
      {
        role: 'system',
        content: 'You are a data analyst for a government benefits agency. Generate comprehensive reports with sections: EXECUTIVE SUMMARY, KEY METRICS, DETAILED ANALYSIS, TRENDS, RECOMMENDATIONS, and ACTION ITEMS. Use specific numbers and percentages. Format professionally.'
      },
      {
        role: 'user',
        content: `Generate a ${reportType || 'general'} report:\n\nData: ${JSON.stringify(data || {})}\nDate Range: ${dateRange || 'Current month'}\n\nProvide a detailed analytical report with insights and recommendations.`
      }
    ];
    const result = await callOpenRouter(messages);
    res.json({ report: result.choices?.[0]?.message?.content || 'Unable to generate report', model: result.model, usage: result.usage });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
