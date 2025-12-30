-- /api/v1/posts
-- /api/v1/posts/[slug]
-- /api/v1/categories/[slug]/posts
-- /api/v1/tags/[slug]/posts
-- /api/v1/search

CREATE VIEW public_posts_with_tags AS
SELECT
  c.id,
  c.title,
  c.slug,
  c.excerpt,
  c.body,
  c.body_format,
  c.type,
  c.thumbnail_url,
  c.is_featured,
  c.allow_comments,
  c.published_at,
  c.created_at,
  c.updated_at,

  c.category_id,
  cat.name AS category_name,
  cat.slug AS category_slug,
  cat.description AS category_description,

  p.id AS author_id,
  p.display_name AS author_name,
  p.avatar_url AS author_avatar,
  p.bio AS author_bio,

  COALESCE(
    jsonb_agg(
      DISTINCT jsonb_build_object(
        'id', t.id,
        'name', t.name,
        'slug', t.slug
      )
    ) FILTER (WHERE t.id IS NOT NULL),
    '[]'::jsonb
  ) AS tags

FROM contents c
JOIN profiles p ON p.id = c.author_id
LEFT JOIN categories cat ON cat.id = c.category_id
LEFT JOIN content_tags ct ON ct.content_id = c.id
LEFT JOIN tags t ON t.id = ct.tag_id

WHERE
  c.status = 'published'
  AND c.visibility = 'public'

GROUP BY
  c.id,
  c.title,
  c.slug,
  c.excerpt,
  c.body,
  c.body_format,
  c.type,
  c.thumbnail_url,
  c.is_featured,
  c.allow_comments,
  c.published_at,
  c.created_at,
  c.updated_at,
  c.category_id,
  cat.id,
  cat.name,
  cat.slug,
  cat.description,
  p.id,
  p.display_name,
  p.avatar_url,
  p.bio;