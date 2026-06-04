import type { User } from '@/types'

export const users: User[] = [
  {
    id: 'USR-01',
    name: 'Avishka Perera',
    email: 'avishka@loomworks.io',
    role: 'Owner',
    status: 'active',
    lastActive: '2026-06-04T08:30:00Z',
  },
  {
    id: 'USR-02',
    name: 'Rosa Mendel',
    email: 'rosa@loomworks.io',
    role: 'Floor Lead',
    status: 'active',
    lastActive: '2026-06-04T07:55:00Z',
  },
  {
    id: 'USR-03',
    name: 'Idris Cole',
    email: 'idris@loomworks.io',
    role: 'Floor Lead',
    status: 'active',
    lastActive: '2026-06-03T18:10:00Z',
  },
  {
    id: 'USR-04',
    name: 'Hana Welsh',
    email: 'hana@loomworks.io',
    role: 'Manager',
    status: 'active',
    lastActive: '2026-06-04T09:02:00Z',
  },
  {
    id: 'USR-05',
    name: 'Tomas Vega',
    email: 'tomas@loomworks.io',
    role: 'Cashier',
    status: 'invited',
    lastActive: '2026-05-30T11:20:00Z',
  },
  {
    id: 'USR-06',
    name: 'Lena Frost',
    email: 'lena@loomworks.io',
    role: 'Viewer',
    status: 'suspended',
    lastActive: '2026-05-12T14:45:00Z',
  },
]
