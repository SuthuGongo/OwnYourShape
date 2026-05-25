import logging
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from .models import Order
from .serializers import OrderCreateSerializer, OrderSerializer

logger = logging.getLogger(__name__)

PROMO_CODES = {
    'WELCOME': 10,
    'DREAMINLACE': 15,
    'SUMMER25': 25,
}

FROM_EMAIL = 'Own Your Shape <noreply@ownyourshape.co.za>'


def send_order_confirmation(order):
    """Send a branded HTML order confirmation email."""
    context = {
        'order': order,
        'items': order.items.all(),
    }
    html_body = render_to_string('emails/order_confirmation.html', context)
    plain_body = (
        f"Hi {order.shipping_name},\n\n"
        f"Thank you for your order!\n\n"
        f"Order number: {order.order_number}\n"
        f"Total: R {order.total}\n\n"
        f"We'll be in touch once your order is on its way.\n\n"
        f"— Own Your Shape Team"
    )
    try:
        msg = EmailMultiAlternatives(
            subject=f'Order confirmed — {order.order_number}',
            body=plain_body,
            from_email=FROM_EMAIL,
            to=[order.email],
        )
        msg.attach_alternative(html_body, 'text/html')
        msg.send(fail_silently=False)
        logger.info(f"Confirmation email sent for {order.order_number} to {order.email}")
    except Exception as e:
        logger.error(f"Email failed for {order.order_number}: {e}")


def send_order_sms(order):
    """Send SMS via Africa's Talking — only runs if credentials are configured."""
    try:
        import africastalking
    except ImportError:
        logger.info("africastalking not installed — SMS skipped.")
        return

    phone = getattr(order, 'shipping_phone', None)
    if not phone:
        logger.info(f"SMS skipped for {order.order_number} — no phone number.")
        return

    phone = phone.strip().replace(' ', '').replace('-', '')
    if phone.startswith('0') and len(phone) == 10:
        phone = '+27' + phone[1:]
    if not phone.startswith('+'):
        logger.warning(f"SMS skipped — unrecognised number format: {phone}")
        return

    username  = getattr(settings, 'AT_USERNAME', '')
    api_key   = getattr(settings, 'AT_API_KEY', '')
    sender_id = getattr(settings, 'AT_SENDER_ID', '') or None

    if not username or not api_key:
        logger.info("SMS skipped — AT_USERNAME or AT_API_KEY not set.")
        return

    try:
        africastalking.initialize(username, api_key)
        sms = africastalking.SMS
        message = (
            f"Hi {order.shipping_name.split()[0]}! "
            f"Your Own Your Shape order {order.order_number} "
            f"(R{int(order.total)}) is confirmed. "
            f"We'll notify you when it ships."
        )
        kwargs = dict(message=message, recipients=[phone])
        if sender_id:
            kwargs['sender_id'] = sender_id
        response = sms.send(**kwargs)
        logger.info(f"SMS sent for {order.order_number}: {response}")
    except Exception as e:
        logger.error(f"SMS failed for {order.order_number}: {e}")


class ValidatePromoView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        code = request.data.get('code', '').upper().strip()
        if code in PROMO_CODES:
            return Response({'valid': True, 'discount_percent': PROMO_CODES[code], 'code': code})
        return Response({'valid': False, 'error': 'Invalid promo code.'}, status=400)


class OrderCreateView(generics.CreateAPIView):
    serializer_class = OrderCreateSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        send_order_confirmation(order)
        send_order_sms(order)
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'order_number'

    def get_queryset(self):
        return Order.objects.prefetch_related('items')


class MyOrdersView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related('items')