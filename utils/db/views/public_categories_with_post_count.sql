-- /api/v1/categories
-- /api/v1/categories/[slug]/posts

create view public_categories_with_post_count as
select
  c.id,
  c.name,
  c.slug,
  c.description,
  c.parent_id,
  c.created_at,

  jsonb_build_object(
    'id', p.id,
    'name', p.name,
    'slug', p.slug
  ) as parent,

  count(pc.id) as post_count

from categories c
left join categories p
  on p.id = c.parent_id
left join contents pc
  on pc.category_id = c.id
  and pc.status = 'published'
  and pc.visibility = 'public'

group by
  c.id,
  p.id;
