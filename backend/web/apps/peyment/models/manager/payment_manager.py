from django.db import transaction
from apps.peyment.models import Peyment


class PeymentManager:

    @staticmethod
    @transaction.atomic
    def create(order, customer, amount, peyment_type, description=None):
        return Peyment.objects.create(
            order=order,
            customer=customer,
            amount=amount,
            peyment_type=peyment_type,
            description=description,
        )

    @staticmethod
    def get(peyment_id, customer=None):
        qs = Peyment.objects.filter(id=peyment_id)
        if customer:
            qs = qs.filter(customer=customer)
        return qs.first()

    @staticmethod
    def list_for_customer(customer, peyment_type=None):
        qs = Peyment.objects.filter(customer=customer)
        if peyment_type:
            qs = qs.filter(peyment_type=peyment_type)
        return qs.order_by('-createAt')

    @staticmethod
    def mark_accepted(peyment, ref_id=None, status_code=None):
        peyment.status = Peyment.PeymentStatus.ACCEPTED
        peyment.isFinally = True
        if ref_id:
            peyment.refId = ref_id
        if status_code:
            peyment.statusCode = status_code
        peyment.save()
        return peyment

    @staticmethod
    def mark_rejected(peyment, status_code=None):
        peyment.status = Peyment.PeymentStatus.REJECTED
        if status_code:
            peyment.statusCode = status_code
        peyment.save()
        return peyment