import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { getArticles, getCanonicalUrl, siteMeta } from "../../data/site";

export const GET: APIRoute = async (context) => {
  const articles = await getArticles();

  return rss({
    title: `${siteMeta.name} / Articles`,
    description: "Long-form writing from mindful.engineer.",
    site: context.site ?? siteMeta.siteUrl,
    items: articles.map((article) => ({
      title: article.title,
      pubDate: new Date(article.date),
      description: article.summary,
      link: getCanonicalUrl(article),
    })),
  });
};
