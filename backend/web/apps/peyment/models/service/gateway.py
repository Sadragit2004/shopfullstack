from apps.peyment.models.manager.payment_manager import PeymentManager
from apps.peyment.models import Peyment


class GatewayService:

    @staticmethod
    def create_peyment(order, customer, amount, description=None):
        return PeymentManager.create(
            order=order,
            customer=customer,
            amount=amount,
            peyment_type=Peyment.PeymentType.GATEWAY,
            description=description,
        )

    # در آینده: send_request / verify را همین‌جا اضافه کن