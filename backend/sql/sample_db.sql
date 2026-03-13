-- Sample database setup script for local/dev use.
-- Combines category display table setup + category label seed + retro product seed.
-- Safe to run multiple times.

BEGIN;

-- Category -> display label mapping used by UI.
CREATE TABLE IF NOT EXISTS product_category_display (
    category TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Keep backward compatibility if table was created from older script version.
ALTER TABLE product_category_display
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Human-friendly category labels.
INSERT INTO product_category_display (category, display_name)
VALUES
    ('synth', 'Synthesizers'),
    ('drum-machine', 'Drum Machines'),
    ('sampler', 'Samplers'),
    ('sound-module', 'Sound Modules'),
    ('midi-interface', 'MIDI Interfaces'),
    ('sound-card', 'Sound Cards')
ON CONFLICT (category)
DO UPDATE SET
    display_name = EXCLUDED.display_name,
    updated_at = NOW();

-- Retro catalog seed.
WITH seed_data (name, brand, category, type, price, image_url, stock) AS (
    VALUES
        ('JUNO-60', 'Roland', 'synth', 'instrument', 2899.00, '', 4),
        ('JUPITER-8', 'Roland', 'synth', 'instrument', 11999.00, '', 1),
        ('D-50', 'Roland', 'synth', 'instrument', 1899.00, '', 3),
        ('SH-101', 'Roland', 'synth', 'instrument', 2599.00, '', 2),
        ('TB-303 Bass Line', 'Roland', 'synth', 'instrument', 4999.00, '', 2),
        ('TR-808 Rhythm Composer', 'Roland', 'drum-machine', 'instrument', 8999.00, '', 1),
        ('TR-909 Rhythm Composer', 'Roland', 'drum-machine', 'instrument', 9999.00, '', 1),
        ('DX7', 'Yamaha', 'synth', 'instrument', 1999.00, '', 3),
        ('M1', 'Korg', 'synth', 'instrument', 1799.00, '', 3),
        ('Wavestation EX', 'Korg', 'synth', 'instrument', 1699.00, '', 2),
        ('Prophet-5 Rev4', 'Sequential', 'synth', 'instrument', 3599.00, '', 2),
        ('MPC60', 'Akai', 'sampler', 'instrument', 4299.00, '', 1),
        ('AWE32 (CT2760)', 'Creative', 'sound-card', 'accessory', 249.00, '', 12),
        ('Sound Blaster 16 (CT1740)', 'Creative', 'sound-card', 'accessory', 199.00, '', 15),
        ('Sound Blaster AWE64 Gold', 'Creative', 'sound-card', 'accessory', 349.00, '', 8),
        ('Gravis UltraSound Classic', 'Gravis', 'sound-card', 'accessory', 329.00, '', 6),
        ('Gravis UltraSound PnP', 'Gravis', 'sound-card', 'accessory', 279.00, '', 7),
        ('Roland MPU-401AT', 'Roland', 'midi-interface', 'accessory', 189.00, '', 10),
        ('Roland MT-32', 'Roland', 'sound-module', 'instrument', 899.00, '', 4),
        ('Roland SC-55 Sound Canvas', 'Roland', 'sound-module', 'instrument', 999.00, '', 5)
)
INSERT INTO products (name, brand, category, type, price, image_url, stock)
SELECT s.name, s.brand, s.category, s.type, s.price, s.image_url, s.stock
FROM seed_data AS s
WHERE NOT EXISTS (
    SELECT 1
    FROM products AS p
    WHERE p.name = s.name
      AND COALESCE(p.brand, '') = COALESCE(s.brand, '')
      AND p.category = s.category
      AND p.type = s.type
);

COMMIT;
