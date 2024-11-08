"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tabRouter = void 0;
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const router = express_1.default.Router();
exports.tabRouter = router;
// Middleware for logging requests
router.use((req, res, next) => {
    console.log(`[Tab Route] ${req.method} ${req.url}`);
    next();
});
// Serve static files with proper path resolution
const clientBuildPath = path_1.default.resolve(__dirname, '../../client');
router.use(express_1.default.static(clientBuildPath, {
    maxAge: '1d',
    fallthrough: true
}));
// Handle React routing with error handling
router.get('/*', (req, res, next) => {
    try {
        const indexPath = path_1.default.join(clientBuildPath, 'index.html');
        // Check if file exists before sending
        if (!require('fs').existsSync(indexPath)) {
            console.error('Error: index.html not found at', indexPath);
            return res.status(404).send('Build files not found');
        }
        res.sendFile(indexPath);
    }
    catch (err) {
        console.error('Error serving tab page:', err);
        next(err);
    }
});
