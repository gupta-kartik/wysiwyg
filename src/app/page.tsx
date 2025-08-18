'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Save, Plus, User, LogOut, Github, Key, Settings } from 'lucide-react';

interface Issue {
  number: number;
  title: string;
  url: string;
  state?: string;
  updated_at?: string;
}

interface Label {
  name: string;
  color: string;
  description?: string;
}

interface UserInfo {
  login: string;
  name?: string;
  email?: string;
  avatar_url?: string;
}

export default function Home() {
  const [pat, setPat] = useState<string>('');
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [repoOwner, setRepoOwner] = useState('github');
  const [repoName, setRepoName] = useState('solutions-engineering');

  const [note, setNote] = useState('');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Issue[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showNewIssue, setShowNewIssue] = useState(false);
  const [newIssueTitle, setNewIssueTitle] = useState('');
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [availableLabels, setAvailableLabels] = useState<Label[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const validatePat = useCallback(async (token: string) => {
    if (!token.trim()) {
      setUser(null);
      return;
    }

    setIsValidating(true);
    try {
      const response = await fetch('/api/github/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        localStorage.setItem('github-pat', token);
      } else {
        setUser(null);
        localStorage.removeItem('github-pat');
        showNotification('Invalid GitHub Personal Access Token', 'error');
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      setUser(null);
      localStorage.removeItem('github-pat');
      showNotification('Failed to validate token', 'error');
    } finally {
      setIsValidating(false);
    }
  }, []);

  const fetchLabels = useCallback(async () => {
    try {
      const response = await fetch(`/api/github/labels?owner=${encodeURIComponent(repoOwner)}&repo=${encodeURIComponent(repoName)}`, {
        headers: {
          'Authorization': `Bearer ${pat}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setAvailableLabels(data.labels);
      }
    } catch (error) {
      console.error('Failed to fetch labels:', error);
    }
  }, [pat, repoOwner, repoName]);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Load PAT from localStorage on mount
  useEffect(() => {
    const savedPat = localStorage.getItem('github-pat');
    const savedRepoOwner = localStorage.getItem('repo-owner');
    const savedRepoName = localStorage.getItem('repo-name');
    
    if (savedPat) {
      setPat(savedPat);
      validatePat(savedPat);
    }
    if (savedRepoOwner) setRepoOwner(savedRepoOwner);
    if (savedRepoName) setRepoName(savedRepoName);
  }, [validatePat]); // Include validatePat dependency

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [note]);

  // Load labels when authenticated
  useEffect(() => {
    if (user && pat) {
      fetchLabels();
    }
  }, [user, pat, repoOwner, repoName, fetchLabels]); // Include fetchLabels dependency

  const handlePATSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    validatePat(pat);
  };

  const handleLogout = () => {
    setPat('');
    setUser(null);
    localStorage.removeItem('github-pat');
    setNote('');
    setSelectedIssue(null);
    setShowNewIssue(false);
    setNewIssueTitle('');
    setSelectedLabels([]);
    setSearchQuery('');
  };

  const updateRepoSettings = () => {
    localStorage.setItem('repo-owner', repoOwner);
    localStorage.setItem('repo-name', repoName);
    setShowSettings(false);
    if (user && pat) {
      fetchLabels(); // Refresh labels for new repo
    }
  };

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim() && user && pat) {
      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const response = await fetch(`/api/github/search-issues?q=${encodeURIComponent(searchQuery)}&owner=${encodeURIComponent(repoOwner)}&repo=${encodeURIComponent(repoName)}`, {
            headers: {
              'Authorization': `Bearer ${pat}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            setSuggestions(data.issues);
          } else {
            setSuggestions([]);
          }
        } catch (error) {
          console.error('Search failed:', error);
          setSuggestions([]);
        } finally {
          setIsSearching(false);
        }
      }, 300);
    } else {
      setSuggestions([]);
      setIsSearching(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, user, pat, repoOwner, repoName]); // Include repo dependencies

  // Keyboard shortcuts
  const handleSave = useCallback(async () => {
    if (!note.trim() || !user || !pat) return;
    
    setIsSaving(true);
    try {
      if (showNewIssue) {
        // Create new issue
        const response = await fetch('/api/github/create-issue', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${pat}`,
          },
          body: JSON.stringify({
            title: newIssueTitle,
            body: note,
            labels: selectedLabels,
            repoOwner,
            repoName,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          showNotification(`New issue #${data.number} created successfully!`, 'success');
        } else {
          throw new Error('Failed to create issue');
        }
      } else if (selectedIssue) {
        // Add comment to existing issue
        const response = await fetch('/api/github/add-comment', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${pat}`,
          },
          body: JSON.stringify({
            issueNumber: selectedIssue.number,
            body: note,
            repoOwner,
            repoName,
          }),
        });

        if (response.ok) {
          showNotification(`Comment added to issue #${selectedIssue.number} successfully!`, 'success');
        } else {
          throw new Error('Failed to add comment');
        }
      } else {
        showNotification('Please select an issue or create a new one', 'error');
        return;
      }
      
      // Reset form
      setNote('');
      setSelectedIssue(null);
      setShowNewIssue(false);
      setNewIssueTitle('');
      setSelectedLabels([]);
      setSearchQuery('');
    } catch (error) {
      console.error('Save failed:', error);
      showNotification('Failed to save note. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  }, [note, showNewIssue, newIssueTitle, selectedLabels, selectedIssue, user, pat, repoOwner, repoName]); // Include repo dependencies

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="text-center mb-6">
            <Github className="mx-auto h-12 w-12 text-gray-900 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Quick Notes</h1>
            <p className="text-gray-600">Solutions Engineering</p>
          </div>

          <form onSubmit={handlePATSubmit} className="space-y-4">
            <div>
              <label htmlFor="pat" className="block text-sm font-medium text-gray-700 mb-2">
                GitHub Personal Access Token
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  id="pat"
                  type="password"
                  value={pat}
                  onChange={(e) => setPat(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isValidating || !pat.trim()}
              className="w-full bg-gray-900 text-white px-4 py-3 rounded-md hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isValidating ? (
                <>Loading...</>
              ) : (
                <>
                  <Github className="h-4 w-4" />
                  Connect to GitHub
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-xs text-gray-500 space-y-2">
            <p>
              <strong>Required scopes:</strong> <code>repo</code>, <code>read:user</code>
            </p>
            <p>
              Create a token at{' '}
              <a 
                href="https://github.com/settings/tokens/new" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                GitHub Settings
              </a>
            </p>
          </div>

          <div className="mt-4 border-t pt-4">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
            >
              <Settings className="h-4 w-4" />
              Repository Settings
            </button>
            
            {showSettings && (
              <div className="mt-3 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Repository Owner
                  </label>
                  <input
                    type="text"
                    value={repoOwner}
                    onChange={(e) => setRepoOwner(e.target.value)}
                    className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="github"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Repository Name
                  </label>
                  <input
                    type="text"
                    value={repoName}
                    onChange={(e) => setRepoName(e.target.value)}
                    className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="solutions-engineering"
                  />
                </div>
                <button
                  onClick={updateRepoSettings}
                  className="w-full bg-blue-600 text-white px-3 py-2 text-sm rounded hover:bg-blue-700 transition-colors"
                >
                  Save Settings
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Github className="h-6 w-6 text-gray-900" />
            <h1 className="text-xl font-semibold text-gray-900">Quick Notes</h1>
            <span className="text-sm text-gray-500">→ {repoOwner}/{repoName}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-gray-700">{user.name || user.login}</span>
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              title="Repository Settings"
            >
              <Settings className="h-5 w-5" />
            </button>
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              title="Sign out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="border-t bg-gray-50 px-4 py-3">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Repository Owner
                  </label>
                  <input
                    type="text"
                    value={repoOwner}
                    onChange={(e) => setRepoOwner(e.target.value)}
                    className="p-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="github"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Repository Name
                  </label>
                  <input
                    type="text"
                    value={repoName}
                    onChange={(e) => setRepoName(e.target.value)}
                    className="p-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="solutions-engineering"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">&nbsp;</label>
                  <button
                    onClick={updateRepoSettings}
                    className="bg-blue-600 text-white px-4 py-2 text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            {/* Notes Textarea */}
            <div className="mb-6">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                id="notes"
                ref={textareaRef}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Start typing your notes here... (Ctrl/Cmd+Enter to save)"
                className="w-full p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px]"
                rows={4}
              />
            </div>

            {/* Issue Selection */}
            <div className="mb-6">
              <label htmlFor="issue-search" className="block text-sm font-medium text-gray-700 mb-2">
                Issue
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  id="issue-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for existing issues..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Issue Suggestions */}
              {(suggestions.length > 0 || isSearching) && (
                <div className="mt-2 bg-white border border-gray-300 rounded-md shadow-sm">
                  {isSearching ? (
                    <div className="p-3 text-sm text-gray-500">Searching...</div>
                  ) : (
                    suggestions.map((issue) => (
                      <button
                        key={issue.number}
                        onClick={() => {
                          setSelectedIssue(issue);
                          setSearchQuery(`#${issue.number} ${issue.title}`);
                          setSuggestions([]);
                          setShowNewIssue(false);
                        }}
                        className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-sm">#{issue.number}</div>
                        <div className="text-sm text-gray-600">{issue.title}</div>
                        {issue.state && (
                          <div className={`text-xs mt-1 ${issue.state === 'open' ? 'text-green-600' : 'text-gray-500'}`}>
                            {issue.state}
                          </div>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}

              {/* Create New Issue Option */}
              <button
                onClick={() => {
                  setShowNewIssue(true);
                  setSelectedIssue(null);
                  setSearchQuery('');
                  setSuggestions([]);
                }}
                className="mt-2 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
              >
                <Plus className="h-4 w-4" />
                Create new issue
              </button>
            </div>

            {/* New Issue Form */}
            {showNewIssue && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Create New Issue</h3>
                <div className="mb-4">
                  <label htmlFor="issue-title" className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    id="issue-title"
                    type="text"
                    value={newIssueTitle}
                    onChange={(e) => setNewIssueTitle(e.target.value)}
                    placeholder="Issue title..."
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Labels</label>
                  <div className="flex flex-wrap gap-2">
                    {availableLabels.map((label) => (
                      <button
                        key={label.name}
                        onClick={() => {
                          if (selectedLabels.includes(label.name)) {
                            setSelectedLabels(selectedLabels.filter(l => l !== label.name));
                          } else {
                            setSelectedLabels([...selectedLabels, label.name]);
                          }
                        }}
                        className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                          selectedLabels.includes(label.name)
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                        }`}
                        style={{
                          backgroundColor: selectedLabels.includes(label.name) 
                            ? `#${label.color}20` 
                            : undefined
                        }}
                      >
                        {label.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={!note.trim() || isSaving || (showNewIssue && !newIssueTitle.trim())}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Saving...' : showNewIssue ? 'Create Issue' : 'Save Note'}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 p-4 rounded-md shadow-lg ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {notification.message}
        </div>
      )}
    </div>
  );
}
