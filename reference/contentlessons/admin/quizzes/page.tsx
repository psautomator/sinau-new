
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
import { Filter, PlusCircle, UploadCloud } from "lucide-react";
import Link from "next/link";
import { getQuizzesFromDb } from "@/lib/dal";
import { QuizzesList } from "./quizzes-list";

const statuses = [
    { value: 'all', label: 'Alle Statussen' },
    { value: 'published', label: 'Published' },
    { value: 'draft', label: 'Draft' },
];

export default async function AdminQuizzesPage(
    props: { 
      searchParams: { [key: string]: string | string[] | undefined }
    }
) {
    const searchParams = props.searchParams;
    const status = typeof searchParams.status === 'string' ? searchParams.status : undefined;
    const search = typeof searchParams.search === 'string' ? searchParams.search : undefined;

    const quizzes = await getQuizzesFromDb({ status, search });

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                        <CardTitle className="text-2xl">Manage Quizzes</CardTitle>
                        <CardDescription>Create, edit, and manage quizzes and their questions.</CardDescription>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                        <Button variant="outline" asChild>
                           <Link href="/admin/quizzes/bulk-import">
                                <UploadCloud className="mr-2 h-4 w-4" />
                                Bulk Import JSON
                           </Link>
                        </Button>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Create New Quiz
                        </Button>
                    </div>
                </div>
                 <form className="pt-6">
                    <div className="border rounded-lg p-4">
                         <div className="flex items-center gap-2 mb-4">
                            <Filter className="h-5 w-5" />
                            <h3 className="text-lg font-semibold">Filter Quizzes</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-end gap-6">
                            <div className="grid gap-2 lg:col-span-2">
                                <Label htmlFor="search">Search Title/Description</Label>
                                <Input id="search" name="search" placeholder="Zoek op titel of beschrijving..." defaultValue={search} />
                            </div>
                           
                            <div className="grid gap-2">
                                <Label htmlFor="status">Filter by Status</Label>
                                <Select name="status" defaultValue={status ?? 'all'}>
                                    <SelectTrigger id="status">
                                        <SelectValue placeholder="All Statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statuses.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="flex gap-2 md:col-start-2 lg:col-start-3">
                                <Button type="submit" className="w-full">Apply Filters</Button>
                                <Button variant="outline" asChild className="w-full">
                                    <Link href="/admin/quizzes">Reset</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </CardHeader>
            <CardContent>
                <QuizzesList quizzes={quizzes} />
            </CardContent>
        </Card>
    );
}
