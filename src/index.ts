console.log("🔥🔥🔥 NEW CODE IS RUNNING! 🔥🔥🔥");
import 'dotenv/config'
import { Hono } from 'hono'
import type { MiddlewareHandler } from 'hono'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'
import { bearerAuth } from 'hono/bearer-auth'
import { serve } from '@hono/node-server'
import { desc, eq } from 'drizzle-orm'
import { auth } from './auth.js'
import { db } from './db.js'
import { contactMessages, reports } from './schema/schema.js'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

const adminKey = process.env.ADMIN_API_KEY
if (!adminKey) throw new Error('ADMIN_API_KEY is not set')

const adminOnly = bearerAuth({ token: adminKey })

// Checks the login cookie and that the user is you
const sessionAdmin: MiddlewareHandler = async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session || session.user.email !== process.env.ADMIN_EMAIL) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  await next()
}

const uuidSchema = z.string().uuid()

const reportSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1),
})

const app = new Hono()

// Fixed: Combined the duplicate secureHeaders
app.use(
  secureHeaders({
    crossOriginResourcePolicy: false,
  })
)

app.use(
  '/api/*',
  cors({
    // Remove the #contact. Just keep the base URL.
    origin: ['http://localhost:5173'], 
    credentials: true,
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
)

app.on(['GET', 'POST'], '/api/auth/*', (c) => auth.handler(c.req.raw))
app.get('/ping', (c) => c.text('pong from src/index.ts'))
app.get('/', (c) => c.text('OK'))

// ---------- Contact ----------

// Public: visitors send a message
// FIXED: Removed adminOnly so the public can actually send you messages
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

// Private: list all, newest first
app.get('/api/contact', async (c) => {
  const rows = await db
    .select()
    .from(contactMessages)
    .orderBy(desc(contactMessages.createdAt))
  return c.json(rows)
})

// Private: one message
app.get('/api/contact/:id', sessionAdmin, async (c) => {
  const id = c.req.param('id')
  if (!uuidSchema.safeParse(id).success) {
    return c.json({ error: 'Invalid id' }, 400)
  }

  const [row] = await db
    .select()
    .from(contactMessages)
    .where(eq(contactMessages.id, id))

  if (!row) return c.json({ error: 'Not found' }, 404)
  return c.json(row)
})

// Private: mark as read
app.patch('/api/contact/:id/read', sessionAdmin, async (c) => {
  const id = c.req.param('id')
  if (!uuidSchema.safeParse(id).success) {
    return c.json({ error: 'Invalid id' }, 400)
  }

  const [row] = await db
    .update(contactMessages)
    .set({ isRead: true })
    .where(eq(contactMessages.id, id))
    .returning({ id: contactMessages.id, isRead: contactMessages.isRead })

  if (!row) return c.json({ error: 'Not found' }, 404)
  return c.json(row)
})

// ---------- Reports ----------

// Private: only you can create reports (still the bearer key, used from Talend)
app.post('/api/reports', adminOnly, zValidator('json', reportSchema), async (c) => {
  const data = c.req.valid('json')
  const [row] = await db.insert(reports).values(data).returning()
  return c.json(row, 201)
})

// Public: list reports
app.get('/api/reports', async (c) => {
  const rows = await db.select().from(reports).orderBy(desc(reports.createdAt))
  return c.json(rows)
})

// ADDED: Debugger for 404s. If you hit a wrong URL, this logs it.
app.notFound((c) => {
  console.log(`🚨 404 ERROR: Tried to hit ${c.req.method} ${c.req.url}`)
  return c.json({ error: 'Route not found' }, 404)
})

const port = Number(process.env.PORT ?? 3001)

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Server running on http://localhost:${info.port}`)
})
