from django.core.exceptions import ValidationError
from django.db import transaction

from ..user_address import (
    UserAddress,
    Province,
    City,
)


class UserAddressService:

    # ============================================================
    # Province
    # ============================================================

    @staticmethod
    def get_provinces():
        return (
            Province.objects
            .filter(
                is_active=True,
            )
            .order_by(
                "name",
            )
        )

    # ============================================================
    # City
    # ============================================================

    @staticmethod
    def get_cities_by_province(
        province_id,
    ):
        return (
            City.objects
            .filter(
                province_id=province_id,
                province__is_active=True,
                is_active=True,
            )
            .select_related(
                "province",
            )
            .order_by(
                "name",
            )
        )

    # ============================================================
    # Admin
    # ============================================================

    @staticmethod
    def get_all_addresses():
        return (
            UserAddress.objects
            .select_related(
                "user",
                "province",
                "city",
            )
            .order_by(
                "-created_at",
            )
        )

    # ============================================================
    # User
    # ============================================================

    @staticmethod
    def get_user_addresses(
        user,
    ):
        return (
            UserAddress.objects
            .select_related(
                "province",
                "city",
            )
            .filter(
                user=user,
            )
            .order_by(
                "-created_at",
            )
        )

    @staticmethod
    def get_user_address(
        user,
        address_id,
    ):
        return (
            UserAddress.objects
            .select_related(
                "province",
                "city",
            )
            .filter(
                id=address_id,
                user=user,
            )
            .first()
        )

    # ============================================================
    # Create Address
    # ============================================================

    @staticmethod
    @transaction.atomic
    def create_address(
        user,
        *,
        province_id,
        city_id,
        address,
        postal_code,
        latitude=None,
        longitude=None,
    ):
        # --------------------------------------------------------
        # Province
        # --------------------------------------------------------

        province = (
            Province.objects
            .filter(
                id=province_id,
                is_active=True,
            )
            .first()
        )

        if province is None:
            raise ValidationError(
                "استان انتخاب شده معتبر نیست."
            )

        # --------------------------------------------------------
        # City
        # --------------------------------------------------------

        city = (
            City.objects
            .filter(
                id=city_id,
                province_id=province.id,
                province__is_active=True,
                is_active=True,
            )
            .first()
        )

        if city is None:
            raise ValidationError(
                "شهر انتخاب شده متعلق به استان انتخاب شده نیست."
            )

        # --------------------------------------------------------
        # Create
        # --------------------------------------------------------

        return UserAddress.objects.create(
            user=user,
            province=province,
            city=city,
            address=address,
            postal_code=postal_code,
            latitude=latitude,
            longitude=longitude,
        )

    # ============================================================
    # Update Address
    # ============================================================

    @staticmethod
    @transaction.atomic
    def update_address(
        user,
        address_id,
        *,
        province_id=None,
        city_id=None,
        address=None,
        postal_code=None,
        latitude=None,
        longitude=None,
    ):
        # --------------------------------------------------------
        # Get Address
        # --------------------------------------------------------

        user_address = (
            UserAddress.objects
            .select_related(
                "province",
                "city",
            )
            .filter(
                id=address_id,
                user=user,
            )
            .first()
        )

        if user_address is None:
            return None

        # --------------------------------------------------------
        # Province
        # --------------------------------------------------------

        if province_id is not None:

            province = (
                Province.objects
                .filter(
                    id=province_id,
                    is_active=True,
                )
                .first()
            )

            if province is None:
                raise ValidationError(
                    "استان انتخاب شده معتبر نیست."
                )

            # اگر استان تغییر کرده باشد،
            # باید شهر جدید نیز ارسال شود.
            if (
                province.id != user_address.province_id
                and city_id is None
            ):
                raise ValidationError(
                    "برای تغییر استان، شهر را نیز ارسال کنید."
                )

            user_address.province = province

        # --------------------------------------------------------
        # City
        # --------------------------------------------------------

        target_province_id = user_address.province_id

        if city_id is None:
            target_city_id = user_address.city_id
        else:
            target_city_id = city_id

        city = (
            City.objects
            .filter(
                id=target_city_id,
                province_id=target_province_id,
                province__is_active=True,
                is_active=True,
            )
            .first()
        )

        if city is None:
            raise ValidationError(
                "شهر انتخاب شده متعلق به استان انتخاب شده نیست."
            )

        user_address.city = city

        # --------------------------------------------------------
        # Address
        # --------------------------------------------------------

        if address is not None:
            user_address.address = address

        # --------------------------------------------------------
        # Postal Code
        # --------------------------------------------------------

        if postal_code is not None:
            user_address.postal_code = postal_code

        # --------------------------------------------------------
        # Latitude
        # --------------------------------------------------------

        if latitude is not None:
            user_address.latitude = latitude

        # --------------------------------------------------------
        # Longitude
        # --------------------------------------------------------

        if longitude is not None:
            user_address.longitude = longitude

        # --------------------------------------------------------
        # Save
        # --------------------------------------------------------

        user_address.save()

        return user_address

    # ============================================================
    # Delete Address
    # ============================================================

    @staticmethod
    @transaction.atomic
    def delete_address(
        user,
        address_id,
    ):
        deleted_count, _ = (
            UserAddress.objects
            .filter(
                id=address_id,
                user=user,
            )
            .delete()
        )

        return deleted_count > 0