
'use client';

import * as React from 'react';
import type { Word } from '@prisma/client';
import { submitReviewRating } from '@/app/flashcards/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Volume2, Shuffle, RotateCw } from 'lucide-react';
import { cn, shuffleArray } from '@/lib/utils';
import Image from 'next/image';

interface InteractiveFlashcardViewerProps {
  words: Word[];
  title?: string;
}

export function InteractiveFlashcardViewer({ words, title }: InteractiveFlashcardViewerProps) {
  const [shuffledWords, setShuffledWords] = React.useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isFlipped, setIsFlipped] = React.useState(false);
  
  React.useEffect(() => {
    setShuffledWords(shuffleArray(words));
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [words]);

  const handleShuffle = () => {
    setShuffledWords(shuffleArray(words));
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleNext = (rating: 'good' | 'bad') => {
    if (!currentWord) return;
    submitReviewRating(currentWord.id, rating);

    setIsFlipped(false);
    // Use timeout to allow card to flip back before showing next word
    setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % shuffledWords.length);
    }, 150);
  };
  
  const handleRestart = () => {
      setCurrentIndex(0);
      setIsFlipped(false);
  }

  const handlePlayAudio = () => {
    if (currentWord.audioJavanese) {
        const audio = new Audio(currentWord.audioJavanese);
        audio.play().catch(e => console.error("Error playing audio:", e));
    }
  };

  if (shuffledWords.length === 0) {
    return null;
  }

  const currentWord = shuffledWords[currentIndex];

  return (
    <Card className="shadow-sm">
        <CardHeader>
            <CardTitle>{title || 'Woordenschat'}</CardTitle>
            <CardDescription>Oefen de sleutelwoorden voor deze les.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
            {/* The Flippable Card */}
            <div 
                className="w-full max-w-md h-64 rounded-xl cursor-pointer"
                onClick={() => setIsFlipped(!isFlipped)}
                style={{ perspective: '1000px' }}
            >
                <div 
                    className="relative w-full h-full text-center transition-transform duration-500 rounded-xl"
                    style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                >
                    {/* Front of the card */}
                    <div className="absolute w-full h-full flex flex-col items-center justify-center p-4 rounded-xl border bg-card text-card-foreground shadow-md" style={{ backfaceVisibility: 'hidden' }}>
                        <div className="flex flex-col items-center gap-2">
                            <h2 className="text-5xl font-bold text-primary">{currentWord.javanese}</h2>
                            {currentWord.formality && <Badge>{currentWord.formality}</Badge>}
                            {currentWord.category && <p className="text-sm text-muted-foreground">{currentWord.category}</p>}
                        </div>
                    </div>
                    {/* Back of the card */}
                    <div className="absolute w-full h-full flex flex-col items-center justify-center p-4 rounded-xl border bg-card text-card-foreground shadow-md" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                        <div className="flex flex-col items-center gap-2">
                             {currentWord.image && <Image src={currentWord.image} data-ai-hint={currentWord.aiHint || ''} alt={currentWord.dutch} width={100} height={60} className="rounded-md shadow-sm mb-2"/>}
                            <h2 className="text-4xl font-bold">{currentWord.dutch}</h2>
                            {currentWord.notes && <p className="text-sm text-muted-foreground mt-2 italic">"{currentWord.notes}"</p>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center items-center gap-8 w-full max-w-md border-t pt-4 mt-4">
                <Button variant="ghost" size="icon" disabled={!currentWord.audioJavanese} onClick={handlePlayAudio}><Volume2/></Button>
                <Button variant="ghost" size="icon" onClick={handleShuffle}><Shuffle/></Button>
                <Button variant="ghost" size="icon" onClick={handleRestart}><RotateCw/></Button>
            </div>
            
            {/* Progress */}
            <div className="w-full max-w-md space-y-2">
               <Progress value={((currentIndex + 1) / shuffledWords.length) * 100} />
               <p className="text-center text-sm text-muted-foreground">Kaart {currentIndex + 1} van {shuffledWords.length}</p>
            </div>
            
            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-md pt-4">
                <Button variant="destructive" size="lg" onClick={() => handleNext('bad')}>Weet Niet</Button>
                <Button size="lg" onClick={() => handleNext('good')}>Ik Weet Dit</Button>
            </div>
        </CardContent>
    </Card>
  );
}
