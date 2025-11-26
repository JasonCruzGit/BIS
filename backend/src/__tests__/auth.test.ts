import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

describe('Authentication', () => {
  let testUserId: string

  beforeAll(async () => {
    // Create test user
    const hashedPassword = await bcrypt.hash('testpassword', 10)
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
        role: 'STAFF'
      }
    })
    testUserId = user.id
  })

  afterAll(async () => {
    // Clean up
    await prisma.user.delete({
      where: { id: testUserId }
    })
    await prisma.$disconnect()
  })

  it('should create a user', async () => {
    const user = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    })
    expect(user).toBeTruthy()
    expect(user?.email).toBe('test@example.com')
  })

  it('should hash password correctly', async () => {
    const user = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    })
    if (user) {
      const isValid = await bcrypt.compare('testpassword', user.password)
      expect(isValid).toBe(true)
    }
  })

  it('should find user by email', async () => {
    const user = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    })
    expect(user).toBeTruthy()
  })
})



