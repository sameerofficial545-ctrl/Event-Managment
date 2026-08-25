from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.authentication import JWTAuthentication


class SessionJWTAuthentication(JWTAuthentication):
    """
    JWT auth plus a live UserSession check, so logout can actually
    revoke a token instead of just forgetting it client-side.

    Every authenticated request answers: is the JWT itself valid
    (signature + expiry, handled by the base class)? does a matching
    UserSession row exist? is it still active? A "yes" to all three
    touches last_activity and lets the request through.
    """

    def authenticate(self, request):
        header = self.get_header(request)
        if header is None:
            return None

        raw_token = self.get_raw_token(header)
        if raw_token is None:
            return None

        validated_token = self.get_validated_token(raw_token)
        user = self.get_user(validated_token)

        token_str = raw_token.decode() if isinstance(raw_token, bytes) else raw_token
        session = user.sessions.filter(token=token_str).first()
        if session is None or not session.is_active:
            raise AuthenticationFailed('Session is no longer active. Please log in again.')

        session.save(update_fields=['last_activity'])
        return user, validated_token
