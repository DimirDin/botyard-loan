from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from .schemas import (
    LoanInput, PrepaymentInput, OptimizerInput,
    LoanResultOut, PrepaymentResultOut, OptimizerPoint,
    MonthRowOut, SaveLoanInput,
)
from .calc import calculate_loan, prepayment_scenarios, optimizer_data, MonthRow
from .database import get_db
from .models import User, Loan

router = APIRouter(prefix="/api")


def _row(r: MonthRow) -> MonthRowOut:
    return MonthRowOut(month=r.month, payment=r.payment, principal=r.principal,
                       interest=r.interest, balance=r.balance)


@router.post("/calculate", response_model=LoanResultOut)
async def calculate(body: LoanInput):
    res = calculate_loan(body.amount, body.rate, body.term_months, body.payment_type)
    return LoanResultOut(
        monthly_payment=res.monthly_payment,
        total_payment=res.total_payment,
        total_interest=res.total_interest,
        schedule=[_row(r) for r in res.schedule],
    )


@router.post("/prepayment", response_model=PrepaymentResultOut)
async def prepayment(body: PrepaymentInput):
    base = calculate_loan(body.amount, body.rate, body.term_months, body.payment_type)
    if body.months_elapsed >= body.term_months:
        raise ValueError("months_elapsed must be less than term_months")
    elapsed = body.months_elapsed
    if elapsed > 0:
        balance = base.schedule[elapsed - 1].balance
        months_remaining = body.term_months - elapsed
        current_payment = base.schedule[elapsed - 1].payment
    else:
        balance = body.amount
        months_remaining = body.term_months
        current_payment = base.monthly_payment

    res = prepayment_scenarios(
        balance, body.rate, months_remaining, current_payment,
        body.prepayment, body.payment_type,
    )
    return PrepaymentResultOut(
        term_savings_months=res.term_savings_months,
        term_interest_saved=res.term_interest_saved,
        term_new_close_month=res.term_new_close_month,
        term_schedule=[_row(r) for r in res.term_schedule],
        payment_new_monthly=res.payment_new_monthly,
        payment_interest_saved=res.payment_interest_saved,
        payment_schedule=[_row(r) for r in res.payment_schedule],
    )


@router.post("/optimizer", response_model=list[OptimizerPoint])
async def optimizer(body: OptimizerInput):
    points = optimizer_data(body.amount, body.rate, body.term_months, body.payment_type, body.prepayment)
    return [OptimizerPoint(month=p["month"], savings=p["savings"]) for p in points]


@router.post("/loan/save")
async def save_loan(body: SaveLoanInput, db: AsyncSession = Depends(get_db)):
    user = await db.get(User, body.telegram_id)
    if not user:
        user = User(id=body.telegram_id)
        db.add(user)

    # Keep only latest loan per user
    await db.execute(delete(Loan).where(Loan.user_id == body.telegram_id))
    loan = Loan(
        user_id=body.telegram_id,
        amount=body.amount,
        rate=body.rate,
        term_months=body.term_months,
        payment_type=body.payment_type,
    )
    db.add(loan)
    await db.commit()
    return {"ok": True}


@router.get("/loan/{telegram_id}")
async def get_loan(telegram_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Loan).where(Loan.user_id == telegram_id).order_by(Loan.created_at.desc()).limit(1)
    )
    loan = result.scalar_one_or_none()
    if not loan:
        return None
    return {
        "amount": float(loan.amount),
        "rate": float(loan.rate),
        "term_months": loan.term_months,
        "payment_type": loan.payment_type,
    }
