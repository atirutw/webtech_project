export const PRODUCT_TYPES = ['instrument', 'accessory'] as const

export const PRODUCT_CATEGORY_OPTIONS = [
    { value: 'synth', type: 'instrument' },
    { value: 'drum-machine', type: 'instrument' },
    { value: 'sampler', type: 'instrument' },
    { value: 'sound-module', type: 'instrument' },
    { value: 'midi-interface', type: 'accessory' },
    { value: 'sound-card', type: 'accessory' },
] as const

export const PRODUCT_CATEGORIES = PRODUCT_CATEGORY_OPTIONS.map((entry) => entry.value) as [
    (typeof PRODUCT_CATEGORY_OPTIONS)[number]['value'],
    ...(typeof PRODUCT_CATEGORY_OPTIONS)[number]['value'][],
]

export const PRODUCT_CATEGORY_TYPE_MAP: Record<(typeof PRODUCT_CATEGORIES)[number], (typeof PRODUCT_TYPES)[number]> = {
    synth: 'instrument',
    'drum-machine': 'instrument',
    sampler: 'instrument',
    'sound-module': 'instrument',
    'midi-interface': 'accessory',
    'sound-card': 'accessory',
}

export const getProductTypeByCategory = (
    category: (typeof PRODUCT_CATEGORIES)[number],
): (typeof PRODUCT_TYPES)[number] => PRODUCT_CATEGORY_TYPE_MAP[category]
