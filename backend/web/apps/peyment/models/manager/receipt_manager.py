from django.db import transaction
from apps.peyment.models import Peyment, Receipt, IgnoreOrAccept


class ReceiptManager:

    @staticmethod
    @transaction.atomic
    def create(peyment, image, code_peygiri=None):
        return Receipt.objects.create(
            peyment=peyment,
            image=image,
            codePeygiri=code_peygiri,
        )

    @staticmethod
    def get(receipt_id):
        return Receipt.objects.filter(id=receipt_id).first()

    @staticmethod
    def list_for_peyment(peyment):
        return Receipt.objects.filter(peyment=peyment).order_by('-createAt')

    @staticmethod
    @transaction.atomic
    def review(receipt, reviewer, is_accept, reason=None):
        # شمارش ردهای قبلی این رسید
        count_ignore = IgnoreOrAccept.objects.filter(
            receipt=receipt, is_ignore=True
        ).count()

        review = IgnoreOrAccept.objects.create(
            receipt=receipt,
            reviewer=reviewer,
            is_accept=is_accept,
            is_ignore=not is_accept,
            reason=reason,
            countIgnore=count_ignore + (1 if not is_accept else 0),
        )

        # اگر تأیید شد، پرداخت نهایی می‌شود
        if is_accept:
            from apps.peyment.models.manager.payment_manager import PeymentManager
            PeymentManager.mark_accepted(receipt.peyment)
        else:
            # اگر سه بار رد شد، پرداخت رد می‌شود
            if review.countIgnore >= 3:
                from apps.peyment.models.manager.payment_manager import PeymentManager
                PeymentManager.mark_rejected(receipt.peyment)

        return review