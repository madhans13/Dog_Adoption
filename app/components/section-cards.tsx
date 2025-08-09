import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"

interface SectionCardsProps {
  title: string
  description?: string
  children?: React.ReactNode
}

export function SectionCards({ title, description, children }: SectionCardsProps) {
  return (
    <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Dogs</span>
              <span className="text-sm text-muted-foreground">23</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Available</span>
              <span className="text-sm text-muted-foreground">18</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Adopted</span>
              <span className="text-sm text-muted-foreground">5</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Pending Rescues</span>
              <span className="text-sm text-muted-foreground">3</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}