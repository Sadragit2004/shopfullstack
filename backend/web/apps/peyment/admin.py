# apps/payment/admin.py
from django.contrib import admin
from apps.peyment.models.peyment import Peyment
from apps.peyment.models.receipt import Receipt
from apps.peyment.models.ignore_or_accept import IgnoreOrAccept


@admin.register(Peyment)
class PeymentAdmin(admin.ModelAdmin):
    list_display = ('id', 'order', 'customer', 'peyment_type', 'status', 'amount', 'isFinaly')
    list_filter = ('peyment_type', 'status', 'isFinaly')
    search_fields = ('refId', 'customer__username')


@admin.register(Receipt)
class ReceiptAdmin(admin.ModelAdmin):
    list_display = ('id', 'peyment', 'codePeygiri', 'createAt')
    search_fields = ('codePeygiri',)


@admin.register(IgnoreOrAccept)
class IgnoreOrAcceptAdmin(admin.ModelAdmin):
    list_display = ('id', 'receipt', 'is_accept', 'is_ignore', 'countIgnore', 'createAt')
    list_filter = ('is_accept', 'is_ignore')