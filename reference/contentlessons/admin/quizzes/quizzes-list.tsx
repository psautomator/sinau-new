'use client';

import * as React from 'react';
import type { Quiz, Prisma } from '@prisma/client';
import { useToast } from '@/hooks/use-toast';
import { toggleQuizPublishAction } from './actions';
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

interface QuizzesListProps {
  quizzes: Quiz[];
}

export function QuizzesList({ quizzes }: QuizzesListProps) {
  const [isPending, startTransition] = React.useTransition();
  const { toast } = useToast();

  const handleTogglePublish = (id: string, isPublished: boolean) => {
    startTransition(async () => {
      const result = await toggleQuizPublishAction(id, isPublished);
      if (result.success) {
        toast({ title: "Success", description: `Quiz status has been ${isPublished ? 'published' : 'unpublished'}.` });
      } else {
        toast({ variant: 'destructive', title: "Error", description: result.error });
      }
    });
  };

  return (
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead className="w-2/6">Title</TableHead>
                <TableHead className="w-3/6">Description</TableHead>
                <TableHead>Questions</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="text-right">Actions</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {quizzes.map((quiz) => (
                <TableRow key={quiz.id}>
                    <TableCell className="font-medium">{quiz.title}</TableCell>
                    <TableCell className="text-muted-foreground">{quiz.description}</TableCell>
                    <TableCell className="text-center">
                        {(quiz.questions as Prisma.JsonArray)?.length ?? 0}
                    </TableCell>
                    <TableCell>
                        <Switch 
                            checked={quiz.isPublished}
                            onCheckedChange={(checked) => handleTogglePublish(quiz.id, checked)}
                            disabled={isPending}
                            aria-label="Published toggle" 
                        />
                    </TableCell>
                    <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
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
