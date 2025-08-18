import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { Octokit } from '@octokit/rest';
import { ExtendedSession } from '@/types/session';

const REPO_OWNER = 'github';
const REPO_NAME = 'solutions-engineering';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession() as ExtendedSession | null;
    
    if (!session || !session.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { issueNumber, body } = await request.json();

    if (!issueNumber || !body) {
      return NextResponse.json(
        { error: 'Issue number and body are required' },
        { status: 400 }
      );
    }

    const octokit = new Octokit({
      auth: session.accessToken,
    });

    // Add timestamp and author info to the comment
    const timestamp = new Date().toISOString();
    const enhancedBody = `${body}\n\n---\n*Added via Quick Notes by ${session.user?.name || session.user?.email} at ${timestamp}*`;

    const response = await octokit.rest.issues.createComment({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      issue_number: issueNumber,
      body: enhancedBody,
    });

    return NextResponse.json({
      id: response.data.id,
      url: response.data.html_url,
      created_at: response.data.created_at,
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    );
  }
}