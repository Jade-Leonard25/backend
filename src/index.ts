import 'dotenv/config'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'
import { bearerAuth } from 'hono/bearer-auth'
import { serve } from '@hono/node-server'
import { desc } from 'drizzle-orm'
import { auth } from './auth.js'
import { db } from './db.js'
import { contactMessages ,reports} from './schema/schema.js'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
const app = new Hono()

app.use(secureHeaders())

app.use(
  '/api/*',
  cors({
    origin: ['http://localhost:3000'],
    credentials: true,
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  }),
)

app.on(['GET', 'POST'], '/api/auth/*', (c) => auth.handler(c.req.raw))

app.get('/', (c) => c.text('OK'))

// Public: employers send a message
app.post('/api/contact', async (c) => {
  const body = await c.req.json()

  if (!body.fullName || !body.email || !body.companyName || !body.subject || !body.message) {
    return c.json({ error: 'Missing required fields' }, 400)
  }

  const [row] = await db
    .insert(contactMessages)
    .values({
      fullName: body.fullName,
      email: body.email,
      companyName: body.companyName,
      subject: body.subject,
      message: body.message,
      comment: body.comment ?? null,
    })
    .returning({ id: contactMessages.id })

  return c.json({ ok: true, id: row.id }, 201)
})
const reportSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1),
})

// Private: only you can create rep orts
app.post(
  '/api/reports',
  bearerAuth({ token: process.env.ADMIN_API_KEY! }),
  zValidator('json', reportSchema),
  async (c) => {
    const data = c.req.valid('json') // typed: { title: string; content: string }

    const [row] = await db.insert(reports).values(data).returning()

    return c.json(row, 201)
  },
)

// Public: list reports
app.get('/api/reports', async (c) => {
  const rows = await db.select().from(reports).orderBy(desc(reports.createdAt))
  return c.json(rows)
})
// Private: only you, with the secret key
app.get(
  '/api/messages',
  bearerAuth({ token: process.env.ADMIN_API_KEY! }),
  async (c) => {
    const rows = await db
      .select()
      .from(contactMessages)
      .orderBy(desc(contactMessages.createdAt))
    return c.json(rows)
  },
)

const port = Number(process.env.PORT ?? 3001)

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Server running on http://localhost:${info.port}`)
})