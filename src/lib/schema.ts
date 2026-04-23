import type {
  WebSite,
  Organization,
  Person,
  LocalBusiness,
  BlogPosting,
  BreadcrumbList,
  FAQPage,
  PostalAddress,
  WithContext,
  VideoGame,
  GamePlayMode,
} from 'schema-dts';
import siteConfig from '@/config/site.config';

/** Postal address for JSON-LD only when `site.config` has at least one non-empty field. */
function sitePostalAddress(): PostalAddress | undefined {
  const a = siteConfig.address;
  if (!a) return undefined;
  const has = [a.street, a.city, a.state, a.zip, a.country].some((v) => v && v.trim() !== '');
  if (!has) return undefined;
  return {
    '@type': 'PostalAddress',
    ...(a.street?.trim() ? { streetAddress: a.street.trim() } : {}),
    ...(a.city?.trim() ? { addressLocality: a.city.trim() } : {}),
    ...(a.state?.trim() ? { addressRegion: a.state.trim() } : {}),
    ...(a.zip?.trim() ? { postalCode: a.zip.trim() } : {}),
    ...(a.country?.trim() ? { addressCountry: a.country.trim() } : {}),
  };
}

/**
 * Create WebSite schema for homepage
 */
export function createWebsiteSchema(): WithContext<WebSite> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
  };
}

/**
 * Create Person schema for site author / brand (synced with `siteConfig.author`).
 */
export function createPersonSchema(): WithContext<Person> {
  const postal = sitePostalAddress();
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: siteConfig.author,
    jobTitle: 'Gaming publisher & community',
    url: siteConfig.url,
    email: siteConfig.email,
    ...(siteConfig.authorImage ? { image: `${siteConfig.url}${siteConfig.authorImage}` } : {}),
    ...(postal ? { address: postal } : {}),
    sameAs: siteConfig.socialLinks,
  };
}

/**
 * Create ProfessionalService schema for local SEO
 */
export function createProfessionalServiceSchema(): WithContext<LocalBusiness> {
  const postal = sitePostalAddress();
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService' as 'LocalBusiness',
    name: siteConfig.name,
    url: siteConfig.url,
    email: siteConfig.email,
    ...(siteConfig.phone ? { telephone: siteConfig.phone } : {}),
    ...(siteConfig.authorImage ? { image: `${siteConfig.url}${siteConfig.authorImage}` } : {}),
    ...(postal ? { address: postal } : {}),
    areaServed: { '@type': 'Place', name: 'Worldwide' },
    sameAs: siteConfig.socialLinks,
  };
}

/**
 * Create Organization schema
 */
export function createOrganizationSchema(): WithContext<Organization> {
  const logoUrl = siteConfig.branding.logo.imageUrl
    ? `${siteConfig.url}${siteConfig.branding.logo.imageUrl}`
    : undefined;
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
    ...(logoUrl ? { logo: logoUrl } : {}),
    sameAs: siteConfig.socialLinks,
    contactPoint: siteConfig.phone
      ? {
          '@type': 'ContactPoint',
          telephone: siteConfig.phone,
          contactType: 'customer service',
        }
      : undefined,
  };
}

/**
 * Create BlogPosting schema for blog posts
 */
export function createBlogPostSchema(post: {
  title: string;
  description: string;
  url: string;
  image: string;
  datePublished: Date;
  dateModified?: Date;
  author: { name: string; url?: string };
}): WithContext<BlogPosting> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    url: post.url,
    image: post.image,
    datePublished: post.datePublished.toISOString(),
    dateModified: post.dateModified?.toISOString() || post.datePublished.toISOString(),
    author: {
      '@type': 'Person',
      name: post.author.name,
      url: post.author.url,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      ...(siteConfig.branding.logo.imageUrl
        ? {
            logo: {
              '@type': 'ImageObject',
              url: `${siteConfig.url}${siteConfig.branding.logo.imageUrl}`,
            },
          }
        : {}),
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': post.url,
    },
  };
}

/**
 * Create BreadcrumbList schema
 */
export function createBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
): WithContext<BreadcrumbList> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Create FAQPage schema
 */
export function createFAQSchema(
  faqs: Array<{ question: string; answer: string }>
): WithContext<FAQPage> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

type PlayModeLiteral = 'SinglePlayer' | 'MultiPlayer' | 'CoOp';

/**
 * VideoGame JSON-LD for game detail pages (SERP).
 */
export function createVideoGameSchema(input: {
  name: string;
  description: string;
  url: string;
  image?: string;
  applicationCategory: string;
  operatingSystem: string[];
  gamePlatform: string[];
  playMode: PlayModeLiteral[];
  offersPrice: 0 | 1;
  playUrl: string;
  datePublished?: string;
  trailerYoutubeId?: string;
}): WithContext<VideoGame> {
  const playModes: GamePlayMode[] = input.playMode.map((m) => m as GamePlayMode);

  const offers =
    input.offersPrice === 0
      ? {
          '@type': 'Offer' as const,
          price: 0,
          priceCurrency: 'USD',
          url: input.playUrl,
        }
      : {
          '@type': 'Offer' as const,
          price: 4.99,
          priceCurrency: 'USD',
          url: input.playUrl,
        };

  return {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: input.name,
    description: input.description,
    url: input.url,
    ...(input.image ? { image: input.image } : {}),
    applicationCategory: input.applicationCategory,
    operatingSystem:
      input.operatingSystem.length === 1 ? input.operatingSystem[0] : input.operatingSystem,
    gamePlatform: input.gamePlatform.length === 1 ? input.gamePlatform[0] : input.gamePlatform,
    playMode: playModes.length === 1 ? playModes[0] : playModes,
    offers,
    ...(input.datePublished ? { datePublished: input.datePublished } : {}),
    ...(input.trailerYoutubeId
      ? {
          trailer: {
            '@type': 'VideoObject',
            name: `${input.name} trailer`,
            embedUrl: `https://www.youtube.com/embed/${input.trailerYoutubeId}`,
            contentUrl: `https://www.youtube.com/watch?v=${input.trailerYoutubeId}`,
          },
        }
      : {}),
  };
}
