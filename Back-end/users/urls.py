from django.urls import path

from .views import AdminUserListView, LoginView, MeView, RegisterView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('me/', MeView.as_view(), name='me'),
    path('users/', AdminUserListView.as_view(), name='admin-user-list'),
]
