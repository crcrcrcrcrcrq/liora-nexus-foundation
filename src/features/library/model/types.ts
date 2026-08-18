/** Sekcja artykułu — śródtytuł i jego akapity. */
export interface ArticleSection {
  heading: string;
  paragraphs: string[];
}

/** Tekst Biblioteki Refleksji w formie publikacji magazynowej. */
export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  category: string;
  readingTime: number;
  author: string;
  authorRole: string;
  heroImage: string;
  heroAlt: string;
  excerpt: string;
  lead: string;
  quote: string;
  sections: ArticleSection[];
}
