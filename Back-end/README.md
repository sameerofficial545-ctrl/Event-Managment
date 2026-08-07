# Event-Managment Backend

Django + Django REST Framework API. Currently provides user registration and
token-based authentication.

## Setup

```bash
python -m venv venv
source venv/Scripts/activate   # Windows (Git Bash); use venv\Scripts\activate on cmd/PowerShell
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

The API is served at `http://127.0.0.1:8000/`.

Optional: copy `.env.example` to `.env` and adjust values (secret key, debug,
allowed hosts, CORS origins) for your environment.

## Auth endpoints

| Method | Endpoint              | Auth required | Description                          |
|--------|------------------------|:--------------:|--------------------------------------|
| POST   | `/api/auth/register/`  | No             | Create an account, returns a token   |
| POST   | `/api/auth/login/`     | No             | Authenticate, returns a token        |
| GET    | `/api/auth/me/`        | Yes            | Return the current user's profile    |

Authenticated requests send the token in the `Authorization` header:

```
Authorization: Token <token>
```

### Register

```bash
curl -X POST http://127.0.0.1:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"username":"jane","email":"jane@example.com","password":"a-strong-password","password2":"a-strong-password"}'
```

### Login

```bash
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"jane","password":"a-strong-password"}'
```

### Current user

```bash
curl http://127.0.0.1:8000/api/auth/me/ -H "Authorization: Token <token>"
```

## Notes

- User model: `users.User`, a custom model extending Django's `AbstractUser`
  with a required, unique `email` field (see `AUTH_USER_MODEL` in
  `config/settings.py`).
- Auth: DRF `TokenAuthentication` (`rest_framework.authtoken`). A token is
  issued on register and login and does not expire.
- Passwords are validated with Django's built-in password validators
  (minimum length, common-password check, etc.).
- CORS is enabled for the front-end dev server (`http://localhost:5173`) via
  `django-cors-headers`.
