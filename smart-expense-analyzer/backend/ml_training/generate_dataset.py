"""
Generates ml_training/expense_dataset.csv: a labeled dataset of expense
descriptions built from realistic merchant names combined with the kinds of
short phrases a user actually types into an expense form.

Run:
    python ml_training/generate_dataset.py
"""

import csv
import random
from pathlib import Path

random.seed(42)

MERCHANTS: dict[str, list[str]] = {
    "Food": [
        "McDonald's",
        "KFC",
        "Burger King",
        "Starbucks",
        "Pizza Hut",
        "Domino's Pizza",
        "Subway",
        "Talabat",
        "Careem Food",
        "Carrefour",
        "Safeway",
        "Cafe Latte",
        "local restaurant",
        "bakery",
        "supermarket",
        "coffee shop",
        "food court",
        "grocery store",
        "shawarma stand",
        "juice bar",
    ],
    "Transportation": [
        "Uber",
        "Careem",
        "taxi",
        "city bus",
        "gas station",
        "fuel station",
        "parking garage",
        "car wash",
        "car maintenance shop",
        "toll gate",
        "airport shuttle",
        "train ticket",
        "metro card top-up",
    ],
    "Entertainment": [
        "Netflix",
        "Spotify",
        "Shahid",
        "YouTube Premium",
        "cinema",
        "PlayStation Store",
        "Steam",
        "bowling alley",
        "amusement park",
        "concert ticket",
        "arcade",
        "board game cafe",
    ],
    "Education": [
        "university",
        "Udemy",
        "Coursera",
        "bookstore",
        "school",
        "training center",
        "online course platform",
        "tutoring center",
        "library",
        "exam fee office",
    ],
    "Bills": [
        "electricity company",
        "water authority",
        "internet provider",
        "Zain",
        "Orange",
        "Umniah",
        "landlord",
        "mobile carrier",
        "gas utility",
        "maintenance company",
    ],
    "Shopping": [
        "Amazon",
        "SHEIN",
        "Zara",
        "H&M",
        "IKEA",
        "electronics store",
        "pharmacy",
        "mall",
        "clothing store",
        "furniture shop",
        "mobile phone shop",
        "bookshop",
    ],
    "Other": [
        "ATM",
        "bank",
        "charity",
        "gift shop",
        "unknown vendor",
        "miscellaneous purchase",
        "cash withdrawal",
        "service fee",
        "donation",
        "repair shop",
    ],
}

TEMPLATES = [
    "{merchant}",
    "{merchant} payment",
    "Payment to {merchant}",
    "Paid {merchant}",
    "{merchant} purchase",
    "Bought something at {merchant}",
    "Monthly {merchant} subscription",
    "{merchant} bill",
    "Spent at {merchant}",
    "Order from {merchant}",
    "{merchant} visit",
    "Charge from {merchant}",
    "{merchant} receipt",
    "Transaction at {merchant}",
    "{merchant} today",
]

EXTRA_EXAMPLES: list[tuple[str, str]] = [
    ("Uber ride to university", "Transportation"),
    ("Uber ride to work", "Transportation"),
    ("Uber Eats delivery", "Food"),
    ("Careem ride home", "Transportation"),
    ("Taxi to the airport", "Transportation"),
    ("Filled up the car with fuel", "Transportation"),
    ("Parked downtown for two hours", "Transportation"),
    ("Dinner at a restaurant with friends", "Food"),
    ("Grabbed coffee before work", "Food"),
    ("Weekly grocery shopping", "Food"),
    ("Lunch with colleagues", "Food"),
    ("Netflix subscription renewal", "Entertainment"),
    ("Spotify premium monthly plan", "Entertainment"),
    ("Watched a movie at the cinema", "Entertainment"),
    ("Bought a new game on Steam", "Entertainment"),
    ("University tuition for this semester", "Education"),
    ("Enrolled in an Udemy course", "Education"),
    ("Bought textbooks for class", "Education"),
    ("Paid the electricity bill", "Bills"),
    ("Monthly internet bill payment", "Bills"),
    ("Paid rent for the apartment", "Bills"),
    ("Mobile phone bill from Zain", "Bills"),
    ("Bought clothes from Zara", "Shopping"),
    ("Amazon order arrived", "Shopping"),
    ("New phone from the electronics store", "Shopping"),
    ("Furniture from IKEA", "Shopping"),
    ("Picked up medicine from the pharmacy", "Shopping"),
    ("Withdrew cash from the ATM", "Other"),
    ("Donated to a local charity", "Other"),
    ("Bank service fee", "Other"),
    ("Miscellaneous small purchase", "Other"),
]


def generate_rows() -> list[tuple[str, str]]:
    rows: list[tuple[str, str]] = list(EXTRA_EXAMPLES)

    for category, merchants in MERCHANTS.items():
        for merchant in merchants:
            # Use a handful of template variants per merchant for variety,
            # rather than every template for every merchant.
            chosen_templates = random.sample(TEMPLATES, k=5)
            for template in chosen_templates:
                text = template.format(merchant=merchant)
                rows.append((text, category))

    random.shuffle(rows)
    return rows


def main() -> None:
    rows = generate_rows()
    output_path = Path(__file__).parent / "expense_dataset.csv"
    with output_path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["description", "category"])
        writer.writerows(rows)

    print(f"Wrote {len(rows)} rows to {output_path}")
    counts: dict[str, int] = {}
    for _, category in rows:
        counts[category] = counts.get(category, 0) + 1
    for category, count in sorted(counts.items()):
        print(f"  {category}: {count}")


if __name__ == "__main__":
    main()
