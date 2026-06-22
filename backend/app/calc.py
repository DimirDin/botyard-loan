"""Pure loan calculation math — no I/O, no side effects."""
from dataclasses import dataclass
from typing import Literal


@dataclass
class MonthRow:
    month: int
    payment: float
    principal: float
    interest: float
    balance: float


@dataclass
class LoanResult:
    monthly_payment: float  # constant for annuity; first payment for differential
    total_payment: float
    total_interest: float
    schedule: list[MonthRow]


@dataclass
class PrepaymentResult:
    # reduce_term variant
    term_savings_months: int
    term_interest_saved: float
    term_new_close_month: int  # months from now
    term_schedule: list[MonthRow]

    # reduce_payment variant
    payment_new_monthly: float
    payment_interest_saved: float
    payment_schedule: list[MonthRow]


def _annuity_payment(principal: float, monthly_rate: float, n: int) -> float:
    if monthly_rate == 0:
        return principal / n
    return principal * monthly_rate * (1 + monthly_rate) ** n / ((1 + monthly_rate) ** n - 1)


def annuity_schedule(amount: float, annual_rate: float, term_months: int) -> LoanResult:
    r = annual_rate / 100 / 12
    pmt = _annuity_payment(amount, r, term_months)
    schedule: list[MonthRow] = []
    balance = amount
    total_interest = 0.0

    for m in range(1, term_months + 1):
        interest = balance * r
        principal = pmt - interest
        if m == term_months:
            principal = balance
            pmt_actual = principal + interest
        else:
            pmt_actual = pmt
        balance -= principal
        balance = max(balance, 0.0)
        total_interest += interest
        schedule.append(MonthRow(m, round(pmt_actual, 2), round(principal, 2), round(interest, 2), round(balance, 2)))

    return LoanResult(
        monthly_payment=round(pmt, 2),
        total_payment=round(pmt * (term_months - 1) + schedule[-1].payment, 2),
        total_interest=round(total_interest, 2),
        schedule=schedule,
    )


def differential_schedule(amount: float, annual_rate: float, term_months: int) -> LoanResult:
    r = annual_rate / 100 / 12
    principal_part = amount / term_months
    schedule: list[MonthRow] = []
    balance = amount
    total_payment = 0.0
    total_interest = 0.0

    for m in range(1, term_months + 1):
        interest = balance * r
        if m == term_months:
            principal = balance
        else:
            principal = principal_part
        payment = principal + interest
        balance -= principal
        balance = max(balance, 0.0)
        total_payment += payment
        total_interest += interest
        schedule.append(MonthRow(m, round(payment, 2), round(principal, 2), round(interest, 2), round(balance, 2)))

    return LoanResult(
        monthly_payment=schedule[0].payment,
        total_payment=round(total_payment, 2),
        total_interest=round(total_interest, 2),
        schedule=schedule,
    )


def calculate_loan(amount: float, annual_rate: float, term_months: int, payment_type: str) -> LoanResult:
    if payment_type == "annuity":
        return annuity_schedule(amount, annual_rate, term_months)
    return differential_schedule(amount, annual_rate, term_months)


def prepayment_scenarios(
    balance: float,
    annual_rate: float,
    months_remaining: int,
    current_payment: float,
    prepayment_amount: float,
    payment_type: Literal["annuity", "differential"],
) -> PrepaymentResult:
    """Calculate both prepayment scenarios after applying a lump sum."""
    new_balance = balance - prepayment_amount
    if new_balance <= 0:
        empty: list[MonthRow] = []
        return PrepaymentResult(
            term_savings_months=months_remaining,
            term_interest_saved=0.0,
            term_new_close_month=0,
            term_schedule=empty,
            payment_new_monthly=0.0,
            payment_interest_saved=0.0,
            payment_schedule=empty,
        )

    # Original remaining interest
    orig = calculate_loan(balance, annual_rate, months_remaining, payment_type)
    orig_interest = orig.total_interest

    # Scenario 1: same payment, shorter term
    r = annual_rate / 100 / 12
    if payment_type == "annuity":
        # find new term
        import math
        if r == 0:
            new_term = int(math.ceil(new_balance / current_payment))
        else:
            new_term = int(math.ceil(
                -math.log(1 - new_balance * r / current_payment) / math.log(1 + r)
            ))
        new_term = max(1, new_term)
        s1 = annuity_schedule(new_balance, annual_rate, new_term)
    else:
        principal_part = balance / months_remaining  # original principal part
        new_term = int(math.ceil(new_balance / principal_part))
        new_term = max(1, new_term)
        s1 = differential_schedule(new_balance, annual_rate, new_term)

    # Scenario 2: same term, lower payment
    s2 = calculate_loan(new_balance, annual_rate, months_remaining, payment_type)

    return PrepaymentResult(
        term_savings_months=months_remaining - new_term,
        term_interest_saved=round(orig_interest - s1.total_interest, 2),
        term_new_close_month=new_term,
        term_schedule=s1.schedule,
        payment_new_monthly=s2.monthly_payment,
        payment_interest_saved=round(orig_interest - s2.total_interest, 2),
        payment_schedule=s2.schedule,
    )


def optimizer_data(amount: float, annual_rate: float, term_months: int, payment_type: str, prepayment: float) -> list[dict]:
    """Return savings vs month of prepayment (for chart)."""
    base = calculate_loan(amount, annual_rate, term_months, payment_type)
    base_interest = base.total_interest
    points = []
    for month in range(1, term_months):
        row = base.schedule[month - 1]
        remaining_balance = row.balance
        remaining_months = term_months - month
        if remaining_balance <= prepayment or remaining_months == 0:
            savings = base_interest - sum(r.interest for r in base.schedule[:month])
            points.append({"month": month, "savings": round(savings, 2)})
            break
        sub = calculate_loan(remaining_balance - prepayment, annual_rate, remaining_months, payment_type)
        interest_paid_so_far = sum(r.interest for r in base.schedule[:month])
        savings = base_interest - (interest_paid_so_far + sub.total_interest)
        points.append({"month": month, "savings": round(savings, 2)})
    return points
