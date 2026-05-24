from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('send-verification/', views.SendVerificationPinView.as_view()),
    path('verify-pin/', views.VerifyPinView.as_view()),
    path('register/', views.RegisterView.as_view()),
    path('login/', views.LoginView.as_view()),
    path('send-recovery-pin/', views.SendRecoveryPinView.as_view()),
    path('reset-password/', views.ResetPasswordView.as_view()),
    path('token/refresh/', TokenRefreshView.as_view()),
    path('profile/', views.ProfileView.as_view()),
    path('wishlist/', views.WishlistView.as_view()),
    path('addresses/', views.AddressListCreateView.as_view()),
]
