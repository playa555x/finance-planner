# Netlify Deployment - Schritt für Schritt

## ✅ Vorbereitung abgeschlossen:
- ✅ Prisma Schema auf PostgreSQL umgestellt
- ✅ Neon Serverless Driver installiert
- ✅ netlify.toml konfiguriert
- ✅ @netlify/plugin-nextjs installiert

## 🚀 Deployment Schritte:

### Schritt 1: Neon PostgreSQL Datenbank erstellen

1. **Gehe zu:** https://console.neon.tech/signup
2. **Registriere dich** (kostenlos)
3. **Erstelle ein neues Projekt:**
   - Name: "finance-planner"
   - Region: Europe (Frankfurt) oder nächste Region
4. **Kopiere die Connection Strings:**
   - Du bekommst 2 URLs:
     - `DATABASE_URL` (pooled connection)
     - `DIRECT_URL` (direct connection)

   Beispiel:
   ```
   DATABASE_URL=postgresql://username:password@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require
   DIRECT_URL=postgresql://username:password@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require&connect_timeout=10
   ```

### Schritt 2: Datenbank migrieren

Im Projektordner:

```bash
# 1. Environment Variable lokal setzen (temporär)
$env:DATABASE_URL="DEINE_NEON_DATABASE_URL_HIER"
$env:DIRECT_URL="DEINE_NEON_DIRECT_URL_HIER"

# 2. Prisma Client neu generieren
npx prisma generate

# 3. Migration erstellen und ausführen
npx prisma migrate dev --name init

# 4. (Optional) Daten ansehen
npx prisma studio
```

### Schritt 3: Code zu GitHub pushen

```bash
# Git initialisieren (falls noch nicht geschehen)
git init

# .gitignore überprüfen (sollte schon existieren)
# Stelle sicher dass .env und node_modules ignoriert werden

# Alles hinzufügen
git add .

# Commit
git commit -m "Ready for Netlify deployment with PostgreSQL"

# Branch umbenennen
git branch -M main

# GitHub Repository erstellen und pushen
# Gehe zu https://github.com/new
# Erstelle ein Repository (z.B. "finance-planner-premium")
# Dann:
git remote add origin https://github.com/DEIN-USERNAME/finance-planner-premium.git
git push -u origin main
```

### Schritt 4: Netlify Site erstellen

1. **Gehe zu:** https://app.netlify.com
2. **Klicke:** "Add new site" → "Import an existing project"
3. **Wähle:** "GitHub"
4. **Autorisiere** Netlify für GitHub
5. **Wähle dein Repository:** finance-planner-premium
6. **Build Settings** (sollte automatisch erkannt werden):
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Base directory: (leer lassen)

### Schritt 5: Environment Variables setzen

Im Netlify Dashboard → "Site settings" → "Environment variables" → "Add a variable"

**Füge folgende Variables hinzu:**

```
DATABASE_URL=postgresql://username:password@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require

DIRECT_URL=postgresql://username:password@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require&connect_timeout=10

NEXTAUTH_SECRET=GENERIERE_EINEN_RANDOM_STRING_HIER
NEXTAUTH_URL=https://deine-site.netlify.app

NODE_ENV=production
```

**NEXTAUTH_SECRET generieren:**
```bash
# In PowerShell:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Schritt 6: Deploy!

1. **Klicke:** "Deploy site"
2. **Warte** bis der Build fertig ist (ca. 2-5 Minuten)
3. **Überprüfe** die Build-Logs bei Fehlern

### Schritt 7: Post-Deployment

1. **Teste die App:**
   - Öffne die Netlify URL (z.B. `random-name-123.netlify.app`)
   - Teste User Registration
   - Teste Login
   - Erstelle einen Finanzplan
   - Teste Ausgaben-Tracking

2. **Custom Domain** (Optional):
   - Netlify Dashboard → "Domain settings"
   - "Add custom domain"
   - Folge den DNS-Anweisungen

3. **NEXTAUTH_URL aktualisieren:**
   - Wenn du eine Custom Domain hast
   - Gehe zurück zu Environment Variables
   - Ändere `NEXTAUTH_URL` zu deiner Custom Domain
   - Redeploy (Trigger: Push zu GitHub)

## 🔧 Troubleshooting

### Build schlägt fehl: "Cannot find module '@prisma/client'"

**Lösung:** Füge build command hinzu:
```
npm run build
```

Oder in `package.json`:
```json
{
  "scripts": {
    "build": "prisma generate && next build"
  }
}
```

### Database Connection Error

**Überprüfe:**
1. DATABASE_URL ist richtig gesetzt (mit `?sslmode=require`)
2. Neon Datenbank ist aktiv (nicht im Sleep Mode)
3. Migration wurde ausgeführt (`npx prisma migrate deploy`)

### "NEXTAUTH_URL not set" Error

**Lösung:**
1. Setze `NEXTAUTH_URL` in Environment Variables
2. Wert: `https://deine-site.netlify.app`
3. Redeploy

### Socket.IO funktioniert nicht

**Wichtig:** Socket.IO (WebSockets) funktioniert NICHT auf Netlify Serverless Functions.

**Lösungen:**
1. Entferne Socket.IO Features
2. Oder: Deploye stattdessen auf Render/Railway (unterstützt WebSockets)

### API Routes 404 Error

**Überprüfe `netlify.toml`:**
```toml
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/server/api/:splat"
  status = 200
```

## 📊 Monitoring

**Nach dem Deployment:**
1. **Netlify Analytics** aktivieren (optional, kostenpflichtig)
2. **Function Logs** überprüfen: Netlify Dashboard → "Functions"
3. **Error Tracking:** Sentry, LogRocket, etc. integrieren (optional)

## 🎉 Fertig!

Deine App sollte jetzt live sein auf:
`https://deine-site.netlify.app`

**Next Steps:**
- Custom Domain hinzufügen
- SSL ist automatisch aktiv ✅
- Continuous Deployment ist aktiv (bei jedem Git Push wird neu deployed)

## 📝 Wichtige Links

- Netlify Dashboard: https://app.netlify.com
- Neon Dashboard: https://console.neon.tech
- Docs: https://docs.netlify.com/frameworks/next-js/overview/

Bei Fragen oder Problemen, check die Build Logs in Netlify!
