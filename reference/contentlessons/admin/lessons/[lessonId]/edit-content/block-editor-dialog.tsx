
'use client';

import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import type { ContentBlock, Word, Quiz } from '@/lib/data';
import { suggestContentImprovements, type SuggestContentImprovementsOutput } from '@/ai/flows/suggest-content-improvements';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Wand2, Loader2, Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface BlockEditorDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (block: ContentBlock) => void;
    block: ContentBlock;
    allWords: Word[];
    allQuizzes: Quiz[];
}

export function BlockEditorDialog({ isOpen, onClose, onSave, block, allWords, allQuizzes }: BlockEditorDialogProps) {
    const [editedBlock, setEditedBlock] = React.useState<ContentBlock>(block);
    const [isCheckingAi, setIsCheckingAi] = React.useState(false);
    const [aiSuggestions, setAiSuggestions] = React.useState<SuggestContentImprovementsOutput | null>(null);
    const [wordSearch, setWordSearch] = React.useState('');

    React.useEffect(() => {
        setEditedBlock(block);
        setAiSuggestions(null); // Reset AI suggestions when a new block is opened
        setWordSearch(''); // Reset search on new block
    }, [block]);

    const handleContentChange = (field: string, value: any) => {
        setEditedBlock(prev => ({
            ...prev,
            content: {
                ...prev.content,
                [field]: value
            }
        }));
    };
    
    const handleSubmit = () => {
        onSave(editedBlock);
        onClose();
    };

    const handleCheckWithAi = async () => {
        if (editedBlock.type !== 'MARKDOWN' || !editedBlock.content.markdownText) return;
        setIsCheckingAi(true);
        setAiSuggestions(null);
        try {
            const result = await suggestContentImprovements({ content: editedBlock.content.markdownText });
            setAiSuggestions(result);
        } catch (error) {
            console.error("AI check failed", error);
        } finally {
            setIsCheckingAi(false);
        }
    };
    
    const handleApplyAiSuggestion = () => {
        if (!aiSuggestions?.improvedContent) return;
        handleContentChange('markdownText', aiSuggestions.improvedContent);
        setAiSuggestions(null);
    };

    const handleWordSelectionChange = (wordId: string, checked: boolean) => {
        setEditedBlock(prev => {
            if (prev.type !== 'FLASHCARD_SET') return prev;
            const currentIds = prev.content.wordIds || [];
            const newIds = checked
                ? [...currentIds, wordId]
                : currentIds.filter(id => id !== wordId);
            return {
                ...prev,
                content: {
                    ...prev.content,
                    wordIds: newIds
                }
            };
        });
    };
    
    const filteredWords = React.useMemo(() => {
        if (!wordSearch) return allWords;
        return allWords.filter(word => 
            word.javanese.toLowerCase().includes(wordSearch.toLowerCase()) ||
            word.dutch.toLowerCase().includes(wordSearch.toLowerCase())
        );
    }, [allWords, wordSearch]);

    const renderForm = () => {
        switch (editedBlock.type) {
            case 'MARKDOWN':
                return (
                     <div className="grid gap-4 py-4">
                        <Tabs defaultValue="edit" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="edit">Bewerken</TabsTrigger>
                                <TabsTrigger value="preview">Preview</TabsTrigger>
                            </TabsList>
                            <TabsContent value="edit">
                                <Textarea 
                                    id="markdownText"
                                    value={editedBlock.content.markdownText || ''}
                                    onChange={(e) => handleContentChange('markdownText', e.target.value)}
                                    rows={15}
                                    placeholder="Schrijf je lesinhoud hier... Ondersteunt Markdown. Gebruik ### voor titels en **vet** voor nadruk."
                                />
                            </TabsContent>
                            <TabsContent value="preview">
                                <ScrollArea className="h-[340px] rounded-md border">
                                    <div className="prose prose-sm dark:prose-invert max-w-none p-4">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                                            {editedBlock.content.markdownText || "Geen preview beschikbaar."}
                                        </ReactMarkdown>
                                    </div>
                                </ScrollArea>
                            </TabsContent>
                        </Tabs>
                        <div className="flex justify-end pt-2">
                            <Button variant="outline" onClick={handleCheckWithAi} disabled={isCheckingAi}>
                                {isCheckingAi ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                                Controleer Tekst (AI)
                            </Button>
                        </div>
                        {aiSuggestions && (
                            <Alert>
                                <AlertTitle className="font-bold">AI Verbetervoorstellen</AlertTitle>
                                <AlertDescription>
                                    <div className="mt-2 space-y-3">
                                        <div>
                                            <h4 className="font-semibold text-foreground">Suggesties:</h4>
                                            <ul className="list-disc pl-5 text-xs text-muted-foreground">
                                                {aiSuggestions.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-foreground">Verbeterde Tekst:</h4>
                                            <div className="text-xs p-2 bg-secondary rounded-md max-h-40 overflow-y-auto">
                                                <p>{aiSuggestions.improvedContent}</p>
                                            </div>
                                        </div>
                                        <Button size="sm" onClick={handleApplyAiSuggestion}>Pas Verbetering Toe</Button>
                                    </div>
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                );
            case 'FLASHCARD_SET':
                const selectedWordCount = editedBlock.content.wordIds?.length || 0;
                return (
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Optionele Titel</Label>
                            <Input 
                                id="title" 
                                value={editedBlock.content.title || ''} 
                                onChange={(e) => handleContentChange('title', e.target.value)}
                                placeholder="Bijv. Kernwoorden Les 1"
                            />
                        </div>
                        <div className="grid gap-2">
                           <Label htmlFor="word-search">Zoek Woorden</Label>
                           <div className="relative">
                               <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                               <Input
                                  id="word-search"
                                  value={wordSearch}
                                  onChange={(e) => setWordSearch(e.target.value)}
                                  placeholder="Zoek woorden om toe te voegen..."
                                  className="pl-10"
                               />
                           </div>
                        </div>
                        <ScrollArea className="h-60 rounded-md border p-2">
                           <div className="space-y-2">
                              {filteredWords.map(word => (
                                 <div key={word.id} className="flex items-center space-x-3 rounded-md p-2 hover:bg-accent">
                                    <Checkbox 
                                       id={`word-${word.id}`} 
                                       checked={(editedBlock.content.wordIds || []).includes(word.id)}
                                       onCheckedChange={(checked) => handleWordSelectionChange(word.id, !!checked)}
                                    />
                                    <Label htmlFor={`word-${word.id}`} className="flex-1 font-normal cursor-pointer">
                                        {word.javanese} - <span className="text-muted-foreground">{word.dutch}</span>
                                    </Label>
                                 </div>
                              ))}
                           </div>
                        </ScrollArea>
                        <p className="text-sm text-muted-foreground">{selectedWordCount} woord(en) geselecteerd.</p>
                    </div>
                );
            case 'QUIZ_LINK':
                 return (
                     <div className="grid gap-4 py-4">
                         <div className="grid gap-2">
                            <Label htmlFor="quizId">Selecteer een Quiz</Label>
                             <Select
                                value={editedBlock.content.quizId || ''}
                                onValueChange={(val) => {
                                    const selectedQuiz = allQuizzes.find(q => q.id === val);
                                    setEditedBlock(prev => ({
                                        ...prev,
                                        content: { ...prev.content, quizId: val, title: selectedQuiz?.title || '' }
                                    }));
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Kies een quiz..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {allQuizzes.map(quiz => (
                                        <SelectItem key={quiz.id} value={quiz.id}>{quiz.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                );
            case 'EMBEDDED_MEDIA':
                return (
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="mediaTitle">Titel (optioneel)</Label>
                             <Input 
                                id="mediaTitle" 
                                value={editedBlock.content.title || ''} 
                                onChange={(e) => handleContentChange('title', e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="mediaType">Media Type</Label>
                            <Select
                                value={editedBlock.content.mediaType || 'YOUTUBE'}
                                onValueChange={(val: 'YOUTUBE' | 'AUDIO_URL') => handleContentChange('mediaType', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="YOUTUBE">YouTube</SelectItem>
                                    <SelectItem value="AUDIO_URL">Audio URL</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="mediaUrl">Media URL</Label>
                             <Input 
                                id="mediaUrl" 
                                value={editedBlock.content.mediaUrl || ''} 
                                onChange={(e) => handleContentChange('mediaUrl', e.target.value)}
                                placeholder={editedBlock.content.mediaType === 'YOUTUBE' ? 'https://www.youtube.com/embed/...' : '/audio/dialogs/...'}
                            />
                        </div>
                    </div>
                );
            default:
                return <p>Onbekend bloktype.</p>;
        }
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Bewerk Blok: {editedBlock.type.replace(/_/g, ' ')}</DialogTitle>
                     <DialogDescription>
                        Pas de inhoud van dit blok aan. Klik op 'Opslaan' om de wijzigingen toe te passen.
                    </DialogDescription>
                </DialogHeader>
                {renderForm()}
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Annuleren</Button>
                    <Button onClick={handleSubmit}>{ block.id === editedBlock.id ? 'Opslaan' : 'Blok Toevoegen' }</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
