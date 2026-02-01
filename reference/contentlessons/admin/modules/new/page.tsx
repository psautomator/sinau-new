
import { ArrowLeft, BookCopy } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModuleForm } from "../module-form";


export default function NewModulePage() {
  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/modules">
            <ArrowLeft className="mr-2 h-4 w-4" />
            TERUG NAAR MODULEOVERZICHT
          </Link>
        </Button>
      </div>

      <ModuleForm
        formTitle="Creëer Nieuwe Module"
        formDescription="Vul de details in om een nieuwe leermodule aan te maken."
      />
    </div>
  );
}
