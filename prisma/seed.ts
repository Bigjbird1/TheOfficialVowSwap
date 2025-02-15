import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create test user
  const hashedPassword = await hash('password123', 12)
  const user = await prisma.user.create({
    data: {
      id: 'test-user-1',
      name: 'Test Seller',
      email: 'seller@test.com',
      password: hashedPassword,
      role: 'SELLER',
    },
  })

  // Create seller profile
  const seller = await prisma.seller.create({
    data: {
      userId: user.id,
      storeName: 'Wedding Essentials',
      description: 'Your one-stop shop for wedding essentials',
      contactEmail: 'seller@test.com',
      location: 'New York, NY',
    },
  })

  // Create test products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Elegant Wedding Dress',
        description: 'A beautiful white wedding dress with lace details',
        price: 1299.99,
        quantity: 5,
        sellerId: seller.id,
        category: 'Dresses',
        isActive: true,
        isNewArrival: true,
        rating: 4.8,
        popularity: 95,
        tags: ['wedding dress', 'bridal', 'lace', 'white'],
        images: ['https://example.com/dress1.jpg'],
      },
    }),
    prisma.product.create({
      data: {
        name: 'Crystal Tiara',
        description: 'Stunning crystal tiara for the perfect bridal look',
        price: 299.99,
        quantity: 10,
        sellerId: seller.id,
        category: 'Accessories',
        isActive: true,
        isNewArrival: true,
        rating: 4.9,
        popularity: 88,
        tags: ['tiara', 'bridal', 'crystal', 'accessories'],
        images: ['https://example.com/tiara1.jpg'],
      },
    }),
    prisma.product.create({
      data: {
        name: 'Pearl Necklace Set',
        description: 'Elegant pearl necklace and earring set',
        price: 199.99,
        quantity: 15,
        sellerId: seller.id,
        category: 'Jewelry',
        isActive: true,
        isNewArrival: false,
        rating: 4.7,
        popularity: 82,
        tags: ['jewelry', 'pearls', 'necklace', 'earrings'],
        images: ['https://example.com/jewelry1.jpg'],
      },
    }),
    prisma.product.create({
      data: {
        name: 'Wedding Veil',
        description: 'Cathedral length veil with lace trim',
        price: 149.99,
        quantity: 20,
        sellerId: seller.id,
        category: 'Accessories',
        isActive: true,
        isNewArrival: false,
        rating: 4.6,
        popularity: 75,
        tags: ['veil', 'bridal', 'lace', 'accessories'],
        images: ['https://example.com/veil1.jpg'],
      },
    }),
  ])

  console.log('Database seeded with test data')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
