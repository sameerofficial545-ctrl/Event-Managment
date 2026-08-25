from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework import generics, permissions, status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import AccessToken

from .authentication import SessionJWTAuthentication
from .models import UserSession
from .permissions import ADMIN_GROUP, IsAdminRole
from .serializers import (
    LoginSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    RegisterSerializer,
    UserRoleUpdateSerializer,
    UserSerializer,
)

User = get_user_model()


def issue_session(user):
    """Mint a JWT access token and record it as an active UserSession."""
    access_token = AccessToken.for_user(user)
    UserSession.objects.create(
        user=user,
        token=str(access_token),
        expiry_time=timezone.now() + settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'],
    )
    return str(access_token)


class RegisterView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token = issue_session(user)
        return Response(
            {'user': UserSerializer(user).data, 'token': token},
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token = issue_session(user)
        return Response({'user': UserSerializer(user).data, 'token': token})


class LogoutView(APIView):
    """Revokes the session tied to the request's own token - other
    devices/tabs stay logged in, only this one is signed out."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        auth = SessionJWTAuthentication()
        raw_token = auth.get_raw_token(auth.get_header(request))
        token_str = raw_token.decode() if isinstance(raw_token, bytes) else raw_token
        request.user.sessions.filter(token=token_str, is_active=True).update(is_active=False)
        return Response({'detail': 'Logged out.'})


class MeView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class AdminUserListView(generics.ListAPIView):
    permission_classes = [IsAdminRole]
    serializer_class = UserSerializer
    queryset = User.objects.all().order_by('-date_joined')


class AdminUserRoleUpdateView(APIView):
    """Lets an Admin promote a user to Admin or demote them back to Attendee."""

    permission_classes = [IsAdminRole]

    def patch(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        serializer = UserRoleUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_role = serializer.validated_data['role']

        if user.id == request.user.id and new_role != ADMIN_GROUP:
            raise ValidationError({'role': 'You cannot demote your own account.'})

        user.is_staff = new_role == ADMIN_GROUP
        user.save(update_fields=['is_staff'])
        return Response(UserSerializer(user).data)


class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = User.objects.filter(email__iexact=serializer.validated_data['email']).first()
        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            reset_link = f'{settings.FRONTEND_URL}/reset-password/{uid}/{token}/'
            send_mail(
                subject='Reset your Eventify password',
                message=(
                    f'Hi {user.first_name or user.username},\n\n'
                    'Someone requested a password reset for your Eventify account. '
                    f'Click the link below to choose a new password:\n\n{reset_link}\n\n'
                    "If you didn't request this, you can safely ignore this email."
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
            )

        # Same response whether or not the email is registered - otherwise
        # this endpoint could be used to check which addresses have accounts.
        return Response({'detail': 'If that email is registered, a reset link has been sent.'})


class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']

        user.set_password(serializer.validated_data['new_password'])
        user.save(update_fields=['password'])

        # Revoke every active session so it has to re-authenticate with the
        # new password - a still-active JWT would otherwise keep working.
        UserSession.objects.filter(user=user, is_active=True).update(is_active=False)

        return Response({'detail': 'Your password has been reset. You can now log in.'})
