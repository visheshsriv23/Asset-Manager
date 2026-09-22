from datetime import datetime, timezone
from app.database import SessionLocal
from app.models import Asset, Employee, AssignmentHistory

db = SessionLocal()

try:
    # 1. Clear existing data
    db.query(AssignmentHistory).delete()
    db.query(Asset).delete()
    db.query(Employee).delete()
    db.commit()

    # 2. Add Employees
    employees = [
        Employee(
            employee_id="EMP-104",
            name="Aarav Mehta",
            email="aarav.mehta@abmtech.com",
            department="Engineering",
            is_active=True,
        ),
        Employee(
            employee_id="EMP-118",
            name="Priya Nair",
            email="priya.nair@abmtech.com",
            department="Design",
            is_active=True,
        ),
        Employee(
            employee_id="EMP-091",
            name="Rohan Gupta",
            email="rohan.gupta@abmtech.com",
            department="Backend",
            is_active=True,
        ),
        Employee(
            employee_id="EMP-127",
            name="Sara Khan",
            email="sara.khan@abmtech.com",
            department="Frontend",
            is_active=True,
        ),
        Employee(
            employee_id="EMP-066",
            name="Vikram Rao",
            email="vikram.rao@abmtech.com",
            department="QA",
            is_active=False,
        ),
    ]

    db.add_all(employees)
    db.commit()

    # Common non-null values for assets
    now = datetime.now(timezone.utc)
    base_asset_fields = {
        "purchase_date": now,
        "vendor": "Apple Enterprise / CDW",
        "invoice_number": "INV-2026-001",
        "cost": 1299.0,
        "condition": "Good",
        "location": "HQ - Floor 3",
        "warranty_expiry": now,
    }

    assets = [
        # Laptops
        Asset(
            tag="AST-1001",
            type="Laptop",
            make_model='MacBook Pro 16"',
            serial_number="C02G1234MD6R",
            configuration="M3 Pro / 36GB / 512GB SSD",
            status="Ready to assign",
            condition="New",  # 👈 New
            **{k: v for k, v in base_asset_fields.items() if k != "condition"},
        ),
        Asset(
            tag="AST-1002",
            type="Laptop",
            make_model='MacBook Pro 14"',
            serial_number="C02G5678MD6R",
            configuration="M3 / 16GB / 512GB SSD",
            status="Ready to assign",
            condition="Good",  # 👈 Good
            **{k: v for k, v in base_asset_fields.items() if k != "condition"},
        ),
        Asset(
            tag="AST-1003",
            type="Laptop",
            make_model="ThinkPad X1 Carbon",
            serial_number="PF2X9912",
            configuration="i7-1365U / 32GB / 1TB SSD",
            status="Assigned",
            condition="Good",  # 👈 Good
            current_holder_id=employees[1].id,
            **{k: v for k, v in base_asset_fields.items() if k != "condition"},
        ),
        Asset(
            tag="AST-1004",
            type="Laptop",
            make_model='Dell XPS 15"',
            serial_number="8JK22L3",
            configuration="i9-13900H / 32GB / 1TB SSD",
            status="In repair",
            condition="Fair",  # 👈 Fair
            **{k: v for k, v in base_asset_fields.items() if k != "condition"},
        ),
        # Monitors
        Asset(
            tag="AST-2001",
            type="Monitor",
            make_model='Dell UltraSharp 27"',
            serial_number="CN093412",
            configuration="4K UHD / USB-C Hub / 60Hz",
            status="Ready to assign",
            condition="New",  # 👈 New
            **{k: v for k, v in base_asset_fields.items() if k != "condition"},
        ),
        Asset(
            tag="AST-2002",
            type="Monitor",
            make_model='LG UltraFine 4K 24"',
            serial_number="302NDTX91",
            configuration="4K / Daisy Chain / IPS",
            status="Ready to assign",
            condition="Good",  # 👈 Good
            **{k: v for k, v in base_asset_fields.items() if k != "condition"},
        ),
        Asset(
            tag="AST-2003",
            type="Monitor",
            make_model='Dell 24" P2419H',
            serial_number="CN055219",
            configuration="1080p FHD / IPS / Pivot",
            status="Assigned",
            condition="Fair",  # 👈 Fair
            current_holder_id=employees[2].id,
            **{k: v for k, v in base_asset_fields.items() if k != "condition"},
        ),
        # Phones
        Asset(
            tag="AST-3001",
            type="Phone",
            make_model="iPhone 15 Pro",
            serial_number="F2LLM0918",
            configuration="256GB / Natural Titanium",
            status="Ready to assign",
            condition="Good",  # 👈 Good
            **{k: v for k, v in base_asset_fields.items() if k != "condition"},
        ),
        Asset(
            tag="AST-3002",
            type="Phone",
            make_model="Google Pixel 8",
            serial_number="93A018274",
            configuration="128GB / Obsidian",
            status="Assigned",
            condition="Good",  # 👈 Good
            current_holder_id=employees[3].id,
            **{k: v for k, v in base_asset_fields.items() if k != "condition"},
        ),
        # Docks & Peripherals
        Asset(
            tag="AST-4001",
            type="Docks & peripherals",
            make_model="CalDigit TS4 Dock",
            serial_number="CD409182",
            configuration="Thunderbolt 4 / 18 Ports",
            status="Ready to assign",
            condition="New",  # 👈 New
            **{k: v for k, v in base_asset_fields.items() if k != "condition"},
        ),
        Asset(
            tag="AST-4002",
            type="Docks & peripherals",
            make_model="Dell WD19S Dock",
            serial_number="DL994812",
            configuration="USB-C / 130W Power Delivery",
            status="Hardware issue",
            condition="Poor",  # 👈 Poor
            **{k: v for k, v in base_asset_fields.items() if k != "condition"},
        ),
    ]

    db.add_all(assets)
    db.commit()

    # 4. Add Activity Logs (uses 'date' field)
    logs = [
        AssignmentHistory(
            asset_id=assets[2].id,
            employee_id=employees[1].id,
            action="Assigned",
            date=now,
            notes="Primary engineering workstation",
        ),
        AssignmentHistory(
            asset_id=assets[6].id,
            employee_id=employees[2].id,
            action="Assigned",
            date=now,
            notes="Dual desk setup",
        ),
        AssignmentHistory(
            asset_id=assets[3].id,
            action="Status change",
            date=now,
            notes="Battery swelling reported",
        ),
    ]

    db.add_all(logs)
    db.commit()

    print("✅ Database successfully seeded!")

except Exception as e:
    db.rollback()
    print("❌ Error during seed:", e)
finally:
    db.close()