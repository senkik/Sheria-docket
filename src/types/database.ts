export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string | null;
          role: string;
          bio: string | null;
          avatar_url: string | null;
          notify_on_publish: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email?: string | null;
          role?: string;
          bio?: string | null;
          avatar_url?: string | null;
          notify_on_publish?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          email?: string | null;
          role?: string;
          bio?: string | null;
          avatar_url?: string | null;
          notify_on_publish?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      posts: {
        Row: {
          id: string;
          author_id: string | null;
          title: string;
          slug: string;
          content: string | null;
          excerpt: string | null;
          category: string | null;
          jurisdiction: string | null;
          area_of_law: string | null;
          status: string;
          cover_image_url: string | null;
          citation: string | null;
          bench: string | null;
          facts: string | null;
          issues: string | null;
          holding: string | null;
          obiter: string | null;
          pdf_url: string | null;
          published_at: string | null;
          assigned_editor_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_id?: string | null;
          title: string;
          slug: string;
          content?: string | null;
          excerpt?: string | null;
          category?: string | null;
          jurisdiction?: string | null;
          area_of_law?: string | null;
          status?: string;
          cover_image_url?: string | null;
          citation?: string | null;
          bench?: string | null;
          facts?: string | null;
          issues?: string | null;
          holding?: string | null;
          obiter?: string | null;
          pdf_url?: string | null;
          published_at?: string | null;
          assigned_editor_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          author_id?: string | null;
          title?: string;
          slug?: string;
          content?: string | null;
          excerpt?: string | null;
          category?: string | null;
          jurisdiction?: string | null;
          area_of_law?: string | null;
          status?: string;
          cover_image_url?: string | null;
          citation?: string | null;
          bench?: string | null;
          facts?: string | null;
          issues?: string | null;
          holding?: string | null;
          obiter?: string | null;
          pdf_url?: string | null;
          published_at?: string | null;
          assigned_editor_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'posts_author_id_fkey';
            columns: ['author_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      comments: {
        Row: {
          id: string;
          post_id: string | null;
          user_id: string | null;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id?: string | null;
          user_id?: string | null;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string | null;
          user_id?: string | null;
          content?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'comments_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: false;
            referencedRelation: 'posts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'comments_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      resources: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          file_url: string;
          uploaded_by: string | null;
          category: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          file_url: string;
          uploaded_by?: string | null;
          category?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          file_url?: string;
          uploaded_by?: string | null;
          category?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'resources_uploaded_by_fkey';
            columns: ['uploaded_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      subscribers: {
        Row: {
          id: string;
          email: string;
          subscribed_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          subscribed_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          subscribed_at?: string;
        };
        Relationships: [];
      };
      internships: {
        Row: {
          id: string;
          title: string;
          firm_name: string;
          location: string | null;
          description: string | null;
          application_link: string | null;
          deadline: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          firm_name: string;
          location?: string | null;
          description?: string | null;
          application_link?: string | null;
          deadline?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          firm_name?: string;
          location?: string | null;
          description?: string | null;
          application_link?: string | null;
          deadline?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      bookmarks: {
        Row: {
          id: string;
          user_id: string;
          post_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          post_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          post_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'bookmarks_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'bookmarks_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: false;
            referencedRelation: 'posts';
            referencedColumns: ['id'];
          }
        ];
      };
      follows: {
        Row: {
          id: string;
          user_id: string;
          kind: string;
          value: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          kind: string;
          value: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          kind?: string;
          value?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'follows_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          post_id: string;
          follow_id: string | null;
          kind: string;
          dedupe_key: string;
          payload: Json | null;
          status: string;
          attempts: number;
          last_error: string | null;
          sent_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          post_id: string;
          follow_id?: string | null;
          kind?: string;
          dedupe_key?: string;
          payload?: Json | null;
          status?: string;
          attempts?: number;
          last_error?: string | null;
          sent_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          post_id?: string;
          follow_id?: string | null;
          kind?: string;
          dedupe_key?: string;
          payload?: Json | null;
          status?: string;
          attempts?: number;
          last_error?: string | null;
          sent_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'notifications_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'notifications_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: false;
            referencedRelation: 'posts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'notifications_follow_id_fkey';
            columns: ['follow_id'];
            isOneToOne: false;
            referencedRelation: 'follows';
            referencedColumns: ['id'];
          }
        ];
      };
      post_reviews: {
        Row: {
          id: string;
          post_id: string;
          editor_id: string | null;
          decision: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          editor_id?: string | null;
          decision: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          editor_id?: string | null;
          decision?: string;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'post_reviews_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: false;
            referencedRelation: 'posts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'post_reviews_editor_id_fkey';
            columns: ['editor_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

export type Profile = Tables<'profiles'>;
export type Post = Tables<'posts'>;
export type Comment = Tables<'comments'>;
export type Resource = Tables<'resources'>;
export type Subscriber = Tables<'subscribers'>;
export type Internship = Tables<'internships'>;
export type Bookmark = Tables<'bookmarks'>;
export type Follow = Tables<'follows'>;
export type Notification = Tables<'notifications'>;
export type PostReview = Tables<'post_reviews'>;

/** The kinds of topic a reader can follow. */
export type FollowKind = 'area_of_law' | 'jurisdiction' | 'category' | 'case';
export type NotificationStatus = 'pending' | 'sent' | 'failed' | 'skipped';

/** Outbound email kinds: reader brief alerts and author review notices. */
export type NotificationKind = 'new_brief' | 'review_decision';

/** What an editor did with a submission. */
export type ReviewDecision = 'assigned' | 'changes_requested' | 'published' | 'returned';

/** The payload stored on a review notice, so the email needs no extra lookup. */
export interface ReviewNotice {
  decision: ReviewDecision;
  notes: string | null;
  editor_name: string | null;
}

export type UserRole = 'admin' | 'author' | 'editor' | 'reader';
export type PostStatus = 'draft' | 'pending_review' | 'changes_requested' | 'published';
export type PostCategory =
  | 'case_brief'
  | 'student_guide'
  | 'county_update'
  | 'know_your_law'
  | 'opinion';

/** A post joined with the byline of its author, as returned by the queries in lib/queries. */
export type PostWithAuthor = Post & {
  profiles: Pick<Profile, 'id' | 'full_name' | 'avatar_url'> | null;
};

/** A comment joined with the commenting reader's profile. */
export type CommentWithAuthor = Comment & {
  profiles: Pick<Profile, 'id' | 'full_name' | 'avatar_url'> | null;
};

/** An alert row joined with the brief it announces and the reader it went to. */
export type NotificationWithContext = Notification & {
  posts: Pick<Post, 'id' | 'title' | 'slug' | 'category'> | null;
  profiles: Pick<Profile, 'id' | 'full_name' | 'email'> | null;
};

/** A review decision joined with the editor who made it. */
export type PostReviewWithEditor = PostReview & {
  profiles: Pick<Profile, 'id' | 'full_name'> | null;
};

/** A submission in the review queue, with its author and reviewer. */
export type SubmissionWithPeople = PostWithAuthor & {
  editor: Pick<Profile, 'id' | 'full_name'> | null;
};
