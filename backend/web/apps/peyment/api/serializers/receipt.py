from rest_framework import serializers
from apps.peyment.models import Receipt, IgnoreOrAccept


class ReceiptSerializer(serializers.ModelSerializer):
    createAt_jalali = serializers.SerializerMethodField()

    class Meta:
        model = Receipt
        fields = [
            'id', 'peyment', 'image', 'codePeygiri',
            'createAt', 'createAt_jalali',
        ]
        read_only_fields = ['peyment', 'createAt']

    def get_createAt_jalali(self, obj):
        return obj.get_jalali_create_date()


class ReceiptCreateSerializer(serializers.Serializer):
    image = serializers.ImageField()
    codePeygiri = serializers.CharField(required=False, allow_blank=True)


class IgnoreOrAcceptSerializer(serializers.ModelSerializer):
    createAt_jalali = serializers.SerializerMethodField()

    class Meta:
        model = IgnoreOrAccept
        fields = [
            'id', 'receipt', 'reviewer', 'countIgnore',
            'reason', 'is_accept', 'is_ignore',
            'createAt', 'createAt_jalali',
        ]
        read_only_fields = [
            'receipt', 'reviewer', 'countIgnore',
            'is_ignore', 'createAt',
        ]

    def get_createAt_jalali(self, obj):
        return obj.get_jalali_create_date()


class ReviewCreateSerializer(serializers.Serializer):
    is_accept = serializers.BooleanField()
    reason = serializers.CharField(required=False, allow_blank=True)