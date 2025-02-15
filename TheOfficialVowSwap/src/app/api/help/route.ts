import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ArticleStatus } from '@/app/types/help-center';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const category = searchParams.get('category');
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build where clause for search
    const where: Prisma.HelpArticleWhereInput = {
      status: ArticleStatus.PUBLISHED,
      OR: query
        ? [
            { title: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
            { excerpt: { contains: query, mode: 'insensitive' } },
          ]
        : undefined,
      category: category ? { slug: category } : undefined,
      tags: tags?.length
        ? {
            some: {
              name: { in: tags },
            },
          }
        : undefined,
    };

    // Get total count for pagination
    const totalCount = await prisma.helpArticle.count({ where });
    const totalPages = Math.ceil(totalCount / limit);

    // Get articles with relations
    const articles = await prisma.helpArticle.findMany({
      where,
      include: {
        category: true,
        tags: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    return NextResponse.json({
      articles,
      totalCount,
      page,
      totalPages,
    });
  } catch (error) {
    console.error('Error in help articles API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch help articles' },
      { status: 500 }
    );
  }
}

// POST endpoint for creating new help articles (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, excerpt, categoryId, tags } = body;

    // TODO: Add authentication check for admin role
    
    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const article = await prisma.helpArticle.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        categoryId,
        tags: {
          connect: tags.map((tagId: string) => ({ id: tagId })),
        },
      },
      include: {
        category: true,
        tags: true,
      },
    });

    return NextResponse.json(article);
  } catch (error) {
    console.error('Error creating help article:', error);
    return NextResponse.json(
      { error: 'Failed to create help article' },
      { status: 500 }
    );
  }
}
