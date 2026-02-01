
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { Lesson, Quiz, Word } from '@prisma/client';
import type { ContentBlock } from '@/lib/data';
import { updateLessonContentAction } from '../../actions';

import { v4 as uuidv4 } from 'uuid';
import { produce } from 'immer';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Wand2, FileText, Layers, Puzzle, PlaySquare, ArrowUp, ArrowDown, Edit, Trash2, Save, Loader2
} from 'lucide-react';
import { BlockEditorDialog } from './block-editor-dialog';

interface LessonContentEditorProps {
  lesson: Lesson & { module: { title: string } };
  allWords: Word[];
  allQuizzes: Quiz[];
}

export function LessonContentEditor({ lesson, allWords, allQuizzes }: LessonContentEditorProps) {
  const [blocks, setBlocks] = React.useState<ContentBlock[]>(
    (lesson.sectionsJson as ContentBlock[] || []).sort((a, b) => a.order - b.order)
  );
  const [isSaving, setIsSaving] = React.useState(false);
  const [editingBlock, setEditingBlock] = React.useState<ContentBlock | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleAddBlock = (type: ContentBlock['type']) => {
    const newOrder = blocks.length > 0 ? Math.max(...blocks.map(b => b.order)) + 1 : 1;
    let newBlock: ContentBlock;

    switch (type) {
      case 'MARKDOWN':
        newBlock = { id: uuidv4(), type, order: newOrder, content: { markdownText: '## Nieuw Tekstblok\n\nBewerk deze tekst...' } };
        break;
      case 'FLASHCARD_SET':
        newBlock = { id: uuidv4(), type, order: newOrder, content: { title: 'Nieuwe Woordenlijst', wordIds: [] } };
        break;
      case 'QUIZ_LINK':
        newBlock = { id: uuidv4(), type, order: newOrder, content: { title: 'Nieuwe Quiz Link', quizId: '' } };
        break;
      case 'EMBEDDED_MEDIA':
         newBlock = { id: uuidv4(), type, order: newOrder, content: { title: 'Nieuw Mediablok', mediaUrl: '', mediaType: 'YOUTUBE' } };
        break;
      default:
        return;
    }
    setBlocks([...blocks, newBlock]);
    setEditingBlock(newBlock);
  };
  
  const handleDeleteBlock = (blockId: string) => {
    setBlocks(blocks.filter(b => b.id !== blockId));
  };

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === blocks.length - 1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newBlocks = produce(blocks, draft => {
        const [movedBlock] = draft.splice(index, 1);
        draft.splice(newIndex, 0, movedBlock);
    });

    // Re-assign order based on new array index
    const reorderedBlocks = newBlocks.map((block, idx) => ({ ...block, order: idx + 1 }));
    setBlocks(reorderedBlocks);
  };

  const handleSaveBlock = (updatedBlock: ContentBlock) => {
    setBlocks(blocks.map(b => b.id === updatedBlock.id ? updatedBlock : b));
    setEditingBlock(null);
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    const result = await updateLessonContentAction(lesson.id, blocks);
    setIsSaving(false);

    if (result.success) {
      toast({ title: "Success!", description: "Lesinhoud is succesvol opgeslagen." });
      router.refresh();
    } else {
      toast({ variant: "destructive", title: "Fout", description: "Kon de lesinhoud niet opslaan. " + result.error });
    }
  };

  const getBlockDescription = (block: ContentBlock) => {
    switch (block.type) {
        case 'MARKDOWN':
            return (block.content.markdownText || "").substring(0, 100) + "...";
        case 'FLASHCARD_SET':
            return `${block.content.wordIds.length} woord(en) geselecteerd`;
        case 'QUIZ_LINK':
            const quiz = allQuizzes.find(q => q.id === block.content.quizId);
            return quiz ? `${quiz.title}` : "Geen quiz geselecteerd";
        case 'EMBEDDED_MEDIA':
            return block.content.mediaUrl || "Geen URL ingesteld";
    }
  };


  return (
    <>
      <Card>
        <CardHeader>
           <div className="flex items-start gap-4">
                <div className="p-3 bg-secondary rounded-lg border">
                    <Wand2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <CardTitle className="text-2xl">Lesinhoud Blokken</CardTitle>
                    <CardDescription>
                        Stel de les samen uit verschillende contentblokken. Pas de volgorde aan met de pijltjes.
                    </CardDescription>
                </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-6">
                <Button variant="outline" onClick={() => handleAddBlock('MARKDOWN')}><FileText className="mr-2 h-4 w-4" />Tekstblok</Button>
                <Button variant="outline" onClick={() => handleAddBlock('FLASHCARD_SET')}><Layers className="mr-2 h-4 w-4" />Flashcards</Button>
                <Button variant="outline" onClick={() => handleAddBlock('QUIZ_LINK')}><Puzzle className="mr-2 h-4 w-4" />Quiz</Button>
                <Button variant="outline" onClick={() => handleAddBlock('EMBEDDED_MEDIA')}><PlaySquare className="mr-2 h-4 w-4" />Media</Button>
            </div>
        </CardHeader>
        <CardContent className="space-y-4">
           {blocks.map((block, index) => (
             <Card key={block.id} className="bg-secondary/50">
                <CardContent className="p-4 flex items-center gap-4">
                    <div className="flex-grow">
                        <Badge>{block.type.replace(/_/g, ' ')}</Badge>
                        <p className="font-semibold mt-1">{block.content.title || block.type.replace(/_/g, ' ')}</p>
                        <p className="text-sm text-muted-foreground truncate">{getBlockDescription(block)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleMoveBlock(index, 'up')} disabled={index === 0}>
                            <ArrowUp className="h-4 w-4" />
                        </Button>
                         <Button variant="ghost" size="icon" onClick={() => handleMoveBlock(index, 'down')} disabled={index === blocks.length - 1}>
                            <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setEditingBlock(block)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Bewerk
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => handleDeleteBlock(block.id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
             </Card>
           ))}
           {blocks.length === 0 && (
             <div className="text-center text-muted-foreground p-8 border-dashed border-2 rounded-lg">
                <p>Deze les heeft nog geen inhoud.</p>
                <p>Voeg een blok toe met de knoppen hierboven.</p>
             </div>
           )}
        </CardContent>
      </Card>
      
      <div className="mt-6">
        <Button size="lg" onClick={handleSaveAll} disabled={isSaving}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Alle Lesinhoud Blokken Opslaan
        </Button>
      </div>

      {editingBlock && (
        <BlockEditorDialog
            isOpen={!!editingBlock}
            onClose={() => setEditingBlock(null)}
            onSave={handleSaveBlock}
            block={editingBlock}
            allWords={allWords}
            allQuizzes={allQuizzes}
        />
      )}
    </>
  );
}
