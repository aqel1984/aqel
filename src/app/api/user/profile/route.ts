import { NextRequest, NextResponse } from 'next/server';
import { withAuth, withRole } from '@/middleware/auth';
import { graphService } from '@/utils/graph-service';

// Get user profile - requires authentication
export async function GET(request: NextRequest) {
  return withAuth(request, async (_req, user) => {
    try {
      const profile = await graphService.getUserProfile(user.id);
      return NextResponse.json(profile);
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      return NextResponse.json(
        { error: 'Failed to fetch user profile', details: error.message },
        { status: 500 }
      );
    }
  });
}

// Update user profile - requires admin role
export async function PUT(request: NextRequest) {
  return withRole(['admin'])(request, async (_req, user) => {
    try {
      const data = await request.json();
      
      // Here you would typically update the user profile
      // For this example, we'll just return the data
      return NextResponse.json({
        message: 'Profile updated successfully',
        user: {
          id: user.id,
          ...data,
        },
      });
    } catch (error: any) {
      console.error('Error updating user profile:', error);
      return NextResponse.json(
        { error: 'Failed to update user profile', details: error.message },
        { status: 500 }
      );
    }
  });
}

// Delete user - requires admin role
export async function DELETE(request: NextRequest) {
  return withRole(['admin'])(request, async (_req, _user) => {
    try {
      const { userId } = await request.json();
      
      // Here you would typically delete the user
      // For this example, we'll just return a success message
      return NextResponse.json({
        message: 'User deleted successfully',
        deletedUserId: userId,
      });
    } catch (error: any) {
      console.error('Error deleting user:', error);
      return NextResponse.json(
        { error: 'Failed to delete user', details: error.message },
        { status: 500 }
      );
    }
  });
}
