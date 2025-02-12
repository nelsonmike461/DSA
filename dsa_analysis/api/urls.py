from django.urls import path
from .views import (
    RegisterView,
    CustomTokenObtainPairView,
    LogoutView,
    CurrentUserView,
    QuestionListAPIView,
    QuestionRetrieveAPIView,
    CustomTokenRefreshView,
)

urlpatterns = [
    path("questions/", QuestionListAPIView.as_view(), name="question-list"),
    path(
        "questions/<slug:slug>/",
        QuestionRetrieveAPIView.as_view(),
        name="question-detail",
    ),
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", CustomTokenObtainPairView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("user/", CurrentUserView.as_view(), name="current_user"),
    path("token/refresh/", CustomTokenRefreshView.as_view(), name="token_refresh"),
]
