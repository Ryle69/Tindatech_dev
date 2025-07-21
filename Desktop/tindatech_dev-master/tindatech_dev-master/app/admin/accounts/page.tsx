// admin/accounts/page.tsx (updated version)
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Search, Edit, Trash2, Users } from "lucide-react"
import { createEmployeeAccount, updateEmployeeAccount, deleteEmployeeAccount, getEmployeeAccounts } from "./actions"
import { useToast } from "@/components/ui/use-toast"

interface Employee {
    id: string
    auth_id: string
    first_name: string
    last_name: string
    email: string
    role: 'employee'
    status: string
    created_at: string
}

export default function ManageAccountsPage() {
    const [employees, setEmployees] = useState<Employee[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const { toast } = useToast()

    useEffect(() => {
        async function fetchEmployees() {
            setIsLoading(true)
            const { data, error } = await getEmployeeAccounts()

            if (error) {
                toast({
                    title: "Error",
                    description: error,
                    variant: "destructive",
                })
            } else if (data) {
                setEmployees(data.map(emp => ({
                    ...emp,
                    status: "Active" // You might want to get this from auth status
                })))
            }
            setIsLoading(false)
        }

        fetchEmployees()
    }, [toast])

    const filteredEmployees = employees.filter(
        (employee) =>
            `${employee.first_name} ${employee.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.email.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    async function handleCreateEmployee(formData: FormData) {
        setIsLoading(true)

        try {
            const result = await createEmployeeAccount(formData)

            if (result.error) {
                toast({
                    title: "Error",
                    description: result.error,
                    variant: "destructive",
                })
            } else {
                toast({
                    title: "Success",
                    description: result.success,
                })

                // Refresh employee list
                const { data } = await getEmployeeAccounts()
                if (data) {
                    setEmployees(data.map(emp => ({
                        ...emp,
                        status: "Active"
                    })))
                }

                setIsCreateDialogOpen(false)
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create employee account",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    async function handleUpdateEmployee(formData: FormData) {
        if (!selectedEmployee) return

        setIsLoading(true)

        try {
            const result = await updateEmployeeAccount(selectedEmployee.auth_id, formData)

            if (result.error) {
                toast({
                    title: "Error",
                    description: result.error,
                    variant: "destructive",
                })
            } else {
                toast({
                    title: "Success",
                    description: result.success,
                })

                // Refresh employee list
                const { data } = await getEmployeeAccounts()
                if (data) {
                    setEmployees(data.map(emp => ({
                        ...emp,
                        status: "Active"
                    })))
                }

                setIsEditDialogOpen(false)
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update employee account",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    async function handleDeleteEmployee() {
        if (!selectedEmployee) return

        setIsLoading(true)

        try {
            const result = await deleteEmployeeAccount(selectedEmployee.auth_id)

            if (result.error) {
                toast({
                    title: "Error",
                    description: result.error,
                    variant: "destructive",
                })
            } else {
                toast({
                    title: "Success",
                    description: result.success,
                })

                // Refresh employee list
                const { data } = await getEmployeeAccounts()
                if (data) {
                    setEmployees(data.map(emp => ({
                        ...emp,
                        status: "Active"
                    })))
                }

                setIsDeleteDialogOpen(false)
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete employee account",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    function openEditDialog(employee: Employee) {
        setSelectedEmployee(employee)
        setIsEditDialogOpen(true)
    }

    function openDeleteDialog(employee: Employee) {
        setSelectedEmployee(employee)
        setIsDeleteDialogOpen(true)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manage Accounts</h1>
                    <p className="text-muted-foreground">Create and manage employee accounts</p>
                </div>

                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add New Employee
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Create Employee Account</DialogTitle>
                            <DialogDescription>
                                Add a new employee to the system. They will receive login credentials via email.
                            </DialogDescription>
                        </DialogHeader>

                        <form id="employee-form" action={handleCreateEmployee} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input id="firstName" name="firstName" placeholder="John" required disabled={isLoading} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input id="lastName" name="lastName" placeholder="Doe" required disabled={isLoading} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="john@company.com"
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <Select name="role" required disabled={isLoading}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Employee">Employee</SelectItem>
                                        <SelectItem value="Manager">Manager</SelectItem>
                                        <SelectItem value="Admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Temporary Password</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="Temporary password"
                                    required
                                    minLength={6}
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={isLoading}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? "Creating..." : "Create Account"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Employee List
                    </CardTitle>
                    <CardDescription>Manage all employee accounts in the system</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search employees..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            Loading employees...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredEmployees.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            No employees found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredEmployees.map((employee) => (
                                        <TableRow key={employee.auth_id}>
                                            <TableCell className="font-medium">{`${employee.first_name} ${employee.last_name}`}</TableCell>
                                            <TableCell>{employee.email}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{employee.role}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={employee.status === "Active" ? "default" : "secondary"}>
                                                    {employee.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{new Date(employee.created_at).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => openEditDialog(employee)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-600 hover:text-red-700"
                                                        onClick={() => openDeleteDialog(employee)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Edit Employee Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Employee Account</DialogTitle>
                        <DialogDescription>
                            Update employee details.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedEmployee && (
                        <form id="edit-employee-form" action={handleUpdateEmployee} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-firstName">First Name</Label>
                                    <Input
                                        id="edit-firstName"
                                        name="firstName"
                                        defaultValue={selectedEmployee.first_name}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-lastName">Last Name</Label>
                                    <Input
                                        id="edit-lastName"
                                        name="lastName"
                                        defaultValue={selectedEmployee.last_name}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-email">Email</Label>
                                <Input
                                    id="edit-email"
                                    name="email"
                                    type="email"
                                    defaultValue={selectedEmployee.email}
                                    disabled
                                    className="opacity-70"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-role">Role</Label>
                                <Select name="role" defaultValue={selectedEmployee.role} required disabled={isLoading}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Employee">Employee</SelectItem>
                                        <SelectItem value="Manager">Manager</SelectItem>
                                        <SelectItem value="Admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isLoading}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? "Updating..." : "Save Changes"}
                                </Button>
                            </div>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Delete Employee Account</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this employee account? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedEmployee && (
                        <div className="space-y-4">
                            <div className="p-4 border rounded-lg">
                                <h4 className="font-medium">{`${selectedEmployee.first_name} ${selectedEmployee.last_name}`}</h4>
                                <p className="text-sm text-muted-foreground">{selectedEmployee.email}</p>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Role: <Badge variant="outline" className="ml-1">{selectedEmployee.role}</Badge>
                                </p>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsDeleteDialogOpen(false)}
                                    disabled={isLoading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={handleDeleteEmployee}
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Deleting..." : "Delete Account"}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}