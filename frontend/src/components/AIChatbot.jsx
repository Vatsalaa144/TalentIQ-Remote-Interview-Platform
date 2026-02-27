import { useState, useRef, useEffect } from "react";
import {
  BotIcon,
  SendIcon,
  XIcon,
  SparklesIcon,
  Loader2Icon,
  ChevronDownIcon,
  Code2Icon,
  ZapIcon,
  BugIcon,
  LightbulbIcon,
  RefreshCwIcon,
} from "lucide-react";

const QUICK_ACTIONS = [
  { label: "Find bugs", icon: BugIcon, prompt: "Find any bugs or issues in my current code and explain them." },
  { label: "Explain code", icon: Code2Icon, prompt: "Explain what my current code does step by step." },
  { label: "Optimize", icon: ZapIcon, prompt: "How can I optimize this code for better time/space complexity?" },
  { label: "Hint", icon: LightbulbIcon, prompt: "Give me a small hint to solve this problem without spoiling the full answer." },
];

function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-2 ${isUser ? "flex-row-reverse" : "flex-row"} items-start`}>
      {/* Avatar */}
      <div
        className={`shrink-0 size-7 rounded-lg flex items-center justify-center text-xs font-bold ${
          isUser
            ? "bg-primary text-primary-content"
            : "bg-gradient-to-br from-secondary to-accent text-white"
        }`}
      >
        {isUser ? "You" : <SparklesIcon className="size-4" />}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
          isUser
            ? "bg-primary text-primary-content rounded-tr-sm"
            : "bg-base-300 text-base-content rounded-tl-sm"
        }`}
      >
        {msg.content.split("```").map((part, i) =>
          i % 2 === 1 ? (
            <pre
              key={i}
              className="bg-base-100/50 rounded-lg p-2 my-1 text-xs font-mono overflow-x-auto whitespace-pre-wrap"
            >
              {part.replace(/^[a-z]+\n/, "")}
            </pre>
          ) : (
            <span key={i} className="whitespace-pre-wrap">{part}</span>
          )
        )}
      </div>
    </div>
  );
}

function AIChatbot({ currentCode, problemTitle, selectedLanguage }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hi! I'm your AI coding assistant 🤖\n\nI can help you with:\n• Finding bugs in your code\n• Explaining concepts\n• Optimizing solutions\n• Giving hints\n\nAsk me anything!`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  const sendMessage = async (userMessage) => {
    if (!userMessage.trim() || isLoading) return;

    const newMessages = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const systemPrompt = `You are an expert coding interview assistant helping a developer during a live coding session.
      
Current context:
- Problem: ${problemTitle || "Unknown"}
- Language: ${selectedLanguage || "javascript"}
- Current code:
\`\`\`${selectedLanguage}
${currentCode || "// No code written yet"}
\`\`\`

Guidelines:
- Be concise and helpful
- When showing code, always wrap it in triple backticks with the language
- For bugs, point to the specific line/issue
- Give hints without full solutions unless explicitly asked
- Focus on teaching, not just answering`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemPrompt,
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();
      const assistantMessage = data.content?.[0]?.text || "Sorry, I couldn't process that.";
      setMessages((prev) => [...prev, { role: "assistant", content: assistantMessage }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Connection error. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (prompt) => {
    sendMessage(prompt);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 btn btn-circle btn-lg shadow-2xl bg-gradient-to-br from-primary via-secondary to-accent border-0 text-white hover:scale-110 transition-transform"
          title="Open AI Assistant"
        >
          <SparklesIcon className="size-6" />
        </button>
      )}

      {/* Chat Panel */}
      <div
        className={`fixed bottom-0 right-0 z-50 flex flex-col bg-base-100 shadow-2xl border-l-2 border-t-2 border-primary/30 transition-all duration-300 ease-out ${
          isOpen ? "w-[380px] h-[580px] opacity-100" : "w-0 h-0 opacity-0 overflow-hidden"
        }`}
        style={{ borderRadius: "16px 0 0 0" }}
      >
        {isOpen && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-base-300">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-primary to-secondary rounded-lg">
                  <SparklesIcon className="size-4 text-white" />
                </div>
                <div>
                  <p className="font-black text-sm">AI Assistant</p>
                  <p className="text-xs text-base-content/50">Powered by Claude</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() =>
                    setMessages([
                      {
                        role: "assistant",
                        content: "Chat cleared! How can I help you?",
                      },
                    ])
                  }
                  className="btn btn-ghost btn-xs btn-circle"
                  title="Clear chat"
                >
                  <RefreshCwIcon className="size-3.5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="btn btn-ghost btn-xs btn-circle"
                >
                  <XIcon className="size-4" />
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-1.5 p-2 bg-base-200 border-b border-base-300 flex-wrap">
              {QUICK_ACTIONS.map(({ label, icon: Icon, prompt }) => (
                <button
                  key={label}
                  onClick={() => handleQuickAction(prompt)}
                  disabled={isLoading}
                  className="btn btn-xs btn-outline btn-primary gap-1 font-medium"
                >
                  <Icon className="size-3" />
                  {label}
                </button>
              ))}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.map((msg, i) => (
                <Message key={i} msg={msg} />
              ))}

              {isLoading && (
                <div className="flex gap-2 items-start">
                  <div className="shrink-0 size-7 rounded-lg bg-gradient-to-br from-secondary to-accent flex items-center justify-center">
                    <SparklesIcon className="size-4 text-white" />
                  </div>
                  <div className="bg-base-300 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="size-1.5 rounded-full bg-primary/60 animate-bounce"
                          style={{ animationDelay: `${i * 150}ms` }}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-base-content/50">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-base-300 bg-base-200">
              <div className="flex gap-2 items-end">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your code... (Enter to send)"
                  rows={1}
                  className="textarea textarea-bordered textarea-sm flex-1 resize-none bg-base-100 min-h-[36px] max-h-[120px]"
                  style={{ height: "auto", overflow: "auto" }}
                  onInput={(e) => {
                    e.target.style.height = "auto";
                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                  }}
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isLoading}
                  className="btn btn-primary btn-sm btn-circle"
                >
                  {isLoading ? (
                    <Loader2Icon className="size-4 animate-spin" />
                  ) : (
                    <SendIcon className="size-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-base-content/30 mt-1 text-center">
                Context-aware — reads your current code
              </p>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default AIChatbot;