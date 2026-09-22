import math
import os
import shutil
import uuid
from fastapi import APIRouter, Depends, Query, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from typing import Optional

from app.database import get_db
from app.models import Asset, User, AssignmentHistory,  Employee
from app.routers.auth import get_current_user
from app.schemas import PaginatedAssetsResponse, AssetCreateRequest, AssetResponse
from app.schemas import AssetDetailResponse, AssignmentHistoryItem, StatusUpdateRequest, ReassignRequest, AssetUpdateRequest
from datetime import datetime, timezone

router = APIRouter(prefix="/api/assets", tags=["Assets"])
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("", response_model=PaginatedAssetsResponse)
def list_assets(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    q: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    asset_type: Optional[str] = Query(None, alias="type"),
    condition: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Asset).options(joinedload(Asset.current_holder))

    if q:
        search_term = f"%{q.strip()}%"
        query = query.filter(
            or_(
                Asset.tag.ilike(search_term),
                Asset.make_model.ilike(search_term),
                Asset.serial_number.ilike(search_term),
            )
        )
    if status and status != "All":
        query = query.filter(Asset.status == status)

    if asset_type and asset_type != "All":
        query = query.filter(Asset.type == asset_type)

    if condition and condition != "All":
        query = query.filter(Asset.condition == condition)

    total = query.count()
    total_pages = math.ceil(total / page_size) if total > 0 else 1

    offset = (page - 1) * page_size
    items = query.order_by(Asset.id.desc()).offset(offset).limit(page_size).all()

    return PaginatedAssetsResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )

@router.post("", response_model=AssetResponse, status_code=status.HTTP_201_CREATED)
def create_asset(
    payload: AssetCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Check duplicate tag/serial
    if db.query(Asset).filter(Asset.tag == payload.tag.upper()).first():
        raise HTTPException(status_code=400, detail="Asset tag already exists.")
    if db.query(Asset).filter(Asset.serial_number == payload.serial_number.upper()).first():
        raise HTTPException(status_code=400, detail="Serial number already exists.")

    holder_id = payload.current_holder_id if payload.status == "Assigned" else None

    new_asset = Asset(
        tag=payload.tag.strip().upper(),
        type=payload.type,
        make_model=payload.make_model.strip(),
        serial_number=payload.serial_number.strip().upper(),
        configuration=payload.configuration,
        purchase_date=payload.purchase_date,
        vendor=payload.vendor.strip(),
        invoice_number=payload.invoice_number.strip(),
        cost=payload.cost,
        warranty_expiry=payload.warranty_expiry,
        location=payload.location or "Bengaluru HQ",
        condition=payload.condition,
        status=payload.status,
        current_holder_id=holder_id,
        invoice_file_url=payload.invoice_file_url,
    )
    db.add(new_asset)
    db.flush()

    # Log initial creation & assignment history
    action_text = "Asset registered"
    action_text = "Asset registered"
    if payload.status == "Assigned" and holder_id:
        emp = db.query(Employee).filter(Employee.id == holder_id).first()
        action_text = f"Assigned to {emp.name}" if emp else "Asset registered and assigned"
    elif payload.status == "Shipped to":
        action_text = f"Shipped to {new_asset.location}"

    history_entry = AssignmentHistory(
        asset_id=new_asset.id,
        employee_id=holder_id,
        action=action_text,
        date=datetime.now(timezone.utc),
        notes=payload.notes or "Initial registration into system",
    )
    db.add(history_entry)
    db.commit()
    db.refresh(new_asset)

    return new_asset

@router.get("/{asset_id}", response_model=AssetDetailResponse)
def get_asset_detail(
    asset_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    asset = (
        db.query(Asset)
        .options(joinedload(Asset.current_holder))
        .filter(Asset.id == asset_id)
        .first()
    )
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    raw_history = (
        db.query(
            AssignmentHistory.id,
            AssignmentHistory.action,
            AssignmentHistory.date,
            AssignmentHistory.notes,
            Employee.name.label("employee_name"),
            Employee.employee_id.label("employee_code"),
        )
        .outerjoin(Employee, AssignmentHistory.employee_id == Employee.id)
        .filter(AssignmentHistory.asset_id == asset.id)
        .order_by(AssignmentHistory.date.desc())
        .all()
    )

    history_items = [
        AssignmentHistoryItem(
            id=h.id,
            action=h.action,
            date=h.date,
            notes=h.notes,
            employee_name=h.employee_name,
            employee_code=h.employee_code,
        )
        for h in raw_history
    ]

    res = AssetDetailResponse.from_orm(asset)
    res.history = history_items
    return res

@router.post("/{asset_id}/status")
def update_asset_status(
    asset_id: int,
    payload: StatusUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    old_status = asset.status
    asset.status = payload.status

    if payload.status == "Shipped to":
        if not payload.destination or not payload.destination.strip():
            raise HTTPException(
                status_code=400,
                detail="Destination is required when status is 'Shipped to'."
            )
        dest = payload.destination.strip()
        asset.location = dest
        asset.current_holder_id = None
        action_label = f"Shipped to {dest}"
    elif payload.status in ["Ready to assign", "In repair", "Hardware issue", "Retired"]:
        asset.current_holder_id = None

    note_details = payload.notes.strip() if payload.notes else ""
    if payload.status == "Shipped to":
        note_details = f"Dispatched to: {payload.destination.strip()}. " + note_details

    log = AssignmentHistory(
        asset_id=asset.id,
        action=f"Status changed to {payload.status}",
        date=datetime.now(timezone.utc),
        notes=payload.notes or f"Changed from {old_status} to {payload.status}",
    )
    db.add(log)
    db.commit()
    db.refresh(asset)
    return {"message": "Status updated successfully"}

@router.post("/{asset_id}/reassign")
def reassign_or_return_asset(
    asset_id: int,
    payload: ReassignRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    action_date = payload.effective_date or datetime.now(timezone.utc)
    old_holder_name = asset.current_holder.name if asset.current_holder else "Stock"

    if payload.condition_on_return:
        asset.condition = payload.condition_on_return

    if payload.employee_id is None:
        asset.current_holder_id = None
        asset.status = "Ready to assign"

        log = AssignmentHistory(
            asset_id=asset.id,
            action="Returned to stock",
            date=action_date,
            notes=payload.notes or f"Returned from {old_holder_name}. Condition recorded as {asset.condition}.",
        )
        db.add(log)
        db.commit()
        return {"message": "Asset returned to stock successfully"}

    new_holder = db.query(Employee).filter(Employee.id == payload.employee_id).first()
    if not new_holder:
        raise HTTPException(status_code=404, detail="Target employee not found")

    asset.current_holder_id = new_holder.id
    asset.status = "Assigned"

    log = AssignmentHistory(
        asset_id=asset.id,
        employee_id=new_holder.id,
        action=f"Assigned to {new_holder.name}",
        date=action_date,
        notes=payload.notes or f"Transferred from {old_holder_name} to {new_holder.name} ({new_holder.employee_id})",
    )
    db.add(log)
    db.commit()
    return {"message": f"Asset assigned to {new_holder.name} successfully"}

@router.post("/upload-invoice")
async def upload_invoice(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    allowed_extensions = {".pdf", ".png", ".jpg", ".jpeg", ".doc", ".docx"}
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file format. Please upload PDF, PNG, JPG, or DOC.",
        )

    unique_filename = f"{uuid.uuid4().hex[:8]}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {
        "filename": file.filename,
        "url": f"/uploads/{unique_filename}",
        "size_kb": round(os.path.getsize(file_path) / 1024),
    }

@router.put("/{asset_id}", response_model=AssetResponse)
def update_asset(
    asset_id: int,
    payload: AssetUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    cleaned_serial = payload.serial_number.strip().upper()
    if cleaned_serial != asset.serial_number:
        duplicate = db.query(Asset).filter(Asset.serial_number == cleaned_serial, Asset.id != asset.id).first()
        if duplicate:
            raise HTTPException(status_code=400, detail="Serial number already assigned to another asset.")

    asset.type = payload.type
    asset.make_model = payload.make_model.strip()
    asset.serial_number = cleaned_serial
    asset.configuration = payload.configuration.strip()
    asset.purchase_date = payload.purchase_date
    asset.vendor = payload.vendor.strip()
    asset.invoice_number = payload.invoice_number.strip()
    asset.cost = payload.cost
    asset.condition = payload.condition
    asset.location = payload.location.strip() if payload.location else asset.location
    asset.warranty_expiry = payload.warranty_expiry
    if payload.invoice_file_url:
        asset.invoice_file_url = payload.invoice_file_url

    if payload.warranty_expiry:
        if isinstance(payload.warranty_expiry, str):
            asset.warranty_expiry = datetime.fromisoformat(payload.warranty_expiry.replace("Z", "+00:00"))
        else:
            asset.warranty_expiry = payload.warranty_expiry
    else:
        asset.warranty_expiry = asset.warranty_expiry or asset.purchase_date

    audit_note = payload.edit_reason.strip() if payload.edit_reason else "Asset details updated by administrator."
    log = AssignmentHistory(
        asset_id=asset.id,
        action="Asset details updated",
        date=datetime.now(timezone.utc),
        notes=audit_note,
    )
    db.add(log)
    db.commit()
    db.refresh(asset)
    return asset