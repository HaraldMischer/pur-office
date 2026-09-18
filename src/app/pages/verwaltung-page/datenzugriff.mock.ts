// pur-office/src/app/pages/verwaltung-page/datenzugriff.mock.ts

import { IUnternehmerAuswahl } from '../../commons/models/domain/datenzugriff';

export const DATENZUGRIFF_MOCK: readonly IUnternehmerAuswahl[] = [
  {
    id: 'demo-unternehmer-west',
    name: 'Musterunternehmen West',
    firmen: [
      {
        id: 'demo-firma-ruhr',
        name: 'Ruhr Freizeit GmbH',
        filialen: [
          { id: 'demo-bochum', name: 'Bochum Zentrum' },
          { id: 'demo-herne', name: 'Herne Mitte' },
          { id: 'demo-essen', name: 'Essen Süd' },
        ],
      },
      {
        id: 'demo-firma-rhein',
        name: 'Rhein Service GmbH',
        filialen: [
          { id: 'demo-duesseldorf', name: 'Düsseldorf Altstadt' },
          { id: 'demo-koeln', name: 'Köln Nord' },
        ],
      },
    ],
  },
  {
    id: 'demo-unternehmer-nord',
    name: 'Musterunternehmen Nord',
    firmen: [
      {
        id: 'demo-firma-hanse',
        name: 'Hanse Freizeit GmbH',
        filialen: [
          { id: 'demo-hamburg', name: 'Hamburg Hafen' },
          { id: 'demo-luebeck', name: 'Lübeck Zentrum' },
        ],
      },
      {
        id: 'demo-firma-kueste',
        name: 'Küsten Service GmbH',
        filialen: [
          { id: 'demo-kiel', name: 'Kiel Mitte' },
          { id: 'demo-rostock', name: 'Rostock Hafen' },
        ],
      },
    ],
  },
];
