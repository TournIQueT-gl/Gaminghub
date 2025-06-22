import { Post, User } from '@/types'
import { PostCard } from '@/components/feed/post-card'

interface UserPostsProps {
  posts: Post[]
  user: User
}

export function UserPosts({ posts, user }: UserPostsProps) {
  const handlePostUpdate = (updatedPost: Post) => {
    // In a real app, you'd update the parent state
    console.log('Post updated:', updatedPost)
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground mb-2">No posts yet</div>
        <p className="text-sm text-muted-foreground">
          {user.username || user.firstName || 'This user'} hasn't shared anything yet.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={{ ...post, user }}
          onUpdate={handlePostUpdate}
        />
      ))}
    </div>
  )
}