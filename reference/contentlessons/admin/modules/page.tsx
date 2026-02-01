
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
import { getModulesFromDb } from "@/lib/dal";
import { ModulesList } from "./modules-list";
import { ModuleActionButtons } from "./module-action-buttons";

const levels = [
    { value: 'all', label: 'All Levels' },
    { value: 'A1', label: 'A1' },
    { value: 'A2', label: 'A2' },
    { value: 'B1', label: 'B1' },
    { value: 'C1', label: 'C1' },
    { value: 'C2', label: 'C2' },
];

const statuses = [
    { value: 'all', label: 'All Statuses' },
    { value: 'published', label: 'Published' },
    { value: 'draft', label: 'Draft' },
];

export default async function AdminModulesPage(
    props: { 
      searchParams: { [key: string]: string | string[] | undefined }
    }
) {
    const { searchParams } = props;
    const search = typeof searchParams.search === 'string' ? searchParams.search : undefined;
    const level = typeof searchParams.level === 'string' ? searchParams.level : undefined;
    const status = typeof searchParams.status === 'string' ? searchParams.status : undefined;
    
    const modules = await getModulesFromDb({ search, level, status });

    return (
      <Card>
          <CardHeader>
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                      <CardTitle className="text-2xl">Manage Modules</CardTitle>
                      <CardDescription>Create, edit, and manage learning modules. Use the filters to find specific modules.</CardDescription>
                  </div>
                  <ModuleActionButtons />
              </div>
              <form className="pt-6">
                  <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-4">
                          <Filter className="h-5 w-5" />
                          <h3 className="text-lg font-semibold">Filter Modules</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 items-end gap-6">
                          <div className="grid gap-2 lg:col-span-2">
                              <Label htmlFor="search">Search Title</Label>
                              <Input id="search" name="search" placeholder="Zoek op titel..." defaultValue={search}/>
                          </div>
                           <div className="grid gap-2">
                              <Label htmlFor="level">Filter by Level</Label>
                              <Select name="level" defaultValue={level ?? 'all'}>
                                  <SelectTrigger id="level">
                                      <SelectValue placeholder="All Levels" />
                                  </SelectTrigger>
                                  <SelectContent>
                                      {levels.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
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
                                      {statuses.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                                  </SelectContent>
                              </Select>
                          </div>
                          <div className="flex gap-2">
                            <Button type="submit" className="w-full">Apply Filters</Button>
                            <Button variant="outline" asChild className="w-full">
                              <Link href="/admin/modules">Reset</Link>
                            </Button>
                          </div>
                      </div>
                  </div>
              </form>
          </CardHeader>
          <CardContent>
             <ModulesList modules={modules} />
          </CardContent>
      </Card>
    );
}
