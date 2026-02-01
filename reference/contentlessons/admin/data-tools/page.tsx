
"use client";

import * as React from 'react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  AudioWaveform, CopyCheck, DatabaseBackup, FileSearch2, Loader2, Wand2, CheckCircle, Link as LinkIcon, Download, AlertTriangle
} from "lucide-react";
import {
  generateSeedScript,
  findDuplicateWords,
  validateAudioPaths,
  validateDialogueAudio,
  fixSingleAudioPath,
  fixMultipleAudioPaths,
  generateBatchDialogueAudio,
} from './actions';
import type { ClientWordForDuplicates, AudioValidationResult, DialogueAudioValidationResult } from '@/lib/data';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type ToolName = 'seed' | 'duplicates' | 'wordAudio' | 'dialogueAudio';

export default function DataToolsPage() {
  const { toast } = useToast();

  const [loading, setLoading] = React.useState<ToolName | null>(null);
  
  const [seedScript, setSeedScript] = React.useState<string | null>(null);
  const [duplicates, setDuplicates] = React.useState<ClientWordForDuplicates[][]>([]);
  const [wordAudioProblems, setWordAudioProblems] = React.useState<AudioValidationResult[]>([]);
  const [dialogueAudioProblems, setDialogueAudioProblems] = React.useState<DialogueAudioValidationResult[]>([]);

  const [selectedWordAudioFixes, setSelectedWordAudioFixes] = React.useState<Set<string>>(new Set());
  const [selectedDialogueAudio, setSelectedDialogueAudio] = React.useState<Set<string>>(new Set());
  const [dialogueTtsVoice, setDialogueTtsVoice] = React.useState('Siti');


  const handleGenerateSeed = async () => {
    setLoading('seed');
    const result = await generateSeedScript();
    if (result.success) {
      setSeedScript(result.script!);
      toast({ title: 'Seed Script Generated', description: 'The script has been generated below. Copy it to your `prisma/seed.ts` file.' });
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
    setLoading(null);
  };

  const handleCopyScript = () => {
    if (seedScript) {
      navigator.clipboard.writeText(seedScript);
      toast({ title: 'Copied!', description: 'Seed script copied to clipboard.' });
    }
  };
  
  const handleFindDuplicates = async () => {
    setLoading('duplicates');
    const result = await findDuplicateWords();
    if (result.success) {
      setDuplicates(result.duplicates);
      toast({ title: 'Scan Complete', description: `${result.duplicates.length} duplicate groups found.` });
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
    setLoading(null);
  };

  const handleValidateWordAudio = async () => {
    setLoading('wordAudio');
    setSelectedWordAudioFixes(new Set());
    const result = await validateAudioPaths();
    if (result.success) {
      setWordAudioProblems(result.problems);
      toast({ title: 'Word Audio Scan Complete', description: `${result.problems.length} problems found.` });
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
    setLoading(null);
  };
  
  const handleFixSingleWordPath = async (wordId: string, correctPath: string) => {
    setLoading('wordAudio');
    const result = await fixSingleAudioPath(wordId, correctPath);
    if (result.success) {
      toast({ title: "Path Fixed", description: result.message });
      handleValidateWordAudio(); // Re-run validation to refresh list
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.message });
      setLoading(null);
    }
  };

  const handleFixSelectedWordPaths = async () => {
    setLoading('wordAudio');
    const fixesToApply = wordAudioProblems
        .filter(p => selectedWordAudioFixes.has(p.wordId) && p.status === 'INCORRECT_PATH')
        .map(p => ({ wordId: p.wordId, correctPath: p.expectedPath }));
    
    if (fixesToApply.length === 0) {
        toast({ title: "No fixable items selected", description: "Select items with status 'Pad Incorrect' to fix."});
        setLoading(null);
        return;
    }

    const result = await fixMultipleAudioPaths(fixesToApply);
    if (result.success) {
      toast({ title: "Paths Fixed", description: result.message });
      await handleValidateWordAudio();
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.message });
      setLoading(null);
    }
  };

  const handleValidateDialogueAudio = async () => {
    setLoading('dialogueAudio');
    setSelectedDialogueAudio(new Set());
    const result = await validateDialogueAudio();
    if (result.success) {
        setDialogueAudioProblems(result.problems);
        toast({ title: 'Dialogue Audio Scan Complete', description: `${result.problems.length} missing files found.`});
    } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
    setLoading(null);
  };

  const handleGenerateSelectedDialogueAudio = async () => {
      setLoading('dialogueAudio');
      const itemsToGenerate = dialogueAudioProblems.filter(p => selectedDialogueAudio.has(p.id));
      const result = await generateBatchDialogueAudio(itemsToGenerate, dialogueTtsVoice);
      if (result.success) {
          toast({ title: 'Batch Audio Generation Complete', description: result.message });
          await handleValidateDialogueAudio(); // Refresh
      } else {
          toast({ variant: 'destructive', title: 'Batch Audio Generation Failed', description: result.message });
      }
      setLoading(null);
  };
  
  const handleWordAudioFixSelection = (wordId: string, checked: boolean) => {
    setSelectedWordAudioFixes(prev => {
        const newSet = new Set(prev);
        if (checked) newSet.add(wordId);
        else newSet.delete(wordId);
        return newSet;
    });
  };

  const handleDialogueAudioSelection = (id: string, checked: boolean) => {
      setSelectedDialogueAudio(prev => {
          const newSet = new Set(prev);
          if(checked) newSet.add(id);
          else newSet.delete(id);
          return newSet;
      });
  };
  
    // --- Logic for "Select All" Checkboxes ---
    const fixableWordAudioIds = React.useMemo(() => wordAudioProblems.filter(p => p.status === 'INCORRECT_PATH').map(p => p.wordId), [wordAudioProblems]);
    const selectedFixableWordCount = React.useMemo(() => Array.from(selectedWordAudioFixes).filter(id => fixableWordAudioIds.includes(id)).length, [selectedWordAudioFixes, fixableWordAudioIds]);

    const handleSelectAllFixableWords = (checked: boolean | 'indeterminate') => {
        if (checked === true) {
            setSelectedWordAudioFixes(prev => new Set([...prev, ...fixableWordAudioIds]));
        } else {
            setSelectedWordAudioFixes(prev => {
                const newSet = new Set(prev);
                fixableWordAudioIds.forEach(id => newSet.delete(id));
                return newSet;
            });
        }
    };
    
    const dialogueAudioIds = React.useMemo(() => dialogueAudioProblems.map(p => p.id), [dialogueAudioProblems]);

    const handleSelectAllDialogueAudio = (checked: boolean | 'indeterminate') => {
        if (checked === true) {
            setSelectedDialogueAudio(new Set(dialogueAudioIds));
        } else {
            setSelectedDialogueAudio(new Set());
        }
    };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Data Tools</h1>
        <p className="text-muted-foreground mt-1">
          Tools to manage and maintain the integrity of the application data.
        </p>
      </div>

      <div className="space-y-6">
        {/* Dialogue Audio Validator */}
        <Card>
          <CardHeader className="flex flex-row items-start gap-4 space-y-0">
            <div className="p-3 bg-secondary rounded-lg border"><FileSearch2 className="w-5 h-5 text-primary" /></div>
            <div className="flex-1"><CardTitle className="text-lg font-semibold">Dialogue Audio Validator</CardTitle><CardDescription className="mt-1">Scan de database op gepubliceerde lessen en controleer of de bijbehorende dialoog-audiobestanden bestaan.</CardDescription></div>
          </CardHeader>
          <CardContent>
            <Button onClick={handleValidateDialogueAudio} disabled={loading === 'dialogueAudio'}>
              {loading === 'dialogueAudio' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />} Scan Database Lessen
            </Button>
            {dialogueAudioProblems.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center gap-4 mb-4">
                      <Select value={dialogueTtsVoice} onValueChange={setDialogueTtsVoice}>
                          <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                              <SelectItem value="Siti">Stem: Siti (Vrouwelijk)</SelectItem>
                              <SelectItem value="Budi">Stem: Budi (Mannelijk)</SelectItem>
                          </SelectContent>
                      </Select>
                      <Button onClick={handleGenerateSelectedDialogueAudio} disabled={selectedDialogueAudio.size === 0 || loading === 'dialogueAudio'}>
                          {loading === 'dialogueAudio' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />} Genereer Audio ({selectedDialogueAudio.size})
                      </Button>
                  </div>
                  <Table><TableHeader><TableRow>
                    <TableHead className="w-10">
                         <Checkbox
                            checked={dialogueAudioIds.length > 0 && selectedDialogueAudio.size === dialogueAudioIds.length ? true : selectedDialogueAudio.size > 0 ? 'indeterminate' : false}
                            onCheckedChange={handleSelectAllDialogueAudio}
                            disabled={dialogueAudioIds.length === 0}
                            aria-label="Select all dialogue items"
                        />
                    </TableHead>
                    <TableHead>Les</TableHead><TableHead>Tekst</TableHead><TableHead>Pad Audiobestand</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {dialogueAudioProblems.map(problem => (
                            <TableRow key={problem.id}>
                                <TableCell><Checkbox checked={selectedDialogueAudio.has(problem.id)} onCheckedChange={(checked) => handleDialogueAudioSelection(problem.id, !!checked)}/></TableCell>
                                <TableCell className="font-medium">{problem.lessonFile}</TableCell>
                                <TableCell className="text-muted-foreground italic">&quot;{problem.dialogueText}&quot;</TableCell>
                                <TableCell><code>{problem.audioPath}</code></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
            )}
          </CardContent>
        </Card>
        
        {/* Word Audio Path Validator */}
        <Card>
          <CardHeader className="flex flex-row items-start gap-4 space-y-0">
             <div className="p-3 bg-secondary rounded-lg border"><AudioWaveform className="w-5 h-5 text-primary" /></div>
            <div className="flex-1"><CardTitle className="text-lg font-semibold">Word Audio Path Validator</CardTitle><CardDescription className="mt-1">Scan de database op incorrecte of ontbrekende audiopaden voor woorden.</CardDescription></div>
          </CardHeader>
          <CardContent>
            <Button onClick={handleValidateWordAudio} disabled={loading === 'wordAudio'}>
              {loading === 'wordAudio' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />} Valideer Woorden Paden
            </Button>
            {wordAudioProblems.length > 0 && (
                <div className="mt-4">
                  <div className="flex justify-end mb-2">
                      <Button onClick={handleFixSelectedWordPaths} size="sm" disabled={selectedWordAudioFixes.size === 0 || loading === 'wordAudio'}>
                        {loading === 'wordAudio' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />} Herstel Selectie ({selectedFixableWordCount})
                      </Button>
                  </div>
                  <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-10">
                               <Checkbox
                                    checked={fixableWordAudioIds.length > 0 && selectedFixableWordCount === fixableWordAudioIds.length ? true : selectedFixableWordCount > 0 ? 'indeterminate' : false}
                                    onCheckedChange={handleSelectAllFixableWords}
                                    disabled={fixableWordAudioIds.length === 0}
                                    aria-label="Select all fixable items"
                                />
                            </TableHead>
                            <TableHead>Woord</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Huidig Pad</TableHead>
                            <TableHead>Verwacht Pad</TableHead>
                            <TableHead className="text-right">Actie</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                      {wordAudioProblems.map(p => (
                        <TableRow key={p.wordId}>
                          <TableCell><Checkbox checked={selectedWordAudioFixes.has(p.wordId)} onCheckedChange={(c) => handleWordAudioFixSelection(p.wordId, !!c)} disabled={p.status !== 'INCORRECT_PATH'}/></TableCell>
                          <TableCell className="font-medium">{p.javanese}</TableCell>
                          <TableCell>
                            {p.status === 'MISSING_FILE' ? (
                                <span className="text-red-600 font-medium">Bestand Ontbreekt</span>
                            ) : (
                                <span className="text-orange-600 font-medium">Pad Incorrect (Herstelbaar)</span>
                            )}
                          </TableCell>
                          <TableCell><code>{p.currentPath || 'N/A'}</code></TableCell>
                          <TableCell><code>{p.expectedPath}</code></TableCell>
                          <TableCell className="text-right">
                              {p.status === 'INCORRECT_PATH' && (
                                <Button size="sm" variant="outline" onClick={() => handleFixSingleWordPath(p.wordId, p.expectedPath)} disabled={loading === 'wordAudio'}>Herstel</Button>
                              )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
            )}
          </CardContent>
        </Card>

        {/* Find Duplicate Words */}
        <Card>
          <CardHeader className="flex flex-row items-start gap-4 space-y-0">
            <div className="p-3 bg-secondary rounded-lg border"><CopyCheck className="w-5 h-5 text-primary" /></div>
            <div className="flex-1"><CardTitle className="text-lg font-semibold">Find Duplicate Words</CardTitle><CardDescription className="mt-1">Scan the database for words with the same Javanese and Dutch pair, ignoring capitalization, to help clean up the data.</CardDescription></div>
          </CardHeader>
          <CardContent>
            <Button onClick={handleFindDuplicates} disabled={loading === 'duplicates'}>
               {loading === 'duplicates' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />} Find Duplicates
            </Button>
            {duplicates.length > 0 && (
                <div className="mt-4 space-y-4">
                  {duplicates.map((group, index) => (
                      <div key={index} className="p-4 border rounded-md">
                          <h4 className="font-semibold">{group[0].javanese} / {group[0].dutch}</h4>
                          <Table><TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Categorie</TableHead><TableHead className="text-right">Actie</TableHead></TableRow></TableHeader>
                              <TableBody>
                                {group.map(word => (
                                    <TableRow key={word.id}>
                                        <TableCell><code>{word.id}</code></TableCell>
                                        <TableCell>{word.category || 'N/A'}</TableCell>
                                        <TableCell className="text-right"><Button asChild variant="outline" size="sm"><Link href={`/admin/vocabulary/${word.id}/edit`}><LinkIcon className="mr-2 h-3 w-3"/>Bewerk</Link></Button></TableCell>
                                    </TableRow>
                                ))}
                              </TableBody>
                          </Table>
                      </div>
                  ))}
                </div>
            )}
          </CardContent>
        </Card>

        {/* Generate Seed Script */}
        <Card>
          <CardHeader className="flex flex-row items-start gap-4 space-y-0">
             <div className="p-3 bg-secondary rounded-lg border"><DatabaseBackup className="w-5 h-5 text-primary" /></div>
            <div className="flex-1"><CardTitle className="text-lg font-semibold">Generate Seed Script</CardTitle><CardDescription className="mt-1">Generate a TypeScript seed script from the current database state. This can be used to populate another database or reset the current one.</CardDescription></div>
          </CardHeader>
          <CardContent>
            <Button onClick={handleGenerateSeed} disabled={loading === 'seed'}>
              {loading === 'seed' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />} Generate Seed Script
            </Button>
            {seedScript && (
                <div className="mt-4 relative">
                    <Button onClick={handleCopyScript} size="sm" variant="outline" className="absolute top-2 right-2"><CopyCheck className="mr-2 h-4 w-4"/>Kopieer</Button>
                    <Textarea value={seedScript} readOnly rows={20} className="font-mono text-xs bg-muted/50"/>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
