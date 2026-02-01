
'use server';

import { revalidatePath } from 'next/cache';
import { ModuleImportSchema, type ModuleImportData, moduleFormSchema, type ModuleFormData } from '@/lib/data';
import { bulkUpsertModules, createModule, updateModule, deleteModule, toggleModulePublishInDb } from '@/lib/dal';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth-utils';
import { hasPermission } from '@/lib/permissions';

interface BulkImportResult {
    success: boolean;
    message: string;
    createdCount?: number;
    updatedCount?: number;
    error?: string;
}

async function checkPermission(permission: 'module_add' | 'module_edit' | 'module_delete' | 'module_publish') {
    const user = await getCurrentUser();
    if (!user) throw new Error("Authentication required.");
    if (!hasPermission(user.role, permission)) {
        throw new Error("Authorization denied.");
    }
    return user;
}


export async function bulkImportModulesAction(jsonString: string): Promise<BulkImportResult> {
    await checkPermission('module_add');
    let data: ModuleImportData;
    try {
        const jsonData = JSON.parse(jsonString);
        
        const dataToValidate = Array.isArray(jsonData) ? jsonData : [jsonData];

        const validationResult = ModuleImportSchema.safeParse(dataToValidate);
        
        if (!validationResult.success) {
            console.error("Zod validation error:", validationResult.error.flatten());
            return {
                success: false,
                message: "JSON validation failed. Please check the format.",
                error: JSON.stringify(validationResult.error.flatten()),
            };
        }
        data = validationResult.data;
    } catch (e) {
        return { success: false, message: "Invalid JSON string. Please check for syntax errors." };
    }

    if (data.length === 0) {
        return { success: false, message: "No modules found in the provided JSON." };
    }

    try {
        const { createdCount, updatedCount } = await bulkUpsertModules(data);
        
        revalidatePath('/admin/modules');

        return {
            success: true,
            message: `Import successful! ${createdCount} modules created, ${updatedCount} modules updated.`,
            createdCount,
            updatedCount,
        };
    } catch (error) {
        console.error("Bulk import failed:", error);
        return { success: false, message: "An error occurred during the database import." };
    }
}


export async function createModuleAction(data: ModuleFormData) {
    await checkPermission('module_add');
    const validationResult = moduleFormSchema.safeParse(data);
    if (!validationResult.success) {
        return { success: false, error: "Validation failed.", issues: validationResult.error.flatten() };
    }
    
    try {
        await createModule(validationResult.data);
    } catch (error) {
        return { success: false, error: "Database error." };
    }

    revalidatePath('/admin/modules');
    redirect('/admin/modules');
}

export async function updateModuleAction(id: string, data: ModuleFormData) {
    await checkPermission('module_edit');
    const validationResult = moduleFormSchema.safeParse(data);
    if (!validationResult.success) {
        return { success: false, error: "Validation failed.", issues: validationResult.error.flatten() };
    }

    try {
        await updateModule(id, validationResult.data);
    } catch (error) {
        return { success: false, error: "Database error." };
    }

    revalidatePath('/admin/modules');
    revalidatePath(`/admin/modules/${id}/edit`);
    return { success: true, message: "Module updated successfully." };
}

export async function deleteModuleAction(id: string) {
    await checkPermission('module_delete');
    try {
        await deleteModule(id);
        revalidatePath('/admin/modules');
        revalidatePath(`/admin/modules/${id}/edit`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || "Database error." };
    }
}

export async function toggleModulePublishAction(id: string, isPublished: boolean) {
    await checkPermission('module_publish');
    try {
        await toggleModulePublishInDb(id, isPublished);
        revalidatePath('/admin/modules');
        return { success: true, message: `Module status updated.` };
    } catch (error) {
        return { success: false, error: "Database error." };
    }
}
