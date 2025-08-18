import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { Octokit } from '@octokit/rest';
import { ExtendedSession } from '@/types/session';

const REPO_OWNER = 'github';
const REPO_NAME = 'solutions-engineering';

export async function GET() {
  try {
    const session = await getServerSession() as ExtendedSession | null;
    
    if (!session || !session.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const octokit = new Octokit({
      auth: session.accessToken,
    });

    const response = await octokit.rest.issues.listLabelsForRepo({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      per_page: 100,
    });

    const labels = response.data.map(label => ({
      name: label.name,
      color: label.color,
      description: label.description,
    }));

    return NextResponse.json({ labels });
  } catch (error) {
    console.error('Error fetching labels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch labels' },
      { status: 500 }
    );
  }
}