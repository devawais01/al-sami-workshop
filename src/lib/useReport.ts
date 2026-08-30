import { useQuery } from '@tanstack/react-query'
import { supabase } from './supabase'

export type Row = { key: string; label: string; sub: string; issued: number; returned: number }

export function useReport(workshopId: string | undefined, from: string, to: string) {
    return useQuery({
        queryKey: ['report', workshopId, from, to],
        enabled: !!workshopId,
        queryFn: async () => {
            if (from > to) return { issued: 0, returned: 0, byWorker: [], byDress: [] }
            const startAt = new Date(`${from}T00:00:00`).toISOString()
            const endDate = new Date(`${to}T00:00:00`)
            endDate.setDate(endDate.getDate() + 1)
            const endAt = endDate.toISOString()

            const { data, error } = await supabase
                .from('entry')
                .select('kind, qty, worker_id, lot_id, worker:worker_id(name), lot:lot_id(lot_number, dress:dress_id(name))')
                .eq('workshop_id', workshopId!)
                .is('deleted_at', null)
                .gte('happened_at', startAt)
                .lt('happened_at', endAt)
            if (error) throw error

            const byWorker = new Map<string, Row>()
            const byDress = new Map<string, Row>()
            let issued = 0
            let returned = 0

            for (const e of data ?? []) {
                const w = e.worker as unknown as { name: string }
                const l = e.lot as unknown as { lot_number: string; dress: { name: string } }
                const isIssue = e.kind === 'issue'
                if (isIssue) issued += e.qty
                else returned += e.qty

                const push = (map: Map<string, Row>, key: string, label: string, sub: string) => {
                    const r = map.get(key) ?? { key, label, sub, issued: 0, returned: 0 }
                    if (isIssue) r.issued += e.qty
                    else r.returned += e.qty
                    map.set(key, r)
                }

                push(byWorker, e.worker_id, w?.name ?? '', '')
                push(byDress, e.lot_id, l?.dress?.name ?? '', `Lot ${l?.lot_number ?? ''}`)
            }

            return {
                issued,
                returned,
                byWorker: [...byWorker.values()].sort((a, b) => b.issued - a.issued),
                byDress: [...byDress.values()].sort((a, b) => b.issued - a.issued),
            }
        },
    })
}