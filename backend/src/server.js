import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config.js';
import healthRoutes from './routes/health.js';
import googleAuthRoutes from './routes/googleAuth.js';
import vapiWebhookRoutes from './routes/vapiWebhook.js';

const app = express();

app.use(
  cors({
    origin: [config.appBaseUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.use('/health', healthRoutes);
app.use('/auth', googleAuthRoutes);
app.use('/vapi', vapiWebhookRoutes);

app.get('/', (_req, res) => {
  res.json({
    ok: true,
    message: 'Voice Scheduling Agent backend is running.'
  });
});

app.listen(config.port, () => {
  console.log(`Backend listening on http://localhost:${config.port}`);
});
