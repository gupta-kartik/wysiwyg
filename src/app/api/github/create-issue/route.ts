import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    const { title, body, labels, repoOwner, repoName } = await request.json();

    if (!title || !body) {
      return NextResponse.json(
        { error: 'Title and body are required' },
        { status: 400 }
      );
    }

    const owner = repoOwner || process.env.GITHUB_REPO_OWNER || 'github';
    const repo = repoName || process.env.GITHUB_REPO_NAME || 'solutions-engineering';

    const octokit = new Octokit({
      auth: token,
    });

    // Get user info for attribution
    let userInfo = 'Unknown User';
    try {
      const userResponse = await octokit.rest.users.getAuthenticated();
      userInfo = userResponse.data.name || userResponse.data.login;
    } catch (error) {
      console.warn('Could not get user info:', error);
    }

    // Add timestamp and author info to the body
    const timestamp = new Date().toISOString();
    const enhancedBody = `${body}\n\n---\n*Created via Quick Notes by ${userInfo} at ${timestamp}*`;

    const response = await octokit.rest.issues.create({
      owner,
      repo,
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