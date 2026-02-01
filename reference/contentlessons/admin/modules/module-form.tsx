
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { Module } from '@prisma/client';
import { moduleFormSchema, type ModuleFormData, moduleLevelsList } from '@/lib/data';
import { createModuleAction, updateModuleAction, deleteModuleAction } from './actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit, BookOpen, Loader2, Save, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

interface ModuleFormProps {
  initialData?: Module | null;
  formTitle: string;
  formDescription: string;
}

export function ModuleForm({ initialData, formTitle, formDescription }: ModuleFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { hasPermission } = useAuth();
  const isEditMode = !!initialData;
  const [isDeleting, startDeleteTransition] = React.useTransition();

  const form = useForm<ModuleFormData>({
    resolver: zodResolver(moduleFormSchema),
    defaultValues: {
      title: initialData?.title ?? '',
      description: initialData?.description ?? '',
      order: initialData?.order ?? 1,
      isPublished: initialData?.isPublished ?? false,
      level: initialData?.level ?? 'A1',
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(data: ModuleFormData) {
    if (isEditMode && initialData) {
      const result = await updateModuleAction(initialData.id, data);
      if (result.success) {
        toast({ title: "Success!", description: "Module has been updated." });
        router.refresh();
      } else {
        toast({ variant: "destructive", title: "Error", description: result.error });
      }
    } else {
      await createModuleAction(data);
      toast({ title: "Success!", description: "Module has been created." });
    }
  }

  async function onDelete() {
    if (!initialData) return;
    startDeleteTransition(async () => {
      try {
        const result = await deleteModuleAction(initialData.id);
        if (result.success) {
            toast({ title: "Success!", description: "Module has been deleted." });
            router.push('/admin/modules');
        } else {
            toast({ variant: "destructive", title: "Error", description: result.error });
        }
      } catch (error) {
          toast({ variant: "destructive", title: "Authorization Error", description: (error as Error).message });
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-4">
          <div className="p-3 bg-secondary rounded-lg border">
            {isEditMode ? <Edit className="w-6 h-6 text-primary" /> : <BookOpen className="w-6 h-6 text-primary" />}
          </div>
          <div>
            <CardTitle className="text-2xl">{formTitle}</CardTitle>
            <CardDescription>{formDescription}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="uppercase text-xs font-bold text-muted-foreground">Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Module 1: Greetings" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="uppercase text-xs font-bold text-muted-foreground">Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A short summary of the module's content."
                      rows={5}
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-bold text-muted-foreground">Level (CEFR)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger><SelectValue placeholder="Select a level..." /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {moduleLevelsList.map((level) => (
                                <SelectItem key={level} value={level}>{level}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-bold text-muted-foreground">Order</FormLabel>
                    <FormControl>
                        <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="isPublished"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2 pt-2">
                    <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="font-medium uppercase text-xs !m-0">Publish Module</FormLabel>
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between items-center pt-6">
            <div>
              {isEditMode && hasPermission('module_delete') && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                            <Trash2 />
                            Delete Module
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the module and all associated lessons.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={onDelete} disabled={isSubmitting || isDeleting} className="bg-destructive hover:bg-destructive/90">
                                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Continue
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Save />
              )}
              {isEditMode ? 'Save Changes' : 'Create Module'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
