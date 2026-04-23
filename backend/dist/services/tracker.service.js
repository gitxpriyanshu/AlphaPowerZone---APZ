import prisma from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';
export const trackerService = {
    /**
     * Log daily stats
     */
    logStats: async (userId, data) => {
        const profile = await prisma.fitnessProfile.findUnique({ where: { userId } });
        if (!profile)
            throw new ApiError(404, 'Fitness profile not found');
        const log = await prisma.progressLog.create({
            data: {
                fitnessProfileId: profile.id,
                weight: data.weight,
                bodyFat: data.bodyFat,
                muscleMass: data.muscleMass,
                notes: data.notes,
                loggedAt: data.loggedAt ? new Date(data.loggedAt) : undefined,
            },
        });
        // Update current weight in profile
        await prisma.fitnessProfile.update({
            where: { id: profile.id },
            data: { weight: data.weight, lastUpdated: new Date() },
        });
        return log;
    },
    /**
     * Get logs for charts
     */
    getLogs: async (userId, period = '30d') => {
        const profile = await prisma.fitnessProfile.findUnique({ where: { userId } });
        if (!profile)
            return [];
        const days = period === '30d' ? 30 : period === '90d' ? 90 : 365;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        return prisma.progressLog.findMany({
            where: {
                fitnessProfileId: profile.id,
                loggedAt: { gte: startDate },
            },
            orderBy: { loggedAt: 'asc' },
        });
    },
    /**
     * Log supplement intake
     */
    logSupplement: async (userId, name, dosage) => {
        const profile = await prisma.fitnessProfile.findUnique({ where: { userId } });
        if (!profile)
            throw new ApiError(404, 'Fitness profile not found');
        return prisma.supplementIntake.create({
            data: {
                fitnessProfileId: profile.id,
                supplementName: name,
                dosage,
            },
        });
    },
    /**
     * Get streaks and insights
     */
    getStreaks: async (userId) => {
        const profile = await prisma.fitnessProfile.findUnique({
            where: { userId },
            include: {
                progressLogs: { orderBy: { loggedAt: 'desc' }, take: 10 },
                supplementIntakes: { orderBy: { takenAt: 'desc' }, take: 10 },
            }
        });
        if (!profile)
            return null;
        // Logic for streaks (simplified)
        const logStreak = 0; // Would calculate based on daily continuity
        const suppStreak = 0;
        return {
            weightChange: profile.progressLogs.length > 1
                ? profile.progressLogs[0].weight - profile.progressLogs[profile.progressLogs.length - 1].weight
                : 0,
            logStreak,
            suppStreak,
            history: {
                logs: profile.progressLogs,
                supplements: profile.supplementIntakes,
            }
        };
    },
};
