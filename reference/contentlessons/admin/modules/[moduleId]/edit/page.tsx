
import { notFound } from "next/navigation";
import { ArrowLeft, BookCopy, Edit } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge";
import { getModuleById } from "@/lib/dal";
import { ModuleForm } from "../../module-form";


export default async function EditModulePage(props: { params: Promise<{ moduleId: string }> }) {
    const params = await props.params;
    const moduleData = await getModuleById(params.moduleId);

    if (!moduleData) {
      notFound();
    }

    const getStatusVariant = (status: boolean) => {
      return status ? "default" : "secondary";
    };

    return (
      <div className="space-y-6">
        <div>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/modules">
              <ArrowLeft className="mr-2 h-4 w-4" />
              BACK TO MODULE OVERVIEW
            </Link>
          </Button>
        </div>

        <ModuleForm
          formTitle="Bewerk Module Details"
          formDescription="Pas de kerndetails van de module aan. De lessen hieronder worden automatisch bijgewerkt."
          initialData={moduleData}
        />

         <Card>
              <CardHeader>
                   <div className="flex items-start gap-4">
                      <div className="p-3 bg-secondary rounded-lg border">
                          <BookCopy className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                          <CardTitle className="text-xl">Lessen in deze Module ({moduleData.lessons.length})</CardTitle>
                          <CardDescription>
                              Overzicht van alle lessen die bij deze module horen.
                          </CardDescription>
                      </div>
                  </div>
              </CardHeader>
              <CardContent>
                  <Table>
                      <TableHeader>
                          <TableRow>
                              <TableHead>Volgorde</TableHead>
                              <TableHead className="w-full">Titel</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Actie</TableHead>
                          </TableRow>
                      </TableHeader>
                      <TableBody>
                          {moduleData.lessons.map((lesson) => (
                               <TableRow key={lesson.id}>
                                  <TableCell>{lesson.order}</TableCell>
                                  <TableCell className="font-medium">{lesson.title}</TableCell>
                                  <TableCell>
                                      <Badge variant={getStatusVariant(lesson.isPublished) as any}>
                                          {lesson.isPublished ? 'Gepubliceerd' : 'Concept'}
                                      </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                      <Button asChild variant="outline" size="sm">
                                          <Link href={`/admin/lessons/${lesson.id}/edit`}>
                                              BEWERK
                                          </Link>
                                      </Button>
                                  </TableCell>
                               </TableRow>
                          ))}
                      </TableBody>
                  </Table>
              </CardContent>
         </Card>

      </div>
    );
}
