import type { MetadataRoute } from "next";
import { sitio } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] }],
    sitemap: `${sitio.url}/sitemap.xml`,
  };
}
