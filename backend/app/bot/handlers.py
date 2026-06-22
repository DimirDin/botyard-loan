from aiogram import Router, F
from aiogram.filters import CommandStart
from aiogram.types import Message, InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo

from ..config import settings

router = Router()


def webapp_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(inline_keyboard=[[
        InlineKeyboardButton(
            text="Открыть калькулятор",
            web_app=WebAppInfo(url=settings.webapp_url),
        )
    ]])


@router.message(CommandStart())
async def cmd_start(message: Message):
    await message.answer(
        "Привет! Я помогу рассчитать кредит и найти лучший момент для досрочного погашения.\n\n"
        "Нажми кнопку ниже, чтобы открыть калькулятор 👇",
        reply_markup=webapp_keyboard(),
    )


@router.message(F.text == "/calc")
async def cmd_calc(message: Message):
    await message.answer("Открываю калькулятор:", reply_markup=webapp_keyboard())
