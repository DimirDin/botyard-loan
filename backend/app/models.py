from datetime import datetime
from sqlalchemy import BigInteger, String, Numeric, Integer, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .database import Base


class User(Base):
    __tablename__ = "users"
    __table_args__ = {"schema": "loan_schema"}

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)  # telegram_id
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    loans: Mapped[list["Loan"]] = relationship(back_populates="user")


class Loan(Base):
    __tablename__ = "loans"
    __table_args__ = {"schema": "loan_schema"}

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("loan_schema.users.id"))
    amount: Mapped[float] = mapped_column(Numeric(15, 2))
    rate: Mapped[float] = mapped_column(Numeric(6, 4))
    term_months: Mapped[int] = mapped_column(Integer)
    payment_type: Mapped[str] = mapped_column(String(20))  # annuity | differential
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="loans")
