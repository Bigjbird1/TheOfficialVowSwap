export interface HelpCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  articles?: HelpArticle[];
}

export interface HelpTag {
  id: string;
  name: string;
}

export interface HelpArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  status: ArticleStatus;
  categoryId: string;
  category?: HelpCategory;
  tags?: HelpTag[];
  views: number;
  helpful: number;
  notHelpful: number;
  createdAt: string;
  updatedAt: string;
}

export enum ArticleStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export interface SearchParams {
  query?: string;
  category?: string;
  tags?: string[];
  page?: number;
  limit?: number;
}

export interface SearchResponse {
  articles: HelpArticle[];
  totalCount: number;
  page: number;
  totalPages: number;
}
