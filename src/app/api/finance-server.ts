import express from 'express';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';
import { db } from './lib/db';
import { currencyService } from './services/currency';
import { baliCostService } from './services/bali-costs';
import { exportService } from './services/export';

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(cors());
app.use(express.json());
app.use(limiter);

// Validation schemas
const CreatePlanSchema = z.object({
  lifestyleLevel: z.enum(['budget', 'comfort', 'premium']),
  duration: z.number().min(1).max(365),
  persons: z.number().min(1).max(10),
  customCategories: z.array(z.object({
    name: z.string(),
    amount: z.number()
  })).optional()
});

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Currency exchange
app.get('/api/currency/:from/:to', async (req, res) => {
  try {
    const { from, to } = req.params;
    const rate = await currencyService.getExchangeRate(from.toUpperCase(), to.toUpperCase());
    res.json({ from, to, rate, timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch exchange rate' });
  }
});

// Bali cost categories
app.get('/api/bali-costs', async (req, res) => {
  try {
    const costs = await baliCostsService.getAllCosts();
    res.json(costs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Bali costs' });
  }
});

// Create financial plan
app.post('/api/plan', async (req, res) => {
  try {
    const validatedData = CreatePlanSchema.parse(req.body);
    const plan = await baliCostsService.calculatePlan(validatedData);
    res.json(plan);
  } catch (error) {
    res.status(400).json({ error: 'Invalid plan data' });
  }
});

// Export plan
app.post('/api/export/:format', async (req, res) => {
  try {
    const { format } = req.params;
    const planData = req.body;
    
    if (format === 'excel') {
      const buffer = await exportService.exportToExcel(planData);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=bali-financial-plan.xlsx');
      res.send(buffer);
    } else if (format === 'pdf') {
      const buffer = await exportService.exportToPDF(planData);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=bali-financial-plan.pdf');
      res.send(buffer);
    } else {
      res.status(400).json({ error: 'Unsupported export format' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Export failed' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Bali Finance Planner API running on port ${PORT}`);
});