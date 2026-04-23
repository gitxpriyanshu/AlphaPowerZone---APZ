import prisma from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';
export const addressService = {
    /**
     * List user addresses
     */
    list: async (userId) => {
        return prisma.address.findMany({
            where: { userId },
            orderBy: { isDefault: 'desc' },
        });
    },
    /**
     * Create new address
     */
    create: async (userId, data) => {
        if (data.isDefault) {
            await prisma.address.updateMany({
                where: { userId },
                data: { isDefault: false },
            });
        }
        return prisma.address.create({
            data: { userId, ...data },
        });
    },
    /**
     * Update address
     */
    update: async (userId, addressId, data) => {
        const address = await prisma.address.findUnique({ where: { id: addressId } });
        if (!address || address.userId !== userId)
            throw new ApiError(404, 'Address not found');
        if (data.isDefault) {
            await prisma.address.updateMany({
                where: { userId },
                data: { isDefault: false },
            });
        }
        return prisma.address.update({
            where: { id: addressId },
            data,
        });
    },
    /**
     * Delete address
     */
    delete: async (userId, addressId) => {
        const address = await prisma.address.findUnique({ where: { id: addressId } });
        if (!address || address.userId !== userId)
            throw new ApiError(404, 'Address not found');
        await prisma.address.delete({ where: { id: addressId } });
    },
    /**
     * Set as default
     */
    setDefault: async (userId, addressId) => {
        const address = await prisma.address.findUnique({ where: { id: addressId } });
        if (!address || address.userId !== userId)
            throw new ApiError(404, 'Address not found');
        await prisma.$transaction([
            prisma.address.updateMany({
                where: { userId },
                data: { isDefault: false },
            }),
            prisma.address.update({
                where: { id: addressId },
                data: { isDefault: true },
            }),
        ]);
    },
};
