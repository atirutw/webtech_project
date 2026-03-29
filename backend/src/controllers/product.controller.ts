import { RequestHandler } from 'express'
import { z } from 'zod'

import {
    createProductAsAdmin,
    deleteProductAsAdmin,
    getCategoryCounts,
    getProductById,
    getProducts,
    getRecommendedProductsForProduct,
    getTrendingProducts,
    updateProductAsAdmin,
} from '../services/product.service'
import { normalizeStoredMediaPath, resolveMediaUrl } from '../utils/media'
import { HttpError } from '../utils/http-error'

const imagePathSchema = z
    .string()
    .trim()
    .refine((value) => value.startsWith('/media/') || value.startsWith('media/'), {
        message: 'Use uploaded image path from /products/media',
    })
    .transform((value) => normalizeStoredMediaPath(value))
    .refine((value) => value.startsWith('/media/'), {
        message: 'Use uploaded image path from /products/media',
    })

const listProductsQuerySchema = z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(50).optional(),
    category: z.string().trim().min(1).optional(),
    search: z.string().trim().min(1).optional(),
    sort: z.enum(['default', 'lowToHigh', 'highToLow']).optional(),
    type: z.string().trim().min(1).optional(),
    brand: z.string().trim().min(1).optional(),
})

const categoryQuerySchema = z.object({
    type: z.string().trim().min(1).optional(),
})

const productBodySchema = z.object({
    name: z.string().trim().min(1),
    brand: z.string().trim().optional(),
    category: z.string().trim().min(1),
    type: z.string().trim().min(1).default('instrument'),
    price: z.coerce.number().nonnegative(),
    image: imagePathSchema.optional(),
    stock: z.coerce.number().int().nonnegative().default(0),
})

const updateProductBodySchema = z
    .object({
        name: z.string().trim().min(1).optional(),
        brand: z.string().trim().optional(),
        category: z.string().trim().min(1).optional(),
        type: z.string().trim().min(1).optional(),
        price: z.coerce.number().nonnegative().optional(),
        image: imagePathSchema.optional(),
        stock: z.coerce.number().int().nonnegative().optional(),
    })
    .refine((payload) => Object.keys(payload).length > 0, {
        message: 'At least one field is required',
    })

const idParamSchema = z.object({
    id: z.coerce.number().int().positive(),
})

const recommendationQuerySchema = z.object({
    limit: z.coerce.number().int().positive().max(12).optional(),
})

const trendingQuerySchema = z.object({
    limit: z.coerce.number().int().positive().max(12).optional(),
})

export const listProductsController: RequestHandler = async (req, res, next) => {
    try {
        const query = listProductsQuerySchema.parse(req.query)
        const payload = await getProducts({
            page: query.page ?? 1,
            limit: query.limit ?? 6,
            category: query.category,
            search: query.search,
            sort: query.sort ?? 'default',
            type: query.type,
            brand: query.brand,
        })

        res.status(200).json(payload)
    } catch (error) {
        next(error)
    }
}

export const getProductController: RequestHandler = async (req, res, next) => {
    try {
        const params = idParamSchema.parse(req.params)
        const payload = await getProductById(params.id)

        res.status(200).json({ item: payload })
    } catch (error) {
        next(error)
    }
}

export const categoryCountsController: RequestHandler = async (req, res, next) => {
    try {
        const query = categoryQuerySchema.parse(req.query)
        const payload = await getCategoryCounts(query.type)

        res.status(200).json({ categories: payload })
    } catch (error) {
        next(error)
    }
}

export const createProductController: RequestHandler = async (req, res, next) => {
    try {
        const body = productBodySchema.parse(req.body)
        const payload = await createProductAsAdmin(body)

        res.status(201).json({ item: payload })
    } catch (error) {
        next(error)
    }
}

export const uploadProductMediaController: RequestHandler = async (req, res, next) => {
    try {
        if (!req.file) {
            throw new HttpError(400, 'Image file is required')
        }

        const mediaPath = `/media/products/${req.file.filename}`

        res.status(201).json({
            path: mediaPath,
            url: resolveMediaUrl(mediaPath),
            mimeType: req.file.mimetype,
            size: req.file.size,
        })
    } catch (error) {
        next(error)
    }
}

export const updateProductController: RequestHandler = async (req, res, next) => {
    try {
        const params = idParamSchema.parse(req.params)
        const body = updateProductBodySchema.parse(req.body)
        const payload = await updateProductAsAdmin(params.id, body)

        res.status(200).json({ item: payload })
    } catch (error) {
        next(error)
    }
}

export const deleteProductController: RequestHandler = async (req, res, next) => {
    try {
        const params = idParamSchema.parse(req.params)
        await deleteProductAsAdmin(params.id)

        res.status(204).send()
    } catch (error) {
        next(error)
    }
}

export const productRecommendationsController: RequestHandler = async (req, res, next) => {
    try {
        const params = idParamSchema.parse(req.params)
        const query = recommendationQuerySchema.parse(req.query)
        const recommendations = await getRecommendedProductsForProduct(params.id, query.limit ?? 6)

        res.status(200).json({ recommendations })
    } catch (error) {
        next(error)
    }
}

export const trendingProductsController: RequestHandler = async (req, res, next) => {
    try {
        const query = trendingQuerySchema.parse(req.query)
        const products = await getTrendingProducts(query.limit ?? 6)

        res.status(200).json({ products })
    } catch (error) {
        next(error)
    }
}
