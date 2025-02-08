import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ArticleStatus } from '@/app/types/help-center';

export async function GET() {
  try {
    const categories = await prisma.helpCategory.findMany({
      include: {
        _count: {
          select: {
            articles: {
              where: {
                status: ArticleStatus.PUBLISHED,
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Transform the response to include the article count
    const transformedCategories = categories.map((category: { 
      id: string;
      name: string;
      slug: string;
      description: string | null;
      _count: { articles: number };
    }) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      articles: category._count.articles,
    }));

    return NextResponse.json(transformedCategories);
  } catch (error) {
    console.error('Error fetching help categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch help categories' },
      { status: 500 }
    );
  }
}
