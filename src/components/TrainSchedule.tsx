import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Train, Clock } from 'lucide-react';
import { getLocalizedText } from '@/lib/i18n-utils';

interface ScheduleEntry {
  departure: string;
  arrival: string;
  note?: string;
}

interface RouteSchedule {
  route: { en: string; ru: string };
  entries: ScheduleEntry[];
}

interface TrainGroup {
  name: string;
  routes: RouteSchedule[];
}

const scheduleData: TrainGroup[] = [
  {
    name: 'Afrosiyob',
    routes: [
      {
        route: { en: 'Tashkent → Samarkand', ru: 'Ташкент → Самарканд' },
        entries: [
          { departure: '06:10', arrival: '08:23', note: 'Fri-Sun' },
          { departure: '06:33', arrival: '08:46' },
          { departure: '07:30', arrival: '09:43' },
          { departure: '08:00', arrival: '10:25' },
          { departure: '08:30', arrival: '10:49' },
          { departure: '19:48', arrival: '22:13' },
        ],
      },
      {
        route: { en: 'Samarkand → Tashkent', ru: 'Самарканд → Ташкент' },
        entries: [
          { departure: '05:21', arrival: '07:42' },
          { departure: '16:56', arrival: '19:17' },
          { departure: '17:40', arrival: '20:07' },
          { departure: '18:15', arrival: '20:30' },
          { departure: '18:49', arrival: '21:04' },
          { departure: '20:01', arrival: '22:16', note: 'Fri-Sun' },
        ],
      },
      {
        route: { en: 'Tashkent → Bukhara', ru: 'Ташкент → Бухара' },
        entries: [
          { departure: '06:10', arrival: '10:16', note: 'Fri-Sun' },
          { departure: '07:30', arrival: '11:42' },
          { departure: '08:30', arrival: '12:42' },
          { departure: '19:48', arrival: '00:06' },
        ],
      },
      {
        route: { en: 'Bukhara → Tashkent', ru: 'Бухара → Ташкент' },
        entries: [
          { departure: '03:27', arrival: '07:42' },
          { departure: '15:03', arrival: '19:17' },
          { departure: '16:16', arrival: '20:30' },
          { departure: '18:08', arrival: '22:16', note: 'Fri-Sun' },
        ],
      },
      {
        route: { en: 'Samarkand → Bukhara', ru: 'Самарканд → Бухара' },
        entries: [
          { departure: '08:33', arrival: '10:16', note: 'Fri-Sun' },
          { departure: '09:53', arrival: '11:42' },
          { departure: '10:59', arrival: '12:42' },
          { departure: '22:23', arrival: '00:06' },
        ],
      },
      {
        route: { en: 'Bukhara → Samarkand', ru: 'Бухара → Самарканд' },
        entries: [
          { departure: '03:27', arrival: '05:11' },
          { departure: '15:03', arrival: '16:46' },
          { departure: '16:16', arrival: '18:05' },
          { departure: '18:08', arrival: '19:51', note: 'Fri-Sun' },
        ],
      },
    ],
  },
  {
    name: 'Sharq',
    routes: [
      {
        route: { en: 'Tashkent → Samarkand', ru: 'Ташкент → Самарканд' },
        entries: [
          { departure: '08:37', arrival: '11:42' },
          { departure: '20:32', arrival: '23:41' },
        ],
      },
      {
        route: { en: 'Samarkand → Tashkent', ru: 'Самарканд → Ташкент' },
        entries: [
          { departure: '08:06', arrival: '12:01' },
          { departure: '19:23', arrival: '23:06' },
        ],
      },
      {
        route: { en: 'Tashkent → Bukhara', ru: 'Ташкент → Бухара' },
        entries: [
          { departure: '08:37', arrival: '14:18' },
          { departure: '20:32', arrival: '02:29' },
        ],
      },
      {
        route: { en: 'Bukhara → Tashkent', ru: 'Бухара → Ташкент' },
        entries: [
          { departure: '05:17', arrival: '12:01' },
          { departure: '16:51', arrival: '23:06' },
        ],
      },
      {
        route: { en: 'Samarkand → Bukhara', ru: 'Самарканд → Бухара' },
        entries: [
          { departure: '00:01', arrival: '02:29' },
          { departure: '11:56', arrival: '14:12' },
        ],
      },
      {
        route: { en: 'Bukhara → Samarkand', ru: 'Бухара → Самарканд' },
        entries: [
          { departure: '05:17', arrival: '07:38' },
          { departure: '16:51', arrival: '19:13' },
        ],
      },
    ],
  },
];

const TrainSchedule = () => {
  const { t } = useTranslation();

  return (
    <section className="container mx-auto px-4 py-16">
      <h2 className="text-2xl md:text-3xl font-bold mb-2">{t('trainTickets.scheduleTitle')}</h2>
      <p className="text-muted-foreground mb-8">{t('trainTickets.scheduleSubtitle')}</p>

      <div className="space-y-12">
        {scheduleData.map((group) => (
          <div key={group.name}>
            <div className="flex items-center gap-3 mb-6">
              <Train className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-bold">{group.name}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.routes.map((route, idx) => (
                <Card key={idx}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{getLocalizedText(route.route)}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {route.entries.map((entry, i) => (
                      <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b border-border last:border-0">
                        <span className="flex items-center gap-1.5 font-mono">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          {entry.departure} – {entry.arrival}
                        </span>
                        {entry.note && (
                          <Badge variant="secondary" className="text-xs">
                            {entry.note}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TrainSchedule;
