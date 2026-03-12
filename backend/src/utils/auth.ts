import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'crypto'

const TOKEN_BYTES = 32
const PASSWORD_HASH_BYTES = 64

export const hashPassword = (password: string): string => {
    const salt = randomBytes(16).toString('hex')
    const hash = scryptSync(password, salt, PASSWORD_HASH_BYTES).toString('hex')

    return `${salt}:${hash}`
}

export const verifyPassword = (password: string, passwordHash: string): boolean => {
    const [salt, savedHash] = passwordHash.split(':')

    if (!salt || !savedHash) {
        return false
    }

    const derivedHash = scryptSync(password, salt, PASSWORD_HASH_BYTES)
    const storedHashBuffer = Buffer.from(savedHash, 'hex')

    if (derivedHash.length !== storedHashBuffer.length) {
        return false
    }

    return timingSafeEqual(derivedHash, storedHashBuffer)
}

export const generateToken = (): string => randomBytes(TOKEN_BYTES).toString('hex')

export const hashToken = (token: string): string => createHash('sha256').update(token).digest('hex')
