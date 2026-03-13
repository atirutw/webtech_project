import {
    Product,
    createProduct,
    deleteProductById,
    findProductById,
    listCategoryCounts,
    listProducts,
    updateProduct,
} from '../repositories/product.repository'
import { HttpError } from '../utils/http-error'

export const getProducts = async (params: {
    page: number
    limit: number
    category?: string | undefined
    search?: string | undefined
    sort?: 'default' | 'lowToHigh' | 'highToLow' | undefined
    type?: string | undefined
    brand?: string | undefined
}): Promise<{ items: Product[]; total: number; page: number; limit: number; totalPages: number }> => {
    return listProducts(params)
}

export const getCategoryCounts = async (
    type?: string,
): Promise<Array<{ category: string; displayName: string; count: number; type: string }>> => {
    return listCategoryCounts(type)
}

export const createProductAsAdmin = async (params: {
    name: string
    brand?: string | undefined
    category: string
    type: string
    price: number
    image?: string | undefined
    stock: number
}): Promise<Product> => {
    return createProduct(params)
}

export const updateProductAsAdmin = async (
    id: number,
    params: {
        name?: string | undefined
        brand?: string | undefined
        category?: string | undefined
        type?: string | undefined
        price?: number | undefined
        image?: string | undefined
        stock?: number | undefined
    },
): Promise<Product> => {
    const product = await updateProduct(id, params)

    if (!product) {
        throw new HttpError(404, 'Product not found')
    }

    return product
}

export const deleteProductAsAdmin = async (id: number): Promise<void> => {
    try {
        const deleted = await deleteProductById(id)

        if (!deleted) {
            throw new HttpError(404, 'Product not found')
        }
    } catch (error) {
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23503') {
            throw new HttpError(409, 'Product is referenced by cart or order items')
        }

        throw error
    }
}

export const getProductById = async (id: number): Promise<Product> => {
    const product = await findProductById(id)

    if (!product) {
        throw new HttpError(404, 'Product not found')
    }

    return product
}
