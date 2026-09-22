from apps.peyment.models.manager.payment_manager import PeymentManager
from apps.peyment.models.manager.receipt_manager import ReceiptManager
from apps.peyment.models import Peyment


class CardToCardService:

    @staticmethod
    def create_peyment(order, customer, amount, description=None):
        return PeymentManager.create(
            order=order,
            customer=customer,
            amount=amount,
            peyment_type=Peyment.PeymentType.CARD_TO_CARD,
            description=description,
        )

    @staticmethod
    def attach_receipt(peyment, image, code_peygiri=None):
        return ReceiptManager.create(
            peyment=peyment,
            image=image,
            code_peygiri=code_peygiri,
        )

    @staticmethod
    def review_receipt(receipt, reviewer, is_accept, reason=None):
        return ReceiptManager.review(
            receipt=receipt,
            reviewer=reviewer,
            is_accept=is_accept,
            reason=reason,
        )

    @staticmethod
    def list_peyments(customer):
        return PeymentManager.list_for_customer(
            customer=customer,
            peyment_type=Peyment.PeymentType.CARD_TO_CARD,
        )