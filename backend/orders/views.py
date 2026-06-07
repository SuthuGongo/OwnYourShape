import logging
import threading
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

FROM_EMAIL = 'Own Your Shape <nobesuthu.gongo03@gmail.com>'


def send_order_confirmation(order):
    def _send():
        try:
            context = {'order': order, 'items': order.items.all()}
            html_body = render_to_string('emails/order_confirmation.html', context)
            plain_body = (
                f"Hi {order.shipping_name},\n\n"
                f"Thank you for your order!\n\n"
                f"Order number: {order.order_number}\n"
                f"Total: R {order.total}\n\n"
                f"We'll be in touch once your order is on its way.\n\n"
                f"— Own Your Shape Team"
            )
            msg = EmailMultiAlternatives(
                subject=f'Order confirmed — {order.order_number}',
                body=plain_body,
                from_email=FROM_EMAIL,
                to=[order.email],
            )
            msg.attach_alternative(html_body, 'text/html')
            msg.send(fail_silently=True)
            logger.info(f"Confirmation email sent for {order.order_number} to {order.email}")
        except Exception as e:
            logger.error(f"Email failed for {order.order_number}: {e}")

    threading.Thread(target=_send, daemon=True).start()


def send_order_sms(order):
    def _send():
        try:
            import africastalking
        except ImportError:
            return

        phone = getattr(order, 'shipping_phone', None)
        if not phone:
            return

        phone = phone.strip().replace(' ', '').replace('-', '')
        if phone.startswith('0') and len(phone) == 10:
            phone = '+27' + phone[1:]
        if not phone.startswith('+'):
            return

        username  = getattr(settings, 'AT_USERNAME', '')
        api_key   = getattr(settings, 'AT_API_KEY', '')
        sender_id = getattr(settings, 'AT_SENDER_ID', '') or None

        if not username or not api_key:
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

    threading.Thread(target=_send, daemon=True).start()


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

        if not serializer.is_valid():
            logger.error(f"Order validation failed: {serializer.errors}")
            return Response(
                {'detail': 'Invalid order data.', 'errors': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            order = serializer.save()
        except Exception as e:
            logger.error(f"Order save failed: {e}", exc_info=True)
            return Response(
                {'detail': f'Failed to create order: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

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