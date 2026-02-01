
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getModulesFromDb } from '@/lib/dal';
import { BulkImportForm } from './bulk-import-form';

export default async function BulkImportLessonsPage() {
    const modules = await getModulesFromDb({});

    return (
        <div className="space-y-6">
            <div>
                <Button asChild variant="outline" size="sm">
                    <Link href="/admin/lessons">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Lessons List
                    </Link>
                </Button>
            </div>
            <BulkImportForm modules={modules} />
        </div>
    );
}
