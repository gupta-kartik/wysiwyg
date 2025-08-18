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
    const repoOwner = searchParams.get('owner') || process.env.GITHUB_REPO_OWNER || 'github';
    const repoName = searchParams.get('repo') || process.env.GITHUB_REPO_NAME || 'solutions-engineering';

    const octokit = new Octokit({
      auth: token,
    });

    const response = await octokit.rest.issues.listLabelsForRepo({
      owner: repoOwner,
      repo: repoName,
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