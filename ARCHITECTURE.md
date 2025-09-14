# Architecture Documentation

## System Overview

The MCP Server Registry Details Page is a Next.js application that provides a comprehensive view of MCP (Model Context Protocol) servers with adaptive UI based on server configuration.

## Core Design Principles

### 1. Adaptive UI
The interface dynamically adjusts based on two primary factors:
- **Server Type**: Determines connection method (SSE, HTTP, or STDIO)
- **Hosting Type**: Determines feature availability (External vs Omni-Hosted)

### 2. Component Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    App Layout (70/30)                    │
├──────────────────────────┬──────────────────────────────┤
│                          │                              │
│   Main Content (70%)     │    Sidebar (30%)            │
│                          │                              │
│  ┌────────────────────┐  │  ┌──────────────────────┐  │
│  │   Server Header    │  │  │   Quick Actions      │  │
│  └────────────────────┘  │  └──────────────────────┘  │
│                          │                              │
│  ┌────────────────────┐  │  ┌──────────────────────┐  │
│  │    Tab System      │  │  │   Server Metadata    │  │
│  │  - Overview        │  │  └──────────────────────┘  │
│  │  - Tools           │  │                              │
│  │  - Config          │  │  ┌──────────────────────┐  │
│  │  - Installation    │  │  │   Hosting Status     │  │
│  │  - Security        │  │  └──────────────────────┘  │
│  │  - Reviews         │  │                              │
│  │  - Use Cases       │  │  ┌──────────────────────┐  │
│  │  - Related         │  │  │   Quick Links        │  │
│  │  - Versions        │  │  └──────────────────────┘  │
│  │  - Deployment*     │  │                              │
│  └────────────────────┘  │                              │
│                          │                              │
└──────────────────────────┴──────────────────────────────┘

* Deployment tab only visible for Omni-Hosted servers
```

## Data Flow

### 1. Page Load Sequence
```
User navigates to /servers/[server_name]
    ↓
Page component fetches server data
    ↓
Determine server type and hosting type
    ↓
Calculate tab visibility based on permissions
    ↓
Render adaptive UI components
```

### 2. State Management
```typescript
// Primary state in page component
const [data, setData] = useState<ServerPageProps>()
const [selectedVersion, setSelectedVersion] = useState<string>()
const [connectionModalOpen, setConnectionModalOpen] = useState<boolean>()
const [tabVisibility, setTabVisibility] = useState<TabVisibility>()
```

## Component Responsibilities

### Layout Components

| Component | Responsibility |
|-----------|---------------|
| `layout.tsx` | 70/30 grid, breadcrumb navigation |
| `page.tsx` | Data fetching, state management, component orchestration |

### Display Components

| Component | Responsibility |
|-----------|---------------|
| `server-header.tsx` | Server metadata, version selection, stats display |
| `server-tabs.tsx` | Tab navigation, content routing |
| `server-sidebar.tsx` | Context-aware actions, quick links |
| `connection-modal.tsx` | Connection configuration UI |

### Tab Components

Each tab component is self-contained and receives only the data it needs:

| Tab | Props | Adaptive Behavior |
|-----|-------|-------------------|
| `overview-tab` | `server` | Shows disclaimers for Omni-hosted |
| `tools-tab` | `tools, server` | Links to playground |
| `schema-config-tab` | `config, server, permissions` | Editable for Omni + permissions |
| `installation-tab` | `server, config` | Different guides per server type |
| `security-tab` | `security` | Static display |
| `reviews-tab` | `reviews, serverId` | User interaction |
| `use-cases-tab` | `useCases` | Static display |
| `related-tab` | `relatedItems` | Static display |
| `versions-tab` | `versions, currentVersion` | Version switching |
| `deployment-tab` | `deployment, permissions` | Only for Omni-hosted |

## Adaptive Logic

### Server Type Adaptations

```typescript
// Remote SSE/HTTP
- Shows HTTP/WebSocket endpoints
- External authentication options
- Network configuration

// Local STDIO
- Shows command-line configuration
- Process spawn commands
- Local file paths
```

### Hosting Type Adaptations

```typescript
// External
- Read-only configuration
- Self-hosting instructions
- "Host on Omni" CTA

// Omni-Hosted
- Editable runtime config (with permissions)
- Deployment management tab
- WebSocket endpoint display
- "Manage Deployment" or "Add to Skillset" CTAs
```

## Security Considerations

### Permission Checks
```typescript
// All permission checks happen server-side and client-side
if (permissions.canManageDeployment) {
  // Show deployment controls
}

if (permissions.canEditConfig) {
  // Enable config editing
}
```

### Data Validation
- All user inputs are validated
- API responses are typed with TypeScript
- Error boundaries catch component failures

## Performance Optimizations

### Code Splitting
- Each tab component is loaded on demand
- Modal components are lazy loaded
- Heavy dependencies are dynamically imported

### Caching Strategy
- Server data cached for session
- Static content (README, structure) cached longer
- Real-time data (metrics, logs) not cached

## Extension Points

### Adding New Server Types
1. Add type to `ServerType` enum
2. Update adaptive logic in `server-utils.ts`
3. Add specific UI adaptations in components

### Adding New Tabs
1. Create component in `components/tabs/`
2. Add to tab array in `server-tabs.tsx`
3. Update `TabVisibility` type
4. Add visibility logic

### Custom Hosting Types
1. Add type to `HostingType` enum
2. Update `getTabVisibility()` function
3. Add UI adaptations in relevant components

## Testing Strategy

### Unit Tests
- Type definitions validation
- Utility function logic
- Component rendering

### Integration Tests
- Tab visibility logic
- Permission-based features
- API integration

### E2E Tests
- Full user flows
- Different server/hosting combinations
- Permission scenarios

## Deployment

### Environment Variables
```env
# API Configuration
NEXT_PUBLIC_API_URL=https://api.mcphub.ai

# Feature Flags
NEXT_PUBLIC_ENABLE_DEPLOYMENT_MANAGEMENT=true
NEXT_PUBLIC_ENABLE_CONFIG_EDITING=true
```

### Build Optimization
```bash
# Production build with optimizations
npm run build

# Analyze bundle size
npm run analyze
```

## Future Considerations

### Scalability
- Implement virtual scrolling for large lists
- Add pagination for reviews/versions
- Lazy load heavy components

### Real-time Updates
- WebSocket connection for deployment status
- Live log streaming
- Real-time metrics updates

### Internationalization
- Extract all strings to locale files
- Add language switcher
- RTL support for global markets