# Quick Notes - Solutions Engineering

A lightning-fast note-taking web application that seamlessly integrates with GitHub Issues. Perfect for Solutions Engineers who need to capture notes during meetings and quickly save them to the right GitHub Issue.

![Quick Notes Authentication Screen](https://github.com/user-attachments/assets/7e25adf6-c698-41d3-9ef3-88c9c815dc5d)

## Features

- **🚀 Lightning-fast note capture** - Minimal UI focused on speed
- **🔍 Smart Issue search** - Auto-suggest Issues based on keywords with debounced search
- **💾 Seamless GitHub integration** - Save notes as comments or create new Issues
- **🏷️ Label management** - Select from repository labels when creating Issues
- **⌨️ Keyboard shortcuts** - Ctrl/Cmd+Enter to save instantly
- **🔐 Secure authentication** - GitHub OAuth with team access control
- **📱 Responsive design** - Works great on desktop and tablet
- **♿ Accessible** - WCAG AA compliant with proper focus management

![Main Interface](https://github.com/user-attachments/assets/894d54aa-e857-4c8f-9cba-ae8cdc5862de)

## Core User Stories

1. **Capture & save notes to existing Issues** - Type notes and save them as comments to selected Issues
2. **Smart Issue suggestions** - Auto-suggest Issues based on typed keywords
3. **Create new Issues** - Create Issues with titles, descriptions, and labels
4. **Quick label selection** - Multi-select from predefined repository labels
5. **Secure team access** - GitHub OAuth with organization/team restrictions

![New Issue Creation](https://github.com/user-attachments/assets/3377ae0c-d513-4896-a399-2edc4fde0050)

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Authentication**: NextAuth.js with GitHub OAuth
- **GitHub Integration**: Octokit REST API
- **Icons**: Lucide React
- **Styling**: Tailwind CSS with custom responsive design

## Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd wysiwyg
npm install
```

### 2. Configure GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/applications/new)
2. Create a new OAuth App with:
   - **Application name**: Quick Notes - Solutions Engineering
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
3. Copy the Client ID and Client Secret

### 3. Environment Variables

Copy the example environment file and configure it:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

```bash
# GitHub OAuth App Configuration
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_here

# Repository Configuration
GITHUB_REPO_OWNER=github
GITHUB_REPO_NAME=solutions-engineering
```

### 4. Required GitHub Permissions

The OAuth app needs these scopes:
- `repo` - Full access to repositories (to create Issues and comments)
- `read:user` - Read user profile information
- `read:org` - Read organization membership (for access control)

### 5. Run the Application

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

Visit `http://localhost:3000` to start using the app.

## Usage

### Adding Notes to Existing Issues

1. **Sign in** with your GitHub account
2. **Type your notes** in the main textarea
3. **Search for Issues** by typing keywords in the Issue search box
4. **Select an Issue** from the auto-suggestions
5. **Save** using the button or Ctrl/Cmd+Enter

### Creating New Issues

1. **Type your notes** that will become the Issue description
2. **Click "Create new issue"**
3. **Enter a title** for the Issue
4. **Select labels** from the available options
5. **Save** to create the Issue with your notes as the description

## API Routes

The application includes these API endpoints:

- `GET /api/github/search-issues?q=query` - Search repository Issues
- `POST /api/github/create-issue` - Create new Issue with labels
- `POST /api/github/add-comment` - Add comment to existing Issue
- `GET /api/github/labels` - Fetch repository labels
- `/api/auth/[...nextauth]` - NextAuth.js authentication

## Security Features

- **OAuth Authentication** - Secure GitHub integration
- **Session Management** - Proper token handling with NextAuth.js
- **API Protection** - All GitHub API routes require authentication
- **Access Control** - Can be restricted to specific GitHub organizations/teams

## Accessibility

- **WCAG AA compliant** - Proper contrast ratios and focus management
- **Keyboard navigation** - Full keyboard support with shortcuts
- **Screen reader friendly** - Proper ARIA labels and semantic HTML
- **Focus management** - Clear focus indicators and logical tab order

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
