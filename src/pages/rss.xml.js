import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';

export async function GET(context) {
	const posts = await getCollection('blog', ({ data }) => !data.labels.includes('hidden'));
	const getDate = (entry) => entry.data.date ?? new Date(0);
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: posts
			.sort((a, b) => getDate(b).valueOf() - getDate(a).valueOf())
			.map((post) => ({
				title: post.data.title,
				pubDate: getDate(post),
				link: `/blog/${post.id}/`,
			})),
	});
}
