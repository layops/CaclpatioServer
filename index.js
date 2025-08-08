require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const loggerMiddleware = require("./routes/middleware/loggerMiddleware");

const app = express();
const port = process.env.PORT || 5000;

// ======================================
// ⚙️ MONGODB BAĞLANTI FONKSİYONU
// ======================================
async function connectToDatabase() {
    try {
        console.log('ℹ MongoDB bağlantısı kuruluyor...');

        await mongoose.connect(process.env.MONGODB_URI, {
            retryWrites: true,
            w: 'majority',
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000
        });

        console.log('✓ MongoDB bağlantısı başarılı (SRV)');

    } catch (srvError) {
        console.error('⚠ SRV bağlantısı başarısız, alternatif denenecek...');

        try {
            await mongoose.connect(process.env.MONGODB_ALT_URI, {
                retryWrites: true,
                w: 'majority',
                serverSelectionTimeoutMS: 10000,
                socketTimeoutMS: 45000,
                connectTimeoutMS: 10000
            });
            console.log('✓ MongoDB bağlantısı başarılı (Direkt IP)');

        } catch (altError) {
            console.error('✗ MongoDB bağlantı hatası:', altError.message);
            process.exit(1);
        }
    }
}

// ======================================
// 🛡️ MIDDLEWARE'LER
// ======================================
app.use(helmet());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(loggerMiddleware);

// Rate Limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: 'Çok fazla istek gönderdiniz, lütfen 15 dakika sonra tekrar deneyin'
});
app.use(limiter);

// ======================================
// 🚪 ROUTE'LAR
// ======================================
app.use('/api/user', require('./routes/user.route'));

// Health Check Endpoint
app.get('/', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

    res.status(200).json({
        status: 'active',
        database: dbStatus,
        cluster: mongoose.connection.host,
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Endpoint bulunamadı',
        requestedUrl: req.originalUrl
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('✗ Hata:', err.message);

    res.status(err.status || 500).json({
        status: 'error',
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// ======================================
// 🚀 SUNUCU BAŞLATMA
// ======================================
async function startServer() {
    try {
        await connectToDatabase();

        const server = app.listen(port, () => {
            console.log(`✓ Sunucu çalışıyor: http://localhost:${port}`);
            console.log(`→ Ortam: ${process.env.NODE_ENV || 'development'}`);
        });

        process.on('SIGTERM', () => {
            console.log('⚠ Sunucu kapatılıyor...');
            server.close(() => {
                mongoose.connection.close(false, () => {
                    console.log('✓ Tüm bağlantılar kapatıldı');
                    process.exit(0);
                });
            });
        });

    } catch (error) {
        console.error('✗ Sunucu başlatma hatası:', error);
        process.exit(1);
    }
}

startServer();
