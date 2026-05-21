import { app } from './app.js';
import { env } from './src/config/env.js';
import prisma from './src/config/database.js';
const PORT = env.PORT || 5000;
/**
 * Start the server
 */
const startServer = async () => {
    const maxRetries = 5;
    let attempt = 0;
    while (attempt < maxRetries) {
        try {
            attempt++;
            console.log(`🔌 Connecting to database (Attempt ${attempt}/${maxRetries})...`);
            // Test database connection
            await prisma.$connect();
            console.log('✅ Database connected successfully');
            app.listen(PORT, () => {
                console.log(`🚀 Server running in ${env.NODE_ENV} mode on port ${PORT}`);
            });
            return; // Connection successful, exit function
        }
        catch (error) {
            console.error(`❌ Connection attempt ${attempt} failed:`, error instanceof Error ? error.message : error);
            if (attempt < maxRetries) {
                const waitSec = 3;
                console.log(`Waiting ${waitSec} seconds before retrying...`);
                await new Promise((resolve) => setTimeout(resolve, waitSec * 1000));
            }
            else {
                console.error('❌ All database connection attempts failed. Exiting...');
                process.exit(1);
            }
        }
    }
};
startServer();
// Handle unhandled rejections (triggered reload)
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection! Shutting down...', err);
    process.exit(1);
});
