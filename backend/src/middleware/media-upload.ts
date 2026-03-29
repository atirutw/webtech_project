import fs from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'

import multer from 'multer'

const productsMediaDir = path.resolve(process.cwd(), 'media', 'products')
const avatarsMediaDir = path.resolve(process.cwd(), 'media', 'avatars')

fs.mkdirSync(productsMediaDir, { recursive: true })
fs.mkdirSync(avatarsMediaDir, { recursive: true })

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, productsMediaDir)
    },
    filename: (_req, file, cb) => {
        const safeOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '').toLowerCase()
        const extensionFromName = path.extname(safeOriginalName)
        const extensionFromMime = file.mimetype === 'image/png' ? '.png' : file.mimetype === 'image/webp' ? '.webp' : '.jpg'
        const extension = extensionFromName || extensionFromMime

        cb(null, `${Date.now()}-${randomUUID()}${extension}`)
    },
})

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
        cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'file'))
        return
    }

    cb(null, true)
}

export const productImageUpload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1,
    },
    fileFilter,
})

const avatarStorage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, avatarsMediaDir)
    },
    filename: (_req, file, cb) => {
        const safeOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '').toLowerCase()
        const extensionFromName = path.extname(safeOriginalName)
        const extensionFromMime = file.mimetype === 'image/png' ? '.png' : file.mimetype === 'image/webp' ? '.webp' : '.jpg'
        const extension = extensionFromName || extensionFromMime

        cb(null, `${Date.now()}-${randomUUID()}${extension}`)
    },
})

export const userAvatarUpload = multer({
    storage: avatarStorage,
    limits: {
        fileSize: 2 * 1024 * 1024,
        files: 1,
    },
    fileFilter,
})
