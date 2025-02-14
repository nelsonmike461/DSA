from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils.text import slugify


class CustomUserManager(BaseUserManager):
    def create_user(self, username, password=None, **extra_fields):
        user = self.model(username=username, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, username, password, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(username, password, **extra_fields)


class User(AbstractUser):
    email = None
    objects = CustomUserManager()
    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = []


class Category(models.Model):
    name = models.CharField(
        max_length=100,
        unique=True,
        help_text="Name of the category (e.g., Arrays, Strings)",
    )
    slug = models.SlugField(max_length=100, unique=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


DIFFICULTY_CHOICES = (
    ("Easy", "Easy"),
    ("Medium", "Medium"),
    ("Hard", "Hard"),
)


class Question(models.Model):
    title = models.CharField(max_length=255, help_text="The title of the problem")
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="questions",
        default=1,  # Default set to category with id 1 ("General")
        help_text="Category of the problem, e.g., Arrays, Strings",
    )
    description = models.TextField(
        help_text="Full problem statement with details and examples"
    )
    input_format = models.TextField(
        blank=True, null=True, help_text="Description of the input format"
    )
    output_format = models.TextField(
        blank=True, null=True, help_text="Description of the output format"
    )
    constraints = models.TextField(
        blank=True, null=True, help_text="Constraints for the problem (if any)"
    )
    sample_input = models.JSONField(
        blank=True, null=True, help_text="A sample input for the problem in JSON format"
    )
    sample_output = models.JSONField(
        blank=True,
        null=True,
        help_text="The expected output for the sample input in JSON format",
    )
    difficulty = models.CharField(
        max_length=10, choices=DIFFICULTY_CHOICES, default="Medium"
    )
    hints = models.TextField(
        blank=True, null=True, help_text="Hints for solving the problem"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class Submission(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    code = models.TextField()
    status = models.CharField(
        max_length=20,
        default="Pending",
        choices=(
            ("Pending", "Pending"),
            ("Running", "Running"),
            ("Accepted", "Accepted"),
            ("Wrong Answer", "Wrong Answer"),
            ("Error", "Error"),
        ),
    )
    result = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
