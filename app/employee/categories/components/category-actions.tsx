"use client"

import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { deleteCategory, toggleCategoryStatus } from "../actions"

interface CategoryActionsProps {
    category: {
        id: number
        name: string
        is_active: boolean
    }
}

export function CategoryActions({ category }: CategoryActionsProps) {
    const handleDelete = async () => {
        if (confirm(`Are you sure you want to delete "${category.name}"?`)) {
            await deleteCategory(category.id)
        }
    }

    const handleToggleStatus = async () => {
        await toggleCategoryStatus(category.id, category.is_active)
    }

    return (
        <div className="flex gap-2">
            <form action={handleToggleStatus}>
                <Button variant="outline" size="sm" type="submit">
                    {category.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
            </form>
            <Button variant="outline" size="sm" asChild>
                <Link href={`/employee/categories/${category.id}/edit`}>
                    <Edit className="h-4 w-4" />
                </Link>
            </Button>
            <form action={handleDelete}>
                <Button variant="outline" size="sm" type="submit">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </form>
        </div>
    )
}
