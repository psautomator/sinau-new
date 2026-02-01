
'use client';

import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, UploadCloud } from 'lucide-react';

export function ModuleActionButtons() {
    const { hasPermission } = useAuth();

    if (!hasPermission('module_add')) {
        return null;
    }

    return (
        <div className="flex gap-2 flex-shrink-0">
            <Button variant="outline" asChild>
                <Link href="/admin/modules/bulk-import">
                    <UploadCloud className="mr-2 h-4 w-4" />
                    Bulk Import JSON
                </Link>
            </Button>
            <Button asChild>
                <Link href="/admin/modules/new">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Module
                </Link>
            </Button>
        </div>
    );
}
