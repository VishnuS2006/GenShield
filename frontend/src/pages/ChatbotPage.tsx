import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  MessageSquarePlus,
  SendHorizontal,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Search,
  Lock,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useChat } from '../hooks/useChat';
import { formatShortDate, truncateText } from '../utils/formatters';

const SUGGESTED_PROMPTS = [
  'What are our strongest performing products?',
  'Summarize our current business performance',
  'What are our major operational priorities?',
  'What is the status of Atlas Cloud adoption in regional markets?',
];

export const ChatbotPage: React.FC = () => {
  const {
    conversations,
    activeConversation,
    isLoading,
    isSending,
    error,
    selectConversation,
    createConversation,
    sendMessage,
  } = useChat();

  const [draft, setDraft] = useState('');
  const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages, isSending]);

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

  const handleRetry = async () => {
    if (!activeConversation || activeConversation.messages.length === 0) return;
    const lastUserMessage = [...activeConversation.messages].reverse().find((m) => m.role === 'USER');
    if (lastUserMessage) {
      await handleSend(lastUserMessage.content);
    }
  };

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.last_message_preview && c.last_message_preview.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      {/* Restrained Page Header */}
      <PageHeader
        title="AI Assistant"
        subtitle="Enterprise company AI assistant protected by GenShield's automatic semantic security layer"
        icon={Bot}
        badge="Protected Session"
        actions={
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Security: Active</span>
            </div>
            <button
              type="button"
              onClick={createConversation}
              className="inline-flex items-center gap-2 rounded-xl bg-cyber-800 hover:bg-cyber-750 border border-cyber-700 px-3.5 py-2 text-xs font-medium text-white transition shadow-sm"
            >
              <MessageSquarePlus className="h-4 w-4 text-shield-cyan" />
              <span>New Chat</span>
            </button>
          </div>
        }
      />

      {error && <ErrorMessage message={error} />}

      {/* Main Chat Grid */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
        {/* Left Panel: Conversation History */}
        <aside className="cyber-card flex flex-col h-[78vh] overflow-hidden">
          <div className="p-3 border-b border-cyber-800 space-y-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-cyber-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-cyber-950/80 border border-cyber-750 text-cyber-100 placeholder-cyber-500 focus:border-shield-cyan focus:outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {isLoading ? (
              <div className="flex min-h-[160px] items-center justify-center">
                <LoadingSpinner size="md" label="Loading conversations..." />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="py-8 text-center text-xs text-cyber-400">
                {searchQuery ? 'No matching conversations' : 'No conversations yet'}
              </div>
            ) : (
              filteredConversations.map((conversation) => {
                const isActive = activeConversation?.id === conversation.id;
                return (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => selectConversation(conversation.id)}
                    className={`w-full text-left p-2.5 rounded-xl transition group ${
                      isActive
                        ? 'bg-shield-cyan/10 border border-shield-cyan/40 text-white'
                        : 'hover:bg-cyber-850 border border-transparent text-cyber-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-xs font-semibold text-white">
                        {conversation.title || 'New conversation'}
                      </p>
                    </div>
                    <p className="mt-1 text-[11px] text-cyber-400 line-clamp-1">
                      {conversation.last_message_preview || 'Ready for a new question'}
                    </p>
                    <p className="mt-1.5 text-[10px] text-cyber-500 font-mono">
                      {formatShortDate(conversation.updated_at)}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Right Panel: Primary Chat Canvas */}
        <section className="cyber-card flex flex-col h-[78vh] overflow-hidden">
          {/* Top Bar of Active Conversation */}
          <div className="px-5 py-3.5 border-b border-cyber-800 flex items-center justify-between">
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-white truncate">
                {activeConversation?.title || 'New conversation'}
              </h2>
              <p className="text-xs text-cyber-400 truncate">
                Company Knowledge Assistant • Autonomous Semantic Security
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-cyber-400 font-mono">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Protected</span>
            </div>
          </div>

          {/* Chat Messages Stream */}
          <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
            {!activeConversation || activeConversation.messages.length === 0 ? (
              /* Welcome Empty State */
              <div className="flex flex-col items-center justify-center h-full max-w-xl mx-auto text-center space-y-6 py-8 animate-fadeIn">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-shield-cyan/20 to-shield-indigo/20 border border-shield-cyan/40 flex items-center justify-center text-shield-cyan shadow-glow-cyan">
                  <Sparkles className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">GenShield AI Assistant</h3>
                  <p className="text-sm text-cyber-300 max-w-md">
                    Your secure company AI assistant. Ask questions about company operations, products, markets, performance, and internal knowledge.
                  </p>
                </div>

                <div className="w-full space-y-2.5 pt-2">
                  <p className="text-xs font-semibold text-cyber-400 uppercase tracking-wider text-left">
                    Suggested Questions
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                    {SUGGESTED_PROMPTS.map((promptText, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSend(promptText)}
                        className="p-3 rounded-xl bg-cyber-900/80 hover:bg-cyber-850 border border-cyber-800 hover:border-shield-cyan/50 text-xs text-cyber-200 hover:text-white transition group flex items-start gap-2"
                      >
                        <span className="text-shield-cyan font-mono">•</span>
                        <span>{promptText}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              activeConversation.messages.map((message) => {
                const isUser = message.role === 'USER';
                const isBlock = message.decision === 'BLOCK';
                const isWarn = message.decision === 'WARN';

                return (
                  <div
                    key={message.id}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'} group animate-fadeIn`}
                  >
                    <div
                      className={`max-w-2xl rounded-2xl p-4 transition-all ${
                        isUser
                          ? 'bg-cyber-800 text-white border border-cyber-700/80'
                          : isBlock
                          ? 'bg-rose-950/30 text-rose-100 border border-rose-800/60'
                          : isWarn
                          ? 'bg-cyber-900 text-cyber-100 border border-amber-800/40'
                          : 'bg-cyber-900/90 text-cyber-100 border border-cyber-800'
                      }`}
                    >
                      {/* Message Metadata Header */}
                      <div className="flex items-center justify-between gap-4 mb-2 pb-1.5 border-b border-cyber-800/40 text-[11px] text-cyber-400">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-cyber-200">
                            {isUser ? 'You' : 'GenShield AI'}
                          </span>
                          <span>•</span>
                          <span className="font-mono">{formatShortDate(message.created_at)}</span>
                        </div>

                        {!isUser && (
                          <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition">
                            <button
                              type="button"
                              onClick={() => handleCopy(message.id, message.content)}
                              title="Copy response"
                              className="p-1 hover:text-white text-cyber-400 rounded transition"
                            >
                              {copiedMessageId === message.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Message Body */}
                      {isBlock ? (
                        /* Blocked Response Banner */
                        <div className="space-y-2 py-1">
                          <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs">
                            <Lock className="w-4 h-4" />
                            <span>Response blocked</span>
                          </div>
                          <p className="text-xs text-rose-200/90 leading-relaxed">
                            GenShield detected that this response may contain protected company information. Security verification prevented the response from being released.
                          </p>
                          <div className="text-[10px] font-mono text-rose-300/70 pt-1">
                            Status: Exfiltration Prevented • Risk: High
                          </div>
                        </div>
                      ) : (
                        <div>
                          {isWarn && (
                            /* Subtle Warning Banner */
                            <div className="mb-3 p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/50 flex items-start gap-2 text-xs text-amber-200">
                              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                              <div>
                                <span className="font-semibold text-amber-300">Security warning: </span>
                                <span>This response may contain information associated with protected company knowledge.</span>
                              </div>
                            </div>
                          )}

                          <div className="text-sm leading-relaxed whitespace-pre-wrap font-normal text-cyber-100">
                            {message.content}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {/* Thinking / Loading State */}
            {isSending && (
              <div className="flex justify-start animate-fadeIn">
                <div className="rounded-2xl bg-cyber-900 border border-cyber-800 px-4 py-3 text-xs text-cyber-300 flex items-center gap-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-shield-cyan animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-shield-cyan animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-shield-cyan animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span>GenShield is thinking & verifying safety...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Input Form */}
          <div className="p-4 border-t border-cyber-800 bg-cyber-950/50">
            <div className="rounded-2xl bg-cyber-900 border border-cyber-750 p-2.5 focus-within:border-shield-cyan transition shadow-inner">
              <textarea
                ref={textareaRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
                placeholder="Ask your company AI assistant (e.g. business operations, markets, performance)..."
                disabled={isSending}
                className="w-full resize-none bg-transparent px-2 text-sm text-cyber-100 placeholder-cyber-500 focus:outline-none leading-relaxed"
              />
              <div className="mt-2 flex items-center justify-between px-2 pt-1 border-t border-cyber-800/50">
                <div className="flex items-center gap-2 text-[11px] text-cyber-500">
                  <span className="hidden sm:inline">Enter to send • Shift+Enter for new line</span>
                  {activeConversation && activeConversation.messages.length > 0 && (
                    <button
                      type="button"
                      onClick={handleRetry}
                      disabled={isSending}
                      title="Retry last question"
                      className="hover:text-cyber-300 transition flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Retry</span>
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleSend()}
                  disabled={isSending || !draft.trim()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-shield-cyan hover:bg-shield-cyanDark px-3.5 py-1.5 text-xs font-semibold text-cyber-950 transition disabled:opacity-30 disabled:cursor-not-allowed shadow-glow-cyan"
                >
                  <span>Send</span>
                  <SendHorizontal className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
