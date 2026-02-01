
'use client';

import * as React from 'react';
import type { Module } from '@prisma/client';
import { FileUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { bulkImportLessonsAction } from '../actions';

interface ImportResult {
    success: boolean;
    message: string;
}

interface BulkImportFormProps {
    modules: Module[];
}

export function BulkImportForm({ modules }: BulkImportFormProps) {
    const [jsonInput, setJsonInput] = React.useState('');
    const [moduleId, setModuleId] = React.useState('');
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [result, setResult] = React.useState<ImportResult | null>(null);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        setResult(null);

        if (!moduleId) {
            setResult({ success: false, message: "Please select a module to import the lessons into." });
            setIsSubmitting(false);
            return;
        }

        const importResult = await bulkImportLessonsAction(moduleId, jsonInput);
        setResult(importResult);
        setIsSubmitting(false);

        if (importResult.success) {
            setJsonInput('');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-secondary rounded-lg border">
                            <FileUp className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl">Bulk Import Lessons from JSON</CardTitle>
                            <CardDescription>
                                Selecteer een module en plak hier een JSON-array van les-objecten. De app zal proberen de lessen te importeren of bij te werken.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid w-full gap-2">
                        <Label htmlFor="module-select">Target Module *</Label>
                        <Select onValueChange={setModuleId} value={moduleId}>
                            <SelectTrigger id="module-select">
                                <SelectValue placeholder="Select a module to import into..." />
                            </SelectTrigger>
                            <SelectContent>
                                {modules.map(module => (
                                    <SelectItem key={module.id} value={module.id}>
                                        {module.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid w-full gap-2">
                        <Label htmlFor="json-input">JSON Content *</Label>
                        <Textarea
                            id="json-input"
                            placeholder='[{"title": "My Lesson", "description": "...", "sections": [...]}, ...]'
                            rows={15}
                            value={jsonInput}
                            onChange={(e) => setJsonInput(e.target.value)}
                            required
                        />
                    </div>
                    {result && (
                         <Alert variant={result.success ? 'default' : 'destructive'}>
                            <AlertTitle>{result.success ? 'Success!' : 'Error'}</AlertTitle>
                            <AlertDescription>{result.message}</AlertDescription>
                        </Alert>
                    )}
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={isSubmitting || !jsonInput || !moduleId}>
                         {isSubmitting ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                         ) : (
                            <FileUp className="mr-2 h-4 w-4" />
                         )}
                        Start Import
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}
