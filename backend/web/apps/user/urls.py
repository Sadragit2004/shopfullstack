from django.urls import path

from apps.user.api.views import auth
from apps.user.api.views import user_address


urlpatterns = [

    # ========================================================
    # Authentication
    # ========================================================

    path(
        "login/",
        auth.LoginMobileView.as_view(),
        name="login",
    ),

    path(
        "verify/",
        auth.VerifyCodeView.as_view(),
        name="verify",
    ),

    # ========================================================
    # Province / City
    # ========================================================

    path(
        "provinces/",
        user_address.ProvinceListView.as_view(),
        name="province-list",
    ),

    path(
        "provinces/<int:province_id>/cities/",
        user_address.CityListByProvinceView.as_view(),
        name="city-list-by-province",
    ),

    # ========================================================
    # User Addresses
    # ========================================================

    path(
        "addresses/",
        user_address.UserAddressListCreateView.as_view(),
        name="user-address-list-create",
    ),

    path(
        "addresses/<int:address_id>/",
        user_address.UserAddressDetailView.as_view(),
        name="user-address-detail",
    ),

    # ========================================================
    # Admin Addresses
    # ========================================================

    path(
        "admin/addresses/",
        user_address.AdminUserAddressListView.as_view(),
        name="admin-user-address-list",
    ),
]