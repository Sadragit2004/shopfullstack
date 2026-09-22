from rest_framework import serializers
from apps.peyment.models import Peyment


class PeymentSerializer(serializers.ModelSerializer):
    createAt_jalali = serializers.SerializerMethodField()

    class Meta:
        model = Peyment
        fields = [
            'id', 'order', 'customer', 'peyment_type', 'status',
            'amount', 'description', 'isFinally',
            'statusCode', 'refId', 'createAt', 'updateAt', 'createAt_jalali',
        ]
        read_only_fields = [
            'customer', 'status', 'isFinally',
            'statusCode', 'refId', 'createAt', 'updateAt',
        ]

    def get_createAt_jalali(self, obj):
        return obj.get_jalali_register_date()


class PeymentCreateSerializer(serializers.Serializer):
    order_id = serializers.IntegerField()
    amount = serializers.IntegerField()
    description = serializers.CharField(required=False, allow_blank=True)