import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const repoOwner = searchParams.get('owner') || process.env.GITHUB_REPO_OWNER || 'github';
    const repoName = searchParams.get('repo') || process.env.GITHUB_REPO_NAME || 'solutions-engineering';

    if (!query) {
      return NextResponse.json({ error: 'Query parameter required' }, { status: 400 });
    }

    const octokit = new Octokit({
      auth: token,
    });

    const searchQuery = `repo:${repoOwner}/${repoName} ${query} in:title,body`;
    
    const response = await octokit.rest.search.issuesAndPullRequests({
      q: searchQuery,
      sort: 'updated',
      order: 'desc',
      per_page: 5,
    });

    const issues = response.data.items
      .filter(item => !item.pull_request) // Only issues, not PRs
      .map(issue => ({
        number: issue.number,
        title: issue.title,
        url: issue.html_url,
        state: issue.state,
        updated_at: issue.updated_at,
      }));

    return NextResponse.json({ issues });
  } catch (error) {
    console.error('Error searching issues:', error);
    return NextResponse.json(
      { error: 'Failed to search issues' },
      { status: 500 }
    );
  }
}