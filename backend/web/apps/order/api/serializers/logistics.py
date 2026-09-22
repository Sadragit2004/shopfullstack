
from rest_framework import serializers

from ...models import Logistics


class LogisticsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Logistics

        fields = [
            "id",
            "type",
            "title",
            "price",
            "is_active",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
        ]

