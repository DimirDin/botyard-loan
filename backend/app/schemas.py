from pydantic import BaseModel, Field
from typing import Literal


class LoanInput(BaseModel):
    amount: float = Field(gt=0)
    rate: float = Field(gt=0, lt=100)
    term_months: int = Field(gt=0, le=600)
    payment_type: Literal["annuity", "differential"] = "annuity"


class PrepaymentInput(LoanInput):
    prepayment: float = Field(gt=0)
    months_elapsed: int = Field(ge=0, default=0)


class OptimizerInput(LoanInput):
    prepayment: float = Field(gt=0)


class MonthRowOut(BaseModel):
    month: int
    payment: float
    principal: float
    interest: float
    balance: float


class LoanResultOut(BaseModel):
    monthly_payment: float
    total_payment: float
    total_interest: float
    schedule: list[MonthRowOut]


class PrepaymentResultOut(BaseModel):
    term_savings_months: int
    term_interest_saved: float
    term_new_close_month: int
    term_schedule: list[MonthRowOut]
    payment_new_monthly: float
    payment_interest_saved: float
    payment_schedule: list[MonthRowOut]


class OptimizerPoint(BaseModel):
    month: int
    savings: float


class SaveLoanInput(LoanInput):
    telegram_id: int
