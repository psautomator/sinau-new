
import { notFound } from 'next/navigation';
import { ArrowLeft, Edit, Save, Trash2, Wand2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { getLessonById, getModulesFromDb } from '@/lib/dal';

export default async function EditLessonPage(props: { params: Promise<{ lessonId: string }> }) {
    const params = await props.params;
    const lessonToEdit = await getLessonById(params.lessonId);
    const modules = await getModulesFromDb({});

    if (!lessonToEdit) {
      notFound();
    }

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

          <Card>
              <CardHeader>
                  <div className="flex items-start gap-4">
                      <div className="p-3 bg-secondary rounded-lg border">
                          <Edit className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                          <CardTitle className="text-2xl">Edit Lesson Metadata</CardTitle>
                          <CardDescription>
                              Pas de basisgegevens van de les aan. De inhoud van de les (tekst, quizzen) wordt op een aparte pagina bewerkt.
                          </CardDescription>
                      </div>
                  </div>
              </CardHeader>
              <CardContent className="space-y-6">
                  <div className="grid gap-2">
                      <Label htmlFor="title">Title</Label>
                      <Input id="title" defaultValue={lessonToEdit.title} />
                  </div>
                  <div className="grid gap-2">
                      <Label htmlFor="description">Description (Optional)</Label>
                      <Textarea id="description" defaultValue={lessonToEdit.description ?? ''} />
                  </div>
                  <div className="grid gap-2">
                      <Label htmlFor="module">Module</Label>
                      <Select defaultValue={lessonToEdit.moduleId}>
                          <SelectTrigger id="module">
                              <SelectValue placeholder="Select a module..." />
                          </SelectTrigger>
                          <SelectContent>
                             {modules.map(module => (
                                  <SelectItem key={module.id} value={module.id}>{module.title}</SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="grid gap-2">
                          <Label htmlFor="order">Order Within Module</Label>
                          <Input id="order" type="number" defaultValue={lessonToEdit.order} />
                      </div>
                       <div className="flex items-end">
                          <div className="flex items-center space-x-2 h-10">
                              <Checkbox id="publish" defaultChecked={lessonToEdit.isPublished} />
                              <Label htmlFor="publish" className="font-medium">Publish Lesson</Label>
                          </div>
                      </div>
                  </div>
              </CardContent>
               <CardFooter className="flex justify-between items-center pt-6">
                  <Button variant="destructive" size="lg">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Lesson
                  </Button>
                  <div className="flex gap-2">
                      <Button size="lg" variant="outline" asChild>
                         <Link href={`/admin/lessons/${params.lessonId}/edit-content`}>
                           <Wand2 className="mr-2 h-4 w-4" />
                           Edit Lesson Content
                         </Link>
                      </Button>
                      <Button size="lg">
                          <Save className="mr-2 h-4 w-4" />
                          Update Metadata
                      </Button>
                  </div>
              </CardFooter>
          </Card>
      </div>
    );
}
