from datetime import timedelta

from django.contrib.auth import authenticate, get_user_model
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import EmailVerification, Address
from .serializers import RegisterSerializer, UserSerializer, AddressSerializer

User = get_user_model()

PIN_EXPIRY_MINUTES = 15
FROM_EMAIL = 'Own Your Shape <noreply@ownyourshape.co.za>'


# ─── helper ───────────────────────────────────────────────────────────────────

def _issue_pin(email: str) -> str:
    """Delete all old PINs for this email, create a fresh one, return it."""
    EmailVerification.objects.filter(email=email).delete()
    pin = EmailVerification.generate_pin()
    EmailVerification.objects.create(email=email, pin=pin)
    return pin


def _consume_pin(email: str, pin: str) -> bool:
    """
    Return True if a valid, unexpired, unused PIN matches.
    Marks it used on success. Deletes it if expired.
    """
    record = EmailVerification.objects.filter(email=email, pin=pin, used=False).last()
    if not record:
        return False
    cutoff = timezone.now() - timedelta(minutes=PIN_EXPIRY_MINUTES)
    if record.created_at < cutoff:
        record.delete()
        return False
    record.used = True
    record.save()
    return True


def _send_html_email(to: str, subject: str, template: str, context: dict):
    """Send a plain-text + HTML multipart email."""
    context['expiry_minutes'] = PIN_EXPIRY_MINUTES
    html_body  = render_to_string(template, context)
    plain_body = f"Your Dream In Lace PIN is: {context['pin']}\n\nIt expires in {PIN_EXPIRY_MINUTES} minutes."
    msg = EmailMultiAlternatives(subject=subject, body=plain_body, from_email=FROM_EMAIL, to=[to])
    msg.attach_alternative(html_body, 'text/html')
    msg.send(fail_silently=False)


# ─── send signup verification PIN ─────────────────────────────────────────────

class SendVerificationPinView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').lower().strip()
        if not email:
            return Response({'error': 'Email is required.'}, status=400)
        if User.objects.filter(email=email).exists():
            return Response({'error': 'An account with this email already exists.'}, status=400)

        pin = _issue_pin(email)
        try:
            _send_html_email(
                to=email,
                subject='Verify your email — Dream In Lace',
                template='emails/verify_email.html',
                context={'email': email, 'pin': pin},
            )
        except Exception as exc:
            return Response({'error': f'Failed to send email: {exc}'}, status=500)

        return Response({'message': 'Verification PIN sent to your email.'})


# ─── verify signup PIN ────────────────────────────────────────────────────────

class VerifyPinView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').lower().strip()
        pin   = request.data.get('pin', '').strip()

        if not email or not pin:
            return Response({'error': 'Email and PIN are required.'}, status=400)

        if not _consume_pin(email, pin):
            return Response({'error': 'Invalid or expired PIN.'}, status=400)

        return Response({'message': 'Email verified successfully.'})


# ─── register ─────────────────────────────────────────────────────────────────

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'message': 'Account created successfully.',
                'access':  str(refresh.access_token),
                'refresh': str(refresh),
                'user':    UserSerializer(user).data,
            }, status=201)
        return Response(serializer.errors, status=400)


# ─── login ────────────────────────────────────────────────────────────────────

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email    = request.data.get('email', '').lower().strip()
        password = request.data.get('password', '')
        user     = authenticate(request, username=email, password=password)
        if not user:
            return Response({'error': 'Invalid email or password.'}, status=400)
        refresh = RefreshToken.for_user(user)
        return Response({
            'access':  str(refresh.access_token),
            'refresh': str(refresh),
            'user':    UserSerializer(user).data,
        })


# ─── send recovery PIN ────────────────────────────────────────────────────────

class SendRecoveryPinView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').lower().strip()
        if not email:
            return Response({'error': 'Email is required.'}, status=400)

        # Always 200 — never reveal whether the email exists
        if User.objects.filter(email=email).exists():
            pin = _issue_pin(email)
            try:
                _send_html_email(
                    to=email,
                    subject='Reset your password — Dream In Lace',
                    template='emails/reset_password.html',
                    context={'email': email, 'pin': pin},
                )
            except Exception:
                pass  # silent — don't leak account existence via error either

        return Response({'message': 'If that email is registered, a recovery PIN has been sent.'})


# ─── reset password ───────────────────────────────────────────────────────────

class ResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email        = request.data.get('email', '').lower().strip()
        pin          = request.data.get('pin', '').strip()
        new_password = request.data.get('new_password', '')

        if not email or not pin or not new_password:
            return Response({'error': 'Email, PIN and new password are required.'}, status=400)
        if len(new_password) < 8:
            return Response({'error': 'Password must be at least 8 characters.'}, status=400)
        if not _consume_pin(email, pin):
            return Response({'error': 'Invalid or expired PIN.'}, status=400)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=404)

        user.set_password(new_password)
        user.save()
        return Response({'message': 'Password reset successfully.'})


# ─── profile ──────────────────────────────────────────────────────────────────

class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class   = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


# ─── wishlist ─────────────────────────────────────────────────────────────────

class WishlistView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from products.serializers import ProductSerializer
        products = request.user.wishlist.all()
        return Response(ProductSerializer(products, many=True, context={'request': request}).data)

    def post(self, request):
        from products.models import Product
        product_id = request.data.get('product_id')
        try:
            product = Product.objects.get(id=product_id)
            user    = request.user
            if product in user.wishlist.all():
                user.wishlist.remove(product)
                return Response({'message': 'Removed from wishlist.', 'wishlisted': False})
            else:
                user.wishlist.add(product)
                return Response({'message': 'Added to wishlist.', 'wishlisted': True})
        except Product.DoesNotExist:
            return Response({'error': 'Product not found.'}, status=404)


# ─── addresses ────────────────────────────────────────────────────────────────

class AddressListCreateView(generics.ListCreateAPIView):
    serializer_class   = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
