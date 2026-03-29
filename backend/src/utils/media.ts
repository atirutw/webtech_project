import { env } from '../config/env'

export const normalizeStoredMediaPath = (value: string): string => {
    const trimmed = value.trim()

    if (!trimmed) {
        return ''
    }

    if (trimmed.includes('://') || trimmed.startsWith('data:')) {
        return ''
    }

    if (trimmed.startsWith('/media/')) {
        return trimmed
    }

    if (trimmed.startsWith('media/')) {
        return `/${trimmed}`
    }

    return `/media/${trimmed}`
}

export const resolveMediaUrl = (value: string | null | undefined): string => {
    if (!value) {
        return ''
    }

    const normalized = normalizeStoredMediaPath(value)

    if (!normalized) {
        return ''
    }

    if (!normalized.startsWith('/media/')) {
        return ''
    }

    return `${env.PUBLIC_BASE_URL}${normalized}`
}
