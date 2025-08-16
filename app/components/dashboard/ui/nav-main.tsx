"use client"

import { ChevronRight } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "../../ui/sidebar"

export function NavMain({
  items,
  onNavigate,
  activeSection,
}: {
  items: {
    title: string
    url: string
    icon?: React.ElementType
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
  onNavigate?: (section: string) => void
  activeSection?: string
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
                             <CollapsibleTrigger asChild>
                 <SidebarMenuButton 
                   tooltip={item.title}
                   className={`${
                     item.items?.some(subItem => activeSection === subItem.title.toLowerCase()) 
                       ? '  font-medium' 
                       : ''
                   }`}
                 >
                   {item.icon && <item.icon />}
                   <span>{item.title}</span>
                   <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                 </SidebarMenuButton>
               </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                                     {item.items?.map((subItem) => (
                     <SidebarMenuSubItem key={subItem.title}>
                       <SidebarMenuSubButton 
                         onClick={() => onNavigate?.(subItem.title.toLowerCase())}
                         className={`cursor-pointer transition-colors duration-200 relative px-3 py-2 rounded-md mx-2 ${
                           activeSection === subItem.title.toLowerCase() ? 'bg-blue-500 text-white font-medium' : ''
                         }`}
                         style={{
                           backgroundColor: activeSection === subItem.title.toLowerCase() ? '#3b82f6' : 'transparent',
                           color: activeSection === subItem.title.toLowerCase() ? 'white' : 'inherit'
                         }}
                         onMouseEnter={(e) => {
                           if (activeSection !== subItem.title.toLowerCase()) {
                             e.currentTarget.style.backgroundColor = '#eff6ff';
                               e.currentTarget.style.color = '#1d4ed8';
                           }
                         }}
                         onMouseLeave={(e) => {
                           if (activeSection !== subItem.title.toLowerCase()) {
                             e.currentTarget.style.backgroundColor = 'transparent';
                               e.currentTarget.style.color = 'inherit';
                           }
                         }}
                       >
                         <span>{subItem.title}</span>
                       </SidebarMenuSubButton>
                     </SidebarMenuSubItem>
                   ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
