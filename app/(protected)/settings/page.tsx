import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { MainContent } from '@/components/dashboard/main-content'
import { User, Bell, Shield, Palette, Globe, Database, Key, HelpCircle } from 'lucide-react'

const settingsSections = [
  {
    title: 'Account',
    icon: User,
    description: 'Manage your account settings and preferences',
    items: ['Profile Information', 'Email Settings', 'Password & Security']
  },
  {
    title: 'Notifications',
    icon: Bell,
    description: 'Configure how you receive alerts and notifications',
    items: ['Push Notifications', 'Email Alerts', 'SMS Notifications']
  },
  {
    title: 'Security',
    icon: Shield,
    description: 'Security settings and access controls',
    items: ['Two-Factor Authentication', 'Active Sessions', 'Login History']
  },
  {
    title: 'Appearance',
    icon: Palette,
    description: 'Customize the look and feel of the dashboard',
    items: ['Theme Settings', 'Dashboard Layout', 'Widget Preferences']
  },
  {
    title: 'Integrations',
    icon: Globe,
    description: 'Connect with external services and APIs',
    items: ['ELD Providers', 'Fuel Cards', 'GPS Tracking']
  },
  {
    title: 'Data Management',
    icon: Database,
    description: 'Manage your data exports and backups',
    items: ['Export Data', 'Import Data', 'Backup Settings']
  },
  {
    title: 'API Access',
    icon: Key,
    description: 'Manage API keys and developer settings',
    items: ['API Keys', 'Webhooks', 'Developer Documentation']
  },
  {
    title: 'Help & Support',
    icon: HelpCircle,
    description: 'Get help and contact support',
    items: ['Documentation', 'Contact Support', 'Feature Requests']
  },
]

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <MainContent>
        <Header title="Settings" subtitle="Manage your account and preferences" />
        
        <main className="p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {settingsSections.map((section) => (
              <button
                key={section.title}
                className="glass-card rounded-xl p-5 text-left transition-colors hover:bg-secondary/50"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
                  <section.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-1 font-semibold text-foreground">{section.title}</h3>
                <p className="mb-3 text-xs text-muted-foreground">{section.description}</p>
                <ul className="space-y-1">
                  {section.items.map((item) => (
                    <li key={item} className="text-xs text-muted-foreground">
                      • {item}
                    </li>
                  ))}
                </ul>
              </button>
            ))}
          </div>
        </main>
      </MainContent>
    </div>
  )
}
