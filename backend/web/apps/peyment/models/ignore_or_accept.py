# apps/payment/models/ignore_or_accept.py
from django.db import models
from django.utils import timezone
from apps.user.models.user import User
import jdatetime
from .receipt import Receipt

class IgnoreOrAccept(models.Model):
    receipt = models.ForeignKey(
        Receipt,
        on_delete=models.CASCADE,
        related_name='reviews',
        verbose_name='رسید'
    )
    countIgnore = models.PositiveIntegerField(
        default=0,
        verbose_name='تعداد رد شدن'
    )
    reason = models.TextField(
        verbose_name='دلیل',
        null=True,
        blank=True
    )
    is_accept = models.BooleanField(
        default=False,
        verbose_name='تأیید شده'
    )
    is_ignore = models.BooleanField(
        default=False,
        verbose_name='رد شده'
    )
    createAt = models.DateTimeField(
        default=timezone.now,
        verbose_name='تاریخ ایجاد'
    )
    # اگر خواستی بدانی چه کسی بررسی کرده (اختیاری ولی مفید)
    reviewer = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='receipt_reviews',
        verbose_name='بررسی‌کننده'
    )

    def get_jalali_create_date(self):
        return jdatetime.datetime.fromgregorian(
            datetime=self.createAt
        ).strftime('%Y/%m/%d')

    def __str__(self):
        status = 'تأیید' if self.is_accept else ('رد' if self.is_ignore else 'در انتظار')
        return f'بررسی رسید {self.receipt_id} - {status}'

    class Meta:
        verbose_name = 'بررسی رسید'
        verbose_name_plural = 'بررسی‌های رسید'