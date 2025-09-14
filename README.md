# MCP Server Registry Details Page

A comprehensive React/Next.js application for displaying MCP (Model Context Protocol) server details with adaptive UI based on server type and hosting configuration.

## 🎯 Overview

This application provides a detailed view of MCP servers with:
- **Adaptive Layout**: UI adapts based on server type (Remote/Local) and hosting (External/Omni-Hosted)
- **Comprehensive Tabs**: 10 different tabs for complete server information
- **Permission-Based Features**: Shows/hides features based on user permissions
- **Real-time Deployment Management**: For Omni-hosted servers

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

Visit http://localhost:3000 to see the homepage with example servers.

## 📁 Project Structure

```
src/
├── app/
│   ├── servers/[server_name]/
│   │   ├── page.tsx          # Main server details page
│   │   └── layout.tsx        # 70/30 grid layout with breadcrumbs
│   └── page.tsx              # Homepage with server cards
│
├── components/
│   ├── server-header.tsx     # Server title, badges, stats
│   ├── server-tabs.tsx       # Tab navigation controller
│   ├── server-sidebar.tsx    # Right sidebar with actions
│   ├── connection-modal.tsx  # Connection configuration modal
│   └── tabs/
│       ├── overview-tab.tsx     # README and project structure
│       ├── tools-tab.tsx        # Available tools with playground
│       ├── schema-config-tab.tsx # Configuration (3 sub-tabs)
│       ├── installation-tab.tsx  # Installation guides
│       ├── security-tab.tsx      # Security scan results
│       ├── reviews-tab.tsx       # User reviews
│       ├── use-cases-tab.tsx     # Examples and workflows
│       ├── related-tab.tsx       # Related servers/clients
│       ├── versions-tab.tsx      # Version history
│       └── deployment-tab.tsx    # Deployment management (Omni only)
│
├── types/
│   └── server.ts             # TypeScript type definitions
│
└── lib/
    ├── api/
    │   └── server-api.ts     # API functions (mock implementation)
    ├── utils/
    │   └── server-utils.ts   # Helper functions for adaptive logic
    └── mock/
        └── server-data.ts    # Mock data for testing
```

## 🔑 Key Features

### 1. Adaptive UI Based on Server Type

The UI automatically adapts based on:
- **Server Type**: `remote-sse`, `remote-http`, or `local-stdio`
- **Hosting Type**: `external` or `omni-hosted`

### 2. Tab System

| Tab | Description | Visibility |
|-----|-------------|------------|
| Overview | README, project structure, disclaimers | Always |
| Tools | List of available tools with parameters | Always |
| Schema & Config | Connection, runtime config, manifest | Always |
| Installation | Platform-specific setup guides | Always |
| Security | Security scan results and permissions | Always |
| Reviews | Community feedback and ratings | Always |
| Use Cases | Examples and workflows | Always |
| Related | Similar servers and clients | Always |
| Versions | Version history with changelogs | Always |
| Deployment | Management controls and logs | Omni-hosted only |

### 3. Permission-Based Features

Features that require permissions:
- **Config Editing**: Only for Omni-hosted servers with `canEditConfig`
- **Deployment Management**: Requires `canManageDeployment`
- **Log Viewing**: Requires `canViewLogs`

## 🎨 Component Documentation

### Core Components

#### ServerHeader (`server-header.tsx`)
Displays server metadata and quick stats.
- Server name, author, version selector
- Usage stats, rating, forks, security score
- External links (repo, issues, docs)
- Visual badges for server/hosting type

#### ServerTabs (`server-tabs.tsx`)
Main tab navigation with conditional visibility.
- Dynamically shows/hides tabs based on context
- Manages tab content rendering
- Responsive grid layout for mobile/desktop

#### ServerSidebar (`server-sidebar.tsx`)
Right sidebar with context-aware actions.
- Primary action buttons (Test, Connection Info)
- Adaptive buttons (Host on Omni vs Manage Deployment)
- Server metadata card
- Quick links and registry sources

#### ConnectionModal (`connection-modal.tsx`)
Modal for connection configuration.
- Auto-config JSON generation
- Manual setup instructions
- Environment variable configuration
- Download config file option

## 📊 Type Definitions

All TypeScript types are in `src/types/server.ts`:

```typescript
// Main entities
ServerEntity      // Server metadata and configuration
ToolEntity        // Tool definitions with parameters
ConfigEntity      // Connection and auth configuration
DeploymentEntity  // Deployment status and metrics

// Supporting types
UserPermissions   // User authorization levels
SecurityScan      // Security assessment results
Review           // User reviews and ratings
UseCase          // Example implementations
RelatedItem      // Related servers/clients
Version          // Version history entries
```

## 🎯 Usage Examples

### View Different Server Types

1. **Omni-Hosted Server**: `/servers/mcp-omni-server`
   - Shows deployment tab with controls
   - Enables runtime config editing
   - Displays WebSocket endpoint

2. **External Server**: `/servers/mcp-external-server`
   - Hides deployment features
   - Shows self-hosting instructions
   - Read-only configuration

## 🧪 Development

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Production build
npm run build

# Start production server
npm start
```

## 📝 API Integration

Currently uses mock data. To integrate with real API:

1. Update `src/lib/api/server-api.ts`:
```typescript
// Replace mock call with:
const response = await fetch(`/api/servers/${serverName}`);
return response.json();
```

2. Implement authentication:
```typescript
// Add auth headers
headers: {
  'Authorization': `Bearer ${token}`
}
```

## 🚧 Future Enhancements

- [ ] Real API integration
- [ ] User authentication
- [ ] Search and filtering
- [ ] Analytics dashboard
- [ ] Webhook support
- [ ] Export functionality
- [ ] Real-time updates via WebSocket

## 📄 License

MIT
