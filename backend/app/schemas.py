from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: EmailStr | None = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: EmailStr

    class Config:
        from_attributes = True


class StatusCount(BaseModel):
    status: str
    count: int
    percentage: float

class TypeCount(BaseModel):
    type: str
    total: int
    available: int
    percentage: float

class DashboardStatsResponse(BaseModel):
    ready_to_assign: int
    assigned: int
    in_repair: int
    hardware_issue: int
    total_assets: int
    by_status: List[StatusCount]
    by_type: List[TypeCount]

class RecentActivityItem(BaseModel):
    id: int
    action: str
    timestamp: datetime
    notes: Optional[str] = None
    asset_name: str
    asset_tag: str
    employee_name: Optional[str] = None

    class Config:
        from_attributes = True


# --- Asset Schemas ---

class EmployeeBrief(BaseModel):
    id: int
    name: str
    employee_id: str
    email: EmailStr

    class Config:
        from_attributes = True

class AssetResponse(BaseModel):
    id: int
    tag: str
    type: str
    make_model: str
    serial_number: str
    configuration: str
    purchase_date: datetime
    vendor: str
    invoice_number: str
    cost: float
    condition: str
    status: str
    location: Optional[str] = None
    current_holder_id: Optional[int] = None
    current_holder: Optional[EmployeeBrief] = None

    class Config:
        from_attributes = True

class PaginatedAssetsResponse(BaseModel):
    items: List[AssetResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

class AssetCreateRequest(BaseModel):
    tag: str
    type: str
    make_model: str
    serial_number: str
    configuration: str
    purchase_date: datetime
    vendor: str
    invoice_number: str
    cost: float
    current_holder_id: Optional[int] = None
    condition: str = "New"
    status: str = "Ready to assign"
    location: Optional[str] = "Bengaluru HQ"
    warranty_expiry: Optional[datetime] = None
    invoice_file_url: Optional[str] = None
    notes: Optional[str] = None

class AssignmentHistoryItem(BaseModel):
    id: int
    action: str
    date: datetime
    notes: Optional[str] = None
    employee_name: Optional[str] = None
    employee_code: Optional[str] = None

    class Config:
        from_attributes = True

class AssetDetailResponse(AssetResponse):
    history: List[AssignmentHistoryItem] = []

class StatusUpdateRequest(BaseModel):
    status: str
    destination: Optional[str] = None
    notes: Optional[str] = None

class ReassignRequest(BaseModel):
    employee_id: Optional[int] = None
    condition_on_return: Optional[str] = "Good"
    effective_date: Optional[datetime] = None
    notes: Optional[str] = None

class EmployeeCreateRequest(BaseModel):
    name: str
    employee_id: str
    email: EmailStr
    department: str
    is_active: bool = True

class EmployeeDetailItem(BaseModel):
    id: int
    employee_id: str
    name: str
    email: str
    department: str
    is_active: bool
    assigned_assets_count: int

    class Config:
        from_attributes = True

class PaginatedEmployeesResponse(BaseModel):
    items: List[EmployeeDetailItem]
    total: int
    page: int
    page_size: int
    total_pages: int

class CurrentAssetItem(BaseModel):
    id: int
    tag: str
    make_model: str
    type: str
    condition: str
    status: str
    since: Optional[datetime] = None

    class Config:
        from_attributes = True

class PastAssetItem(BaseModel):
    id: int
    asset_id: int
    tag: str
    make_model: str
    type: str
    held_period: str
    returned_date: datetime
    condition_on_return: str

    class Config:
        from_attributes = True

class AssetUpdateRequest(BaseModel):
    type: str
    make_model: str
    serial_number: str
    configuration: str
    purchase_date: datetime
    vendor: str
    invoice_number: str
    cost: float
    condition: str
    location: Optional[str] = "Bengaluru HQ"
    warranty_expiry: Optional[datetime] = None
    invoice_file_url: Optional[str] = None
    edit_reason: Optional[str] = None

class EmployeeProfileResponse(BaseModel):
    id: int
    employee_id: str
    name: str
    email: str
    department: str
    is_active: bool
    current_assets: List[CurrentAssetItem] = []
    past_assets: List[PastAssetItem] = []

    class Config:
        from_attributes = True

class AssignAssetToEmployeeRequest(BaseModel):
    asset_id: int
    effective_date: Optional[datetime] = None
    notes: Optional[str] = None

class PaginatedHistoryItem(BaseModel):
    id: int
    asset_id: int
    asset_tag: str
    asset_name: str
    asset_type: str
    employee_id: Optional[int] = None
    employee_name: Optional[str] = None
    employee_code: Optional[str] = None
    action: str
    date: datetime
    notes: Optional[str] = None

class PaginatedHistoryResponse(BaseModel):
    items: List[PaginatedHistoryItem]
    total: int
    page: int
    page_size: int
    total_pages: int

class WarrantyAlertItem(BaseModel):
    id: int
    tag: str
    make_model: str
    type: str
    warranty_expiry: datetime
    days_left: int
    is_expired: bool

class OldAssetAlertItem(BaseModel):
    id: int
    tag: str
    make_model: str
    type: str
    purchase_date: datetime
    age_months: int

class DashboardAlertsResponse(BaseModel):
    expiring_warranty: List[WarrantyAlertItem]
    old_assets: List[OldAssetAlertItem]