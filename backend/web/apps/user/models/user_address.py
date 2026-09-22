from django.db import models

from .user import User


class Province(models.Model):

    name = models.CharField(
        max_length=100,
        unique=True,
    )

    is_active = models.BooleanField(
        default=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        db_table = "provinces"
        verbose_name = "Province"
        verbose_name_plural = "Provinces"
        ordering = [
            "name",
        ]

    def __str__(self):
        return self.name


class City(models.Model):

    province = models.ForeignKey(
        Province,
        on_delete=models.CASCADE,
        related_name="cities",
        db_index=True,
    )

    name = models.CharField(
        max_length=100,
    )

    is_active = models.BooleanField(
        default=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        db_table = "cities"
        verbose_name = "City"
        verbose_name_plural = "Cities"
        ordering = [
            "name",
        ]
        constraints = [
            models.UniqueConstraint(
                fields=[
                    "province",
                    "name",
                ],
                name="unique_city_per_province",
            ),
        ]

    def __str__(self):
        return f"{self.name} - {self.province.name}"


class UserAddress(models.Model):

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="addresses",
        db_index=True,
    )

    province = models.ForeignKey(
        Province,
        on_delete=models.PROTECT,
        related_name="user_addresses",
        db_index=True,
    )

    city = models.ForeignKey(
        City,
        on_delete=models.PROTECT,
        related_name="user_addresses",
        db_index=True,
    )

    address = models.TextField()

    latitude = models.DecimalField(
        max_digits=10,
        decimal_places=7,
        null=True,
        blank=True,
    )

    longitude = models.DecimalField(
        max_digits=10,
        decimal_places=7,
        null=True,
        blank=True,
    )

    postal_code = models.CharField(
        max_length=10,
        db_index=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        db_table = "user_addresses"
        verbose_name = "User Address"
        verbose_name_plural = "User Addresses"
        ordering = [
            "-created_at",
        ]

    def __str__(self):
        return f"{self.user.mobile_number} - {self.city.name}"