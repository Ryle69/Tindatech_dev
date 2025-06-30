import { requireAdmin } from "@/utils/admin-middleware"
import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

export default async function SettingsPage() {
  await requireAdmin()

  const supabase = await createClient()

  const { data: settings } = await supabase.from("StoreSettings").select("*").order("category", { ascending: true })

  // Group settings by category
  const settingsByCategory =
      settings?.reduce((acc: any, setting: any) => {
        if (!acc[setting.category]) {
          acc[setting.category] = []
        }
        acc[setting.category].push(setting)
        return acc
      }, {}) || {}

  return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Store Settings</h1>
          <p className="text-gray-600">Configure your store preferences</p>
        </div>

        <div className="space-y-6">
          {/* General Settings */}
          {settingsByCategory.general && (
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>Basic store information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {settingsByCategory.general.map((setting: any) => (
                      <div key={setting.key} className="space-y-2">
                        <Label htmlFor={setting.key}>
                          {setting.key.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </Label>
                        {setting.key === "store_address" ? (
                            <Textarea
                                id={setting.key}
                                defaultValue={JSON.stringify(setting.value, null, 2)}
                                className="font-mono text-sm"
                            />
                        ) : (
                            <Input
                                id={setting.key}
                                defaultValue={typeof setting.value === "string" ? setting.value.replace(/"/g, "") : setting.value}
                            />
                        )}
                        <p className="text-sm text-gray-600">{setting.description}</p>
                      </div>
                  ))}
                </CardContent>
              </Card>
          )}

          {/* Financial Settings */}
          {settingsByCategory.financial && (
              <Card>
                <CardHeader>
                  <CardTitle>Financial Settings</CardTitle>
                  <CardDescription>Tax and pricing configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {settingsByCategory.financial.map((setting: any) => (
                      <div key={setting.key} className="space-y-2">
                        <Label htmlFor={setting.key}>
                          {setting.key.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </Label>
                        <Input id={setting.key} type="number" step="0.01" defaultValue={setting.value} />
                        <p className="text-sm text-gray-600">{setting.description}</p>
                      </div>
                  ))}
                </CardContent>
              </Card>
          )}

          {/* Shipping Settings */}
          {settingsByCategory.shipping && (
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Settings</CardTitle>
                  <CardDescription>Shipping rates and policies</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {settingsByCategory.shipping.map((setting: any) => (
                      <div key={setting.key} className="space-y-2">
                        <Label htmlFor={setting.key}>
                          {setting.key.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </Label>
                        <Input id={setting.key} type="number" step="0.01" defaultValue={setting.value} />
                        <p className="text-sm text-gray-600">{setting.description}</p>
                      </div>
                  ))}
                </CardContent>
              </Card>
          )}

          {/* Inventory Settings */}
          {settingsByCategory.inventory && (
              <Card>
                <CardHeader>
                  <CardTitle>Inventory Settings</CardTitle>
                  <CardDescription>Stock management preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {settingsByCategory.inventory.map((setting: any) => (
                      <div key={setting.key} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor={setting.key}>
                              {setting.key.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                            </Label>
                            <p className="text-sm text-gray-600">{setting.description}</p>
                          </div>
                          {typeof setting.value === "boolean" ? (
                              <Switch id={setting.key} defaultChecked={setting.value} />
                          ) : (
                              <Input id={setting.key} type="number" defaultValue={setting.value} className="w-24" />
                          )}
                        </div>
                      </div>
                  ))}
                </CardContent>
              </Card>
          )}

          <div className="flex justify-end">
            <Button size="lg">Save All Settings</Button>
          </div>
        </div>
      </div>
  )
}
