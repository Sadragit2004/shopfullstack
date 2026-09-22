from rest_framework import serializers


# ============================================================
# User Address
# ============================================================

class UserAddressSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)

    user_id = serializers.IntegerField(
        read_only=True
    )

    province = serializers.SerializerMethodField()

    city = serializers.SerializerMethodField()

    address = serializers.CharField()

    latitude = serializers.DecimalField(
        max_digits=10,
        decimal_places=7,
        allow_null=True,
        required=False,
    )

    longitude = serializers.DecimalField(
        max_digits=10,
        decimal_places=7,
        allow_null=True,
        required=False,
    )

    postal_code = serializers.CharField(
        max_length=10,
    )

    created_at = serializers.DateTimeField(
        read_only=True
    )

    updated_at = serializers.DateTimeField(
        read_only=True
    )

    # --------------------------------------------------------
    # Province
    # --------------------------------------------------------

    def get_province(self, obj):
        return {
            "id": obj.province_id,
            "name": obj.province.name,
        }

    # --------------------------------------------------------
    # City
    # --------------------------------------------------------

    def get_city(self, obj):
        return {
            "id": obj.city_id,
            "name": obj.city.name,
        }


# ============================================================
# Create Address
# ============================================================

class UserAddressCreateSerializer(serializers.Serializer):

    province_id = serializers.IntegerField()

    city_id = serializers.IntegerField()

    address = serializers.CharField(
        min_length=5,
    )

    latitude = serializers.DecimalField(
        max_digits=10,
        decimal_places=7,
        required=False,
        allow_null=True,
    )

    longitude = serializers.DecimalField(
        max_digits=10,
        decimal_places=7,
        required=False,
        allow_null=True,
    )

    postal_code = serializers.CharField(
        max_length=10,
        min_length=10,
    )


# ============================================================
# Update Address
# ============================================================

class UserAddressUpdateSerializer(serializers.Serializer):

    province_id = serializers.IntegerField(
        required=False,
    )

    city_id = serializers.IntegerField(
        required=False,
    )

    address = serializers.CharField(
        min_length=5,
        required=False,
    )

    latitude = serializers.DecimalField(
        max_digits=10,
        decimal_places=7,
        required=False,
        allow_null=True,
    )

    longitude = serializers.DecimalField(
        max_digits=10,
        decimal_places=7,
        required=False,
        allow_null=True,
    )

    postal_code = serializers.CharField(
        max_length=10,
        min_length=10,
        required=False,
    )


# ============================================================
# Province List
# ============================================================

class ProvinceListSerializer(serializers.Serializer):

    id = serializers.IntegerField(
        read_only=True,
    )

    name = serializers.CharField(
        read_only=True,
    )


# ============================================================
# City List
# ============================================================

class CityListSerializer(serializers.Serializer):

    id = serializers.IntegerField(
        read_only=True,
    )

    name = serializers.CharField(
        read_only=True,
    )

    province_id = serializers.IntegerField(
        read_only=True,
    )