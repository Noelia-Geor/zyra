// Exportación de datos a CSV — descarga directa en el navegador

export function downloadCSV(filename: string, rows: string[][], headers: string[]) {
  const BOM = '﻿' // UTF-8 BOM para que Excel abra correctamente con tildes
  const escape = (v: string) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const lines = [
    headers.map(escape).join(';'),
    ...rows.map(row => row.map(escape).join(';')),
  ]
  const csv = BOM + lines.join('\r\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function exportInvoices(invoices: import('@/types').Invoice[]) {
  const headers = ['Número','Fecha','Cliente','NIF Cliente','Total','IVA','Subtotal','Estado','Vencimiento','Notas']
  const rows = invoices.map(inv => [
    inv.number, inv.issue_date, inv.client_name, inv.client_nif ?? '',
    String(inv.total), String(inv.tax_amount), String(inv.subtotal),
    inv.status, inv.due_date ?? '', inv.notes ?? '',
  ])
  const month = new Date().toISOString().slice(0, 7)
  downloadCSV(`ZYRA_Facturas_${month}.csv`, rows, headers)
}

export function exportTimeEntries(entries: import('@/types').TimeEntry[]) {
  const headers = ['Fecha','Entrada','Salida','Duración (min)','Duración (horas)','Proyecto','Notas']
  const rows = entries.map(e => {
    const date = e.clock_in.split('T')[0]
    const entrada = new Date(e.clock_in).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    const salida = e.clock_out ? new Date(e.clock_out).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : ''
    const mins = String(e.duration_mins ?? '')
    const horas = e.duration_mins ? (e.duration_mins / 60).toFixed(2) : ''
    return [date, entrada, salida, mins, horas, e.project ?? '', e.notes ?? '']
  })
  const month = new Date().toISOString().slice(0, 7)
  downloadCSV(`ZYRA_Fichajes_${month}.csv`, rows, headers)
}

export function exportContacts(contacts: import('@/types').Contact[]) {
  const headers = ['Nombre','Email','Teléfono','Empresa','Tipo','Estado','Notas','Último contacto']
  const rows = contacts.map(c => [
    c.name, c.email ?? '', c.phone ?? '', c.company ?? '',
    c.type, c.status, c.notes ?? '', c.last_contact ?? '',
  ])
  downloadCSV(`ZYRA_Contactos_${new Date().toISOString().slice(0,10)}.csv`, rows, headers)
}

export function exportQuotes(quotes: import('@/types').Quote[]) {
  const headers = ['Número','Fecha','Cliente','NIF Cliente','Total','Estado','Válido hasta','Factura generada']
  const rows = quotes.map(q => [
    q.number, q.issue_date, q.client_name, q.client_nif ?? '',
    String(q.total), q.status, q.valid_until ?? '', q.invoice_id ? 'Sí' : 'No',
  ])
  downloadCSV(`ZYRA_Presupuestos_${new Date().toISOString().slice(0,7)}.csv`, rows, headers)
}
