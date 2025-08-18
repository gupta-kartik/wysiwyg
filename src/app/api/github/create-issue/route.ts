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

    const { title, body, labels } = await request.json();

    if (!title || !body) {
      return NextResponse.json(
        { error: 'Title and body are required' },
        { status: 400 }
      );
    }

    const octokit = new Octokit({
      auth: session.accessToken,
    });

    // Add timestamp and author info to the body
    const timestamp = new Date().toISOString();
    const enhancedBody = `${body}\n\n---\n*Created via Quick Notes by ${session.user?.name || session.user?.email} at ${timestamp}*`;

    const response = await octokit.rest.issues.create({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      title,
      body: enhancedBody,
      labels: labels || [],
    });

    return NextResponse.json({
      number: response.data.number,
      url: response.data.html_url,
      title: response.data.title,
    });
  } catch (error) {
    console.error('Error creating issue:', error);
    return NextResponse.json(
      { error: 'Failed to create issue' },
      { status: 500 }
    );
  }
}