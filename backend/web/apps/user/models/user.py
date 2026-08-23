# apps/user/models/user.py

from django.contrib.auth.base_user import AbstractBaseUser
from django.contrib.auth.models import PermissionsMixin
from django.db import models


class Gender(models.TextChoices):
    MALE = "male", "Male"
    FEMALE = "female", "Female"


class User(AbstractBaseUser, PermissionsMixin):

    first_name = models.CharField(
        max_length=100,
        blank=True,
    )

    last_name = models.CharField(
        max_length=100,
        blank=True,
    )

    email = models.EmailField(
        unique=True,
        db_index=True,
    )

    mobile_number = models.CharField(
        max_length=15,
        unique=True,
        db_index=True,
    )

    national_code = models.CharField(
        max_length=10,
        unique=True,
        null=True,
        blank=True,
        db_index=True,
    )

    gender = models.CharField(
        max_length=10,
        choices=Gender.choices,
        null=True,
        blank=True,
    )

    is_active = models.BooleanField(
        default=True,
    )

    is_staff = models.BooleanField(
        default=False,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    USERNAME_FIELD = "email"

    REQUIRED_FIELDS = []

    class Meta:
        db_table = "users"
        verbose_name = "User"
        verbose_name_plural = "Users"
        ordering = ["-created_at"]

    def __str__(self):
        return self.email