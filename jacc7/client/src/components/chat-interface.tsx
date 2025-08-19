import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Mic, MicOff, Calculator, TrendingUp, BarChart3, Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { MessageContent } from "./message-content";
// Types for messages
interface MessageWithActions {
  id: string;
  content: string;
  role: "user" | "assistant";
  createdAt: string;
  actions?: Array<{
    type: "document_link" | "search_query" | "export";
    label: string;
    url?: string;
    query?: string;
  }>;
}

interface ChatInterfaceProps {
  chatId: string | null;
  onNewChatWithMessage?: (message: string) => Promise<void>;
  onChatUpdate: () => void;
  isDemo?: boolean;
}

export default function ChatInterface({
  chatId,
  onNewChatWithMessage,
  onChatUpdate,
  isDemo = false,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [optimisticMessages, setOptimisticMessages] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  




  // Optimized message fetching with intelligent caching
  const { data: messages = [], isLoading, error, refetch } = useQuery<MessageWithActions[]>({
    queryKey: [`/api/chats/${chatId}/messages`],
    enabled: !!chatId,
    staleTime: 10000, // Cache for 10 seconds - balance between freshness and performance
    gcTime: 120000, // Keep in cache for 2 minutes
    refetchOnMount: "always", // Always refetch when mounting to get latest data
    refetchOnWindowFocus: false,
    refetchInterval: false,
    retry: 1, // Only retry once on failure
    queryFn: async () => {
      const startTime = performance.now();
      const response = await fetch(`/api/chats/${chatId}/messages`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.status}`);
      }
      
      const data = await response.json();
      const endTime = performance.now();
      
      // Only log performance in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`📊 Messages fetched in ${Math.round(endTime - startTime)}ms:`, {
          count: Array.isArray(data) ? data.length : 0,
          chatId: chatId?.substring(0, 8)
        });
      }
      
      return Array.isArray(data) ? data : [];
    },
  });

// Define conversation starters
const conversationStarters = [
  {
    id: "rates",
    icon: Calculator,
    text: "I need help calculating processing rates and finding competitive pricing",
    color: "bg-blue-600 hover:bg-blue-700"
  },
  {
    id: "compare", 
    icon: BarChart3,
    text: "I need to compare payment processors - can you help me analyze different options?",
    color: "bg-green-600 hover:bg-green-700"
  },
  {
    id: "proposal",
    icon: TrendingUp,
    text: "Help me create a professional proposal for a new merchant",
    color: "bg-orange-600 hover:bg-orange-700"
  },
  {
    id: "marketing",
    icon: Brain,
    text: "Let's Talk Marketing",
    color: "bg-purple-600 hover:bg-purple-700"
  }
];

  // Auto-scroll to bottom when messages or thinking state change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, optimisticMessages, isThinking]);

  // Handle sending messages with optimistic updates
  const sendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;
    
    setIsProcessing(true);
    
    // Add optimistic user message immediately
    const optimisticUserMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: messageText,
      createdAt: new Date().toISOString(),
      isOptimistic: true
    };
    
    setOptimisticMessages(prev => [...prev, optimisticUserMessage]);
    
    try {
      if (!chatId && onNewChatWithMessage) {
        await onNewChatWithMessage(messageText);
      } else if (chatId) {
        // Show AI thinking state
        setIsThinking(true);
        
        const response = await fetch(`/api/chats/${chatId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            content: messageText,
            role: 'user'
          })
        });
        
        if (!response.ok) {
          throw new Error(`Failed to send message: ${response.status}`);
        }
        
        // Clear optimistic messages since real ones will come from server
        setOptimisticMessages([]);
        
        // Immediately invalidate cache and refetch
        queryClient.invalidateQueries({ queryKey: [`/api/chats/${chatId}/messages`] });
        queryClient.invalidateQueries({ queryKey: ["/api/chats"] });
        
        // Intelligent polling that checks for AI response
        let pollAttempts = 0;
        const maxPolls = 20; // 10 seconds max
        const initialMessageCount = messages.length;
        
        const smartPoll = setInterval(async () => {
          if (pollAttempts >= maxPolls) {
            clearInterval(smartPoll);
            setIsThinking(false);
            return;
          }
          
          const freshData = await refetch();
          const newMessages = freshData.data || [];
          
          // Check if we got both user message AND AI response (2 new messages)
          if (newMessages.length >= initialMessageCount + 2) {
            clearInterval(smartPoll);
            setIsThinking(false);
            onChatUpdate();
          }
          
          pollAttempts++;
        }, 500);
        
        // Fallback timeout
        setTimeout(() => {
          clearInterval(smartPoll);
          setIsThinking(false);
        }, 12000);
      }
    } catch (error) {
      setOptimisticMessages([]);
      setIsThinking(false);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    
    const messageText = input.trim();
    setInput("");
    await sendMessage(messageText);
  };

  const handleConversationStarter = async (text: string) => {
    await sendMessage(text);
  };

  // Debug log when no chatId to help troubleshoot
  console.log('ChatInterface render:', { chatId, showingWelcome: !chatId });

  if (!chatId) {
    return (
      <div 
        className="flex-1 flex flex-col h-full bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 overflow-hidden"
      >
        {/* Scroll Progress Indicator */}
        <div 
          className="fixed top-0 left-0 h-1 bg-gradient-to-r from-blue-600 to-green-400 z-50 transition-all duration-150 ease-out sm:hidden opacity-80"
          style={{ width: '50%' }}
        />
        
        {/* Scrollable content area with bottom padding for mobile nav */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 pb-4 sm:pb-4">
          <div className="max-w-4xl w-full mx-auto">
            <div className="space-y-4 sm:space-y-6 mt-32">
              <div className="text-center space-y-2 sm:space-y-3">
                <div className="flex justify-center">
                  <img 
                    src="/jacc-logo.jpg" 
                    alt="JACC Logo" 
                    className="w-12 sm:w-16 md:w-20 h-12 sm:h-16 md:h-20 rounded-full shadow-lg object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <h1 
                    className="text-lg sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white"
                  >
                    Welcome to JACC
                  </h1>
                  <p 
                    className="text-xs sm:text-base md:text-lg text-slate-600 dark:text-slate-300 px-2 sm:px-0"
                  >
                    Your AI-Powered Merchant Services Assistant
                  </p>
                </div>
              </div>

              {/* Mobile-first responsive grid */}
              <div className="space-y-2 sm:space-y-3 md:grid md:grid-cols-2 md:gap-3 md:space-y-0 px-1 sm:px-0">
                {conversationStarters.map((starter, index) => {
                  const IconComponent = starter.icon;
                  return (
                    <button
                      key={starter.id}
                      onClick={() => handleConversationStarter(starter.text)}
                      className="w-full p-3 sm:p-4 md:p-5 rounded-xl border-2 hover:shadow-lg transition-all duration-200 text-left group bg-white dark:bg-slate-800 hover:scale-[1.01] active:scale-[0.99] touch-manipulation min-h-[60px] sm:min-h-[70px]"
                      style={{
                        borderColor: starter.id === 'rates' ? '#2563eb' : 
                                    starter.id === 'compare' ? '#16a34a' : 
                                    starter.id === 'proposal' ? '#ea580c' : 
                                    '#7c3aed',
                        borderWidth: '2px'
                      }}
                      disabled={isProcessing}
                    >
                      <div className="flex items-center space-x-3">
                        <IconComponent 
                          className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 flex-shrink-0" 
                          style={{
                            color: starter.id === 'rates' ? '#2563eb' : 
                                   starter.id === 'compare' ? '#16a34a' : 
                                   starter.id === 'proposal' ? '#ea580c' : 
                                   '#7c3aed'
                          }}
                        />
                        <span className="text-xs sm:text-sm md:text-base font-medium leading-tight text-slate-900 dark:text-white text-left flex-1">
                          {starter.text}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Fixed bottom input area - positioned above bottom nav */}
        <div className="flex-shrink-0 border-t border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm mb-20 md:mb-0">
          <div className="max-w-4xl w-full mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4">
            <div className="chat-glow-container">
              <form onSubmit={handleSubmit} className="flex gap-2 w-full">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your question here..."
                  className="w-[85%] min-h-[44px] max-h-20 resize-none border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm sm:text-base min-w-0 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
                <Button
                  type="submit"
                  disabled={!input.trim() || isProcessing}
                  size="icon"
                  className="w-[15%] h-11 bg-blue-600 hover:bg-blue-700 text-white border-0 flex-shrink-0 rounded-lg"
                >
                  <Send className="w-4 h-4 text-white" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-900">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-4 md:pb-24">
        {isLoading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-slate-500 dark:text-slate-400 py-8">
            No messages yet. Start a conversation!
          </div>
        ) : (
          <>
            {/* Render actual messages */}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white shadow-md'
                  }`}
                >
                  <MessageContent 
                    content={message.content} 
                    className={message.role === 'user' ? 'text-white [&>*]:text-white [&>p]:text-white [&>div]:text-white' : ''}
                  />
                </div>
              </div>
            ))}
            
            {/* Render optimistic user messages */}
            {optimisticMessages.map((message) => (
              <div
                key={message.id}
                className="flex justify-end animate-slideInFromRight"
              >
                <div className="max-w-[80%] rounded-lg p-4 bg-blue-600 text-white shadow-lg opacity-90">
                  <MessageContent 
                    content={message.content} 
                    className="text-white [&>*]:text-white [&>p]:text-white [&>div]:text-white"
                  />
                </div>
              </div>
            ))}
            
            {/* AI Thinking State */}
            {isThinking && (
              <div className="flex justify-start animate-fadeIn">
                <div className="max-w-[80%] rounded-lg p-4 bg-slate-100 dark:bg-slate-700 shadow-md">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-pulse" />
                      <div className="absolute inset-0 animate-spin">
                        <div className="w-6 h-6 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full opacity-30"></div>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span className="text-slate-600 dark:text-slate-300 text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Fixed for mobile/tablet, static for desktop */}
      <div className="border-t border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-900 md:relative md:bottom-auto md:left-auto md:right-auto fixed bottom-24 left-0 right-0 z-10" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
        <div className="chat-glow-container">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="w-[85%] min-h-[44px] max-h-32 resize-none border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm sm:text-base rounded-lg px-4 py-3"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <Button
              type="submit"
              disabled={!input.trim() || isProcessing}
              size="icon"
              className="w-[15%] h-11 bg-blue-600 hover:bg-blue-700 text-white border-0 flex-shrink-0"
            >
              <Send className="w-4 h-4 text-white" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
