import { config } from "$lib/common/config";

export async function GET() {
	const baseUrl = config.HTTP.CLIENT_URL;
	const currentDate = new Date().toISOString().split("T")[0];

	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
	<url>
		<loc>${baseUrl}</loc>
		<lastmod>${currentDate}</lastmod>
		<changefreq>weekly</changefreq>
		<priority>1.0</priority>
	</url>
	<url>
		<loc>${baseUrl}/web/login</loc>
		<lastmod>${currentDate}</lastmod>
		<changefreq>monthly</changefreq>
		<priority>0.7</priority>
	</url>
	<url>
		<loc>${baseUrl}/web/register</loc>
		<lastmod>${currentDate}</lastmod>
		<changefreq>monthly</changefreq>
		<priority>0.7</priority>
	</url>
</urlset>`;

	return new Response(sitemap, {
		headers: {
			"Content-Type": "application/xml",
			"Cache-Control": "max-age=3600" // Cache for 1 hour
		}
	});
}
