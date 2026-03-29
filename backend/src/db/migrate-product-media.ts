import fs from 'node:fs/promises'
import path from 'node:path'
import { randomUUID } from 'node:crypto'

import { pool } from './pool'

type ProductImageRow = {
    id: number
    image_url: string
}

const productsMediaDir = path.resolve(process.cwd(), 'media', 'products')

const mimeToExtension: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'image/svg+xml': '.svg',
}

const getExtensionFromUrl = (url: string): string => {
    try {
        const parsed = new URL(url)
        const extension = path.extname(parsed.pathname).toLowerCase()
        if (extension) {
            return extension
        }
    } catch {
        return ''
    }

    return ''
}

const getExtension = (contentType: string | null, sourceUrl: string): string => {
    const mimeType = contentType?.split(';')[0]?.trim().toLowerCase() ?? ''

    if (mimeType && mimeToExtension[mimeType]) {
        return mimeToExtension[mimeType]
    }

    const fromUrl = getExtensionFromUrl(sourceUrl)
    if (fromUrl) {
        return fromUrl
    }

    return '.jpg'
}

const downloadImage = async (url: string): Promise<{ bytes: Buffer; extension: string }> => {
    const response = await fetch(url)

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
    }

    const contentType = response.headers.get('content-type')
    if (!contentType?.toLowerCase().startsWith('image/')) {
        throw new Error('Response is not an image')
    }

    const arrayBuffer = await response.arrayBuffer()
    return {
        bytes: Buffer.from(arrayBuffer),
        extension: getExtension(contentType, url),
    }
}

const migrate = async (): Promise<void> => {
    await fs.mkdir(productsMediaDir, { recursive: true })

    const sourceResult = await pool.query<ProductImageRow>(
        `
        SELECT id, image_url
        FROM products
        WHERE image_url ~* '^https?://'
        ORDER BY id ASC
        `,
    )

    const rows = sourceResult.rows
    console.log(`Found ${rows.length} product images to migrate`)

    let migratedCount = 0
    let failedCount = 0

    for (const row of rows) {
        try {
            const { bytes, extension } = await downloadImage(row.image_url)
            const filename = `${row.id}-${Date.now()}-${randomUUID()}${extension}`
            const diskPath = path.join(productsMediaDir, filename)
            const storedPath = `/media/products/${filename}`

            await fs.writeFile(diskPath, bytes)

            await pool.query(
                `
                UPDATE products
                SET image_url = $1
                WHERE id = $2
                `,
                [storedPath, row.id],
            )

            migratedCount += 1
            console.log(`Migrated product #${row.id} -> ${storedPath}`)
        } catch (error) {
            failedCount += 1
            const message = error instanceof Error ? error.message : String(error)
            console.error(`Failed migrating product #${row.id} (${row.image_url}): ${message}`)
        }
    }

    console.log(`Migration complete. Success: ${migratedCount}, Failed: ${failedCount}`)
}

void migrate()
    .catch((error) => {
        console.error('Product media migration failed', error)
        process.exitCode = 1
    })
    .finally(async () => {
        await pool.end()
    })
