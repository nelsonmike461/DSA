# api/management/commands/import_questions.py
import csv
from django.core.management.base import BaseCommand
from api.models import Question, Category


class Command(BaseCommand):
    help = "Import questions from a CSV file."

    def add_arguments(self, parser):
        parser.add_argument(
            "csv_file", type=str, help="Path to the CSV file containing questions."
        )

    def handle(self, *args, **kwargs):
        csv_file = kwargs["csv_file"]
        self.stdout.write(f"Importing questions from: {csv_file}")

        with open(csv_file, newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Retrieve the category name from the CSV; default to 'General' if not provided.
                category_name = row.get("category", "General").strip()
                # Get or create a Category object.
                category, created = Category.objects.get_or_create(name=category_name)
                if created:
                    self.stdout.write(
                        self.style.SUCCESS(f"Created new category: {category_name}")
                    )

                # Create the Question object with the retrieved Category object.
                question = Question.objects.create(
                    title=row.get("title", "").strip(),
                    description=row.get("description", "").strip(),
                    category=category,  # Pass the Category instance here
                    input_format=row.get("input_format", "").strip(),
                    output_format=row.get("output_format", "").strip(),
                    constraints=row.get("constraints", "").strip(),
                    sample_input=row.get("sample_input", "").strip(),
                    sample_output=row.get("sample_output", "").strip(),
                    difficulty=row.get("difficulty", "Medium").strip(),
                )
                self.stdout.write(
                    self.style.SUCCESS(f"Imported question: {question.title}")
                )

        self.stdout.write(self.style.SUCCESS("Successfully imported all questions."))
