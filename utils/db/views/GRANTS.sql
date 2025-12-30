-- Grant SELECT permissions on views to anonymous users (for public API access)
GRANT SELECT ON public_posts_with_tags TO anon;
GRANT SELECT ON public_tags_with_post_count TO anon;
GRANT SELECT ON public_categories_with_post_count TO anon;

-- Also grant to authenticated users (in case they access via API)
GRANT SELECT ON public_posts_with_tags TO authenticated;
GRANT SELECT ON public_tags_with_post_count TO authenticated;
GRANT SELECT ON public_categories_with_post_count TO authenticated;