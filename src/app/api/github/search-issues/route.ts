import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { Octokit } from '@octokit/rest';
import { ExtendedSession } from '@/types/session';

const REPO_OWNER = 'github';
const REPO_NAME = 'solutions-engineering';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession() as ExtendedSession | null;
    
    if (!session || !session.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter required' }, { status: 400 });
    }

    const octokit = new Octokit({
      auth: session.accessToken,
    });

    const searchQuery = `repo:${REPO_OWNER}/${REPO_NAME} ${query} in:title,body`;
    
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