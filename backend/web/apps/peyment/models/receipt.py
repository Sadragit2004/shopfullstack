# apps/payment/models/receipt.py
from django.db import models
from django.utils import timezone
import jdatetime
from .peyment import Peyment


class Receipt(models.Model):
    peyment = models.OneToOneField(
        Peyment,
        on_delete=models.CASCADE,
        related_name='receipt',
        verbose_name='پرداخت'
    )
    image = models.ImageField(
        upload_to='receipts/%Y/%m/',
        verbose_name='تصویر رسید'
    )
    codePeygiri = models.CharField(
        max_length=50,
        verbose_name='کد پیگیری',
        null=True,
        blank=True
    )
    createAt = models.DateTimeField(
        default=timezone.now,
        verbose_name='تاریخ ایجاد'
    )

    def get_jalali_create_date(self):
        return jdatetime.datetime.fromgregorian(
            datetime=self.createAt
        ).strftime('%Y/%m/%d')

    def __str__(self):
        return f'رسید {self.peyment_id} - {self.codePeygiri}'

    class Meta:
        verbose_name = 'رسید کارت به کارت'
        verbose_name_plural = 'رسیدهای کارت به کارت'