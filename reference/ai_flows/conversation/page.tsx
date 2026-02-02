
'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { streamTutorResponse, type ChatMessage } from './actions';
import MainLayout from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, User, Send, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const WELCOME_MESSAGE = 'Sugeng rawuh! Ik ben Furnie, je persoonlijke AI-tutor voor het Javaans. Waar wil je vandaag mee beginnen?';

export default function ConversationPage() {
  const { user, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        setMessages([{ role: 'model', content: `Hallo ${user.displayName || 'Leerling'}! Welkom bij je eerste gesprek. Vraag me gerust iets!` }]);
      } else {
        setMessages([{ role: 'model', content: WELCOME_MESSAGE }]);
      }
      setIsLoadingHistory(false);
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming || !user) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput('');
    setIsStreaming(true);

    try {
      const stream = await streamTutorResponse(newHistory, user.displayName);
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';
      const modelMessage: ChatMessage = { role: 'model', content: '' };
      setMessages((prev) => [...prev, modelMessage]);

      while (true) {
        const { value, done: readerDone } = await reader.read();
        if (readerDone) break;
        if (value) {
          accumulatedContent += decoder.decode(value, { stream: true });
          setMessages((prev) => {
            const newMessages = [...prev];
            if (newMessages.length > 0 && newMessages[newMessages.length - 1].role === 'model') {
              newMessages[newMessages.length - 1].content = accumulatedContent;
            }
            return newMessages;
          });
        }
      }
      
    } catch (error) {
      console.error('Error streaming response:', error);
      setMessages((prev) => [...prev, { role: 'model', content: 'Sorry, er is iets misgegaan. Probeer het opnieuw.' }]);
    } finally {
      setIsStreaming(false);
    }
  };

  if (authLoading || isLoadingHistory) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-full pt-10">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="ml-2">Gesprek laden...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 flex flex-col h-[calc(100vh-8rem)]">
        <Card className="flex flex-col flex-grow shadow-lg relative">
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
              <CardTitle>Conversatie Oefening</CardTitle>
              <CardDescription>Chat met Furnie, je AI-taaltutor, om je Javaans te oefenen.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col p-0">
            <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
              <div className="space-y-6">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      'flex items-start gap-3',
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {message.role === 'model' && (
                      <div className="bg-primary text-primary-foreground rounded-full p-2">
                        <Bot className="h-5 w-5" />
                      </div>
                    )}
                    <div
                      className={cn(
                        'p-3 rounded-lg max-w-xs md:max-w-md lg:max-w-lg',
                        message.role === 'user'
                          ? 'bg-muted text-foreground'
                          : 'bg-card text-card-foreground border'
                      )}
                    >
                      <div className="prose dark:prose-invert prose-sm max-w-none">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    </div>
                    {message.role === 'user' && (
                      <div className="bg-secondary text-secondary-foreground rounded-full p-2">
                        <User className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                ))}
                {isStreaming && (
                  <div className="flex items-start gap-3 justify-start">
                    <div className="bg-primary text-primary-foreground rounded-full p-2">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div className="p-3 rounded-lg bg-card text-card-foreground border">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            <div className="p-4 border-t">
              {user ? (
                <form onSubmit={handleSubmit} className="flex items-center gap-3">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Typ je bericht in Javaans of Nederlands..."
                    disabled={isStreaming}
                  />
                  <Button type="submit" disabled={isStreaming || !input.trim()}>
                    {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    <span className="sr-only">Verstuur</span>
                  </Button>
                </form>
              ) : (
                <div className="text-center text-sm text-muted-foreground">
                  <Link href="/login" className="font-semibold text-primary hover:underline">Log in</Link> om een gesprek te starten.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
