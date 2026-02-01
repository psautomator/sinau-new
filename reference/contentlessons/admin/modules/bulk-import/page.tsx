'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, FileUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { bulkImportModulesAction } from '../actions';

interface ImportResult {
    success: boolean;
    message: string;
}

export default function BulkImportModulesPage() {
    const [jsonInput, setJsonInput] = React.useState('');
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [result, setResult] = React.useState<ImportResult | null>(null);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        setResult(null);

        const importResult = await bulkImportModulesAction(jsonInput);
        setResult(importResult);
        setIsSubmitting(false);

        if (importResult.success) {
            setJsonInput('');
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <Button asChild variant="outline" size="sm">
                    <Link href="/admin/modules">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Modules List
                    </Link>
                </Button>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-secondary rounded-lg border">
                                <FileUp className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl">Bulk Import Modules from JSON</CardTitle>
                                <CardDescription>
                                    Plak hier een JSON-array van moduleobjecten. De app zal proberen deze te importeren of bij te werken op basis van de moduletitel.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid w-full gap-2">
                            <Label htmlFor="json-input">JSON Content</Label>
                            <Textarea
                                id="json-input"
                                placeholder='[{"title": "My Module", "description": "...", "level": "A1", "order": 1, "isPublished": false}, ...]'
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
                        <Button type="submit" disabled={isSubmitting || !jsonInput}>
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
        </div>
    );
}
