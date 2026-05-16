import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';

export async function GET(context) {
	const posts = await getCollection('blog', ({ data }) => !data.hidden);
	const getDate = (entry) => entry.data.date ?? entry.data.pubDate ?? new Date(0);
	const getSlug = (entry) => entry.data.slug ?? entry.id;
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: posts
			.sort((a, b) => getDate(b).valueOf() - getDate(a).valueOf())
			.map((post) => ({
				title: post.data.title,
				description: post.data.summary ?? post.data.description ?? '',
				pubDate: getDate(post),
				link: `/blog/${getSlug(post)}/`,
			})),
	});
}
