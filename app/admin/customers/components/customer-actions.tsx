"use client"

import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { deleteCustomer } from "../actions"

interface CustomerActionsProps {
    customer: {
        id: number
        first_name: string
        last_name: string
    }
}

export function CustomerActions({ customer }: CustomerActionsProps) {
    const handleDelete = async () => {
        if (confirm(`Are you sure you want to delete "${customer.first_name} ${customer.last_name}"?`)) {
            await deleteCustomer(customer.id)
        }
    }

    return (
        <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/customers/${customer.id}/edit`}>
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
