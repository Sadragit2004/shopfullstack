
from rest_framework import serializers

from ...models import PaymentType


class PaymentTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentType

        fields = [
            "id",
            "title",
            "is_active",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
        ]

