from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    employee_id = Column(String, unique=True, index=True, nullable=False)
    department = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    is_active = Column(Boolean, default=True)

    assignments = relationship("AssignmentHistory", back_populates="employee")

class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    tag = Column(String, unique=True, index=True, nullable=False)
    type = Column(String, nullable=False)
    make_model = Column(String, nullable=False)
    serial_number = Column(String, unique=True, index=True, nullable=False)
    configuration = Column(Text, nullable=False)
    purchase_date = Column(DateTime, nullable=False)
    vendor = Column(String, nullable=False)
    invoice_number = Column(String, nullable=False)
    invoice_file_url = Column(String, nullable=True)
    cost = Column(Float, nullable=False)
    warranty_expiry = Column(DateTime, nullable=True)
    condition = Column(String, nullable=False)
    status = Column(String, nullable=False, default="Ready to assign")
    current_holder_id = Column(Integer, ForeignKey("employees.id"), nullable=True)
    location = Column(String, nullable=True)

    current_holder = relationship("Employee", foreign_keys=[current_holder_id])
    history = relationship("AssignmentHistory", back_populates="asset")

class AssignmentHistory(Base):
    __tablename__ = "assignment_history"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=True)
    action = Column(String, nullable=False)
    date = Column(DateTime, default=datetime.utcnow, nullable=False)
    notes = Column(Text, nullable=True)
    condition_on_return = Column(String, nullable=True)
    destination = Column(String, nullable=True)

    asset = relationship("Asset", back_populates="history")
    employee = relationship("Employee", back_populates="assignments")