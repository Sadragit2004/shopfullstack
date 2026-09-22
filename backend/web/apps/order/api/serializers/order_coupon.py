
from rest_framework import serializers


class CouponValidateSerializer(serializers.Serializer):
    code = serializers.CharField(
        max_length=50,
        trim_whitespace=True
    )

    def validate_code(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "کد تخفیف الزامی است."
            )

        return value

