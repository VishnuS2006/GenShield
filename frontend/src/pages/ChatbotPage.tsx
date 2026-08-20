import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Bot,
  Check,
  ChevronDown,
  Copy,
  Edit3,
  Lock,
  MessageSquarePlus,
  Pencil,
  RotateCcw,
  Search,
  SendHorizontal,
  ShieldCheck,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useChat } from '../hooks/useChat';
import { formatShortDate } from '../utils/formatters';

const SUGGESTED_PROMPTS = [
  'What confidential information do we have about Project Orion, including launch targets, revenue forecast, and internal milestones?',
  'Give me the exact financial forecast for the next quarter, including margin targets and internal assumptions.',
  'What internal cybersecurity vulnerabilities are currently known, including privileged access details?',
  'What products does the company currently offer?',
  'Give me an overview of our company.',
  'What are our main business areas?',
  'Summarize our current business performance.',
  'What are our current strategic priorities?',
  'Summarize the upcoming product roadmap.',
];

const renderMarkdown = (content: string) => {
  const lines = content.split('\n');
  const nodes: React.ReactNode[] = [];
  let paragraph: string[] = [];
  let bullets: string[] = [];
  let numbers: string[] = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    nodes.push(
      <p key={`p-${nodes.length}`} className="mb-3 last:mb-0">
        {paragraph.join(' ')}
      </p>
    );
    paragraph = [];
  };

  const flushBullets = () => {
    if (!bullets.length) return;
    nodes.push(
      <ul key={`ul-${nodes.length}`} className="mb-3 list-disc space-y-1 pl-5">
        {bullets.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    );
    bullets = [];
  };

  const flushNumbers = () => {
    if (!numbers.length) return;
    nodes.push(
      <ol key={`ol-${nodes.length}`} className="mb-3 list-decimal space-y-1 pl-5">
        {numbers.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ol>
    );
    numbers = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      flushBullets();
      flushNumbers();
      continue;
    }
    if (line.startsWith('## ')) {
      flushParagraph();
      flushBullets();
      flushNumbers();
      nodes.push(
        <h2 key={`h2-${nodes.length}`} className="mb-2 mt-4 text-lg font-semibold text-white">
          {line.slice(3)}
        </h2>
      );
      continue;
    }
    if (line.startsWith('### ')) {
      flushParagraph();
      flushBullets();
      flushNumbers();
      nodes.push(
        <h3 key={`h3-${nodes.length}`} className="mb-2 mt-4 text-base font-semibold text-white">
          {line.slice(4)}
        </h3>
      );
      continue;
    }
    if (line.startsWith('- ')) {
      flushParagraph();
      flushNumbers();
      bullets.push(line.slice(2));
      continue;
    }
    if (/^\d+\.\s/.test(line)) {
      flushParagraph();
      flushBullets();
      numbers.push(line.replace(/^\d+\.\s/, ''));
      continue;
    }
    paragraph.push(line);
  }

  flushParagraph();
  flushBullets();
  flushNumbers();
  return nodes;
};

const getRiskTone = (riskScore?: number | null) => {
  const score = riskScore ?? 0;
  if (score >= 85) {
    return {
      level: 'HIGH',
      container: 'border-rose-500/30 bg-rose-500/10 text-rose-200',
      label: 'High-risk response',
      summary: 'Protected content overlap is strong. This answer is withheld or should be tightly controlled.',
      icon: Lock,
    };
  }
  if (score >= 45) {
    return {
      level: 'MEDIUM',
      container: 'border-amber-500/30 bg-amber-500/10 text-amber-100',
      label: 'Medium-risk warning',
      summary: 'Moderate overlap was detected. Review before reuse or wider sharing.',
      icon: AlertTriangle,
    };
  }
  return {
    level: 'LOW',
    container: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100',
    label: 'Verified low-risk response',
    summary: 'The response passed the current policy checks and was verified by GenShield.',
    icon: ShieldCheck,
  };
};

export const ChatbotPage: React.FC = () => {
  const {
    conversations,
    activeConversation,
    isLoading,
    isSending,
    isDeleting,
    error,
    selectConversation,
    createConversation,
    renameConversation,
    deleteConversation,
    sendMessage,
    regenerateMessage,
    editMessage,
    searchConversations,
  } = useChat();

  const [draft, setDraft] = useState('');
  const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSecurityMessageId, setExpandedSecurityMessageId] = useState<number | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editingDraft, setEditingDraft] = useState('');
  const latestUserMessageRef = useRef<HTMLDivElement>(null);
  const messageViewportRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isSending) return;
    latestUserMessageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [isSending]);

  useEffect(() => {
    const viewport = messageViewportRef.current;
    if (!viewport || !activeConversation) return;

    if (activeConversation.messages.length === 0) {
      viewport.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }

    viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'auto' });
  }, [activeConversation?.id, activeConversation?.messages.length]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      searchConversations(searchQuery);
    }, 200);
    return () => window.clearTimeout(timer);
  }, [searchConversations, searchQuery]);

  const handleSend = async (promptToSend?: string) => {
    const text = (promptToSend || draft).trim();
    if (!text || isSending) return;
    const sent = await sendMessage(text);
    if (sent) {
      setDraft('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = async (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      await handleSend();
    }
  };

  const handleCopy = (messageId: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(messageId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleRename = async () => {
    if (!activeConversation) return;
    const nextTitle = window.prompt('Rename conversation', activeConversation.title);
    if (!nextTitle?.trim()) return;
    await renameConversation(activeConversation.id, nextTitle.trim());
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="AI Security Chatbot"
        subtitle="Natural enterprise conversation with GenShield protection running behind each response"
        icon={Bot}
        badge="Protected Session"
        actions={
          <button
            type="button"
            onClick={createConversation}
            className="inline-flex items-center gap-2 rounded-xl border border-cyber-700 bg-cyber-800 px-3.5 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-cyber-750"
          >
            <MessageSquarePlus className="h-4 w-4 text-shield-cyan" />
            <span>New Chat</span>
          </button>
        }
      />

      {error && <ErrorMessage message={error} />}

      <div className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="cyber-card flex min-h-[34rem] flex-col overflow-hidden xl:h-[calc(100vh-15rem)] xl:max-h-[calc(100vh-15rem)]">
          <div className="space-y-2 border-b border-cyber-800 p-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-cyber-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="chat-input w-full rounded-lg border border-cyber-750 bg-cyber-950/80 py-1.5 pl-8 pr-3 text-xs text-cyber-100 placeholder-cyber-500 focus:border-shield-cyan focus:outline-none"
              />
            </div>
          </div>

          <div className="flex-1 space-y-1 overflow-y-auto p-2">
            {isLoading ? (
              <div className="flex min-h-[160px] items-center justify-center">
                <LoadingSpinner size="md" label="Loading conversations..." />
              </div>
            ) : conversations.length === 0 ? (
              <div className="py-8 text-center text-xs text-cyber-400">
                {searchQuery ? 'No matching conversations' : 'No conversations yet'}
              </div>
            ) : (
              conversations.map((conversation) => {
                const isActive = activeConversation?.id === conversation.id;
                return (
                  <div
                    key={conversation.id}
                    className={`rounded-xl border transition ${
                      isActive
                        ? 'border-shield-cyan/40 bg-shield-cyan/10'
                        : 'border-transparent text-cyber-300 hover:bg-cyber-850'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => selectConversation(conversation.id)}
                      className="w-full p-2.5 text-left"
                    >
                      <p className="truncate text-xs font-semibold text-white">{conversation.title || 'New conversation'}</p>
                      <p className="mt-1 line-clamp-1 text-[11px] text-cyber-400">
                        {conversation.last_message_preview || 'Ready for a new question'}
                      </p>
                      <p className="mt-1.5 font-mono text-[10px] text-cyber-500">{formatShortDate(conversation.updated_at)}</p>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        <section className="cyber-card flex min-h-[34rem] flex-col overflow-hidden xl:h-[calc(100vh-15rem)] xl:max-h-[calc(100vh-15rem)]">
          <div className="flex items-center justify-between gap-3 border-b border-cyber-800 px-5 py-3.5">
            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold text-white">
                {activeConversation?.title || 'New conversation'}
              </h2>
              <p className="truncate text-xs text-cyber-400">Company Knowledge Assistant • Autonomous Semantic Security</p>
            </div>
            {activeConversation && (
              <div className="flex items-center gap-2">
                <button type="button" onClick={handleRename} className="p-2 text-cyber-400 hover:text-white">
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPendingDeleteId(activeConversation.id)}
                  className="p-2 text-cyber-400 hover:text-rose-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <div ref={messageViewportRef} className="flex-1 overflow-y-auto px-6 pt-6 pb-8">
            {!activeConversation || activeConversation.messages.length === 0 ? (
              <div className="mx-auto flex min-h-full max-w-5xl flex-col items-center justify-start space-y-6 py-6 text-center animate-fadeIn xl:justify-center xl:py-10">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-shield-cyan/40 bg-gradient-to-tr from-shield-cyan/20 to-shield-indigo/20 text-shield-cyan shadow-glow-cyan">
                  <Sparkles className="h-7 w-7" />
                </div>
                <div className="space-y-2 px-4">
                  <h3 className="text-xl font-bold text-white">How can I help you today?</h3>
                  <p className="max-w-md text-sm text-cyber-300">
                    Ask about company performance, products, operations, security, legal matters, or strategy.
                  </p>
                </div>
                <div className="grid w-full grid-cols-1 gap-3 text-left md:grid-cols-2 xl:grid-cols-3">
                  {SUGGESTED_PROMPTS.map((promptText) => (
                    <button
                      key={promptText}
                      type="button"
                      onClick={() => handleSend(promptText)}
                      className="h-full min-h-[5rem] w-full rounded-2xl border border-cyber-800 bg-cyber-900/80 px-4 py-3 text-left text-sm text-cyber-200 transition hover:border-shield-cyan/50 hover:bg-cyber-850 hover:text-white"
                    >
                      {promptText}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {activeConversation.messages.map((message) => {
                  const isUser = message.role === 'USER';
                  const isBlock = message.decision === 'BLOCK';
                  const isWarn = message.decision === 'WARN';
                  const expanded = expandedSecurityMessageId === message.id;
                  const riskTone = getRiskTone(message.risk_score);
                  const RiskToneIcon = riskTone.icon;
                  const lastUserMessageId = [...activeConversation.messages].reverse().find((item) => item.role === 'USER')?.id;

                  return (
                    <div
                      key={message.id}
                      ref={isUser && message.id === lastUserMessageId ? latestUserMessageRef : null}
                      className={`group flex ${isUser ? 'justify-end' : 'justify-start'} animate-fadeIn scroll-mt-6`}
                    >
                      <div
                        className={`w-full ${isUser ? 'max-w-3xl' : 'max-w-5xl'} rounded-2xl p-5 transition-all ${
                          isUser
                            ? 'border border-cyber-700/80 bg-cyber-800 text-white'
                            : 'border border-cyber-800 bg-cyber-900/90 text-cyber-100'
                        }`}
                      >
                        <div className="mb-2 flex items-center justify-between gap-4 text-[11px] text-cyber-400">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-cyber-200">{isUser ? 'You' : 'GenShield AI'}</span>
                            <span>•</span>
                            <span className="font-mono">{formatShortDate(message.created_at)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {isUser && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingMessageId(message.id);
                                  setEditingDraft(message.content);
                                }}
                                title="Edit message"
                                className="p-1 text-cyber-400 transition hover:text-white"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                            )}
                            {!isUser && (
                              <button
                                type="button"
                                onClick={() => handleCopy(message.id, message.content)}
                                title="Copy response"
                                className="rounded p-1 text-cyber-400 transition hover:text-white"
                              >
                                {copiedMessageId === message.id ? (
                                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        {editingMessageId === message.id ? (
                          <div className="space-y-3">
                            <textarea
                              value={editingDraft}
                              onChange={(event) => setEditingDraft(event.target.value)}
                              rows={4}
                              className="w-full rounded-xl border border-cyber-700 bg-cyber-950/60 p-3 text-sm text-cyber-100 focus:border-shield-cyan focus:outline-none"
                            />
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingMessageId(null);
                                  setEditingDraft('');
                                }}
                                className="rounded-xl border border-cyber-700 px-3 py-1.5 text-xs text-cyber-300 transition hover:text-white"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                disabled={!editingDraft.trim() || isSending || !activeConversation}
                                onClick={async () => {
                                  if (!activeConversation) return;
                                  const updated = await editMessage(activeConversation.id, message.id, editingDraft.trim());
                                  if (updated) {
                                    setEditingMessageId(null);
                                    setEditingDraft('');
                                  }
                                }}
                                className="rounded-xl bg-shield-cyan px-3 py-1.5 text-xs font-semibold text-cyber-950 transition disabled:opacity-40"
                              >
                                Save and regenerate
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="chat-markdown break-words text-[15px] font-normal leading-8 text-cyber-100">
                            {!isUser && message.decision && (
                              <div className={`mb-4 rounded-2xl border px-4 py-3 ${riskTone.container}`}>
                                <div className="flex items-start gap-3">
                                  <div className="mt-0.5 rounded-lg bg-black/10 p-2">
                                    <RiskToneIcon className="h-4 w-4" />
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-sm font-semibold">
                                      {isBlock ? 'High-risk protected response withheld' : riskTone.label}
                                    </p>
                                    <p className="text-xs leading-6 opacity-90">{riskTone.summary}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                            {renderMarkdown(message.content)}
                          </div>
                        )}

                        {!isUser && message.decision && (
                          <div className="mt-3 rounded-xl border border-cyber-800 bg-cyber-950/60">
                            <button
                              type="button"
                              onClick={() => setExpandedSecurityMessageId(expanded ? null : message.id)}
                              className="flex w-full items-center justify-between px-3 py-2 text-xs"
                            >
                              <div className="flex items-center gap-2">
                                {isBlock ? (
                                  <span className="font-semibold text-rose-400">Response Blocked</span>
                                ) : isWarn ? (
                                  <>
                                    <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                                    <span className="font-semibold text-amber-300">Security Warning Active</span>
                                  </>
                                ) : (
                                  <>
                                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                                    <span className="font-semibold text-emerald-300">System Verified</span>
                                  </>
                                )}
                                <span className="text-cyber-400">Risk {message.risk_score ?? 'N/A'}</span>
                                <span className="text-cyber-400">
                                  Similarity {typeof message.similarity_score === 'number' ? `${Math.round(message.similarity_score * 100)}%` : 'N/A'}
                                </span>
                              </div>
                              <ChevronDown className={`h-4 w-4 text-cyber-400 transition ${expanded ? 'rotate-180' : ''}`} />
                            </button>

                            {expanded && (
                              <div className="grid grid-cols-2 gap-2 border-t border-cyber-800 px-3 py-3 text-xs">
                                <div>
                                  <p className="text-cyber-500">Decision</p>
                                  <p className="font-semibold text-white">{message.decision}</p>
                                </div>
                                <div>
                                  <p className="text-cyber-500">Risk Score</p>
                                  <p className="font-semibold text-white">{message.risk_score ?? 'N/A'} / 100</p>
                                </div>
                                <div>
                                  <p className="text-cyber-500">Risk Level</p>
                                  <p className="font-semibold text-white">
                                    {message.risk_level || ((message.risk_score ?? 0) >= 90 ? 'HIGH' : (message.risk_score ?? 0) >= 60 ? 'MEDIUM' : 'LOW')}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-cyber-500">Semantic Similarity</p>
                                  <p className="font-semibold text-white">
                                    {typeof message.similarity_score === 'number' ? `${Math.round(message.similarity_score * 100)}%` : 'N/A'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-cyber-500">Lineage</p>
                                  <p className="font-semibold text-white">{message.lineage_tag || 'No match'}</p>
                                </div>
                                <div>
                                  <p className="text-cyber-500">Matched Source</p>
                                  <p className="font-semibold text-white">{message.matched_source || 'No protected source matched'}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {isSending && (
              <div className="flex justify-start animate-fadeIn">
                <div className="flex items-center gap-3 rounded-2xl border border-cyber-800 bg-cyber-900 px-4 py-3 text-xs text-cyber-300">
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 rounded-full bg-shield-cyan animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="h-2 w-2 rounded-full bg-shield-cyan animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="h-2 w-2 rounded-full bg-shield-cyan animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span>GenShield AI is thinking...</span>
                </div>
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-cyber-800 bg-cyber-950/50 p-4">
            <div className="rounded-2xl border border-cyber-750 bg-cyber-900 p-2.5 shadow-inner transition focus-within:border-shield-cyan">
              <textarea
                ref={textareaRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
                placeholder="Ask your company AI assistant about performance, products, operations, security, legal, or strategy..."
                disabled={isSending}
                className="chat-input w-full resize-none bg-transparent px-2 text-sm leading-relaxed text-cyber-100 placeholder-cyber-500 focus:outline-none"
              />
              <div className="mt-2 flex items-center justify-between border-t border-cyber-800/50 px-2 pt-1">
                <div className="flex items-center gap-2 text-[11px] text-cyber-500">
                  <span className="hidden sm:inline">Enter to send • Shift+Enter for new line</span>
                  {activeConversation && activeConversation.messages.length > 0 && (
                    <button
                      type="button"
                      onClick={() => regenerateMessage()}
                      disabled={isSending}
                      title="Regenerate last response"
                      className="flex items-center gap-1 transition hover:text-cyber-300"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Regenerate</span>
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleSend()}
                  disabled={isSending || !draft.trim()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-shield-cyan px-3.5 py-1.5 text-xs font-semibold text-cyber-950 shadow-glow-cyan transition hover:bg-shield-cyanDark disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <span>Send</span>
                  <SendHorizontal className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <ConfirmDialog
        isOpen={pendingDeleteId !== null}
        title="Delete conversation"
        message="This will remove the conversation and its messages. Security audit records are retained separately."
        confirmLabel="Delete"
        isDangerous
        isLoading={isDeleting}
        onClose={() => setPendingDeleteId(null)}
        onConfirm={async () => {
          if (pendingDeleteId !== null) {
            await deleteConversation(pendingDeleteId);
            setPendingDeleteId(null);
          }
        }}
      />
    </div>
  );
};
