# Deployment auf Netlify

## Automatisches Deployment via Netlify Dashboard

### Option 1: GitHub Integration (Empfohlen)

1. **Code zu GitHub pushen:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Finance Planner Premium"
   git branch -M main
   git remote add origin https://github.com/DEIN-USERNAME/finance-planner.git
   git push -u origin main
   ```

2. **Netlify Dashboard öffnen:**
   - Gehe zu https://app.netlify.com
   - Klicke auf "Add new site" → "Import an existing project"
   - Wähle "GitHub"
   - Wähle dein Repository aus

3. **Build Settings konfigurieren:**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Diese Einstellungen sollten automatisch erkannt werden dank `netlify.toml`

4. **Environment Variables setzen:**
   Im Netlify Dashboard unter "Site settings" → "Environment variables":
   ```
   DATABASE_URL=file:./prisma/dev.db
   NEXTAUTH_SECRET=dein-secret-hier-generieren
   NEXTAUTH_URL=https://deine-app.netlify.app
   ```

5. **Deploy klicken!**

### Option 2: Netlify CLI (Manuell)

Wenn du bereits im Projektordner bist:

```bash
# 1. Build erstellen
npm run build

# 2. Mit Netlify CLI deployen
netlify deploy --prod

# Wähle bei den Prompts:
# - "Create & configure a new project"
# - Team: Dein Team auswählen
# - Site name: finance-planner-premium (oder einen anderen Namen)
# - Publish directory: .next
```

### Option 3: Drag & Drop (Schnelltest)

1. Build erstellen:
   ```bash
   npm run build
   ```

2. Gehe zu https://app.netlify.com/drop
3. Ziehe den `.next` Ordner in das Upload-Feld

## Wichtige Hinweise

### Datenbank
⚠️ **WICHTIG**: SQLite funktioniert nicht auf Netlify (Serverless Environment)!

Du musst auf eine externe Datenbank umstellen:
- **Neon** (PostgreSQL) - Kostenlos: https://neon.tech
- **PlanetScale** (MySQL) - Kostenlos: https://planetscale.com
- **Supabase** (PostgreSQL) - Kostenlos: https://supabase.com

#### Datenbank Migration (Beispiel mit Neon):

1. **Neon Account erstellen**: https://neon.tech
2. **Neue Datenbank erstellen** und Connection String kopieren
3. **Prisma Schema anpassen** (`prisma/schema.prisma`):
   ```prisma
   datasource db {
     provider = "postgresql"  // statt "sqlite"
     url      = env("DATABASE_URL")
   }
   ```
4. **Environment Variable in Netlify setzen**:
   ```
   DATABASE_URL=postgresql://user:password@host/database?sslmode=require
   ```
5. **Migration ausführen**:
   ```bash
   npx prisma migrate deploy
   ```

### Socket.IO
Socket.IO funktioniert möglicherweise nicht optimal auf Netlify (Serverless).
Für WebSocket-Features solltest du auf **Vercel** oder **Railway** deployen.

## Alternative Deployment-Optionen

### Vercel (Empfohlen für Next.js)
```bash
npm install -g vercel
vercel login
vercel --prod
```

### Railway
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

## Nach dem Deployment

1. **Funktionalität testen:**
   - User Registration/Login
   - Finanzplan erstellen
   - Ausgaben tracken
   - Custom Kategorien hinzufügen

2. **Custom Domain hinzufügen** (Optional):
   - Netlify Dashboard → Domain settings → Add custom domain

3. **HTTPS ist automatisch aktiviert** ✅

## Troubleshooting

### Build schlägt fehl
- Überprüfe die Build-Logs in Netlify
- Stelle sicher, dass alle Dependencies in `package.json` sind
- Teste lokal: `npm run build`

### Datenbank-Fehler
- Wechsle von SQLite zu PostgreSQL/MySQL
- Überprüfe DATABASE_URL Environment Variable

### API Routes funktionieren nicht
- Überprüfe `netlify.toml` Konfiguration
- Stelle sicher, dass `@netlify/plugin-nextjs` installiert ist

## Support

Bei Problemen:
- Netlify Docs: https://docs.netlify.com/frameworks/next-js/overview/
- Next.js Deployment: https://nextjs.org/docs/deployment
