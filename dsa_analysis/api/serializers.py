from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Question, Category, Submission

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["username", "password", "confirm_password"]

    def validate(self, data):
        if data["password"] != data["confirm_password"]:
            raise serializers.ValidationError("Passwords do not match.")
        return data

    def create(self, validated_data):
        user = User.objects.create_user(username=validated_data["username"])
        user.set_password(validated_data["password"])
        user.save()
        return user


class QuestionSerializer(serializers.ModelSerializer):
    category = serializers.SlugRelatedField(
        queryset=Category.objects.all(), slug_field="name"
    )

    class Meta:
        model = Question
        fields = (
            "title",
            "slug",
            "category",
            "description",
            "input_format",
            "output_format",
            "constraints",
            "sample_input",
            "sample_output",
            "difficulty",
            "hints",
            "created_at",
            "updated_at",
        )


class SubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Submission
        fields = ["id", "code", "status", "result", "created_at"]
        read_only_fields = ["id", "status", "result", "created_at"]
