# api/management/commands/import_questions.py
import csv
import json
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
                # Retrieve the category name; default to 'General' if not provided.
                category_name = row.get("category", "General").strip()
                # Get or create a Category object.
                category, created = Category.objects.get_or_create(name=category_name)
                if created:
                    self.stdout.write(
                        self.style.SUCCESS(f"Created new category: {category_name}")
                    )

                # Parse sample_input and sample_output as JSON.
                sample_input_str = row.get("sample_input", "").strip()
                sample_output_str = row.get("sample_output", "").strip()

                try:
                    sample_input = (
                        json.loads(sample_input_str) if sample_input_str else None
                    )
                except json.JSONDecodeError:
                    self.stdout.write(
                        self.style.WARNING(
                            f"Invalid JSON for sample_input in question: {row.get('title', '').strip()}"
                        )
                    )
                    sample_input = None

                try:
                    sample_output = (
                        json.loads(sample_output_str) if sample_output_str else None
                    )
                except json.JSONDecodeError:
                    self.stdout.write(
                        self.style.WARNING(
                            f"Invalid JSON for sample_output in question: {row.get('title', '').strip()}"
                        )
                    )
                    sample_output = None

                # Create the Question object, including the hints field.
                question = Question.objects.create(
                    title=row.get("title", "").strip(),
                    description=row.get("description", "").strip(),
                    category=category,
                    input_format=row.get("input_format", "").strip(),
                    output_format=row.get("output_format", "").strip(),
                    constraints=row.get("constraints", "").strip(),
                    sample_input=sample_input,
                    sample_output=sample_output,
                    difficulty=row.get("difficulty", "Medium").strip(),
                    hints=row.get("hints", "").strip(),  # New hints field
                )
                self.stdout.write(
                    self.style.SUCCESS(f"Imported question: {question.title}")
                )

        self.stdout.write(self.style.SUCCESS("Successfully imported all questions."))
