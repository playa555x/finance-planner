# GitHub Repo erstellen und pushen

## Schritt 1: Repo erstellen (30 Sekunden)

Gehe zu: https://github.com/new

- **Repository name**: `finance-planner`
- **Description**: `Personal Finance Planning Application`
- **Public** ✅
- **DO NOT** initialize with README (wir haben schon einen!)
- Click **Create repository**

## Schritt 2: Ich pushe dann automatisch

Sobald das Repo existiert, sage mir Bescheid und ich führe aus:

```bash
git remote add origin https://github.com/playa555x/finance-planner.git
git push -u origin main
```

Git wird die gespeicherten Credentials aus Windows Credential Manager nutzen (playa555x)!

## ODER: Du machst es selbst (komplett)

```powershell
cd "C:\Users\win11\Downloads\workspace-b02bb954-88db-46c9-8be9-62909d5d2356"

# Nach Repo-Erstellung auf GitHub:
git remote add origin https://github.com/playa555x/finance-planner.git
git push -u origin main
```

---

Welche Option? Soll ich warten bis du das Repo erstellt hast, oder machst du alles selbst?
