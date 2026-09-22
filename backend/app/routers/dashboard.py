from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import List, Optional
from datetime import datetime, timezone, timedelta

from app.database import get_db
from app.models import Asset, Employee, AssignmentHistory, User
from app.routers.auth import get_current_user
from app.schemas import DashboardStatsResponse, RecentActivityItem, StatusCount, TypeCount, PaginatedHistoryResponse, PaginatedHistoryItem, DashboardAlertsResponse, WarrantyAlertItem, OldAssetAlertItem

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

STANDARD_STATUSES = [
    "Ready to assign",
    "Assigned",
    "In repair",
    "Hardware issue",
    "Shipped"
    "Retired"
]
STANDARD_TYPES = [
    "Laptop",
    "Monitor",
    "Phone",
    "Docks & peripherals",
]

@router.get("/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    total_assets = db.query(Asset).count()
    status_counts_raw = (
        db.query(Asset.status, func.count(Asset.id))
        .group_by(Asset.status)
        .all()
    )
    status_map = {status: count for status, count in status_counts_raw if status}

    ready_to_assign = status_map.get("Ready to assign", 0)
    assigned = status_map.get("Assigned", 0)
    in_repair = status_map.get("In repair", 0)
    hardware_issue = status_map.get("Hardware issue", 0)
    shipped_retired_count = (
        db.query(func.count(Asset.id))
        .filter(Asset.status.in_(["Shipped to", "Retired", "Shipped"]))
        .scalar()
        or 0
    )

    # Compile status breakdown
    by_status: List[StatusCount] = []
    status_display_items = [
        ("Ready to assign", status_map.get("Ready to assign", 0)),
        ("Assigned", status_map.get("Assigned", 0)),
        ("In repair", status_map.get("In repair", 0)),
        ("Hardware issue", status_map.get("Hardware issue", 0)),
        ("Shipped/Retired", shipped_retired_count),
    ]
    for label, count in status_display_items:
        pct = round((count / total_assets) * 100, 1) if total_assets > 0 else 0.0
        by_status.append(
            StatusCount(
                status=label,
                count=count,
                percentage=pct,
            )
        )
    type_counts_raw = (
        db.query(Asset.type, Asset.status, func.count(Asset.id))
        .group_by(Asset.type, Asset.status)
        .all()
    )

    type_totals = {}
    type_available = {}
    for a_type, status, cnt in type_counts_raw:
        if not a_type:
            continue
        type_totals[a_type] = type_totals.get(a_type, 0) + cnt
        if status == "Ready to assign":
            type_available[a_type] = type_available.get(a_type, 0) + cnt

    # Categories to display
    display_mapping = [
        ("Laptop", ["Laptop", "Laptops"]),
        ("Monitor", ["Monitor", "Monitors"]),
        ("Phone", ["Phone", "Phones"]),
        ("Docks & peripherals", ["Docks & peripherals", "Dock", "Peripherals"]),
    ]

    by_type: List[TypeCount] = []
    for label, aliases in display_mapping:
        tot = sum(type_totals.get(alias, 0) for alias in aliases)
        avail = sum(type_available.get(alias, 0) for alias in aliases)
        pct = round((avail / tot) * 100, 1) if tot > 0 else 0.0
        by_type.append(
            TypeCount(
                type=label,
                total=tot,
                available=avail,
                percentage=pct,
            )
        )

    return DashboardStatsResponse(
        ready_to_assign=ready_to_assign,
        assigned=assigned,
        in_repair=in_repair,
        hardware_issue=hardware_issue,
        total_assets=total_assets,
        by_status=by_status,
        by_type=by_type,
    )

@router.get("/recent-activity", response_model=List[RecentActivityItem])
def get_recent_activity(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    logs = (
        db.query(
            AssignmentHistory.id,
            AssignmentHistory.action,
            AssignmentHistory.date.label("timestamp"), 
            AssignmentHistory.notes,
            Asset.make_model.label("asset_name"),
            Asset.tag.label("asset_tag"),
            Employee.name.label("employee_name"),
        )
        .join(Asset, AssignmentHistory.asset_id == Asset.id)
        .outerjoin(Employee, AssignmentHistory.employee_id == Employee.id)
        .order_by(AssignmentHistory.date.desc())
        .limit(limit)
        .all()
    )

    return [
        RecentActivityItem(
            id=log.id,
            action=log.action,
            timestamp=log.timestamp,
            notes=log.notes,
            asset_name=log.asset_name,
            asset_tag=log.asset_tag,
            employee_name=log.employee_name,
        )
        for log in logs
    ]

@router.get("/global-search")
def global_search(
    q: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query_str = f"%{q.strip()}%"

    # Search assets
    matched_assets = (
        db.query(Asset)
        .filter(
            or_(
                Asset.tag.ilike(query_str),
                Asset.serial_number.ilike(query_str),
                Asset.make_model.ilike(query_str),
            )
        )
        .limit(5)
        .all()
    )

    # Search employees
    matched_employees = (
        db.query(Employee)
        .filter(
            or_(
                Employee.name.ilike(query_str),
                Employee.employee_id.ilike(query_str),
                Employee.email.ilike(query_str),
            )
        )
        .limit(5)
        .all()
    )

    return {
        "assets": [
            {"id": a.id, "tag": a.tag, "title": a.make_model, "type": a.type}
            for a in matched_assets
        ],
        "employees": [
            {"id": e.id, "employee_id": e.employee_id, "title": e.name, "department": e.department}
            for e in matched_employees
        ],
    }

@router.get("/history", response_model=PaginatedHistoryResponse)
def get_full_history(
    page: int = Query(1, ge=1),
    page_size: int = Query(15, ge=1, le=100),
    q: Optional[str] = Query(None),
    action_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = (
        db.query(AssignmentHistory, Asset, Employee)
        .join(Asset, AssignmentHistory.asset_id == Asset.id)
        .outerjoin(Employee, AssignmentHistory.employee_id == Employee.id)
    )

    if q:
        search_pattern = f"%{q.strip()}%"
        query = query.filter(
            or_(
                Asset.tag.ilike(search_pattern),
                Asset.make_model.ilike(search_pattern),
                Employee.name.ilike(search_pattern),
                Employee.employee_id.ilike(search_pattern),
                AssignmentHistory.action.ilike(search_pattern),
                AssignmentHistory.notes.ilike(search_pattern),
            )
        )

    if action_type and action_type != "All":
        query = query.filter(AssignmentHistory.action.ilike(f"%{action_type}%"))

    total = query.count()
    offset = (page - 1) * page_size
    records = (
        query.order_by(AssignmentHistory.date.desc())
        .offset(offset)
        .limit(page_size)
        .all()
    )

    items = [
        PaginatedHistoryItem(
            id=hist.id,
            asset_id=asset.id,
            asset_tag=asset.tag,
            asset_name=asset.make_model,
            asset_type=asset.type,
            employee_id=emp.id if emp else None,
            employee_name=emp.name if emp else None,
            employee_code=emp.employee_id if emp else None,
            action=hist.action,
            date=hist.date,
            notes=hist.notes,
        )
        for hist, asset, emp in records
    ]

    total_pages = (total + page_size - 1) // page_size or 1

    return PaginatedHistoryResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )

@router.get("/alerts", response_model=DashboardAlertsResponse)
def get_dashboard_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    now = datetime.now(timezone.utc)
    sixty_days_from_now = now + timedelta(days=60)
    three_years_ago = now - timedelta(days=3 * 365)
    warranty_records = (
        db.query(Asset)
        .filter(
            Asset.warranty_expiry.isnot(None),
            Asset.warranty_expiry <= sixty_days_from_now,
            Asset.status != "Retired",
        )
        .order_by(Asset.warranty_expiry.asc())
        .limit(6)
        .all()
    )
    warranty_alerts = []
    for a in warranty_records:
        expiry_dt = (
            a.warranty_expiry.replace(tzinfo=timezone.utc)
            if a.warranty_expiry.tzinfo is None
            else a.warranty_expiry
        )
        days_left = (expiry_dt.date() - now.date()).days
        warranty_alerts.append(
            WarrantyAlertItem(
                id=a.id,
                tag=a.tag,
                make_model=a.make_model,
                type=a.type,
                warranty_expiry=a.warranty_expiry,
                days_left=days_left,
                is_expired=days_left < 0,
            )
        )
    old_records = (
        db.query(Asset)
        .filter(
            Asset.purchase_date <= three_years_ago,
            Asset.status != "Retired",
        )
        .order_by(Asset.purchase_date.asc())
        .limit(6)
        .all()
    )
    old_alerts = []
    for a in old_records:
        p_date = (
            a.purchase_date.replace(tzinfo=timezone.utc)
            if a.purchase_date.tzinfo is None
            else a.purchase_date
        )
        age_months = max(
            0,
            (now.year - p_date.year) * 12 + (now.month - p_date.month),
        )
        old_alerts.append(
            OldAssetAlertItem(
                id=a.id,
                tag=a.tag,
                make_model=a.make_model,
                type=a.type,
                purchase_date=a.purchase_date,
                age_months=age_months,
            )
        )
    return DashboardAlertsResponse(
        expiring_warranty=warranty_alerts,
        old_assets=old_alerts,
    )