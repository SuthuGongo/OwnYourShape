from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from .models import Order
from .serializers import OrderCreateSerializer, OrderSerializer

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
    html_body  = render_to_string('emails/order_confirmation.html', context)
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
    msg.send(fail_silently=True)  # don't block the response if email fails


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
        send_order_confirmation(order)  # ← send email
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
