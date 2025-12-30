-- /api/v1/tags
create view public_tags_with_post_count as
select
  t.id,
  t.name,
  t.slug,
  t.created_at,

  count(c.id) as post_count

from tags t
left join content_tags ct
  on ct.tag_id = t.id
left join contents c
  on c.id = ct.content_id
  and c.status = 'published'
  and c.visibility = 'public'

group by
  t.id;
