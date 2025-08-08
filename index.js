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
// ⚙️ MONGODB BAĞLANTI KONFİGÜRASYONU
// ======================================
const mongodbConfig = {
    retryWrites: true,
    w: 'majority',
    serverSelectionTimeoutMS: 15000, // 15 saniye
    socketTimeoutMS: 45000, // 45 saniye
    connectTimeoutMS: 10000,
    appName: 'CalcpatioApp', // Atlas loglarında görüntülenir
    ssl: true,
    heartbeatFrequencyMS: 10000,
    maxPoolSize: 10,
    minPoolSize: 1
};

// ======================================
// 🔌 VERİTABANI BAĞLANTI FONKSİYONU
// ======================================
async function connectToDatabase() {
    try {
        console.log('\x1b[36mℹ\x1b[0m MongoDB bağlantısı kuruluyor...');

        // Önce SRV bağlantısını dene
        await mongoose.connect(process.env.MONGODB_URI, {
            retryWrites: true,
            w: 'majority',
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000
        });

        console.log('\x1b[32m✓\x1b[0m MongoDB bağlantısı başarılı (SRV)');

    } catch (srvError) {
        console.error('\x1b[33m⚠\x1b[0m SRV bağlantısı başarısız, alternatif denenecek...');

        // SRV başarısız olursa direkt IP bağlantısı dene
        try {
            await mongoose.connect(process.env.MONGODB_ALT_URI, {
                retryWrites: true,
                w: 'majority',
                serverSelectionTimeoutMS: 10000,
                socketTimeoutMS: 45000,
                connectTimeoutMS: 10000
            });
            console.log('\x1b[32m✓\x1b[0m MongoDB bağlantısı başarılı (Direkt IP)');

        } catch (altError) {
            console.error('\x1b[31m✗\x1b[0m MongoDB bağlantı hatası:');
            console.error(`- Hata: ${altError.name}`);
            console.error(`- Mesaj: ${altError.message}`);

            // Özel çözüm önerileri
            if (altError.message.includes('ENOTFOUND')) {
                console.log('\n\x1b[33m⚠ DNS Çözümleme Hatası Çözümü:\x1b[0m');
                console.log('1. VPN kullanmayı deneyin');
                console.log('2. Google DNS (8.8.8.8) kullanın');
            }

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
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
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
    console.error('\x1b[31m✗\x1b[0m Hata:', err.message);

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
            console.log(`\n\x1b[32m✓\x1b[0m Sunucu: http://localhost:${port}`);
            console.log(`\x1b[36m→\x1b[0m Ortam: ${process.env.NODE_ENV || 'development'}`);
            console.log(`\x1b[36m→\x1b[0m MongoDB: ${mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'}`);
        });

        // Graceful Shutdown
        process.on('SIGTERM', () => {
            console.log('\n\x1b[33m⚠\x1b[0m Sunucu kapatılıyor...');
            server.close(() => {
                mongoose.connection.close(false, () => {
                    console.log('\x1b[32m✓\x1b[0m Tüm bağlantılar kapatıldı');
                    process.exit(0);
                });
            });
        });

    } catch (error) {
        console.error('\x1b[31m✗\x1b[0m Sunucu başlatma hatası:', error);
        process.exit(1);
    }
}

startServer();