import * as React from "react"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "~/components/ui/sidebar"

const items = [
  {
    title: "Dashboard",
    url: "#",
    icon: "📊",
    isActive: true,
  },
  {
    title: "Dogs",
    url: "#",
    icon: "🐕",
  },
  {
    title: "Users",
    url: "#",
    icon: "👥",
  },
  {
    title: "Rescue Requests",
    url: "#",
    icon: "🚨",
  },
  {
    title: "Reports",
    url: "#",
    icon: "📈",
  },
  {
    title: "Settings",
    url: "#",
    icon: "⚙️",
  },
]

export function NavMain() {
  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild>
            <a href={item.url}>
              <span>{item.icon}</span>
              <span>{item.title}</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}