
import { ArrowLeft, FilePlus, Save } from "lucide-react";
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
import { getModulesFromDb } from "@/lib/dal";

export default async function NewLessonPage() {
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

        <Card>
            <CardHeader>
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-secondary rounded-lg border">
                        <FilePlus className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl">Create New Lesson</CardTitle>
                        <CardDescription>
                            Vul de details in voor de nieuwe les. Na aanmaak wordt er een standaard-sjabloon voor de inhoud toegevoegd en word je doorgestuurd om deze verder te bewerken.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" placeholder="e.g., Introduction to Krama" />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea id="description" placeholder="A brief overview of what this lesson covers" />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="module">Module</Label>
                    <Select>
                        <SelectTrigger id="module">
                            <SelectValue placeholder="Select a module..." />
                        </SelectTrigger>
                        <SelectContent>
                           {modules.map(module => (
                                <SelectItem key={module.id} value={module.id}>{module.title} (Lvl {module.level})</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="order">Order Within Module</Label>
                        <Input id="order" type="number" placeholder="1" />
                    </div>
                     <div className="flex items-end">
                        <div className="flex items-center space-x-2 h-10">
                            <Checkbox id="publish" />
                            <Label htmlFor="publish" className="font-medium">Publish Lesson</Label>
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end">
                <Button size="lg">
                    Create Lesson & Continue
                </Button>
            </CardFooter>
        </Card>
    </div>
  );
}
