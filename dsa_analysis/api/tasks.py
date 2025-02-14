from celery import shared_task
from inspect import getfullargspec, isfunction
import importlib.util
from .models import Submission


@shared_task
def evaluate_submission(submission_id):
    submission = Submission.objects.get(id=submission_id)
    submission.status = "Running"
    submission.save()

    try:
        # Load user code dynamically
        module_name = f"submission_{submission_id}"
        spec = importlib.util.spec_from_loader(module_name, loader=None)
        module = importlib.util.module_from_spec(spec)
        exec(submission.code, module.__dict__)

        # Find function with 1 argument (adjust per question requirements)
        functions = [obj for obj in module.__dict__.values() if isfunction(obj)]
        candidates = [f for f in functions if len(getfullargspec(f).args) == 1]

        if len(candidates) != 1:
            submission.status = "Error"
            submission.result = {
                "error": "Requires exactly one function with one argument"
            }
            submission.save()
            return

        func = candidates[0]
        test_cases = submission.question.sample_input
        expected = submission.question.sample_output

        results = []
        all_passed = True
        for i, test_case in enumerate(test_cases):
            try:
                output = func(*test_case)
                passed = output == expected[i]
                if not passed:
                    all_passed = False
                results.append(
                    {
                        "input": test_case,
                        "output": output,
                        "expected": expected[i],
                        "passed": passed,
                    }
                )
            except Exception as e:
                submission.status = "Error"
                submission.result = {"error": f"Test case {i+1} error: {str(e)}"}
                submission.save()
                return

        submission.result = results
        submission.status = "Accepted" if all_passed else "Wrong Answer"
        submission.save()

    except Exception as e:
        submission.status = "Error"
        submission.result = {"error": str(e)}
        submission.save()
