"""
Resumo anual de vendas em Excel, no mesmo formato da folha que o stand já usava ("Vendas 2026.xlsx"):

- "2025VS2026": vendas e margem bruta mês a mês, ano anterior vs ano escolhido, com 2 gráficos
- "TOTAL": por mês, carros vendidos, margem bruta, IVA, despesas mensais estimadas, margem de lucro e faturação
- uma folha por mês ("Janeiro 2026", ...) com cada venda

Os valores das vendas são escritos como números e os totais como fórmulas, para o ficheiro continuar
a funcionar como antes se alguém corrigir uma célula à mão.
"""
from collections import defaultdict
from decimal import Decimal
from io import BytesIO

from django.utils import timezone
from openpyxl import Workbook
from openpyxl.chart import BarChart, Reference
from openpyxl.chart.series import SeriesLabel
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter

MONTHS = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
]
VAT_RATE = Decimal("0.23")

EURO = '#,##0.00\\ "€"'
GREEN = "356854"
HEADER_FILL = PatternFill("solid", fgColor=GREEN)
STRIPE_FILL = PatternFill("solid", fgColor="F6F8F9")
TOTAL_FILL = PatternFill("solid", fgColor="E8EFEC")
WHITE_BOLD = Font(bold=True, color="FFFFFF")
BOLD = Font(bold=True)
CENTER = Alignment(horizontal="center", vertical="center", wrap_text=True)
THIN = Side(style="thin", color="D0D7D4")
BOX = Border(left=THIN, right=THIN, top=THIN, bottom=THIN)


def _style_header(ws, row, columns):
    for col in range(1, columns + 1):
        cell = ws.cell(row=row, column=col)
        cell.font = WHITE_BOLD
        cell.fill = HEADER_FILL
        cell.alignment = CENTER
        cell.border = BOX


def _style_row(ws, row, columns, fill=None, bold=False):
    for col in range(1, columns + 1):
        cell = ws.cell(row=row, column=col)
        cell.alignment = CENTER
        cell.border = BOX
        if fill:
            cell.fill = fill
        if bold:
            cell.font = BOLD


def _widths(ws, widths):
    for i, width in enumerate(widths, start=1):
        ws.column_dimensions[get_column_letter(i)].width = width


def _sale_row(sale):
    data = sale.vehicle.vehicle_data
    return {
        "date": timezone.localtime(sale.created_at).date(),
        "car": f"{data.make} {data.model}".strip().upper(),
        "plate": data.license_plate or "",
        "cost": sale.vehicle.purchase_price,
        "price": sale.final_price,
        "prep": sale.services_total or Decimal("0"),
        "commission": sale.commission,
        "notes": sale.notes or "",
    }


def _month_sheet(wb, title, rows):
    """Uma folha por mês. Devolve a linha dos totais (as folhas TOTAL apontam para ela)."""
    ws = wb.create_sheet(title)
    headers = ["Data", "Automóvel", "Matrícula", "Custo", "PVP", "Margem de lucro",
               "Despesas de Preparação", "Comissão", "Lucro real", "IVA", "Obs."]
    ws.append(headers)
    _style_header(ws, 1, len(headers))
    ws.row_dimensions[1].height = 30

    for i, r in enumerate(rows, start=2):
        ws.append([r["date"], r["car"], r["plate"], r["cost"], r["price"], f"=E{i}-D{i}",
                   # IVA (carros usados): sobre o lucro sem a comissão = margem − despesas de preparação
                   r["prep"], r["commission"], f"=F{i}+H{i}-G{i}", f"=(F{i}-G{i})*{VAT_RATE}", r["notes"]])
        _style_row(ws, i, len(headers), fill=STRIPE_FILL if i % 2 else None)
        ws.cell(row=i, column=1).number_format = "dd/mm/yyyy"
        for col in range(4, 11):
            ws.cell(row=i, column=col).number_format = EURO

    total_row = len(rows) + 2
    last = max(total_row - 1, 2)
    ws.cell(row=total_row, column=1, value="Total")
    for col in range(4, 11):
        letter = get_column_letter(col)
        cell = ws.cell(row=total_row, column=col, value=f"=SUM({letter}2:{letter}{last})" if rows else 0)
        cell.number_format = EURO
    _style_row(ws, total_row, len(headers), fill=TOTAL_FILL, bold=True)

    ws.freeze_panes = "A2"
    _widths(ws, [13, 24, 13, 14, 14, 16, 18, 14, 14, 14, 30])
    return total_row


def build_sales_workbook(sales, previous_sales, year, monthly_expenses):
    """sales / previous_sales: SoldVehicle com services_total anotado (ver sales_queryset)."""
    by_month = defaultdict(list)
    for sale in sales:
        by_month[timezone.localtime(sale.created_at).month].append(_sale_row(sale))
    for rows in by_month.values():
        rows.sort(key=lambda r: r["date"])

    previous = defaultdict(lambda: {"count": 0, "margin": Decimal("0")})
    for sale in previous_sales:
        r = _sale_row(sale)
        month = previous[r["date"].month]
        month["count"] += 1
        month["margin"] += r["price"] - r["cost"] + r["commission"] - r["prep"]

    wb = Workbook()
    compare = wb.active
    compare.title = f"{year - 1}VS{year}"
    total = wb.create_sheet("TOTAL")

    month_titles = [f"{name} {year}" for name in MONTHS]
    total_rows = {m: _month_sheet(wb, month_titles[m - 1], by_month.get(m, [])) for m in range(1, 13)}

    # --- TOTAL ---
    headers = ["Mês", "Carros vendidos", "Margem Bruta (sem despesas fora preparação de carros)", "IVA",
               "Despesas mensais estimadas fora pagamento de viaturas e despesas com carros",
               "Margem de lucro estimada", "Faturação"]
    total.append(headers)
    _style_header(total, 1, len(headers))
    total.row_dimensions[1].height = 45
    # Meses que ainda não começaram não levam despesas (senão o total do ano fica negativo a meio do ano)
    today = timezone.localdate()
    for m in range(1, 13):
        row = m + 1
        sheet = f"'{month_titles[m - 1]}'"
        future = (year, m) > (today.year, today.month)
        tr = total_rows[m]
        total.append([
            MONTHS[m - 1],
            f"=COUNTA({sheet}!B2:B{max(tr - 1, 2)})",
            f"={sheet}!I{tr}",
            f"={sheet}!J{tr}",
            0 if future else monthly_expenses,
            f"=C{row}-E{row}",
            f"={sheet}!E{tr}",
        ])
        _style_row(total, row, len(headers), fill=STRIPE_FILL if row % 2 else None)
        for col in range(3, 8):
            total.cell(row=row, column=col).number_format = EURO
    total.append(["Total"] + [f"=SUM({get_column_letter(c)}2:{get_column_letter(c)}13)" for c in range(2, 8)])
    _style_row(total, 14, len(headers), fill=TOTAL_FILL, bold=True)
    for col in range(3, 8):
        total.cell(row=14, column=col).number_format = EURO
    total.freeze_panes = "A2"
    _widths(total, [14, 16, 26, 14, 30, 18, 16])

    # --- Ano anterior vs ano escolhido ---
    compare.merge_cells("A1:A2")
    compare.merge_cells("B1:C1")
    compare.merge_cells("D1:E1")
    compare["A1"] = "Mês"
    compare["B1"] = year - 1
    compare["D1"] = year
    for col, label in zip("BCDE", ["N.º Vendas", "Margem Bruta"] * 2):
        compare[f"{col}2"] = label
    _style_header(compare, 1, 5)
    _style_header(compare, 2, 5)
    for m in range(1, 13):
        row = m + 2
        compare.append([
            MONTHS[m - 1],
            previous[m]["count"],
            previous[m]["margin"],
            f"=TOTAL!B{m + 1}",
            f"=TOTAL!C{m + 1}",
        ])
        _style_row(compare, row, 5, fill=STRIPE_FILL if row % 2 else None)
        compare.cell(row=row, column=1).font = BOLD
        compare.cell(row=row, column=3).number_format = EURO
        compare.cell(row=row, column=5).number_format = EURO
    compare.append(["Total", "=SUM(B3:B14)", "=SUM(C3:C14)", "=SUM(D3:D14)", "=SUM(E3:E14)"])
    _style_row(compare, 15, 5, fill=TOTAL_FILL, bold=True)
    compare["C15"].number_format = EURO
    compare["E15"].number_format = EURO

    compare["C17"] = f"Crescimento percentual ({year - 1} - {year})"
    compare["C17"].font = BOLD
    compare["C17"].alignment = CENTER
    compare["D17"] = '=IF(C15=0,"",(E15/C15)-1)'
    compare["D17"].number_format = "0.00%"
    compare["D17"].alignment = CENTER
    _widths(compare, [14, 13, 18, 13, 18])

    categories = Reference(compare, min_col=1, min_row=3, max_row=14)
    for title, cols, anchor, unit in [
        (f"N.º Vendas {year - 1} vs {year}", (2, 4), "G1", 1),
        (f"Margem Bruta {year - 1} vs {year}", (3, 5), "G17", None),
    ]:
        chart = BarChart()
        chart.title = title
        chart.y_axis.majorUnit = unit
        chart.height, chart.width = 7.5, 16
        for col, label, colour in zip(cols, (year - 1, year), ("A6A6A6", GREEN)):
            chart.add_data(Reference(compare, min_col=col, min_row=3, max_row=14))
            chart.series[-1].tx = SeriesLabel(v=str(label))
            chart.series[-1].graphicalProperties.solidFill = colour
        chart.set_categories(categories)
        # Sem isto o Excel esconde os nomes dos meses e os valores dos eixos
        chart.x_axis.delete = False
        chart.y_axis.delete = False
        chart.y_axis.majorGridlines = None
        chart.legend.position = "b"
        compare.add_chart(chart, anchor)

    buffer = BytesIO()
    wb.save(buffer)
    return buffer.getvalue()
