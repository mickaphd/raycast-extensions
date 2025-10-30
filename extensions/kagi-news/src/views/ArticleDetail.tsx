import { Detail, getPreferenceValues } from "@raycast/api";
import { Article, Source } from "../interfaces";
import { getDomain } from "../utils";

interface ArticleDetailProps {
  article: Article;
}

interface Preferences {
  showTalkingPoints: boolean;
  showPrimaryImage: boolean;
  showSecondaryImage: boolean;
  showPerspectives: boolean;
  showHistoricalBackground: boolean;
  showInternationalReactions: boolean;
  showTimeline: boolean;
  showTechnicalDetails: boolean;
  showIndustryImpact: boolean;
  showDidYouKnow: boolean;
}

export function ArticleDetail({ article }: ArticleDetailProps) {
  const preferences = getPreferenceValues<Preferences>();
  const sources = article.sources || [];
  const highlights = article.highlights || [];

  let markdown = `# ${article.title}`;
  let allVisibleText = ""; // Track all visible content for source extraction

  const articleMetadata = article as Record<string, unknown>;

  if (preferences.showPrimaryImage && articleMetadata.primary_image) {
    const primaryImage = articleMetadata.primary_image as { url?: string; caption?: string };
    if (primaryImage.url) {
      markdown += `\n\n![Primary Image](${primaryImage.url})`;
      if (primaryImage.caption) {
        markdown += `\n\n> *${primaryImage.caption}*`;
      }
    }
  }

  markdown += `\n\n## Summary\n${article.summary}`;
  allVisibleText += article.summary + " ";

  if (preferences.showTalkingPoints && highlights.length > 0) {
    markdown += `\n\n## Talking Points\n`;
    highlights.forEach((highlight) => {
      markdown += `- ${highlight}\n`;
      allVisibleText += highlight + " ";
    });
  }

  if (preferences.showSecondaryImage && articleMetadata.secondary_image) {
    const secondaryImage = articleMetadata.secondary_image as { url?: string; caption?: string };
    if (secondaryImage.url) {
      markdown += `\n\n![Secondary Image](${secondaryImage.url})`;
      if (secondaryImage.caption) {
        markdown += `\n\n> *${secondaryImage.caption}*`;
      }
    }
  }

  if (preferences.showPerspectives && articleMetadata.perspectives) {
    const perspectives = articleMetadata.perspectives as Array<{ text: string }>;
    if (Array.isArray(perspectives) && perspectives.length > 0) {
      markdown += `\n\n## Perspectives\n`;
      perspectives.forEach((perspective) => {
        markdown += `- ${perspective.text}\n`;
        allVisibleText += perspective.text + " ";
      });
    }
  }

  if (preferences.showHistoricalBackground && articleMetadata.historical_background) {
    const historicalBackground = articleMetadata.historical_background as string;
    markdown += `\n\n## Historical Background\n${historicalBackground}`;
    allVisibleText += historicalBackground + " ";
  }

  if (preferences.showTechnicalDetails && articleMetadata.technical_details) {
    const details = articleMetadata.technical_details as string[];
    if (Array.isArray(details) && details.length > 0) {
      markdown += `\n\n## Technical Details\n`;
      details.forEach((detail) => {
        markdown += `- ${detail}\n`;
        allVisibleText += detail + " ";
      });
    }
  }

  if (preferences.showIndustryImpact && articleMetadata.industry_impact) {
    const impacts = articleMetadata.industry_impact as string[];
    if (Array.isArray(impacts) && impacts.length > 0) {
      markdown += `\n\n## Industry Impact\n`;
      impacts.forEach((impact) => {
        markdown += `- ${impact}\n`;
        allVisibleText += impact + " ";
      });
    }
  }

  if (preferences.showTimeline && articleMetadata.timeline) {
    const timeline = articleMetadata.timeline as Array<{ date: string; content: string }>;
    if (Array.isArray(timeline) && timeline.length > 0) {
      markdown += `\n\n## Timeline\n`;
      timeline.forEach((event) => {
        markdown += `**${event.date}**: ${event.content}\n\n`;
        allVisibleText += event.content + " ";
      });
    }
  }

  if (preferences.showInternationalReactions && articleMetadata.international_reactions) {
    const reactions = articleMetadata.international_reactions as string[];
    if (Array.isArray(reactions) && reactions.length > 0) {
      markdown += `\n\n## International Reactions\n`;
      reactions.forEach((reaction) => {
        markdown += `- ${reaction}\n`;
        allVisibleText += reaction + " ";
      });
    }
  }

  if (preferences.showDidYouKnow && article.didYouKnow) {
    markdown += `\n\n## Did You Know?\n${article.didYouKnow}`;
    allVisibleText += article.didYouKnow + " ";
  }

  // Extract sources only from visible content
  const refRegex = /\[([a-z0-9.-]+)#(\d+)\]/g;
  const referencedSources = new Map<string, Source>();

  let match;
  while ((match = refRegex.exec(allVisibleText)) !== null) {
    const domain = match[1];
    const num = parseInt(match[2], 10);
    const key = `${domain}#${num}`;

    const source = sources.find((s) => getDomain(s.url) === domain);
    if (source && !referencedSources.has(key)) {
      referencedSources.set(key, source);
    }
  }

  return (
    <Detail
      markdown={markdown}
      metadata={
        referencedSources.size > 0 ? (
          <Detail.Metadata>
            {Array.from(referencedSources.entries()).map(([key, source], index) => (
              <Detail.Metadata.Link key={index} title={`[${key}]`} target={source.url} text={source.name} />
            ))}
          </Detail.Metadata>
        ) : undefined
      }
    />
  );
}
