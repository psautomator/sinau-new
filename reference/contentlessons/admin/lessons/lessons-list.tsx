'use client';

import * as React from 'react';
import type { Prisma } from '@prisma/client';
import { useToast } from '@/hooks/use-toast';
import { toggleLessonPublishAction } from './actions';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import Link from 'next/link';

type LessonsWithModule = Prisma.LessonGetPayload<{ include: { module: true } }>;

interface LessonsListProps {
  lessons: LessonsWithModule[];
}

export function LessonsList({ lessons }: LessonsListProps) {
  const [isPending, startTransition] = React.useTransition();
  const { toast } = useToast();

  const handleTogglePublish = (id: string, isPublished: boolean) => {
    startTransition(async () => {
      const result = await toggleLessonPublishAction(id, isPublished);
      if (result.success) {
        toast({ title: "Success", description: `Lesson status has been ${isPublished ? 'published' : 'unpublished'}.` });
      } else {
        toast({ variant: 'destructive', title: "Error", description: result.error });
      }
    });
  };

  return (
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead className="w-2/5">Title</TableHead>
                <TableHead className="w-2/5">Module</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="text-right">Actions</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {lessons.map((lesson) => (
                <TableRow key={lesson.id}>
                    <TableCell className="font-medium">{lesson.title}</TableCell>
                    <TableCell>{lesson.module.title}</TableCell>
                    <TableCell>{lesson.order}</TableCell>
                    <TableCell>
                        <Switch 
                            checked={lesson.isPublished}
                            onCheckedChange={(checked) => handleTogglePublish(lesson.id, checked)}
                            disabled={isPending}
                            aria-label="Published toggle" 
                        />
                    </TableCell>
                    <TableCell className="text-right">
                        <Button asChild variant="ghost" size="icon">
                            <Link href={`/admin/lessons/${lesson.id}/edit`}>
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                            </Link>
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                        </Button>
                    </TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
  );
}
