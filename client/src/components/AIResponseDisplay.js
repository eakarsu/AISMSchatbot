import React from 'react';
import ReactMarkdown from 'react-markdown';
import { FiCpu, FiZap, FiInfo } from 'react-icons/fi';

export default function AIResponseDisplay({ content, model, usage, loading, title }) {
  if (loading) {
    return (
      <div className="ai-response-container loading">
        <div className="ai-header">
          <FiCpu className="ai-icon spinning" />
          <span>AI is analyzing...</span>
        </div>
        <div className="ai-loading-animation">
          <div className="pulse-dot"></div>
          <div className="pulse-dot"></div>
          <div className="pulse-dot"></div>
        </div>
      </div>
    );
  }

  if (!content) return null;

  return (
    <div className="ai-response-container">
      <div className="ai-header">
        <FiCpu className="ai-icon" />
        <span className="ai-title">{title || 'AI Analysis'}</span>
        <div className="ai-badge">Powered by AI</div>
      </div>
      <div className="ai-content">
        <ReactMarkdown
          components={{
            h1: ({ children }) => <h2 className="ai-section-title">{children}</h2>,
            h2: ({ children }) => <h3 className="ai-section-subtitle">{children}</h3>,
            h3: ({ children }) => <h4 className="ai-section-heading">{children}</h4>,
            p: ({ children }) => <p className="ai-paragraph">{children}</p>,
            ul: ({ children }) => <ul className="ai-list">{children}</ul>,
            ol: ({ children }) => <ol className="ai-list-ordered">{children}</ol>,
            li: ({ children }) => <li className="ai-list-item">{children}</li>,
            strong: ({ children }) => <strong className="ai-bold">{children}</strong>,
            code: ({ children }) => <code className="ai-code">{children}</code>,
            blockquote: ({ children }) => <blockquote className="ai-quote">{children}</blockquote>,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
      {(model || usage) && (
        <div className="ai-footer">
          {model && <span className="ai-model"><FiZap /> {model}</span>}
          {usage && (
            <span className="ai-usage">
              <FiInfo /> Tokens: {usage.prompt_tokens || 0} in / {usage.completion_tokens || 0} out
            </span>
          )}
        </div>
      )}
    </div>
  );
}
