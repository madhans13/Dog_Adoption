import * as React from "react"
import { SidebarMenuButton, SidebarMenuItem } from "~/components/ui/sidebar"

const items = [
  {
    title: "Analytics",
    url: "#",
    icon: "📊",
  },
  {
    title: "Notifications",
    url: "#",
    icon: "🔔",
  },
  {
    title: "Help Center",
    url: "#",
    icon: "❓",
  },
  {
    title: "Contact Support",
    url: "#",
    icon: "📞",
  },
]

export function NavSecondary() {
  return (
    <>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild size="sm">
            <a href={item.url}>
              <span>{item.icon}</span>
              <span>{item.title}</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </>
  )
}