from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from datetime import timedelta
import random
import string


class CustomUser(AbstractUser):
    email      = models.EmailField(unique=True)
    first_name = models.CharField(max_length=50)
    last_name  = models.CharField(max_length=50)
    phone      = models.CharField(max_length=20, blank=True)
    wishlist   = models.ManyToManyField('products.Product', blank=True, related_name='wishlisted_by')

    USERNAME_FIELD  = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    def __str__(self):
        return self.email


class EmailVerification(models.Model):
    email      = models.EmailField(db_index=True)
    pin        = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    used       = models.BooleanField(default=False)

    @staticmethod
    def generate_pin():
        return ''.join(random.choices(string.digits, k=6))

    def is_expired(self, expiry_minutes=15) -> bool:
        return timezone.now() > self.created_at + timedelta(minutes=expiry_minutes)

    def __str__(self):
        return f"{self.email} — {self.pin}"


class Address(models.Model):
    user        = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='addresses')
    label       = models.CharField(max_length=50, default='Home')
    street      = models.CharField(max_length=255)
    city        = models.CharField(max_length=100)
    province    = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=10)
    is_default  = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.email} — {self.label}"
