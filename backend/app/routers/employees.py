from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import List, Optional
from datetime import datetime, timezone

from app.database import get_db
from app.models import Employee, Asset, User, AssignmentHistory
from app.routers.auth import get_current_user
from app.schemas import EmployeeCreateRequest, EmployeeDetailItem, EmployeeProfileResponse, CurrentAssetItem, PastAssetItem, AssignAssetToEmployeeRequest, PaginatedEmployeesResponse

router = APIRouter(prefix="/api/employees", tags=["Employees"])

@router.get("", response_model=List[EmployeeDetailItem])
def list_employees(
    page: int = Query(1, ge=1),
    page_size: int = Query(8, ge=1, le=100),
    q: Optional[str] = Query(None),
    department: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = (
        db.query(
            Employee.id,
            Employee.employee_id,
            Employee.name,
            Employee.email,
            Employee.department,
            Employee.is_active,
            func.count(Asset.id).label("assigned_assets_count"),
        )
        .outerjoin(Asset, Employee.id == Asset.current_holder_id)
        .group_by(Employee.id)
    )

    if q:
        search_term = f"%{q.strip()}%"
        query = query.filter(
            or_(
                Employee.name.ilike(search_term),
                Employee.employee_id.ilike(search_term),
                Employee.email.ilike(search_term),
            )
        )

    if department and department != "All departments":
        query = query.filter(Employee.department == department)

    if status and status != "All":
        is_active = True if status.lower() == "active" else False
        query = query.filter(Employee.is_active == is_active)

    offset = (page - 1) * page_size
    results = (
        query.order_by(Employee.id.desc())
        .offset(offset)
        .limit(page_size)
        .all()
    )

    return [
        EmployeeDetailItem(
            id=r.id,
            employee_id=r.employee_id,
            name=r.name,
            email=r.email,
            department=r.department,
            is_active=r.is_active,
            assigned_assets_count=r.assigned_assets_count,
        )
        for r in results
    ]

@router.post("", response_model=EmployeeDetailItem, status_code=status.HTTP_201_CREATED)
def create_employee(
    payload: EmployeeCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing = (
        db.query(Employee)
        .filter(
            or_(
                Employee.employee_id == payload.employee_id.strip().upper(),
                Employee.email == payload.email.strip().lower(),
            )
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=400,
            detail="An employee with this ID or Email already exists.",
        )

    new_emp = Employee(
        name=payload.name.strip(),
        employee_id=payload.employee_id.strip().upper(),
        email=payload.email.strip().lower(),
        department=payload.department.strip(),
        is_active=payload.is_active,
    )
    db.add(new_emp)
    db.commit()
    db.refresh(new_emp)

    return EmployeeDetailItem(
        id=new_emp.id,
        employee_id=new_emp.employee_id,
        name=new_emp.name,
        email=new_emp.email,
        department=new_emp.department,
        is_active=new_emp.is_active,
        assigned_assets_count=0,
    )

@router.get("/{employee_id}", response_model=EmployeeProfileResponse)
def get_employee_profile(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    current_assets_raw = db.query(Asset).filter(Asset.current_holder_id == emp.id).all()
    current_list = []
    for a in current_assets_raw:
        latest_assign = (
            db.query(AssignmentHistory)
            .filter(AssignmentHistory.asset_id == a.id, AssignmentHistory.employee_id == emp.id)
            .order_by(AssignmentHistory.date.desc())
            .first()
        )
        current_list.append(
            CurrentAssetItem(
                id=a.id,
                tag=a.tag,
                make_model=a.make_model,
                type=a.type,
                condition=a.condition,
                status=a.status,
                since=latest_assign.date if latest_assign else a.purchase_date,
            )
        )
    past_history = (
        db.query(AssignmentHistory, Asset)
        .join(Asset, AssignmentHistory.asset_id == Asset.id)
        .filter(
            AssignmentHistory.employee_id == emp.id,
            Asset.current_holder_id != emp.id,
        )
        .order_by(AssignmentHistory.date.desc())
        .all()
    )
    past_list = []
    for hist, ast in past_history:
        past_list.append(
            PastAssetItem(
                id=hist.id,
                asset_id=ast.id,
                tag=ast.tag,
                make_model=ast.make_model,
                type=ast.type,
                held_period="Prior assignment",
                returned_date=hist.date,
                condition_on_return=ast.condition or "Good",
            )
        )
    return EmployeeProfileResponse(
        id=emp.id,
        employee_id=emp.employee_id,
        name=emp.name,
        email=emp.email,
        department=emp.department,
        is_active=emp.is_active,
        current_assets=current_list,
        past_assets=past_list,
    )

@router.post("/{employee_id}/assign")
def assign_asset_to_employee(
    employee_id: int,
    payload: AssignAssetToEmployeeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    asset = db.query(Asset).filter(Asset.id == payload.asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    action_date = payload.effective_date or datetime.now(timezone.utc)

    asset.current_holder_id = emp.id
    asset.status = "Assigned"

    log = AssignmentHistory(
        asset_id=asset.id,
        employee_id=emp.id,
        action=f"Assigned to {emp.name}",
        date=action_date,
        notes=payload.notes or f"Assigned to {emp.name} ({emp.employee_id})",
    )
    db.add(log)
    db.commit()

    return {"message": f"Asset {asset.tag} assigned to {emp.name}"}