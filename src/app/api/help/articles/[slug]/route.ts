import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ArticleStatus } from '@/app/types/help-center';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const article = await prisma.helpArticle.findFirst({
      where: {
        slug: params.slug,
        status: ArticleStatus.PUBLISHED,
      },
      include: {
        category: true,
        tags: true,
      },
    });

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await prisma.helpArticle.update({
      where: { id: article.id },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json(article);
  } catch (error) {
    console.error('Error fetching help article:', error);
    return NextResponse.json(
      { error: 'Failed to fetch help article' },
      { status: 500 }
    );
  }
}

// Handle helpful/not helpful feedback
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { helpful } = await request.json();
    const article = await prisma.helpArticle.findFirst({
      where: {
        slug: params.slug,
        status: ArticleStatus.PUBLISHED,
      },
    });

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    const updatedArticle = await prisma.helpArticle.update({
      where: { id: article.id },
      data: {
        helpful: helpful ? { increment: 1 } : article.helpful,
        notHelpful: !helpful ? { increment: 1 } : article.notHelpful,
      },
    });

    return NextResponse.json(updatedArticle);
  } catch (error) {
    console.error('Error updating article feedback:', error);
    return NextResponse.json(
      { error: 'Failed to update article feedback' },
      { status: 500 }
    );
  }
}
