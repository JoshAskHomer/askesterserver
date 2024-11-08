import express from 'express';
import path from 'path';


const router = express.Router();

// Middleware for logging requests
router.use((req, res, next) => {
    console.log(`[Tab Route] ${req.method} ${req.url}`);
    next();
  });

// Serve static files with proper path resolution
const clientBuildPath = path.resolve(__dirname, '../../client');
router.use(express.static(clientBuildPath, {
  maxAge: '1d',
  fallthrough: true
}));

// Handle React routing with error handling
router.get('/*', (req, res, next) => {
    try {
      const indexPath = path.join(clientBuildPath, 'index.html');
      
      // Check if file exists before sending
      if (!require('fs').existsSync(indexPath)) {
        console.error('Error: index.html not found at', indexPath);
        return res.status(404).send('Build files not found');
      }
      
      res.sendFile(indexPath);
    } catch (err) {
      console.error('Error serving tab page:', err);
      next(err);
    }
});


export { router as tabRouter };