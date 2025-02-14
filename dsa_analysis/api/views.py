from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .serializers import RegisterSerializer, QuestionSerializer
from .models import Question
from django.shortcuts import get_object_or_404
from .models import Submission
from .serializers import SubmissionSerializer
from .tasks import evaluate_submission

# ------------------ Question & Submission Endpoints ------------------


class SubmissionCreateAPIView(generics.CreateAPIView):
    serializer_class = SubmissionSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        slug = self.kwargs.get("slug")
        question = get_object_or_404(Question, slug=slug)
        submission = serializer.save(user=self.request.user, question=question)
        evaluate_submission.delay(submission.id)


class SubmissionRetrieveAPIView(generics.RetrieveAPIView):
    serializer_class = SubmissionSerializer
    permission_classes = [IsAuthenticated]
    queryset = Submission.objects.all()


class QuestionListAPIView(generics.ListAPIView):
    serializer_class = QuestionSerializer
    queryset = Question.objects.all()

    def get_queryset(self):
        queryset = super().get_queryset()
        category = self.request.query_params.get("category")
        if category:
            queryset = queryset.filter(category__name__iexact=category)
        return queryset


class QuestionRetrieveAPIView(generics.RetrieveAPIView):
    serializer_class = QuestionSerializer
    queryset = Question.objects.all()
    lookup_field = "slug"


# ------------------ Authentication Endpoints ------------------


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"message": "User created successfully."},
            status=status.HTTP_201_CREATED,
        )


class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            access_token = response.data.pop("access", None)
            refresh_token = response.data.pop("refresh", None)
            response.set_cookie(
                "access_token",
                access_token,
                httponly=True,
                secure=False,  # Change to True in production with HTTPS
                samesite="Lax",
                path="/",
            )
            response.set_cookie(
                "refresh_token",
                refresh_token,
                httponly=True,
                secure=False,
                samesite="Lax",
                path="/",
            )
        return response


class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get("refresh_token")
        if not refresh_token:
            return Response(
                {"detail": "Refresh token missing"}, status=status.HTTP_401_UNAUTHORIZED
            )
        request.data["refresh"] = refresh_token
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            response.set_cookie(
                "access_token",
                response.data["access"],
                httponly=True,
                secure=False,
                samesite="Lax",
                path="/",
            )
            if "refresh" in response.data:
                response.set_cookie(
                    "refresh_token",
                    response.data["refresh"],
                    httponly=True,
                    secure=False,
                    samesite="Lax",
                    path="/",
                )
        return response


class LogoutView(APIView):
    def post(self, request, *args, **kwargs):
        response = Response(
            {"message": "Logged out successfully."}, status=status.HTTP_200_OK
        )
        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")
        return response


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        return Response(
            {"username": user.username},
            status=status.HTTP_200_OK,
        )
