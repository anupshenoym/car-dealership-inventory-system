import app from './app';
import { getDatabase } from './config/database';

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Initialize DB connection on startup
    await getDatabase();
    console.log('✅ Database connected successfully.');

    app.listen(PORT, () => {
      console.log(`🚀 Car Dealership API running at http://localhost:${PORT}`);
      console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
