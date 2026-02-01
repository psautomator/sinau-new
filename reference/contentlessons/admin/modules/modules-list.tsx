
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Module } from '@prisma/client';
import { useToast } from '@/hooks/use-toast';
import { deleteModuleAction, toggleModulePublishAction } from './actions';
import { useAuth } from '@/contexts/auth-context';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit, Trash2 } from 'lucide-react';

interface ModulesListProps {
  modules: (Module & { _count: { lessons: number } })[];
}

export function ModulesList({ modules }: ModulesListProps) {
  const [isPending, startTransition] = React.useTransition();
  const { toast } = useToast();
  const router = useRouter();
  const { hasPermission } = useAuth();

  const handleTogglePublish = (id: string, isPublished: boolean) => {
    startTransition(async () => {
      try {
        await toggleModulePublishAction(id, isPublished);
        toast({ title: "Success", description: `Module has been ${isPublished ? 'published' : 'unpublished'}.` });
        router.refresh();
      } catch (error) {
        toast({ variant: 'destructive', title: "Error", description: (error as Error).message });
      }
    });
  };

  const handleDelete = async (id: string) => {
    try {
        await deleteModuleAction(id);
        toast({ title: "Success", description: "Module has been deleted." });
        router.refresh();
    } catch (error) {
        toast({ variant: 'destructive', title: "Error", description: (error as Error).message });
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-2/5">Title</TableHead>
          <TableHead>Level</TableHead>
          <TableHead>Order</TableHead>
          <TableHead>Published</TableHead>
          <TableHead>Lesson Count</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {modules.map((moduleItem) => (
          <TableRow key={moduleItem.id}>
            <TableCell className="font-medium">{moduleItem.title}</TableCell>
            <TableCell><Badge variant="outline">{moduleItem.level}</Badge></TableCell>
            <TableCell>{moduleItem.order}</TableCell>
            <TableCell>
              <Switch
                checked={moduleItem.isPublished}
                onCheckedChange={(checked) => handleTogglePublish(moduleItem.id, checked)}
                disabled={isPending || !hasPermission('module_publish')}
                aria-label="Published toggle"
              />
            </TableCell>
            <TableCell>{moduleItem._count.lessons}</TableCell>
            <TableCell className="text-right">
              {hasPermission('module_edit') && (
                <Button asChild variant="ghost" size="icon">
                  <Link href={`/admin/modules/${moduleItem.id}/edit`}>
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Link>
                </Button>
              )}
              {hasPermission('module_delete') && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" disabled={isPending}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the module '{moduleItem.title}' and all its associated lessons.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(moduleItem.id)} className="bg-destructive hover:bg-destructive/90">
                        Yes, delete module
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
