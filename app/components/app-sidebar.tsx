import * as React from "react"

interface AppSidebarProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter,
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent
} from "~/components/ui/sidebar"
import { NavUser } from "~/components/nav-user"

export function AppSidebar({ activeSection = 'dashboard', onSectionChange }: AppSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <span className="text-lg">🛡️</span>
          </div>
          <div>
            <h2 className="font-bold text-lg">Admin Console</h2>
            <p className="text-xs text-blue-100">Dog Adoption System</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  isActive={activeSection === 'dashboard'}
                  onClick={() => onSectionChange?.('dashboard')}
                >
                  <span>📊</span>
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeSection === 'dogs'}
                  onClick={() => onSectionChange?.('dogs')}
                >
                  <span>🐕</span>
                  <span>Dogs Management</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeSection === 'users'}
                  onClick={() => onSectionChange?.('users')}
                >
                  <span>👥</span>
                  <span>User Management</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeSection === 'rescue-requests'}
                  onClick={() => onSectionChange?.('rescue-requests')}
                >
                  <span>🚨</span>
                  <span>Rescue Requests</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeSection === 'analytics'}
                  onClick={() => onSectionChange?.('analytics')}
                >
                  <span>📈</span>
                  <span>Analytics</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <span>⚙️</span>
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <span>📚</span>
                  <span>Documentation</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <span>🆘</span>
                  <span>Support</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}