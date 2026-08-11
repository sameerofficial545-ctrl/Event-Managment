# Event-Managment Backend

Django + Django REST Framework API. Provides user registration and
token-based authentication, plus CRUD for events.

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

| Method | Endpoint                          | Auth required | Description                                |
|--------|-------------------------------------|:--------------:|---------------------------------------------|
| POST   | `/api/auth/register/`               | No             | Create an account, returns a token           |
| POST   | `/api/auth/login/`                  | No             | Authenticate, returns a token                |
| GET    | `/api/auth/me/`                     | Yes            | Return the current user's profile            |
| GET    | `/api/auth/users/`                  | Yes (staff)    | List all users (admin only)                  |
| POST   | `/api/auth/password-reset/`         | No             | Email a password reset link                  |
| POST   | `/api/auth/password-reset-confirm/` | No             | Set a new password using that link's uid/token |

## Event endpoints

| Method | Endpoint              | Auth required | Description                          |
|--------|------------------------|:--------------:|--------------------------------------|
| GET    | `/api/events/`          | Yes            | List the current user's own events   |
| POST   | `/api/events/`          | Yes            | Create an event (organizer = you)    |
| GET    | `/api/events/<id>/`     | Yes            | Retrieve one of your own events      |
| PATCH  | `/api/events/<id>/`     | Yes            | Partially update one of your events  |
| PUT    | `/api/events/<id>/`     | Yes            | Replace one of your events           |
| DELETE | `/api/events/<id>/`     | Yes            | Delete one of your events            |

Each user only ever sees and manages their own events - the list and detail
endpoints are scoped by `organizer=request.user`, so a request for another
user's event ID returns `404` rather than `403` (it doesn't reveal that the
event exists at all). `end_time`, if given, must be after `start_time`.

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

### Password reset

```bash
# 1. Request a reset - always returns the same response, whether or not
#    the email is registered (avoids leaking which addresses have accounts)
curl -X POST http://127.0.0.1:8000/api/auth/password-reset/ \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com"}'

# 2. In dev, EMAIL_BACKEND defaults to the console backend, so the email
#    (with a link like FRONTEND_URL/reset-password/<uid>/<token>/) is
#    printed to the runserver output rather than actually sent. Point
#    DJANGO_EMAIL_BACKEND/EMAIL_HOST at a real provider for production.

# 3. Confirm with the uid/token from that link
curl -X POST http://127.0.0.1:8000/api/auth/password-reset-confirm/ \
  -H "Content-Type: application/json" \
  -d '{"uid":"<uid>","token":"<token>","new_password":"a-new-strong-password","new_password2":"a-new-strong-password"}'
```

The reset token is single-use (it's derived from the user's password hash
via Django's `PasswordResetTokenGenerator`, so it stops validating the
moment the password changes) and expires after `PASSWORD_RESET_TIMEOUT`
(Django's default: 3 days). Confirming a reset also revokes the user's
existing auth token, so any other logged-in session has to sign in again
with the new password.

## Postman collection

`postman/Event-Managment.postman_collection.json` + `postman/Event-Managment.postman_environment.json`
cover every endpoint above plus the error cases (duplicate username,
invalid email, weak password, wrong login, missing/valid token, wrong
method, unmatched route). Import both into Postman, select the
"Event-Managment Local" environment, and run the collection - or from
the CLI with Newman (Postman's own runner):

```bash
cd postman
npx newman run Event-Managment.postman_collection.json -e Event-Managment.postman_environment.json
```

## Error responses

Every error - a validation failure, a bad auth token, an unmatched route, or
an unexpected bug - comes back as the same JSON shape, so a client never has
to guess what happened:

```json
{
  "error": {
    "status": 400,
    "code": "bad_request",
    "message": "One or more fields failed validation.",
    "details": { "email": ["Enter a valid email address."] }
  }
}
```

- `status` - the HTTP status code.
- `code` - a stable machine-readable slug (`not_authenticated`, `not_found`,
  `method_not_allowed`, `internal_server_error`, ...).
- `message` - a short human-readable summary.
- `details` - the raw field-level errors when there are any (e.g. for
  building inline form validation), otherwise `null`.

This is enforced in two places:
- `config/exceptions.py` (`REST_FRAMEWORK["EXCEPTION_HANDLER"]`) wraps every
  exception raised inside a DRF view - both normal DRF exceptions
  (`ValidationError`, `NotAuthenticated`, `PermissionDenied`, `NotFound`,
  `MethodNotAllowed`, ...) and genuinely unexpected bugs, which are logged
  server-side with a full traceback (`logger.error(..., exc_info=exc)`) and
  returned to the client as a generic 500 - never a raw traceback.
- `config/views.py` + `handler400/403/404/500` in `config/urls.py` cover
  requests that never reach a DRF view at all (an unmatched URL, most
  commonly) so even those return the same JSON envelope instead of Django's
  default HTML error pages. These only take effect when `DEBUG=False`; with
  `DEBUG=True` (the local default) Django's own debug pages take over for
  that specific case so you still get full tracebacks while developing.

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
