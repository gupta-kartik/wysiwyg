import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    const octokit = new Octokit({
      auth: token,
    });

    // Validate token and get user info
    const response = await octokit.rest.users.getAuthenticated();

    return NextResponse.json({
      login: response.data.login,
      name: response.data.name,
      email: response.data.email,
      avatar_url: response.data.avatar_url,
    });
  } catch (error) {
    console.error('Error validating token:', error);
    return NextResponse.json(
      { error: 'Invalid token or failed to authenticate' },
      { status: 401 }
    );
  }
}