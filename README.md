# kysely-model

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![License][license-src]][license-href]

A lightweight Model wrapper for [Kysely](https://kysely.dev/) with full type safety.

## Install

```bash
npm install kysely-model
```

## Usage

```typescript
import { Kysely } from 'kysely'
import { Model } from 'kysely-model'

interface DB {
  users: {
    id: number
    name: string
    email: string
  }
}

const db = new Kysely<DB>({ dialect: new MyDialect() })
const user = new Model(db, 'users', 'id')

await user.create({ name: 'John', email: 'john@example.com' })
await user.findUnique(1)
await user.findMany()
await user.findFirst()
await user.update(1, { name: 'Jane' })
await user.delete(1)
await user.count()
await user.createMany([/* ... */])
await user.updateMany([/* ... */])
await user.deleteMany([/* ... */])
```

### Extend with Custom Methods

```typescript
class UserModel extends Model<DB, 'users', 'id'> {
  constructor(db: Kysely<DB>) {
    super(db, 'users', 'id')
  }

  async findByEmail(email: string) {
    return this.db
      .selectFrom(this.table)
      .selectAll()
      .where('email', '=', email)
      .executeTakeFirst()
  }
}

const user = new UserModel(db)
await user.findByEmail('john@example.com')
```

### Model Assembly

Simplify operations by combining all models.

```typescript
const connection = new Kysely<DB>()

export const db = Object.assign(connection, {
  user: new UserModel(db),
  post: new PostModel(db),
})

db.user.findByEmail('john@example.com')
```

## License

[MIT](./LICENSE) License © [hairyf](https://github.com/hairyf)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/kysely-model?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/kysely-model
[npm-downloads-src]: https://img.shields.io/npm/dm/kysely-model?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/kysely-model
[bundle-src]: https://img.shields.io/bundlephobia/minzip/kysely-model?style=flat&colorA=080f12&colorB=1fa669&label=minzip
[bundle-href]: https://bundlephobia.com/result?p=kysely-model
[license-src]: https://img.shields.io/github/license/hairyf/kysely-model.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/hairyf/kysely-model/blob/main/LICENSE
