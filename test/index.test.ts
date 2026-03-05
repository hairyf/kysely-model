import type { Insertable, Kysely } from 'kysely'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Model } from '../src/index'

interface User {
  id: number
  name: string
  email: string
  age?: number
}

interface DB {
  users: User
}

describe('model', () => {
  let mockDb: Kysely<DB>
  let model: Model<DB, 'users', 'id'>

  beforeEach(() => {
    mockDb = {
      insertInto: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          defaultValues: vi.fn().mockReturnValue({
            execute: vi.fn().mockResolvedValue([{ numInsertedOrUpdatedRows: 1 }]),
          }),
          execute: vi.fn().mockResolvedValue([{ numInsertedOrUpdatedRows: 1 }]),
        }),
        defaultValues: vi.fn().mockReturnValue({
          execute: vi.fn().mockResolvedValue([{ numInsertedOrUpdatedRows: 1 }]),
        }),
        execute: vi.fn().mockResolvedValue([{ numInsertedOrUpdatedRows: 1 }]),
      }),
      deleteFrom: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          execute: vi.fn().mockResolvedValue([{ numDeletedRows: 1 }]),
        }),
        execute: vi.fn().mockResolvedValue([{ numDeletedRows: 1 }]),
      }),
      updateTable: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            execute: vi.fn().mockResolvedValue([{ numUpdatedRows: 1 }]),
          }),
          execute: vi.fn().mockResolvedValue([{ numUpdatedRows: 1 }]),
        }),
      }),
      selectFrom: vi.fn().mockReturnValue({
        selectAll: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            executeTakeFirst: vi.fn().mockResolvedValue({ id: 1, name: 'John', email: 'john@example.com' }),
            execute: vi.fn().mockResolvedValue([{ id: 1, name: 'John', email: 'john@example.com' }]),
          }),
          executeTakeFirst: vi.fn().mockResolvedValue({ id: 1, name: 'John', email: 'john@example.com' }),
          execute: vi.fn().mockResolvedValue([{ id: 1, name: 'John', email: 'john@example.com' }]),
        }),
        select: vi.fn().mockReturnValue({
          executeTakeFirst: vi.fn().mockResolvedValue({ count: 10 }),
        }),
      }),
      fn: {
        count: vi.fn().mockReturnValue({
          as: vi.fn().mockReturnValue({}),
        }),
      },
      transaction: vi.fn().mockReturnValue({
        execute: vi.fn().mockImplementation(async (callback) => {
          const mockTrx = {
            updateTable: vi.fn().mockReturnValue({
              set: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                  execute: vi.fn().mockResolvedValue([{ numUpdatedRows: 1 }]),
                }),
              }),
            }),
          }
          return callback(mockTrx)
        }),
      }),
    } as unknown as Kysely<DB>

    model = new Model(mockDb, 'users', 'id')
  })

  describe('create', () => {
    it('should create a record with values', async () => {
      const result = await model.create({ name: 'John', email: 'john@example.com' } as Insertable<User>)
      expect(mockDb.insertInto).toHaveBeenCalledWith('users')
      expect(result.numInsertedOrUpdatedRows).toBe(1)
    })

    it('should create a record with empty values', async () => {
      await model.create({} as Insertable<User>)
    })
  })

  describe('createMany', () => {
    it('should create multiple records', async () => {
      const values = [
        { name: 'John', email: 'john@example.com' },
        { name: 'Jane', email: 'jane@example.com' },
      ] as Insertable<User>[]
      await model.createMany(values)
      expect(mockDb.insertInto).toHaveBeenCalledWith('users')
    })
  })

  describe('findUnique', () => {
    it('should find a record by id', async () => {
      const result = await model.findUnique(1)
      expect(mockDb.selectFrom).toHaveBeenCalledWith('users')
      expect(result).toEqual({ id: 1, name: 'John', email: 'john@example.com' })
    })
  })

  describe('findMany', () => {
    it('should find all records', async () => {
      const result = await model.findMany()
      expect(mockDb.selectFrom).toHaveBeenCalledWith('users')
      expect(result).toHaveLength(1)
    })
  })

  describe('findFirst', () => {
    it('should find first record', async () => {
      const result = await model.findFirst()
      expect(mockDb.selectFrom).toHaveBeenCalledWith('users')
      expect(result).toEqual({ id: 1, name: 'John', email: 'john@example.com' })
    })
  })

  describe('update', () => {
    it('should update a record by id', async () => {
      const result = await model.update(1, { name: 'Jane' })
      expect(mockDb.updateTable).toHaveBeenCalledWith('users')
      expect(result[0].numUpdatedRows).toBe(1)
    })
  })

  describe('updateMany', () => {
    it('should update multiple records', async () => {
      const values = [
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' },
      ]
      await model.updateMany(values)
      expect(mockDb.transaction).toHaveBeenCalled()
    })
  })

  describe('delete', () => {
    it('should delete a record by id', async () => {
      const result = await model.delete(1)
      expect(mockDb.deleteFrom).toHaveBeenCalledWith('users')
      expect(result.numDeletedRows).toBe(1)
    })
  })

  describe('deleteMany', () => {
    it('should delete multiple records by ids', async () => {
      await model.deleteMany(['1', '2', '3'])
      expect(mockDb.deleteFrom).toHaveBeenCalledWith('users')
    })
  })

  describe('count', () => {
    it('should return count of records', async () => {
      const result = await model.count()
      expect(mockDb.selectFrom).toHaveBeenCalledWith('users')
      expect(result).toBe(10)
    })
  })
})
