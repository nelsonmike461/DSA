from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .serializers import RegisterSerializer, QuestionSerializer
from rest_framework_simplejwt.views import TokenRefreshView
from .models import Question


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
    """
    API endpoint that retrieves a single question by its slug.
    """

    serializer_class = QuestionSerializer
    queryset = Question.objects.all()
    lookup_field = "slug"


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {"message": "User created successfully."}, status=status.HTTP_201_CREATED
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
                secure=False,
                samesite="Lax",
            )
            response.set_cookie(
                "refresh_token",
                refresh_token,
                httponly=True,
                secure=False,
                samesite="Lax",
            )
        return response


class LogoutView(APIView):
    def post(self, request, *args, **kwargs):
        """
        Remove the authentication cookies to log out the user.
        """
        response = Response(
            {"message": "Logged out successfully."}, status=status.HTTP_200_OK
        )
        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")
        return response


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        """
        Return data for the currently authenticated user.
        """
        user = request.user
        return Response(
            {
                "username": user.username,
                # Include any additional user fields as needed.
            },
            status=status.HTTP_200_OK,
        )


class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        # Extract refresh token from cookie
        refresh_token = request.COOKIES.get("refresh_token")

        if not refresh_token:
            return Response(
                {"detail": "Refresh token missing"}, status=status.HTTP_401_UNAUTHORIZED
            )

        # Add refresh token to request data
        request.data["refresh"] = refresh_token

        # Proceed with normal token refresh
        response = super().post(request, *args, **kwargs)

        if response.status_code == 200:
            # Set new access token in cookie
            response.set_cookie(
                "access_token",
                response.data["access"],
                httponly=True,
                secure=False,
                samesite="Lax",
            )

        return response
