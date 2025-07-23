"use client"

import { useFormState, useFormStatus } from "react-dom"
import { createProduct } from "../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

interface FormState {
    error?: string;
    success?: boolean;
}

const initialState: FormState = {
    error: undefined,
    success: false
}

export function ProductForm({ categories }: { categories: any[] }) {
    const [state, formAction] = useFormState<FormState, FormData>(createProduct, initialState)

    return (
        <form action={formAction} className="space-y-6">
            {/* Error message display */}
            {state?.error && (
                <div className="p-4 bg-red-100 text-red-700 rounded-md">
                    {state.error}
                </div>
            )}

            {/* Success message display */}
            {state?.success && (
                <div className="p-4 bg-green-100 text-green-700 rounded-md">
                    Product created successfully!
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input id="name" name="name" required />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="sku">SKU</Label>
                    <Input id="sku" name="sku" placeholder="e.g., PROD-001" />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="image">Product Image *</Label>
                <Input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/*"
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" rows={4} />
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                    <Label htmlFor="price">Price *</Label>
                    <Input id="price" name="price" type="number" step="0.01" min="0" required />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="comparePrice">Compare Price</Label>
                    <Input id="comparePrice" name="comparePrice" type="number" step="0.01" min="0" />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="costPrice">Cost Price</Label>
                    <Input id="costPrice" name="costPrice" type="number" step="0.01" min="0" />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="categoryId">Category</Label>
                <Select name="categoryId">
                    <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories?.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                                {category.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="inventoryQuantity">Inventory Quantity</Label>
                    <Input
                        id="inventoryQuantity"
                        name="inventoryQuantity"
                        type="number"
                        min="0"
                        defaultValue="1"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                    <Input
                        id="lowStockThreshold"
                        name="lowStockThreshold"
                        type="number"
                        min="0"
                    />
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <Label htmlFor="trackInventory">Track Inventory</Label>
                        <p className="text-sm text-gray-600">Monitor stock levels for this product</p>
                    </div>
                    <Switch id="trackInventory" name="trackInventory" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <Label htmlFor="isActive">Active</Label>
                        <p className="text-sm text-gray-600">Product is visible to customers</p>
                    </div>
                    <Switch id="isActive" name="isActive" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <Label htmlFor="isFeatured">Featured</Label>
                        <p className="text-sm text-gray-600">Show product in featured sections</p>
                    </div>
                    <Switch id="isFeatured" name="isFeatured" />
                </div>
            </div>

            <div className="flex gap-4">
                <SubmitButton />
                <Button type="button" variant="outline" asChild>
                    <Link href="/employee/products">Cancel</Link>
                </Button>
            </div>
        </form>
    )
}

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button type="submit" disabled={pending}>
            {pending ? "Creating..." : "Create Product"}
        </Button>
    )
}