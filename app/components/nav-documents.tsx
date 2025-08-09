import * as React from "react"
import { SidebarMenuButton, SidebarMenuItem } from "~/components/ui/sidebar"

const documents = [
  {
    name: "User Manual",
    url: "#",
    icon: "📄",
  },
  {
    name: "API Documentation",
    url: "#",
    icon: "📚",
  },
  {
    name: "Support Guide",
    url: "#",
    icon: "🆘",
  },
]

export function NavDocuments() {
  return (
    <>
      {documents.map((item) => (
        <SidebarMenuItem key={item.name}>
          <SidebarMenuButton asChild>
            <a href={item.url}>
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </>
  )
}