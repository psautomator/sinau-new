import { getAllModulesSimple } from "@/dal/modules";
import BulkImportClient from "./BulkImportClient";

export const metadata = {
    title: "Bulk Import | AyoSinau Admin",
};

export default async function BulkImportPage() {
    const modules = await getAllModulesSimple();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8 pb-32">
            <BulkImportClient modules={modules} />
        </div>
    );
}
