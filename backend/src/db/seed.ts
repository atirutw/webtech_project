import { pool } from './pool'

const categories = [
    { category: 'synth', displayName: 'Synthesizers', type: 'instrument' },
    { category: 'drum-machine', displayName: 'Drum Machines', type: 'instrument' },
    { category: 'sampler', displayName: 'Samplers', type: 'instrument' },
    { category: 'sound-module', displayName: 'Sound Modules', type: 'instrument' },
    { category: 'midi-interface', displayName: 'MIDI Interfaces', type: 'accessory' },
    { category: 'sound-card', displayName: 'Sound Cards', type: 'accessory' }
]

const products = [
    { name: 'Roland JUNO-60', brand: 'Roland', category: 'synth', type: 'instrument', price: 2899.00, stock: 4 },
    { name: 'Roland JUPITER-8', brand: 'Roland', category: 'synth', type: 'instrument', price: 11999.00, stock: 1 },
    { name: 'Roland D-50', brand: 'Roland', category: 'synth', type: 'instrument', price: 1899.00, stock: 3 },
    { name: 'Roland SH-101', brand: 'Roland', category: 'synth', type: 'instrument', price: 2599.00, stock: 2 },
    { name: 'Roland TB-303', brand: 'Roland', category: 'synth', type: 'instrument', price: 4999.00, stock: 2 },
    { name: 'Roland TR-808', brand: 'Roland', category: 'drum-machine', type: 'instrument', price: 8999.00, stock: 1 },
    { name: 'Roland TR-909', brand: 'Roland', category: 'drum-machine', type: 'instrument', price: 9999.00, stock: 1 },
    { name: 'Yamaha DX7', brand: 'Yamaha', category: 'synth', type: 'instrument', price: 1999.00, stock: 3 },
    { name: 'Korg M1', brand: 'Korg', category: 'synth', type: 'instrument', price: 1799.00, stock: 3 },
    { name: 'Korg Wavestation', brand: 'Korg', category: 'synth', type: 'instrument', price: 1699.00, stock: 2 },
    { name: 'Prophet-5', brand: 'Sequential', category: 'synth', type: 'instrument', price: 3599.00, stock: 2 },
    { name: 'Akai MPC60', brand: 'Akai', category: 'sampler', type: 'instrument', price: 4299.00, stock: 1 },
    { name: 'Sound Blaster AWE32', brand: 'Creative', category: 'sound-card', type: 'accessory', price: 249.00, stock: 12 },
    { name: 'Sound Blaster 16', brand: 'Creative', category: 'sound-card', type: 'accessory', price: 199.00, stock: 15 },
    { name: 'Sound Blaster AWE64', brand: 'Creative', category: 'sound-card', type: 'accessory', price: 349.00, stock: 8 },
    { name: 'Gravis UltraSound', brand: 'Gravis', category: 'sound-card', type: 'accessory', price: 329.00, stock: 6 },
    { name: 'Roland MPU-401', brand: 'Roland', category: 'midi-interface', type: 'accessory', price: 189.00, stock: 10 },
    { name: 'Roland MT-32', brand: 'Roland', category: 'sound-module', type: 'instrument', price: 899.00, stock: 4 },
    { name: 'Roland SC-55', brand: 'Roland', category: 'sound-module', type: 'instrument', price: 999.00, stock: 5 }
]

const imageOverrides: Record<string, string> = {
    'Roland JUNO-60': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Roland_Juno-60_%286935222973%29.jpg/330px-Roland_Juno-60_%286935222973%29.jpg',
    'Roland JUPITER-8': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Roland_Jupiter-8_Synth%2C_1983_%28white_bg%29.jpg/330px-Roland_Jupiter-8_Synth%2C_1983_%28white_bg%29.jpg',
    'Sound Blaster AWE64': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/KL_Creative_Labs_Soundblaster_AWE64_Gold_CT4390.jpg/330px-KL_Creative_Labs_Soundblaster_AWE64_Gold_CT4390.jpg',
    'Roland SC-55': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Roland_SCC-1.jpg/330px-Roland_SCC-1.jpg'
}

async function getWikipediaImageUrl(title: string): Promise<string> {
    if (imageOverrides[title]) return imageOverrides[title]
    try {
        const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`)
        const data: any = await response.json()
        if (data && data.thumbnail && data.thumbnail.source) {
            return data.thumbnail.source
        }
    } catch (e) {
        console.error(`Failed to fetch image for ${title}`, e)
    }
    return ''
}

async function seed() {
    console.log('Seeding database...')
    const client = await pool.connect()
    try {
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
            const imageUrl = await getWikipediaImageUrl(prod.name)

            // Revert title mapping back to original product name to match schema if needed
            let originalName = prod.name.replace(prod.brand + ' ', '')
            // specifically for some names to match the sql exactly
            if (prod.name === 'Roland TB-303') originalName = 'TB-303 Bass Line'
            if (prod.name === 'Roland TR-808') originalName = 'TR-808 Rhythm Composer'
            if (prod.name === 'Roland TR-909') originalName = 'TR-909 Rhythm Composer'
            if (prod.name === 'Korg Wavestation') originalName = 'Wavestation EX'
            if (prod.name === 'Prophet-5') originalName = 'Prophet-5 Rev4'
            if (prod.name === 'Sound Blaster AWE32') originalName = 'AWE32 (CT2760)'
            if (prod.name === 'Sound Blaster 16') originalName = 'Sound Blaster 16 (CT1740)'
            if (prod.name === 'Sound Blaster AWE64') originalName = 'Sound Blaster AWE64 Gold'
            if (prod.name === 'Gravis UltraSound') originalName = 'Gravis UltraSound Classic'
            if (prod.name === 'Roland MPU-401') originalName = 'Roland MPU-401AT'
            if (prod.name === 'Roland SC-55') originalName = 'Roland SC-55 Sound Canvas'

            await client.query(
                `UPDATE products SET image_url = $1, price = $2, stock = $3 
                 WHERE name = $4 AND COALESCE(brand, '') = COALESCE($5, '')`,
                [imageUrl, prod.price, prod.stock, originalName, prod.brand]
            )

            await client.query(
                `INSERT INTO products(name, brand, category, type, price, image_url, stock)
                 SELECT $1, $2, $3, $4, $5, $6, $7
                 WHERE NOT EXISTS(
            SELECT 1 FROM products p
                     WHERE p.name = $1 AND COALESCE(p.brand, '') = COALESCE($2, '')
                       AND p.category = $3 AND p.type = $4
        )`,
                [originalName, prod.brand, prod.category, prod.type, prod.price, imageUrl, prod.stock]
            )
            console.log(`Processed ${originalName} with image ${imageUrl}`)
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
