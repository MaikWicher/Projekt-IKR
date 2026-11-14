# Serwer Aplikacji: Google Cloud Platform (GCP)
### Wytyczna projektu IKR: Serwer aplikacji – Google Cloud Platform

W projekcie jako środowisko wdrożeniowe serwera aplikacji wybrano platformę **Google Cloud Platform (GCP)**.

Do obsługi serwera Node.js + Express przygotowano dedykowane pliki konfiguracyjne:
- [`Dockerfile`](./Dockerfile) – zoptymalizowany, wieloetapowy obraz kontenera dla **Google Cloud Run**.
- [`app.yaml`](./app.yaml) – plik konfiguracyjny dla **Google App Engine** (Node.js 22 runtime).
- [`cloudbuild.yaml`](./cloudbuild.yaml) – automatyczny rurociąg CI/CD dla **Google Cloud Build**.
- [`.gcloudignore`](./.gcloudignore) – wykluczenia zbędnych plików podczas wysyłania kodu do chmury GCP.

---

## Opcja 1: Wdrożenie na Google Cloud Run (Zalecane)

**Google Cloud Run** to nowoczesny, w pełni zarządzany serwer aplikacji w chmurze Google, który automatycznie skaluje instancje od 0 w zależności od natężenia ruchu.

### Krok 1: Logowanie i ustawienie projektu w Google Cloud SDK
```powershell
# Logowanie do konta Google
gcloud auth login

# Ustawienie identyfikatora projektu GCP
gcloud config set project project-af4c939f-7ded-477e-add
```

### Krok 2: Utworzenie repozytorium w rejestrze kontenerów Artifact Registry (Warszawa)
```powershell
gcloud artifacts repositories create gdansk-hub-repo `
  --repository-format=docker `
  --location=europe-central2 `
  --description="Gdansk Business Hub backend Docker repository"
```

### Krok 3: Zbudowanie obrazu kontenera w chmurze (Google Cloud Build)
W folderze `server/` uruchom:
```powershell
gcloud builds submit --tag "europe-central2-docker.pkg.dev/project-af4c939f-7ded-477e-add/gdansk-hub-repo/gdansk-hub-api:latest" .
```

### Krok 4: Uruchomienie serwera na Cloud Run (Warszawa - europe-central2)
```powershell
gcloud run deploy gdansk-hub-api `
  --image "europe-central2-docker.pkg.dev/project-af4c939f-7ded-477e-add/gdansk-hub-repo/gdansk-hub-api:latest" `
  --platform managed `
  --region europe-central2 `
  --allow-unauthenticated `
  --set-env-vars NODE_ENV=production,PORT=8080,JWT_SECRET="gdansk-hub-secret-key-2026",FRONTEND_URL="http://localhost:5173"
```

Po zakończeniu polecenie zwraca publiczny adres HTTPS w chmurze Google:
**Adres aktywnej usługi:** `https://gdansk-hub-api-967225963862.europe-central2.run.app`

Sprawdzenie statusu zdrowia serwera (Health Check):
```bash
curl https://gdansk-hub-api-967225963862.europe-central2.run.app/api/health
```
Odpowiedź:
```json
{
  "status": "ok",
  "service": "gdansk-hub-backend",
  "version": "1.0.0",
  "uptimeSeconds": 42
}
```

---

## Opcja 2: Wdrożenie na Google App Engine

Jeśli wolisz klasyczny serwer PaaS bazujący na pliku `app.yaml`:

```bash
# Wdrożenie aplikacji jednym poleceniem
gcloud app deploy app.yaml
```

Google App Engine automatycznie wykryje skrypt `"gcp-build": "prisma generate && tsc"` w pliku `package.json`, zbuduje aplikację i uruchomi ją pod adresem:
`https://TWOJ-ID-PROJEKTU-GCP.appspot.com`

---

## Baza danych: Połączenie Google Cloud Run z bazą PostgreSQL

### Metoda A: Bezpieczny tunel TCP do lokalnej bazy PostgreSQL (Aktywne)
Serwer w chmurze łączy się w czasie rzeczywistym z Twoją lokalną bazą PostgreSQL na laptopie:
- **Narzędzie:** `bore` (działa w tle)
- **Port:** `localhost:5432` ➔ `bore.pub:41398`
- **Konfiguracja w Cloud Run:** `DATABASE_URL=postgresql://postgres:admin123@bore.pub:41398/coworking_db?schema=public`
- **Efekt:** Każda zmiana w Prisma Studio na [http://localhost:5555/](http://localhost:5555/) jest natychmiast widoczna w Google Cloud, a rezerwacje złożone przez Cloud Run zapisują się w Twoim PostgreSQL!

Aby uruchomić tunel ręcznie:
```powershell
npm run tunnel
```

### Metoda B: Google Cloud SQL (Pełna chmura GCP)
W GCP rekomendowaną usługą zarządzaną dla bazy PostgreSQL jest **Google Cloud SQL**:
1. W konsoli GCP wybierz **Cloud SQL** ➔ *Create Instance* ➔ **PostgreSQL**.
2. Podaj hasło użytkownika `postgres` i utwórz bazę `coworking_db`.
3. Skopiuj ciąg połączenia do zmiennej środowiskowej `DATABASE_URL` w usłudze Cloud Run.

