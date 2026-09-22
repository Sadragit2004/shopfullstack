from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _

from .models.user import User
from .models.secret import UserSecret
from .models.user_address import (
    Province,
    City,
    UserAddress,
)


# ============================================================
# User
# ============================================================

@admin.register(User)
class UserAdmin(BaseUserAdmin):

    list_display = (
        "id",
        "mobile_number",
        "first_name",
        "last_name",
        "email",
        "is_active",
        "is_staff",
        "created_at",
    )

    list_display_links = (
        "id",
        "mobile_number",
    )

    list_filter = (
        "is_active",
        "is_staff",
        "is_superuser",
        "gender",
        "created_at",
    )

    search_fields = (
        "mobile_number",
        "first_name",
        "last_name",
        "email",
        "national_code",
    )

    ordering = (
        "-created_at",
    )

    list_per_page = 50

    readonly_fields = (
        "created_at",
        "last_login",
    )

    filter_horizontal = (
        "groups",
        "user_permissions",
    )

    fieldsets = (
        (
            "Authentication",
            {
                "fields": (
                    "mobile_number",
                    "password",
                ),
            },
        ),
        (
            "Personal Information",
            {
                "fields": (
                    "first_name",
                    "last_name",
                    "email",
                    "national_code",
                    "gender",
                ),
            },
        ),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                ),
            },
        ),
        (
            "Important Dates",
            {
                "fields": (
                    "last_login",
                    "created_at",
                ),
            },
        ),
    )

    add_fieldsets = (
        (
            "Create User",
            {
                "classes": ("wide",),
                "fields": (
                    "mobile_number",
                    "password1",
                    "password2",
                    "is_active",
                    "is_staff",
                ),
            },
        ),
    )


# ============================================================
# User Secret
# ============================================================

@admin.register(UserSecret)
class UserSecretAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "user",
        "code",
        "is_active",
        "created_at",
        "expires_at",
        "is_expired",
    )

    list_display_links = (
        "id",
        "code",
    )

    list_filter = (
        "is_active",
        "created_at",
        "expires_at",
    )

    search_fields = (
        "user__mobile_number",
        "user__first_name",
        "user__last_name",
        "code",
    )

    autocomplete_fields = (
        "user",
    )

    list_select_related = (
        "user",
    )

    ordering = (
        "-created_at",
    )

    list_per_page = 50

    readonly_fields = (
        "created_at",
    )

    fieldsets = (
        (
            "Owner",
            {
                "fields": (
                    "user",
                ),
            },
        ),
        (
            "Secret",
            {
                "fields": (
                    "code",
                    "is_active",
                    "expires_at",
                ),
            },
        ),
        (
            "Information",
            {
                "fields": (
                    "created_at",
                ),
            },
        ),
    )

    @admin.display(
        boolean=True,
        description="Expired",
    )
    def is_expired(self, obj):
        from django.utils import timezone

        return obj.expires_at < timezone.now()


# ============================================================
# Province
# ============================================================

@admin.register(Province)
class ProvinceAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "name",
        "is_active",
        "city_count",
        "created_at",
    )

    list_display_links = (
        "id",
        "name",
    )

    list_filter = (
        "is_active",
    )

    search_fields = (
        "name",
    )

    ordering = (
        "name",
    )

    list_per_page = 50

    readonly_fields = (
        "created_at",
    )

    fieldsets = (
        (
            "Province",
            {
                "fields": (
                    "name",
                    "is_active",
                ),
            },
        ),
        (
            "Information",
            {
                "fields": (
                    "created_at",
                ),
            },
        ),
    )

    @admin.display(
        description="Cities",
    )
    def city_count(self, obj):
        return obj.cities.count()


# ============================================================
# City
# ============================================================

@admin.register(City)
class CityAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "name",
        "province",
        "is_active",
        "created_at",
    )

    list_display_links = (
        "id",
        "name",
    )

    list_filter = (
        "is_active",
        "province",
    )

    search_fields = (
        "name",
        "province__name",
    )

    autocomplete_fields = (
        "province",
    )

    ordering = (
        "province__name",
        "name",
    )

    list_per_page = 50

    readonly_fields = (
        "created_at",
    )

    fieldsets = (
        (
            "City",
            {
                "fields": (
                    "province",
                    "name",
                    "is_active",
                ),
            },
        ),
        (
            "Information",
            {
                "fields": (
                    "created_at",
                ),
            },
        ),
    )


# ============================================================
# User Address
# ============================================================

@admin.register(UserAddress)
class UserAddressAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "user",
        "province",
        "city",
        "postal_code",
        "has_location",
        "created_at",
        "updated_at",
    )

    list_display_links = (
        "id",
    )

    list_filter = (
        "province",
        "city",
        "created_at",
    )

    search_fields = (
        "user__mobile_number",
        "user__first_name",
        "user__last_name",
        "user__email",
        "address",
        "postal_code",
        "province__name",
        "city__name",
    )

    autocomplete_fields = (
        "user",
        "province",
        "city",
    )

    list_select_related = (
        "user",
        "province",
        "city",
    )

    ordering = (
        "-created_at",
    )

    list_per_page = 50

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    fieldsets = (
        (
            "Owner",
            {
                "fields": (
                    "user",
                ),
            },
        ),
        (
            "Location",
            {
                "fields": (
                    "province",
                    "city",
                    "address",
                    "postal_code",
                    "latitude",
                    "longitude",
                ),
            },
        ),
        (
            "Information",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                ),
            },
        ),
    )

    @admin.display(
        boolean=True,
        description="Location",
    )
    def has_location(self, obj):
        return (
            obj.latitude is not None
            and obj.longitude is not None
        )