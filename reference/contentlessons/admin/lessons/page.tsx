
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Edit, Filter, PlusCircle, Trash2, UploadCloud } from "lucide-react";
import Link from "next/link";
import { getLessonsFromDb, getModulesFromDb } from "@/lib/dal";
import { LessonsList } from "./lessons-list";

const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'published', label: 'Published' },
    { value: 'draft', label: 'Draft' },
];

export default async function AdminLessonsPage(
    props: { 
      searchParams: { [key: string]: string | string[] | undefined }
    }
) {
    const searchParams = props.searchParams;
    const search = typeof searchParams.search === 'string' ? searchParams.search : undefined;
    const moduleId = typeof searchParams.module === 'string' ? searchParams.module : undefined;
    const status = typeof searchParams.status === 'string' ? searchParams.status : undefined;

    const lessons = await getLessonsFromDb({ search, moduleId, status });
    const modules = await getModulesFromDb({});

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                        <CardTitle className="text-2xl">Manage Lessons</CardTitle>
                        <CardDescription>View, edit, and manage lessons.</CardDescription>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                        <Button variant="outline" asChild>
                            <Link href="/admin/lessons/bulk-import">
                                <UploadCloud className="mr-2 h-4 w-4" />
                                Bulk Import Lessons
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href="/admin/lessons/new">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Create New Lesson
                            </Link>
                        </Button>
                    </div>
                </div>
                 <form className="pt-6">
                    <div className="border rounded-lg p-4">
                         <div className="flex items-center gap-2 mb-4">
                            <Filter className="h-5 w-5" />
                            <h3 className="text-lg font-semibold">Filter Lessons</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 items-end gap-6">
                            <div className="grid gap-2 lg:col-span-2">
                                <Label htmlFor="search">Search Title/Description</Label>
                                <Input id="search" name="search" placeholder="Zoek op titel of beschrijving..." defaultValue={search}/>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="module">Filter by Module</Label>
                                <Select name="module" defaultValue={moduleId ?? 'all'}>
                                    <SelectTrigger id="module">
                                        <SelectValue placeholder="All Modules" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Modules</SelectItem>
                                        {modules.map(module => <SelectItem key={module.id} value={module.id}>{module.title}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="status">Filter by Status</Label>
                                <Select name="status" defaultValue={status ?? 'all'}>
                                    <SelectTrigger id="status">
                                        <SelectValue placeholder="All Statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statusOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="flex gap-2">
                                <Button type="submit" className="w-full">Apply Filters</Button>
                                <Button variant="outline" asChild className="w-full">
                                    <Link href="/admin/lessons">Reset</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </CardHeader>
            <CardContent>
                <LessonsList lessons={lessons} />
            </CardContent>
        </Card>
    );
}
