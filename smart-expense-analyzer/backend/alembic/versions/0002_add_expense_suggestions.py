"""Add expense_suggestions table for autocomplete

Revision ID: 0002_add_expense_suggestions
Revises: 0001_initial_schema
Create Date: 2026-09-11

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0002_add_expense_suggestions"
down_revision: str | None = "0001_initial_schema"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

# name -> (category_name, keywords, icon)
SEED_SUGGESTIONS: list[tuple[str, str, str, str]] = [
    # Food
    ("McDonald's", "Food", "mcdonalds,burger,fast food", "utensils"),
    ("KFC", "Food", "kfc,chicken,fast food", "utensils"),
    ("Burger King", "Food", "burger king,burger,fast food", "utensils"),
    ("Starbucks", "Food", "starbucks,coffee", "coffee"),
    ("Pizza Hut", "Food", "pizza hut,pizza", "pizza"),
    ("Domino's Pizza", "Food", "dominos,pizza", "pizza"),
    ("Subway", "Food", "subway,sandwich", "utensils"),
    ("Talabat", "Food", "talabat,delivery,food delivery", "utensils"),
    ("Careem Food", "Food", "careem food,delivery,food delivery", "utensils"),
    ("Restaurant", "Food", "restaurant,dinner,lunch", "utensils"),
    ("Coffee Shop", "Food", "coffee,cafe", "coffee"),
    ("Bakery", "Food", "bakery,bread,pastry", "utensils"),
    ("Supermarket", "Food", "supermarket,groceries", "shopping-cart"),
    ("Carrefour", "Food", "carrefour,supermarket,groceries", "shopping-cart"),
    ("Safeway", "Food", "safeway,supermarket,groceries", "shopping-cart"),
    # Transportation
    ("Uber", "Transportation", "uber,ride,taxi", "car"),
    ("Careem", "Transportation", "careem,ride,taxi", "car"),
    ("Taxi", "Transportation", "taxi,cab", "car"),
    ("Bus", "Transportation", "bus,public transport", "bus"),
    ("Fuel", "Transportation", "fuel,petrol,gas", "fuel"),
    ("Gas Station", "Transportation", "gas station,petrol,fuel", "fuel"),
    ("Parking", "Transportation", "parking", "car"),
    ("Car Wash", "Transportation", "car wash", "car"),
    ("Car Maintenance", "Transportation", "car maintenance,repair", "car"),
    # Entertainment
    ("Netflix", "Entertainment", "netflix,subscription,streaming", "tv"),
    ("Spotify", "Entertainment", "spotify,music,subscription", "music"),
    ("Shahid", "Entertainment", "shahid,streaming", "tv"),
    ("YouTube Premium", "Entertainment", "youtube,premium,subscription", "tv"),
    ("Cinema", "Entertainment", "cinema,movie", "film"),
    ("PlayStation", "Entertainment", "playstation,gaming,games", "gamepad"),
    ("Steam", "Entertainment", "steam,gaming,games", "gamepad"),
    ("Gaming", "Entertainment", "gaming,games", "gamepad"),
    # Education
    ("University Tuition", "Education", "tuition,university,school fees", "book"),
    ("Online Course", "Education", "online course,course", "book"),
    ("Udemy", "Education", "udemy,course,online course", "book"),
    ("Coursera", "Education", "coursera,course,online course", "book"),
    ("Books", "Education", "books,textbook", "book"),
    ("School Fees", "Education", "school fees,tuition", "book"),
    ("Training Course", "Education", "training course,course", "book"),
    # Bills
    ("Electricity Bill", "Bills", "electricity,power,bill", "zap"),
    ("Water Bill", "Bills", "water,bill", "droplet"),
    ("Internet Bill", "Bills", "internet,wifi,bill", "wifi"),
    ("Mobile Bill", "Bills", "mobile,phone,bill", "phone"),
    ("Zain", "Bills", "zain,mobile,phone bill", "phone"),
    ("Orange", "Bills", "orange,mobile,phone bill", "phone"),
    ("Umniah", "Bills", "umniah,internet,mobile", "wifi"),
    ("Rent", "Bills", "rent,housing", "home"),
    # Shopping
    ("Amazon", "Shopping", "amazon,online shopping", "shopping-bag"),
    ("SHEIN", "Shopping", "shein,clothes,online shopping", "shopping-bag"),
    ("Zara", "Shopping", "zara,clothes,fashion", "shopping-bag"),
    ("H&M", "Shopping", "h&m,clothes,fashion", "shopping-bag"),
    ("IKEA", "Shopping", "ikea,furniture,home", "home"),
    ("Clothing", "Shopping", "clothing,clothes,fashion", "shopping-bag"),
    ("Electronics", "Shopping", "electronics,gadgets", "shopping-bag"),
    ("Pharmacy", "Shopping", "pharmacy,medicine,health", "shopping-bag"),
]


def upgrade() -> None:
    op.create_table(
        "expense_suggestions",
        sa.Column("suggestion_id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("name", sa.String(150), nullable=False),
        sa.Column(
            "category_id",
            sa.Integer,
            sa.ForeignKey("categories.category_id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("keywords", sa.Text, nullable=True),
        sa.Column("icon", sa.String(50), nullable=True),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_expense_suggestions_name", "expense_suggestions", ["name"])

    # Look up category_id for each seed row by name, then bulk insert.
    bind = op.get_bind()
    categories_table = sa.table(
        "categories",
        sa.column("category_id", sa.Integer),
        sa.column("category_name", sa.String),
    )
    rows = bind.execute(sa.select(categories_table)).mappings().all()
    category_id_by_name = {row["category_name"]: row["category_id"] for row in rows}

    suggestions_table = sa.table(
        "expense_suggestions",
        sa.column("name", sa.String),
        sa.column("category_id", sa.Integer),
        sa.column("keywords", sa.Text),
        sa.column("icon", sa.String),
    )
    op.bulk_insert(
        suggestions_table,
        [
            {
                "name": name,
                "category_id": category_id_by_name.get(category_name),
                "keywords": keywords,
                "icon": icon,
            }
            for name, category_name, keywords, icon in SEED_SUGGESTIONS
        ],
    )


def downgrade() -> None:
    op.drop_index("ix_expense_suggestions_name", table_name="expense_suggestions")
    op.drop_table("expense_suggestions")
