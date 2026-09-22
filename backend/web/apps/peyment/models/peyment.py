# apps/payment/models/peyment.py
from django.db import models
from django.utils import timezone
from apps.user.models.user import User
from apps.order.models.order import Order
import jdatetime


class Peyment(models.Model):

    class PeymentType(models.TextChoices):
        CARD_TO_CARD = 'card', 'کارت به کارت'
        GATEWAY = 'gateway', 'درگاه پرداخت'

    class PeymentStatus(models.TextChoices):
        PENDING = 'pending', 'در انتظار'
        ACCEPTED = 'accepted', 'تأیید شده'
        REJECTED = 'rejected', 'رد شده'

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='peyments',
        verbose_name='سفارش'
    )
    customer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='peyments',
        verbose_name='مشتری'
    )
    peyment_type = models.CharField(
        max_length=20,
        choices=PeymentType.choices,
        default=PeymentType.CARD_TO_CARD,
        verbose_name='نوع پرداخت'
    )
    status = models.CharField(
        max_length=20,
        choices=PeymentStatus.choices,
        default=PeymentStatus.PENDING,
        verbose_name='وضعیت پرداخت'
    )
    amount = models.IntegerField(verbose_name='مبلغ پرداخت')
    description = models.TextField(
        verbose_name='توضیحات پرداخت',
        null=True,
        blank=True
    )
    isFinaly = models.BooleanField(
        default=False,
        verbose_name='نهایی شده'
    )
    statusCode = models.IntegerField(
        verbose_name='کد وضعیت پرداخت',
        null=True,
        blank=True
    )
    refId = models.CharField(
        max_length=50,
        verbose_name='کد پیگیری پرداخت',
        null=True,
        blank=True
    )
    createAt = models.DateTimeField(
        default=timezone.now,
        verbose_name='تاریخ ساخته شده'
    )
    updateAt = models.DateTimeField(
        auto_now=True,
        verbose_name='تاریخ بروزرسانی'
    )

    def get_jalali_register_date(self):
        return jdatetime.datetime.fromgregorian(
            datetime=self.createAt
        ).strftime('%Y/%m/%d')

    def __str__(self):
        return f'{self.order} | {self.customer} | {self.refId or "-"}'

    class Meta:
        verbose_name = 'پرداخت'
        verbose_name_plural = 'پرداخت‌ها'