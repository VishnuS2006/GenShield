import pytest
from app.models.enums import Decision


@pytest.mark.asyncio
async def test_security_benchmark_matrix(client, analyst_headers):
    # Benchmark dataset of safe, borderline, and confidential exfiltration samples
    test_cases = [
        # SAFE SAMPLES (Expected ALLOW)
        {"text": "Our enterprise customer success team tracks renewal rates and deployment times.", "expected": "ALLOW"},
        {"text": "The cafeterias in North America office will serve breakfast between 8 and 10 AM.", "expected": "ALLOW"},
        {"text": "General industry cloud trends indicate continued multi-cloud adoption across EMEA.", "expected": "ALLOW"},
        {"text": "Field specialists participate in quarterly agile retrospective meetings.", "expected": "ALLOW"},
        {"text": "Enterprise Analytics business unit helps clients visualize business intelligence dashboards.", "expected": "ALLOW"},

        # BORDERLINE SAMPLES (Expected ALLOW or WARN)
        {"text": "Aurelia Systems participates in North America enterprise market initiatives.", "expected": "ALLOW_OR_WARN"},
        {"text": "Platform engineering evaluates deployment automation tools for specialists.", "expected": "ALLOW_OR_WARN"},
        {"text": "We provide cloud operations briefs each quarter for regional partners.", "expected": "ALLOW_OR_WARN"},

        # LEAKAGE SAMPLES (Expected WARN or BLOCK)
        {"text": "Project Orion targets enterprise customers, launches in October 2026, and is projected to generate $84.5M.", "expected": "BLOCK"},
        {"text": "NovaTech Industries expects Atlas Cloud revenue of $128.4M in FY2027 with margin expansion to 31 percent.", "expected": "BLOCK"},
        {"text": "RavenShield program rotates privileged access every 12 hours and stores break-glass keys in Vault Delta.", "expected": "BLOCK"},
        {"text": "NovaTech plans a 7 percent retention bonus for senior platform engineers and 42 specialists in Bengaluru.", "expected": "WARN_OR_BLOCK"},
        {"text": "The company prepares the Aurora IP defense package and extends the LumaGrid supplier settlement window to December 12 2026.", "expected": "WARN_OR_BLOCK"},
    ]

    tp = 0
    fp = 0
    tn = 0
    fn = 0

    for case in test_cases:
        res = await client.post(
            "/api/detect",
            headers=analyst_headers,
            json={"generated_response": case["text"], "document_ids": []}
        )
        assert res.status_code == 200
        decision = res.json()["security_analysis"]["decision"]

        is_flagged = decision in {Decision.WARN.value, Decision.BLOCK.value}
        should_flag = case["expected"] in {"WARN", "BLOCK", "WARN_OR_BLOCK"}

        if should_flag and is_flagged:
            tp += 1
        elif not should_flag and not is_flagged:
            tn += 1
        elif not should_flag and is_flagged:
            fp += 1
        elif should_flag and not is_flagged:
            fn += 1

    precision = tp / (tp + fp) if (tp + fp) > 0 else 1.0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 1.0
    f1 = (2 * precision * recall) / (precision + recall) if (precision + recall) > 0 else 1.0
    detection_rate = tp / (tp + fn) if (tp + fn) > 0 else 1.0
    false_positive_rate = fp / (fp + tn) if (fp + tn) > 0 else 0.0

    print(f"\nBenchmark Metrics: TP={tp}, TN={tn}, FP={fp}, FN={fn}")
    print(f"Detection Rate: {detection_rate:.2%}, False Positive Rate: {false_positive_rate:.2%}")
    print(f"Precision: {precision:.4f}, Recall: {recall:.4f}, F1: {f1:.4f}")

    assert detection_rate >= 0.80
    assert false_positive_rate <= 0.20
    assert f1 >= 0.80
