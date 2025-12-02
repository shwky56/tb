# Database Migrations Guide

This project uses TypeORM migrations to manage database schema changes.

## Prerequisites

- Ensure your `.env` file is configured with correct database credentials
- Set `DB_SYNCHRONIZE=false` in production (migrations will handle schema changes)

## Available Commands

### Generate a New Migration
Automatically generates a migration file based on entity changes:
```bash
npm run migration:generate src/database/migrations/MigrationName
```

### Create an Empty Migration
Creates an empty migration file for manual SQL:
```bash
npm run migration:create src/database/migrations/MigrationName
```

### Run Pending Migrations
Applies all pending migrations to the database:
```bash
npm run migration:run
```

### Revert Last Migration
Reverts the most recently applied migration:
```bash
npm run migration:revert
```

### Show Migration Status
Lists all migrations and their status:
```bash
npm run migration:show
```
- `[X]` = Applied
- `[ ]` = Pending

### Sync Schema (Development Only)
**⚠️ WARNING: Use only in development!**
```bash
npm run schema:sync
```

### Drop All Tables (Development Only)
**⚠️ DANGER: This will delete all data!**
```bash
npm run schema:drop
```

## Migration Workflow

### 1. Initial Setup (Already Done)
```bash
# Generate initial schema from entities
npm run migration:generate src/database/migrations/InitialSchema

# Apply the migration
npm run migration:run
```

### 2. Making Schema Changes

When you modify your entities (models):

1. **Update your entity file** (e.g., `src/models/user.model.ts`)
2. **Generate migration**:
   ```bash
   npm run migration:generate src/database/migrations/AddUserPhoneNumber
   ```
3. **Review the generated migration** in `src/database/migrations/`
4. **Apply the migration**:
   ```bash
   npm run migration:run
   ```

### 3. Rolling Back Changes

If you need to undo the last migration:
```bash
npm run migration:revert
```

## Best Practices

### ✅ DO
- Always review generated migrations before running them
- Use descriptive migration names (e.g., `AddUserPhoneNumber`, `CreateCoursesTable`)
- Test migrations in development before production
- Keep migrations small and focused
- Commit migration files to version control
- Set `DB_SYNCHRONIZE=false` in production

### ❌ DON'T
- Don't modify existing migration files after they've been applied
- Don't use `synchronize: true` in production
- Don't delete migration files
- Don't run `schema:drop` in production

## Migration File Structure

Generated migrations are stored in:
```
src/database/migrations/
├── 1764285997803-InitialSchema.ts
└── [timestamp]-[MigrationName].ts
```

Each migration has:
- `up()` - Applies the changes
- `down()` - Reverts the changes

## Example: Adding a New Column

1. **Update entity**:
```typescript
@Column({ type: 'varchar', length: 20, nullable: true })
phoneNumber?: string;
```

2. **Generate migration**:
```bash
npm run migration:generate src/database/migrations/AddUserPhoneNumber
```

3. **Review generated file**:
```typescript
public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "phoneNumber" character varying(20)`);
}

public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "phoneNumber"`);
}
```

4. **Apply migration**:
```bash
npm run migration:run
```

## Troubleshooting

### Migration Already Exists Error
If you get "migration already exists", check:
```bash
npm run migration:show
```

### Connection Issues
Verify your `.env` database credentials:
- `DB_HOST`
- `DB_PORT`
- `DB_USERNAME`
- `DB_PASSWORD`
- `DB_DATABASE`

### No Changes Detected
If `migration:generate` says "No changes detected":
- Ensure you've saved your entity changes
- Check that entities are properly decorated with TypeORM decorators
- Verify entity files match the pattern in `database.config.ts`

## Current Migration Status

✅ **Applied Migrations:**
- `InitialSchema1764285997803` - Initial database schema with all tables

**Tables Created:**
- `users` - User accounts with authentication
- `courses` - Course information
- `modules` - Course modules
- `lessons` - Lesson content
- `enrollments` - Student enrollments

## Production Deployment

1. **Before deployment**, ensure all migrations are tested
2. **During deployment**:
   ```bash
   npm run migration:run
   ```
3. **Verify** migration status:
   ```bash
   npm run migration:show
   ```

## Need Help?

- TypeORM Migrations Docs: https://typeorm.io/migrations
- Project Issues: [Your repository issues page]
