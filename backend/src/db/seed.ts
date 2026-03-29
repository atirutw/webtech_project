import fs from 'node:fs/promises'
import path from 'node:path'

import { pool } from './pool'

const categories = [
    { category: 'synth', displayName: 'Synthesizers', type: 'instrument' },
    { category: 'drum-machine', displayName: 'Drum Machines', type: 'instrument' },
    { category: 'sampler', displayName: 'Samplers', type: 'instrument' },
    { category: 'sound-module', displayName: 'Sound Modules', type: 'instrument' },
    { category: 'midi-interface', displayName: 'MIDI Interfaces', type: 'accessory' },
    { category: 'sound-card', displayName: 'Sound Cards', type: 'accessory' }
]

const categoryTypeMap: Record<string, 'instrument' | 'accessory'> = {
    synth: 'instrument',
    'drum-machine': 'instrument',
    sampler: 'instrument',
    'sound-module': 'instrument',
    'midi-interface': 'accessory',
    'sound-card': 'accessory',
}

const products = [
    { name: 'Roland JUNO-60', brand: 'Roland', category: 'synth', price: 2899.00, stock: 4, wikiTitle: 'Roland JUNO-60' },
    { name: 'Roland JUPITER-8', brand: 'Roland', category: 'synth', price: 11999.00, stock: 1, wikiTitle: 'Roland Jupiter-8' },
    { name: 'Roland D-50', brand: 'Roland', category: 'synth', price: 1899.00, stock: 3, wikiTitle: 'Roland D-50' },
    { name: 'Roland SH-101', brand: 'Roland', category: 'synth', price: 2599.00, stock: 2, wikiTitle: 'Roland SH-101' },
    { name: 'Roland TB-303', brand: 'Roland', category: 'synth', price: 4999.00, stock: 2, wikiTitle: 'Roland TB-303' },
    { name: 'Roland TR-808', brand: 'Roland', category: 'drum-machine', price: 8999.00, stock: 1, wikiTitle: 'Roland TR-808' },
    { name: 'Roland TR-909', brand: 'Roland', category: 'drum-machine', price: 9999.00, stock: 1, wikiTitle: 'Roland TR-909' },
    { name: 'Yamaha DX7', brand: 'Yamaha', category: 'synth', price: 1999.00, stock: 3, wikiTitle: 'Yamaha DX7' },
    { name: 'Korg M1', brand: 'Korg', category: 'synth', price: 1799.00, stock: 3, wikiTitle: 'Korg M1' },
    { name: 'Korg Wavestation', brand: 'Korg', category: 'synth', price: 1699.00, stock: 2, wikiTitle: 'Korg Wavestation' },
    { name: 'Prophet-5', brand: 'Sequential', category: 'synth', price: 3599.00, stock: 2, wikiTitle: 'Sequential Prophet-5' },
    { name: 'Akai MPC60', brand: 'Akai', category: 'sampler', price: 4299.00, stock: 1, wikiTitle: 'Akai MPC60' },
    { name: 'Sound Blaster AWE32', brand: 'Creative', category: 'sound-card', price: 249.00, stock: 12, wikiTitle: 'Sound Blaster AWE32' },
    { name: 'Sound Blaster 16', brand: 'Creative', category: 'sound-card', price: 199.00, stock: 15, wikiTitle: 'Sound Blaster 16' },
    { name: 'Sound Blaster AWE64', brand: 'Creative', category: 'sound-card', price: 349.00, stock: 8, wikiTitle: 'Sound Blaster AWE64 Gold' },
    { name: 'Gravis UltraSound', brand: 'Gravis', category: 'sound-card', price: 329.00, stock: 6, wikiTitle: 'Gravis UltraSound' },
    { name: 'Roland MPU-401', brand: 'Roland', category: 'midi-interface', price: 189.00, stock: 10, wikiTitle: 'Roland MPU-401' },
    { name: 'Roland MT-32', brand: 'Roland', category: 'sound-module', price: 899.00, stock: 4, wikiTitle: 'Roland MT-32' },
    { name: 'Roland SC-55', brand: 'Roland', category: 'sound-module', price: 999.00, stock: 5, wikiTitle: 'Roland SC-55' }
]

const imageOverrides: Record<string, string> = {
    'Roland JUNO-60': 'https://commons.wikimedia.org/wiki/Special:FilePath/Roland_Juno-60_(6935222973).jpg',
    'Roland JUPITER-8': 'https://commons.wikimedia.org/wiki/Special:FilePath/Roland_Jupiter-8_Synth,_1983_(white_bg).jpg',
    'Akai MPC60': 'https://commons.wikimedia.org/wiki/Special:FilePath/Akai_MPC60.jpg',
    'Sound Blaster AWE64': 'https://commons.wikimedia.org/wiki/Special:FilePath/KL_Creative_Labs_Soundblaster_AWE64_Gold_CT4390.jpg',
    'Sound Blaster AWE64 Gold': 'https://commons.wikimedia.org/wiki/Special:FilePath/KL_Creative_Labs_Soundblaster_AWE64_Gold_CT4390.jpg',
    'Roland SC-55': 'https://commons.wikimedia.org/wiki/Special:FilePath/Roland_SCC-1.jpg',
    'Roland SC-55 Sound Canvas': 'https://commons.wikimedia.org/wiki/Special:FilePath/Roland_SCC-1.jpg'
}

const seedMediaDir = path.resolve(process.cwd(), 'media', 'products', 'seed')

const slugify = (value: string): string => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

const originalNameForProduct = (name: string, brand: string): string => {
    let originalName = name.replace(`${brand} `, '')

    if (name === 'Roland TB-303') originalName = 'TB-303 Bass Line'
    if (name === 'Roland TR-808') originalName = 'TR-808 Rhythm Composer'
    if (name === 'Roland TR-909') originalName = 'TR-909 Rhythm Composer'
    if (name === 'Korg Wavestation') originalName = 'Wavestation EX'
    if (name === 'Prophet-5') originalName = 'Prophet-5 Rev4'
    if (name === 'Sound Blaster AWE32') originalName = 'AWE32 (CT2760)'
    if (name === 'Sound Blaster 16') originalName = 'Sound Blaster 16 (CT1740)'
    if (name === 'Sound Blaster AWE64') originalName = 'Sound Blaster AWE64 Gold'
    if (name === 'Gravis UltraSound') originalName = 'Gravis UltraSound Classic'
    if (name === 'Roland MPU-401') originalName = 'Roland MPU-401AT'
    if (name === 'Roland SC-55') originalName = 'Roland SC-55 Sound Canvas'

    return originalName
}

const fetchWikipediaThumbnail = async (title: string): Promise<string> => {
    if (imageOverrides[title]) {
        return imageOverrides[title]
    }

    try {
        const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`)

        if (!response.ok) {
            return ''
        }

        const data = (await response.json()) as { thumbnail?: { source?: string } }
        return data.thumbnail?.source ?? ''
    } catch {
        return ''
    }
}

const fetchWikipediaPageImage = async (title: string): Promise<string> => {
    try {
        const response = await fetch(
            `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=pageimages&piprop=original|thumbnail&pithumbsize=1400&titles=${encodeURIComponent(title)}`
        )

        if (!response.ok) {
            return ''
        }

        const data = (await response.json()) as {
            query?: {
                pages?: Record<string, { thumbnail?: { source?: string }; original?: { source?: string } }>
            }
        }
        const pages = data.query?.pages ?? {}
        const firstPage = Object.values(pages)[0]
        return firstPage?.original?.source ?? firstPage?.thumbnail?.source ?? ''
    } catch {
        return ''
    }
}

const resolveSeedImageUrlCandidates = async (titles: string[]): Promise<string[]> => {
    const candidates: string[] = []

    for (const title of titles) {
        const fromSummary = await fetchWikipediaThumbnail(title)
        if (fromSummary) {
            candidates.push(fromSummary)
        }

        const fromPageImage = await fetchWikipediaPageImage(title)
        if (fromPageImage) {
            candidates.push(fromPageImage)
        }
    }

    return Array.from(new Set(candidates.filter(Boolean)))
}

const inferExtension = (url: string, contentType: string | null): string => {
    const mime = contentType?.split(';')[0]?.trim().toLowerCase() ?? ''
    if (mime === 'image/png') return '.png'
    if (mime === 'image/webp') return '.webp'
    if (mime === 'image/gif') return '.gif'

    const fromUrl = path.extname(new URL(url).pathname).toLowerCase()
    return fromUrl || '.jpg'
}

const storeExternalImage = async (productName: string, imageUrl: string): Promise<string> => {
    if (!imageUrl) {
        return ''
    }

    try {
        const response = await fetch(imageUrl)

        if (!response.ok) {
            return ''
        }

        const contentType = response.headers.get('content-type')
        if (!contentType?.toLowerCase().startsWith('image/')) {
            return ''
        }

        const extension = inferExtension(imageUrl, contentType)
        const fileName = `${slugify(productName)}${extension}`
        const absolutePath = path.join(seedMediaDir, fileName)
        const buffer = Buffer.from(await response.arrayBuffer())

        await fs.writeFile(absolutePath, buffer)

        return `/media/products/seed/${fileName}`
    } catch {
        return ''
    }
}

const storeFirstAvailableImage = async (productName: string, imageUrls: string[]): Promise<string> => {
    for (const imageUrl of imageUrls) {
        const storedPath = await storeExternalImage(productName, imageUrl)
        if (storedPath) {
            return storedPath
        }
    }

    return ''
}

async function seed() {
    console.log('Seeding database...')
    const client = await pool.connect()
    try {
        await fs.mkdir(seedMediaDir, { recursive: true })
        await client.query('BEGIN')

        // Seed categories
        console.log('Seeding categories...')
        for (const cat of categories) {
            await client.query(
                `INSERT INTO product_category_display(category, display_name, type)
                 VALUES($1, $2, $3)
                 ON CONFLICT(category) DO UPDATE SET
                 display_name = EXCLUDED.display_name, type = EXCLUDED.type, updated_at = NOW()`,
                [cat.category, cat.displayName, cat.type]
            )
        }

        // Seed products
        console.log('Seeding products...')
        for (const prod of products) {
            const originalName = originalNameForProduct(prod.name, prod.brand)
            const imageUrls = await resolveSeedImageUrlCandidates([prod.name, prod.wikiTitle, `${prod.brand} ${originalName}`, originalName])
            const imagePath = await storeFirstAvailableImage(originalName, imageUrls)
            const derivedType = categoryTypeMap[prod.category]

            await client.query(
                `UPDATE products SET image_url = $1, price = $2, stock = $3 
                 WHERE name = $4 AND COALESCE(brand, '') = COALESCE($5, '')`,
                [imagePath, prod.price, prod.stock, originalName, prod.brand]
            )

            await client.query(
                `INSERT INTO products(name, brand, category, type, price, image_url, stock)
                 SELECT $1, $2, $3, $4, $5, $6, $7
                 WHERE NOT EXISTS(
            SELECT 1 FROM products p
                     WHERE p.name = $1 AND COALESCE(p.brand, '') = COALESCE($2, '')
                       AND p.category = $3 AND p.type = $4
        )`,
                [originalName, prod.brand, prod.category, derivedType, prod.price, imagePath, prod.stock]
            )
            console.log(`Processed ${originalName}${imagePath ? ` with image ${imagePath}` : ' (no image found)'}`)
        }

        await client.query('COMMIT')
        console.log('Seed completed successfully')
    } catch (e) {
        await client.query('ROLLBACK')
        console.error('Seed failed', e)
    } finally {
        client.release()
        await pool.end()
    }
}

seed()
