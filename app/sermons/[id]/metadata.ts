import { Metadata } from "next";
import { generateMetadata as baseGenerateMetadata } from "@/lib/metadata";
// Generate dynamic metadata for each sermon
export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const { id } = params;

  await dbConnect();
  const sermon = await Sermon.findOne({ id });

  if (!sermon) {
    return baseGenerateMetadata({
      title: "Sermon Not Found",
      description: "The requested sermon could not be found.",
      pathname: `/sermons/${id}`,
    });
  }

  // Extract keywords from tags
  const keywords = [
    ...sermon.tags,
    "sermon",
    "preaching",
    "message",
    "video",
    "church",
    "Kiambu",
    "Kenya",
    "Christian",
  ];

  return baseGenerateMetadata({
    title: sermon.title,
    description: `Watch "${sermon.title}" by ${
      sermon.speaker
    } at Uhai Centre Church. ${sermon.description.substring(0, 150)}...`,
    keywords: keywords,
    image: sermon.thumbnailUrl || "/images/og-image.jpg",
    type: "article",
    pathname: `/sermons/${id}`,
  });
}
