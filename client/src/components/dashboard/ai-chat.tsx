import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { Bot, Send, User, Lightbulb } from "lucide-react";
import useTranslation from "@/lib/i18n";

interface ChatMessage {
  id: number;
  message: string;
  isFromUser: boolean;
  createdAt: string;
  metadata?: {
    suggestions?: string[];
    relatedDocuments?: string[];
  };
}

export default function AiChat() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [inputMessage, setInputMessage] = useState("");
  const [sessionId] = useState(() => `session-${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["/api/chat", sessionId],
    retry: false,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/chat", {
        message,
        sessionId,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat", sessionId] });
      setInputMessage("");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: t("auth.unauthorized"),
          description: t("auth.logging_in"),
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: t("ai.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || sendMessageMutation.isPending) return;
    
    sendMessageMutation.mutate(inputMessage);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return t("ai.just_now");
    if (diffMinutes < 60) return t("ai.minutes_ago", { minutes: diffMinutes });
    return date.toLocaleTimeString();
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
          <Bot className="h-5 w-5 mr-2 text-blue-600" />
          {t("ai.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-64 p-4">
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bot className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>{t("ai.no_messages")}</p>
                <p className="text-sm">{t("ai.start_conversation")}</p>
              </div>
            ) : (
              messages.map((message: ChatMessage) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-3 ${
                    message.isFromUser ? "justify-end" : ""
                  }`}
                >
                  {!message.isFromUser && (
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`rounded-lg p-3 max-w-xs ${
                      message.isFromUser
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <p className="text-sm">{message.message}</p>
                    <span
                      className={`text-xs mt-2 block ${
                        message.isFromUser ? "text-blue-200" : "text-gray-500"
                      }`}
                    >
                      {formatTime(message.createdAt)}
                    </span>
                    
                    {/* AI Suggestions */}
                    {!message.isFromUser && message.metadata?.suggestions && (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center text-xs text-gray-600">
                          <Lightbulb className="h-3 w-3 mr-1" />
                          {t("ai.suggestions")}
                        </div>
                        {message.metadata.suggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="block w-full text-left p-2 text-xs bg-white rounded border hover:bg-gray-50 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {message.isFromUser && (
                    <img
                      src={user?.profileImageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"}
                      alt="User"
                      className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                    />
                  )}
                </div>
              ))
            )}
            {sendMessageMutation.isPending && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        {/* Input Area */}
        <div className="p-4 border-t border-gray-200">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={t("ai.input_placeholder")}
              disabled={sendMessageMutation.isPending}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={!inputMessage.trim() || sendMessageMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
